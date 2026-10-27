import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerBar } from './TimerBar';
import { SettingsProvider } from '../settings/SettingsContext';
import { dark, light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';
import { timerFillPercent } from '../testUtils/timer';

const HIDDEN = { includeHiddenElements: true };
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

  it('says the remaining time in whole seconds', async () => {
    const { getByText } = await renderTimerBar({ timeLeft: 45300, duration: 60000 });
    expect(getByText('46 seconds left')).toBeTruthy();
  });

  it('says a single second in the singular', async () => {
    const { getByText } = await renderTimerBar({ timeLeft: 800, duration: 60000 });
    expect(getByText('1 second left')).toBeTruthy();
  });

  it('rounds a fully-expired timer down to 0', async () => {
    const { getByText } = await renderTimerBar({ timeLeft: 0, duration: 60000 });
    expect(getByText('0 seconds left')).toBeTruthy();
  });

  it('fills the bar to the remaining fraction', async () => {
    const { getByTestId } = await renderTimerBar({ timeLeft: 30000, duration: 60000 });
    expect(timerFillPercent(getByTestId('timer-bar-fill', HIDDEN))).toBe(50);
  });

  it('never overfills or underfills the bar', async () => {
    const over = await renderTimerBar({ timeLeft: 90000, duration: 60000 });
    expect(timerFillPercent(over.getByTestId('timer-bar-fill', HIDDEN))).toBe(100);
  });

  it('hides the bar from screen readers, leaving the words to say the time', async () => {
    const { getByTestId } = await renderTimerBar({ timeLeft: 30000, duration: 60000 });
    const track = getByTestId('timer-bar-track', HIDDEN);
    expect(track.props.accessibilityElementsHidden).toBe(true);
    expect(track.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('colors the bar fill and the words from the theme, not a hardcoded value', async () => {
    const { getByTestId, getByText } = await renderTimerBar({ timeLeft: 30000, duration: 60000 });

    expect(
      hasStyleValue(
        getByTestId('timer-bar-fill', HIDDEN).props.style,
        'backgroundColor',
        light.timer
      )
    ).toBe(true);
    expect(
      hasStyleValue(getByText('30 seconds left').props.style, 'color', light.textSecondary)
    ).toBe(true);
  });

  it('switches to the dark theme colors once the player has picked dark mode', async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ muted: false, theme: 'dark', difficulty: 'easy' })
    );

    const { getByTestId, getByText } = await renderTimerBar({ timeLeft: 30000, duration: 60000 });

    await waitFor(() => {
      expect(
        hasStyleValue(
          getByTestId('timer-bar-fill', HIDDEN).props.style,
          'backgroundColor',
          dark.timer
        )
      ).toBe(true);
    });
    expect(
      hasStyleValue(getByText('30 seconds left').props.style, 'color', dark.textSecondary)
    ).toBe(true);
  });
});
