import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreakIndicator } from './StreakIndicator';
import { SettingsProvider } from '../settings/SettingsContext';
import { dark, light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

const SETTINGS_STORAGE_KEY = 'math60_settings_v1';

function renderStreakIndicator(streak: number) {
  return render(
    <SettingsProvider>
      <StreakIndicator streak={streak} />
    </SettingsProvider>
  );
}

describe('StreakIndicator', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows the current streak count', async () => {
    const { getByText } = await renderStreakIndicator(2);
    expect(getByText('2')).toBeTruthy();
  });

  it('is not lit below a streak of 3', async () => {
    const { getByTestId } = await renderStreakIndicator(2);
    expect(getByTestId('streak-flame').props.accessibilityState).toEqual({ selected: false });
  });

  it('lights up at a streak of 3 or more', async () => {
    const { getByTestId } = await renderStreakIndicator(3);
    expect(getByTestId('streak-flame').props.accessibilityState).toEqual({ selected: true });
  });

  it('below a streak of 3, uses the plain text color and no highlight background', async () => {
    const { getByTestId, getByText } = await renderStreakIndicator(2);

    expect(
      hasStyleValue(getByTestId('streak-container').props.style, 'backgroundColor', light.streakSoft)
    ).toBe(false);
    expect(hasStyleValue(getByText('2').props.style, 'color', light.streak)).toBe(false);
  });

  it('at a streak of 3 or more, colors the count and container from the theme, not a hardcoded value', async () => {
    const { getByTestId, getByText } = await renderStreakIndicator(3);

    expect(
      hasStyleValue(getByTestId('streak-container').props.style, 'backgroundColor', light.streakSoft)
    ).toBe(true);
    expect(hasStyleValue(getByText('3').props.style, 'color', light.streak)).toBe(true);
  });

  it('switches to the dark theme streak colors once the player has picked dark mode', async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ muted: false, theme: 'dark', difficulty: 'easy' })
    );

    const { getByTestId, getByText } = await renderStreakIndicator(3);

    await waitFor(() => {
      expect(
        hasStyleValue(getByTestId('streak-container').props.style, 'backgroundColor', dark.streakSoft)
      ).toBe(true);
    });
    expect(hasStyleValue(getByText('3').props.style, 'color', dark.streak)).toBe(true);
  });
});
