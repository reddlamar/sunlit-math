import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoundSummary } from './RoundSummary';
import { SettingsProvider } from '../settings/SettingsContext';
import { operationColors } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

async function renderSummary(overrides: Partial<React.ComponentProps<typeof RoundSummary>> = {}) {
  const props = {
    name: 'Ada',
    score: 12,
    operation: 'division' as const,
    onPlayAgain: jest.fn(),
    onViewLeaderboard: jest.fn(),
    ...overrides,
  };
  const screen = await render(
    <SettingsProvider>
      <RoundSummary {...props} />
    </SettingsProvider>
  );
  return { props, ...screen };
}

describe('RoundSummary', () => {
  it('congratulates the player by name and shows the score', async () => {
    const { getByText } = await renderSummary();
    expect(getByText('Nice work, Ada!')).toBeTruthy();
    expect(getByText('12 points')).toBeTruthy();
  });

  it('colors the score by operation', async () => {
    const { getByText } = await renderSummary();
    expect(hasStyleValue(getByText('12 points').props.style, 'color', operationColors.division)).toBe(true);
  });

  it('offers Play Again and View Leaderboard', async () => {
    const { props, getByTestId, getByText } = await renderSummary();
    await fireEvent.press(getByTestId('play-again-button'));
    await fireEvent.press(getByText('View Leaderboard'));
    expect(props.onPlayAgain).toHaveBeenCalledTimes(1);
    expect(props.onViewLeaderboard).toHaveBeenCalledTimes(1);
  });
});
