import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from './GameScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import type { GameScreenProps } from '../navigation/types';

jest.mock('../storage/scoresRepository');
jest.mock('@react-navigation/native', () => ({ usePreventRemove: jest.fn() }));

// Counts how many times the (memoized) answer buttons actually render.
const mockRenders = { answerButton: 0 };
jest.mock('../components/AnswerButton', () => {
  const { memo } = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    AnswerButton: memo(function AnswerButton(props: {
      value: number;
      onPress: (value: number) => void;
    }) {
      mockRenders.answerButton += 1;
      return (
        <Pressable onPress={() => props.onPress(props.value)}>
          <Text testID="answer-choice">{props.value}</Text>
        </Pressable>
      );
    }),
  };
});

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

describe('GameScreen render cost', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRenders.answerButton = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not re-render the answer buttons on timer ticks', async () => {
    const { getByTestId } = await render(
      <SettingsProvider>
        <GameScreen navigation={navigation} route={route} />
      </SettingsProvider>
    );
    await fireEvent.press(getByTestId('get-ready-start-button'));
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    const rendersAfterStart = mockRenders.answerButton;
    const secondsBefore = getByTestId('timer-bar-fill').props.accessibilityValue.now;

    // 3 seconds of play = ~30 timer ticks, each of which re-renders the screen.
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(getByTestId('timer-bar-fill').props.accessibilityValue.now).toBeLessThan(secondsBefore);
    expect(mockRenders.answerButton).toBe(rendersAfterStart);
  });
});
