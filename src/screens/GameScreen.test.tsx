import React from 'react';
import { Alert, AppState, StyleSheet, type AlertButton } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GameScreen } from './GameScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import {
  PHONE,
  PHONE_LANDSCAPE,
  IPAD_LANDSCAPE,
  IPAD_PORTRAIT,
  setWindow,
} from '../testUtils/window';
import * as scoresRepository from '../storage/scoresRepository';
import * as sounds from '../audio/sounds';
import type { GameScreenProps } from '../navigation/types';

jest.mock('../storage/scoresRepository');

const mockShake = jest.fn();
jest.mock('../components/useShake', () => ({
  useShake: () => ({ shake: mockShake, shakeStyle: {} }),
}));

// The screen is rendered without a NavigationContainer, so usePreventRemove is mocked;
// the mock records the latest `preventRemove` flag and callback for the tests to drive.
const mockPreventRemove: {
  prevent: boolean;
  callback: ((event: { data: { action: unknown } }) => void) | null;
} = { prevent: false, callback: null };
jest.mock('@react-navigation/native', () => ({
  usePreventRemove: (
    prevent: boolean,
    callback: (event: { data: { action: unknown } }) => void
  ) => {
    mockPreventRemove.prevent = prevent;
    mockPreventRemove.callback = callback;
  },
}));

function makeNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  } as unknown as GameScreenProps['navigation'];
}

// Presses the named button of the most recent Alert.alert call.
async function pressAlertButton(label: string) {
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)![2] as AlertButton[];
  await act(async () => {
    buttons.find((button) => button.text === label)!.onPress?.();
  });
}

function makeRoute(): GameScreenProps['route'] {
  return { key: 'Game', name: 'Game', params: { operation: 'addition' } };
}

function renderGameScreen(navigation = makeNavigation(), route = makeRoute()) {
  return render(
    <SettingsProvider>
      <GameScreen navigation={navigation} route={route} />
    </SettingsProvider>
  );
}

async function dismissGetReadyModal(
  getByTestId: Awaited<ReturnType<typeof render>>['getByTestId']
) {
  await fireEvent.press(getByTestId('get-ready-start-button'));
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });
}

