import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from './GameScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import { REVEAL_MS } from '../components/useAnswerFeedback';
import type { GameScreenProps } from '../navigation/types';

jest.mock('../storage/scoresRepository');
jest.mock('@react-navigation/native', () => ({ usePreventRemove: jest.fn() }));

const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
} as unknown as GameScreenProps['navigation'];
const route: GameScreenProps['route'] = {
  key: 'Game',
  name: 'Game',
  params: { operation: 'addition' },
};

const HIDDEN = { includeHiddenElements: true };

type Screen = Awaited<ReturnType<typeof renderStartedRound>>;

async function renderStartedRound() {
  const screen = await render(
    <SettingsProvider>
      <GameScreen navigation={navigation} route={route} />
    </SettingsProvider>
  );
  await fireEvent.press(screen.getByTestId('get-ready-start-button'));
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });
  return screen;
}

/** The question on screen, as a pair of addends. */
const questionOf = ({ getByTestId }: Screen) => getByTestId('problem-question').props.children;

function answerOf(screen: Screen): number {
  const [a, b] = (questionOf(screen) as string).split('+').map((n) => Number(n.trim()));
  return a + b;
}

const choiceButton = (screen: Screen, value: number) =>
  screen.getAllByTestId('answer-choice').find((choice) => choice.props.children === value)!;

async function tapRight(screen: Screen) {
  await fireEvent.press(choiceButton(screen, answerOf(screen)));
}

async function tapWrong(screen: Screen) {
  const right = answerOf(screen);
  const wrong = screen
    .getAllByTestId('answer-choice')
    .map((choice) => choice.props.children as number)
    .find((value) => value !== right)!;
  await fireEvent.press(choiceButton(screen, wrong));
  return { right, wrong };
}

describe('GameScreen answer feedback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('invites the player to tap before any answer', async () => {
    const screen = await renderStartedRound();

    expect(screen.getByTestId('feedback-hint')).toHaveTextContent('Ready: tap the answer');
    expect(screen.queryByTestId('points-float', HIDDEN)).toBeNull();
  });

  describe('a right answer', () => {
    it('moves straight on, with the points it earned floating up', async () => {
      const screen = await renderStartedRound();

      await tapRight(screen);

      expect(screen.getByTestId('points-float', HIDDEN)).toHaveTextContent('+1');
      expect(screen.getByTestId('feedback-hint')).toHaveTextContent('Ready: tap the answer');
      expect(screen.queryByLabelText(/, correct$/)).toBeNull();
    });

    it('floats the streak bonus on the fourth right answer in a row', async () => {
      const screen = await renderStartedRound();

      for (let answer = 0; answer < 4; answer++) {
        await tapRight(screen);
      }

      expect(screen.getByTestId('points-float', HIDDEN)).toHaveTextContent('+3');
    });
  });

  describe('a wrong answer', () => {
    it('keeps the sum up and lights the right answer, marking the tap as wrong', async () => {
      const screen = await renderStartedRound();
      const question = questionOf(screen);

      const { right, wrong } = await tapWrong(screen);

      expect(questionOf(screen)).toBe(question);
      expect(screen.getByLabelText(`Answer ${right}, correct`)).toBeTruthy();
      expect(screen.getByLabelText(`Answer ${wrong}, not correct`)).toBeTruthy();
      expect(screen.getByTestId('feedback-hint')).toHaveTextContent(
        'Miss: the right answer lights up'
      );
      expect(screen.getByTestId('points-float', HIDDEN)).toHaveTextContent('−1');
    });

    it('locks the board while the right answer is shown, so no second tap is judged', async () => {
      const screen = await renderStartedRound();
      const { right } = await tapWrong(screen);

      await fireEvent.press(choiceButton(screen, right));

      expect(screen.getByTestId('score-value')).toHaveTextContent('Score -1');
    });

    it('moves on to a new sum once the reveal is over', async () => {
      const screen = await renderStartedRound();
      await tapWrong(screen);

      await act(async () => {
        jest.advanceTimersByTime(REVEAL_MS);
      });

      expect(screen.getByTestId('feedback-hint')).toHaveTextContent('Ready: tap the answer');
      expect(screen.queryByLabelText(/, correct$/)).toBeNull();
      expect(screen.queryByLabelText(/, not correct$/)).toBeNull();
      // The board is live again.
      await tapRight(screen);
      expect(screen.getByTestId('score-value')).toHaveTextContent('Score 0');
    });

    it('tells a screen reader which answer was right', async () => {
      const screen = await renderStartedRound();
      const question = questionOf(screen);
      const right = answerOf(screen);

      await tapWrong(screen);

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        `Not quite. ${question} is ${right}`
      );
    });
  });
});
