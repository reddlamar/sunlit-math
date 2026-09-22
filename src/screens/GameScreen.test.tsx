import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GameScreen } from './GameScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import * as scoresRepository from '../storage/scoresRepository';
import type { GameScreenProps } from '../navigation/types';

jest.mock('../storage/scoresRepository');

function makeNavigation() {
  return { navigate: jest.fn() } as unknown as GameScreenProps['navigation'];
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
    jest.mocked(scoresRepository.addScore).mockResolvedValue(undefined);
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
});