describe('GameScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockPreventRemove.prevent = false;
    mockPreventRemove.callback = null;
    jest.mocked(scoresRepository.addScore).mockResolvedValue(undefined);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the get ready modal first, with no problem visible yet', async () => {
    const { getByTestId, queryByTestId } = await renderGameScreen();

    expect(getByTestId('get-ready-start-button')).toBeTruthy();
    expect(queryByTestId('problem-question')).toBeNull();
  });

  it('starts the round after Start and the 3-2-1 countdown, showing a problem with answer choices', async () => {
    const { getByTestId, findAllByTestId } = await renderGameScreen();

    await dismissGetReadyModal(getByTestId);

    expect(getByTestId('problem-question')).toBeTruthy();
    const choices = await findAllByTestId('answer-choice');
    expect(choices.length).toBeGreaterThanOrEqual(3);
  });

  it('updates the score after a correct answer', async () => {
    const { getByTestId, findAllByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);

    const questionText = getByTestId('problem-question').props.children as string;
    const [a, b] = questionText.split('+').map((n: string) => Number(n.trim()));
    const correctAnswer = a + b;

    const choices = await findAllByTestId('answer-choice');
    const correctChoice = choices.find((c) => c.props.children === correctAnswer)!;

    await fireEvent.press(correctChoice);

    expect(getByTestId('score-value').props.children).toBe(1);
  });

  it('plays the correct sound for a right answer and the wrong sound (with a shake) for a wrong one', async () => {
    const correctSound = jest.spyOn(sounds, 'playCorrectSound');
    const wrongSound = jest.spyOn(sounds, 'playWrongSound');
    const { getByTestId, findAllByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);

    const [a, b] = (getByTestId('problem-question').props.children as string)
      .split('+')
      .map((n) => Number(n.trim()));
    const choices = await findAllByTestId('answer-choice');
    await fireEvent.press(choices.find((choice) => choice.props.children === a + b)!);

    expect(correctSound).toHaveBeenCalledTimes(1);
    expect(wrongSound).not.toHaveBeenCalled();

    const [c, d] = (getByTestId('problem-question').props.children as string)
      .split('+')
      .map((n) => Number(n.trim()));
    const next = await findAllByTestId('answer-choice');
    await fireEvent.press(next.find((choice) => choice.props.children !== c + d)!);

    expect(wrongSound).toHaveBeenCalledTimes(1);
    expect(mockShake).toHaveBeenCalledTimes(1);
  });

  it('pauses the game, hiding the choices, and resumes on tap', async () => {
    const { getByTestId, findAllByTestId, queryAllByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);
    await findAllByTestId('answer-choice');

    await fireEvent.press(getByTestId('pause-button'));

    expect(getByTestId('resume-button')).toBeTruthy();
    expect(queryAllByTestId('answer-choice').length).toBe(0);

    await fireEvent.press(getByTestId('resume-button'));

    const choices = await findAllByTestId('answer-choice');
    expect(choices.length).toBeGreaterThanOrEqual(3);
  });

  it('does not advance the timer while paused', async () => {
    const { getByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);

    await fireEvent.press(getByTestId('pause-button'));
    const secondsAtPause = getByTestId('timer-bar-fill').props.accessibilityValue.now;

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(getByTestId('timer-bar-fill').props.accessibilityValue.now).toBe(secondsAtPause);
  });

  it('restart shows the get ready modal again, and starting resets score and the timer', async () => {
    const { getByTestId, findAllByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);

    const questionText = getByTestId('problem-question').props.children as string;
    const [a, b] = questionText.split('+').map((n: string) => Number(n.trim()));
    const choices = await findAllByTestId('answer-choice');
    const correctChoice = choices.find((c) => c.props.children === a + b)!;
    await fireEvent.press(correctChoice);
    expect(getByTestId('score-value').props.children).toBe(1);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await fireEvent.press(getByTestId('restart-button'));
    await pressAlertButton('Restart');

    expect(getByTestId('get-ready-start-button')).toBeTruthy();

    await dismissGetReadyModal(getByTestId);

    expect(getByTestId('score-value').props.children).toBe(0);
    expect(getByTestId('timer-bar-fill').props.accessibilityValue.now).toBe(100);
    expect(await findAllByTestId('answer-choice')).toHaveLength(choices.length);
  });

  it('restart freezes the old round timer so it cannot expire behind the get ready modal', async () => {
    const { getByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);

    await fireEvent.press(getByTestId('restart-button'));
    await pressAlertButton('Restart');

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    expect(getByTestId('get-ready-start-button')).toBeTruthy();
  });

  it('restarting while paused resumes normal play once the next round starts', async () => {
    const { getByTestId, findAllByTestId, queryAllByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);
    await findAllByTestId('answer-choice');

    await fireEvent.press(getByTestId('pause-button'));
    expect(queryAllByTestId('answer-choice').length).toBe(0);

    await fireEvent.press(getByTestId('restart-button'));
    await pressAlertButton('Restart');
    await dismissGetReadyModal(getByTestId);

    expect(await findAllByTestId('answer-choice')).not.toHaveLength(0);
    expect(getByTestId('score-value').props.children).toBe(0);
  });

  it('shows the name entry modal once the timer runs out, then a summary after saving, then the get ready modal again on Play Again', async () => {
    const navigation = makeNavigation();
    const { getByTestId, getByText, getByPlaceholderText, queryByPlaceholderText, queryByText } =
      await renderGameScreen(navigation);
    await dismissGetReadyModal(getByTestId);

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    expect(getByText(/Time's up!/)).toBeTruthy();

    await fireEvent.changeText(getByPlaceholderText('Your name'), 'Ada');
    await fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByTestId('play-again-button')).toBeTruthy();
    });

    await fireEvent.press(getByTestId('play-again-button'));

    expect(getByTestId('get-ready-start-button')).toBeTruthy();
    // The stale name-entry modal from the round that just ended must not
    // still be showing underneath/alongside the Get Ready modal.
    expect(queryByPlaceholderText('Your name')).toBeNull();
    expect(queryByText(/Time's up!/)).toBeNull();
  });

  it("says '1 point' on the summary when the score is exactly one", async () => {
    const { getByTestId, findAllByTestId, getByText, getByPlaceholderText } =
      await renderGameScreen();
    await dismissGetReadyModal(getByTestId);
    await fireEvent.press(await findChoice(getByTestId, findAllByTestId, true));
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    await fireEvent.changeText(getByPlaceholderText('Your name'), 'Ada');
    await fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('1 point')).toBeTruthy();
    });
  });

  it("says 'points' on the summary for any other score", async () => {
    const { getByTestId, getByText, getByPlaceholderText } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    await fireEvent.changeText(getByPlaceholderText('Your name'), 'Lin');
    await fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('0 points')).toBeTruthy();
    });
  });

  it('navigates to the leaderboard from the score summary', async () => {
    const navigation = makeNavigation();
    const { getByTestId, getByText, getByPlaceholderText } = await renderGameScreen(navigation);
    await dismissGetReadyModal(getByTestId);

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    await fireEvent.changeText(getByPlaceholderText('Your name'), 'Ada');
    await fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByTestId('play-again-button')).toBeTruthy();
    });

    await fireEvent.press(getByText('View Leaderboard'));
    expect(navigation.navigate).toHaveBeenCalledWith('Leaderboard', { operation: 'addition' });
  });

  it('goes back home from the get ready modal without starting a round', async () => {
    const navigation = makeNavigation();
    const { getByTestId } = await renderGameScreen(navigation);

    await fireEvent.press(getByTestId('get-ready-exit-button'));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('asks before restarting, and keeps the round paused if the player keeps playing', async () => {
    const { getByTestId, queryByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);

    await fireEvent.press(getByTestId('restart-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Restart this round?',
      expect.any(String),
      expect.any(Array)
    );
    expect(queryByTestId('get-ready-start-button')).toBeNull();

    await pressAlertButton('Keep playing');

    expect(queryByTestId('get-ready-start-button')).toBeNull();
    expect(getByTestId('resume-button')).toBeTruthy();
  });

  it('pauses the round when the app goes to the background', async () => {
    let appStateHandler: ((state: string) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _type: string,
      handler: (state: string) => void
    ) => {
      appStateHandler = handler;
      return { remove: jest.fn() };
    }) as unknown as typeof AppState.addEventListener);

    const { getByTestId, queryAllByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);

    await act(async () => {
      appStateHandler!('background');
    });

    expect(getByTestId('resume-button')).toBeTruthy();
    expect(queryAllByTestId('answer-choice')).toHaveLength(0);
  });

  it('confirms before leaving mid-round and pauses while the question is open', async () => {
    const navigation = makeNavigation();
    const { getByTestId } = await renderGameScreen(navigation);
    await dismissGetReadyModal(getByTestId);

    expect(mockPreventRemove.prevent).toBe(true);
    const action = { type: 'GO_BACK' };
    await act(async () => {
      mockPreventRemove.callback!({ data: { action } });
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Leave this game?',
      expect.any(String),
      expect.any(Array)
    );
    expect(getByTestId('resume-button')).toBeTruthy();

    await pressAlertButton('Leave');
    expect(navigation.dispatch).toHaveBeenCalledWith(action);
  });

  it('does not intercept leaving while Get Ready is showing', async () => {
    await renderGameScreen();

    expect(mockPreventRemove.prevent).toBe(false);
  });

  it('shakes the answer grid after a wrong answer, but not after a correct one', async () => {
    const { getByTestId, findAllByTestId } = await renderGameScreen();
    await dismissGetReadyModal(getByTestId);

    await fireEvent.press(await findChoice(getByTestId, findAllByTestId, true));
    expect(mockShake).not.toHaveBeenCalled();

    await fireEvent.press(await findChoice(getByTestId, findAllByTestId, false));
    expect(mockShake).toHaveBeenCalledTimes(1);
  });
});

