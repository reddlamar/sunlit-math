import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnswerButton } from './AnswerButton';
import { SettingsProvider } from '../settings/SettingsContext';
import { dark, light, choiceColors } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

const HIDDEN = { includeHiddenElements: true };

const renderButton = (props: Partial<React.ComponentProps<typeof AnswerButton>> = {}) => {
  const onPress = props.onPress ?? jest.fn();
  return render(
    <SettingsProvider>
      <AnswerButton value={9} {...props} onPress={onPress} />
    </SettingsProvider>
  );
};

describe('AnswerButton', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('calls onPress with its value when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await renderButton({ onPress });
    await fireEvent.press(getByText('9'));
    expect(onPress).toHaveBeenCalledWith(9);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = await renderButton({ onPress, disabled: true });
    await fireEvent.press(getByText('9'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is its own choice color and unmarked by default', async () => {
    const { getByRole, queryByTestId } = await renderButton({ color: choiceColors[1] });

    expect(hasStyleValue(getByRole('button').props.style, 'backgroundColor', choiceColors[1])).toBe(
      true
    );
    expect(queryByTestId('icon-check', HIDDEN)).toBeNull();
    expect(queryByTestId('icon-cross', HIDDEN)).toBeNull();
    expect(getByRole('button')).toHaveAccessibleName('Answer 9');
  });

  describe('once judged', () => {
    it('marks the right answer with a check, the success fill and a heavy border', async () => {
      const { getByRole, getByTestId } = await renderButton({ state: 'correct' });

      const { style } = getByRole('button').props;
      expect(hasStyleValue(style, 'backgroundColor', light.success)).toBe(true);
      expect(hasStyleValue(style, 'borderWidth', 4)).toBe(true);
      expect(hasStyleValue(style, 'borderColor', light.textPrimary)).toBe(true);
      expect(getByTestId('icon-check', HIDDEN)).toBeTruthy();
      expect(getByRole('button')).toHaveAccessibleName('Answer 9, correct');
    });

    it('marks the wrong tap with a cross and the error fill, never by color alone', async () => {
      const { getByRole, getByTestId, queryByTestId } = await renderButton({ state: 'wrong' });

      expect(hasStyleValue(getByRole('button').props.style, 'backgroundColor', light.error)).toBe(
        true
      );
      expect(getByTestId('icon-cross', HIDDEN)).toBeTruthy();
      expect(queryByTestId('icon-check', HIDDEN)).toBeNull();
      expect(getByRole('button')).toHaveAccessibleName('Answer 9, not correct');
    });

    it('draws the number in the on-status color so it stays readable', async () => {
      const { getByTestId } = await renderButton({ state: 'correct' });

      expect(hasStyleValue(getByTestId('answer-choice').props.style, 'color', light.onStatus)).toBe(
        true
      );
    });

    it('steps back, at 45% opacity, when it is neither the right answer nor the tap', async () => {
      const { getByRole, queryByTestId } = await renderButton({ state: 'dimmed' });

      expect(hasStyleValue(getByRole('button').props.style, 'opacity', 0.45)).toBe(true);
      expect(queryByTestId('icon-check', HIDDEN)).toBeNull();
    });

    it('does not fade a marked answer even though the whole board is disabled', async () => {
      const { getByRole } = await renderButton({ state: 'correct', disabled: true });

      expect(hasStyleValue(getByRole('button').props.style, 'opacity', 0.45)).toBe(false);
    });
  });

  it('fades when disabled with no judgement, as when the round is paused', async () => {
    const { getByRole } = await renderButton({ disabled: true });

    expect(hasStyleValue(getByRole('button').props.style, 'opacity', 0.45)).toBe(true);
  });

  it('uses the dark theme fills once the player has picked dark mode', async () => {
    await AsyncStorage.setItem(
      'math60_settings_v1',
      JSON.stringify({ muted: false, theme: 'dark', difficulty: 'easy' })
    );
    const { getByRole } = await renderButton({ state: 'correct' });

    await waitFor(() => {
      expect(hasStyleValue(getByRole('button').props.style, 'backgroundColor', dark.success)).toBe(
        true
      );
    });
  });
});
