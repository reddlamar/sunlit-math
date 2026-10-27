import React from 'react';
import { render } from '@testing-library/react-native';
import { ScoreRow } from './ScoreRow';
import { SettingsProvider } from '../settings/SettingsContext';
import { light, operationColors } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';
import type { ScoreEntry } from '../types/game';

const HIDDEN = { includeHiddenElements: true };
const base: ScoreEntry = {
  id: 'a',
  name: 'Owl',
  avatar: 'owl',
  score: 29,
  operation: 'division',
  difficulty: 'medium',
  createdAt: 1,
};

const renderRow = (entry: ScoreEntry, rank = 2) =>
  render(
    <SettingsProvider>
      <ScoreRow rank={rank} entry={entry} />
    </SettingsProvider>
  );

describe('ScoreRow', () => {
  it('shows the place, the animal, the name and the score', async () => {
    const { getByText, getByTestId } = await renderRow(base);

    expect(getByText('2')).toBeTruthy();
    expect(getByTestId('avatar-owl', HIDDEN)).toBeTruthy();
    expect(getByText('Owl')).toBeTruthy();
    expect(getByText('29')).toBeTruthy();
  });

  it('outlines the row and colors the score by the operation it was earned on', async () => {
    const { getByTestId, getByText } = await renderRow(base);

    expect(
      hasStyleValue(getByTestId('score-row').props.style, 'borderColor', operationColors.division)
    ).toBe(true);
    expect(hasStyleValue(getByText('29').props.style, 'color', operationColors.division)).toBe(
      true
    );
  });

  it('writes the operation and level under the name', async () => {
    const { getByText } = await renderRow(base);

    expect(getByText('÷ · Medium')).toBeTruthy();
  });

  it('writes just the operation for a score saved before levels were recorded', async () => {
    const { getByText } = await renderRow({ ...base, difficulty: undefined });

    expect(getByText('÷')).toBeTruthy();
  });

  it('is read as one thing, naming the place, player, points, operation and level', async () => {
    const { getByTestId } = await renderRow(base);

    expect(getByTestId('score-row').props.accessibilityLabel).toBe(
      '2. Owl, 29 points, Division, Medium'
    );
    expect(getByTestId('score-row').props.accessible).toBe(true);
  });

  it('says a single point in the singular', async () => {
    const { getByTestId } = await renderRow({ ...base, score: 1, difficulty: undefined });

    expect(getByTestId('score-row').props.accessibilityLabel).toBe('2. Owl, 1 point, Division');
  });

  it('draws the place in the secondary text color from the theme', async () => {
    const { getByText } = await renderRow(base);

    expect(hasStyleValue(getByText('2').props.style, 'color', light.textSecondary)).toBe(true);
  });

  it('shortens a very long name instead of pushing the score off the row', async () => {
    const { getByText } = await renderRow({ ...base, avatar: undefined, name: 'A'.repeat(40) });

    expect(getByText('A'.repeat(40)).props.numberOfLines).toBe(1);
  });
});