async function findChoice(
  getByTestId: Awaited<ReturnType<typeof render>>['getByTestId'],
  findAllByTestId: Awaited<ReturnType<typeof render>>['findAllByTestId'],
  correct: boolean
) {
  const questionText = getByTestId('problem-question').props.children as string;
  const [a, b] = questionText.split('+').map((n: string) => Number(n.trim()));
  const choices = await findAllByTestId('answer-choice');
  return choices.find((c) => (c.props.children === a + b) === correct)!;
}

describe('GameScreen layout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.mocked(scoresRepository.addScore).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    setWindow(PHONE);
  });

  async function startRound() {
    const screen = await renderGameScreen();
    await dismissGetReadyModal(screen.getByTestId);
    return screen;
  }

  it('stacks the question above the answers upright', async () => {
    setWindow(PHONE);
    const { getByTestId } = await startRound();
    expect(StyleSheet.flatten(getByTestId('problem-area').props.style).flexDirection).not.toBe(
      'row'
    );
  });

  it('puts score, timer and controls in one compact row on a short window', async () => {
    setWindow(PHONE_LANDSCAPE);
    const { getByTestId } = await startRound();
    expect(getByTestId('top-bar')).toHaveStyle({ flexDirection: 'row' });
  });

  it('keeps the timer above the stats row when there is room', async () => {
    setWindow(IPAD_LANDSCAPE);
    const { getByTestId } = await startRound();
    expect(StyleSheet.flatten(getByTestId('top-bar').props.style).flexDirection).not.toBe('row');
  });

  it('puts the question beside the answers when the window is wider than tall', async () => {
    setWindow(PHONE_LANDSCAPE);
    const { getByTestId } = await startRound();
    expect(getByTestId('problem-area')).toHaveStyle({ flexDirection: 'row' });
  });

  it.each([
    ['a phone', PHONE, 48],
    ['an iPad', IPAD_PORTRAIT, 56],
  ])('sizes the Pause button for %s', async (_name, window, size) => {
    setWindow(window);
    const { getByTestId } = await startRound();
    expect(getByTestId('pause-button')).toHaveStyle({ width: size, height: size });
  });

  it('grows the question on an iPad', async () => {
    setWindow(IPAD_PORTRAIT);
    const { getByTestId } = await startRound();
    expect(getByTestId('problem-question')).toHaveStyle({ fontSize: 61.6 });
  });
});
