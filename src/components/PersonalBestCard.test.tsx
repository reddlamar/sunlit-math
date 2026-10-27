import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PersonalBestCard } from './PersonalBestCard';
import { SettingsProvider } from '../settings/SettingsContext';
import { IPAD_PORTRAIT, PHONE, setWindow } from '../testUtils/window';
import type { ScoreEntry } from '../types/game';

const best: ScoreEntry = {
  id: '1',
  name: 'Ada',
  score: 34,
  operation: 'multiplication',
  createdAt: 1,
};

const renderCard = (entry: ScoreEntry | null, onPress = jest.fn()) =>
  render(
    <SettingsProvider>
      <PersonalBestCard best={entry} onPress={onPress} />
    </SettingsProvider>
  );

describe('PersonalBestCard', () => {
  afterEach(() => setWindow(PHONE));

  it('shows the best score and its operation', async () => {
    const { getByText } = await renderCard(best);

    expect(getByText('Personal best')).toBeTruthy();
    expect(getByText('34 points · Multiplication')).toBeTruthy();
  });

  it('says a single point in the singular', async () => {
    const { getByText } = await renderCard({ ...best, score: 1, operation: 'addition' });

    expect(getByText('1 point · Addition')).toBeTruthy();
  });

  it('invites a first score when there is none', async () => {
    const { getByText } = await renderCard(null);

    expect(getByText('No scores yet — be the first!')).toBeTruthy();
  });

  it('opens the leaderboard when tapped', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderCard(best, onPress);

    await fireEvent.press(getByLabelText('View personal best on the leaderboard'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a phone', PHONE, 20],
    ['an iPad in portrait', IPAD_PORTRAIT, 26],
  ])('sizes the text for %s', async (_name, window, fontSize) => {
    setWindow(window);
    const { getByText } = await renderCard(best);

    expect(getByText('34 points · Multiplication')).toHaveStyle({ fontSize });
  });
});
