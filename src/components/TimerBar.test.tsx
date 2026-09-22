import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerBar } from './TimerBar';
import { SettingsProvider } from '../settings/SettingsContext';
import { dark, light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

const SETTINGS_STORAGE_KEY = 'math60_settings_v1';

function renderTimerBar(props: React.ComponentProps<typeof TimerBar>) {
  return render(
    <SettingsProvider>
      <TimerBar {...props} />
    </SettingsProvider>
  );
}

describe('TimerBar', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows the remaining time in whole seconds', async () => {
    const { getByText } = await renderTimerBar({ timeLeft: 45300, duration: 60000 });
    expect(getByText('46')).toBeTruthy();
  });

  it('rounds a fully-expired timer down to 0', async () => {
    const { getByText } = await renderTimerBar({ timeLeft: 0, duration: 60000 });
    expect(getByText('0')).toBeTruthy();
  });

  it('exposes the remaining fraction for the visual bar via accessibility value', async () => {
    const { getByTestId } = await renderTimerBar({ timeLeft: 30000, duration: 60000 });
    const bar = getByTestId('timer-bar-fill');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
  });

  it('colors the bar fill and the seconds text from the theme, not a hardcoded value', async () => {
    const { getByTestId, getByText } = await renderTimerBar({ timeLeft: 30000, duration: 60000 });

    expect(
      hasStyleValue(getByTestId('timer-bar-fill').props.style, 'backgroundColor', light.timer)
    ).toBe(true);
    expect(hasStyleValue(getByText('30').props.style, 'color', light.timer)).toBe(true);
  });

  it('switches to the dark theme timer color once the player has picked dark mode', async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ muted: false, theme: 'dark', difficulty: 'easy' })
    );

    const { getByTestId, getByText } = await renderTimerBar({ timeLeft: 30000, duration: 60000 });

    await waitFor(() => {
      expect(
        hasStyleValue(getByTestId('timer-bar-fill').props.style, 'backgroundColor', dark.timer)
      ).toBe(true);
    });
    expect(hasStyleValue(getByText('30').props.style, 'color', dark.timer)).toBe(true);
  });
});
