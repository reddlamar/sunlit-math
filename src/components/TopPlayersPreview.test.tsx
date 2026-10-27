import React from 'react';
import { render } from '@testing-library/react-native';
import { TopPlayersPreview } from './TopPlayersPreview';
import { SettingsProvider } from '../settings/SettingsContext';
import type { ScoreEntry } from '../types/game';

const scores: ScoreEntry[] = [
  { id: 'a', name: 'Fox', score: 34, operation: 'addition', createdAt: 1 },
  { id: 'b', name: 'Owl', score: 29, operation: 'division', createdAt: 2 },
];

const renderPreview = (entries: ScoreEntry[]) =>
  render(
    <SettingsProvider>
      <TopPlayersPreview scores={entries} />
    </SettingsProvider>
  );

describe('TopPlayersPreview', () => {
  it('lists each score with its rank, name and points', async () => {
    const { getByText } = await renderPreview(scores);

    expect(getByText('Top players')).toBeTruthy();
    for (const text of ['1', 'Fox', '34', '2', 'Owl', '29']) {
      expect(getByText(text)).toBeTruthy();
    }
  });

  it('renders nothing when there are no scores', async () => {
    const { queryByTestId, queryByText } = await renderPreview([]);

    expect(queryByTestId('top-players')).toBeNull();
    expect(queryByText('Top players')).toBeNull();
  });
});
