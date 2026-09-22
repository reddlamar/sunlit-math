import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LeaderboardScreen } from './LeaderboardScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import * as scoresRepository from '../storage/scoresRepository';
import type { LeaderboardScreenProps } from '../navigation/types';

jest.mock('../storage/scoresRepository');

function makeRoute(operation?: LeaderboardScreenProps['route']['params']['operation']): LeaderboardScreenProps['route'] {
  return { key: 'Leaderboard', name: 'Leaderboard', params: { operation } };
}

function makeNavigation() {
  return { navigate: jest.fn() } as unknown as LeaderboardScreenProps['navigation'];
}

function renderLeaderboard(
  navigation: LeaderboardScreenProps['navigation'],
  route: LeaderboardScreenProps['route']
) {
  return render(
    <SettingsProvider>
      <LeaderboardScreen navigation={navigation} route={route} />
    </SettingsProvider>
  );
}

describe('LeaderboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates back to Home when the home button is tapped', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([]);
    const navigation = makeNavigation();

    const { getByLabelText } = await renderLeaderboard(navigation, makeRoute());

    await fireEvent.press(getByLabelText('Go to home screen'));

    expect(navigation.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'Home' });
  });

  it('shows an empty state when there are no scores yet', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([]);

    const { findByText } = await renderLeaderboard(
      {} as LeaderboardScreenProps['navigation'],
      makeRoute()
    );

    expect(await findByText(/No scores yet/)).toBeTruthy();
  });

  it('lists the top scores it loads on mount', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([
      { id: '1', name: 'Ada', score: 20, operation: 'addition', createdAt: 1 },
      { id: '2', name: 'Lin', score: 15, operation: 'addition', createdAt: 2 },
    ]);

    const { findByText } = await renderLeaderboard(
      {} as LeaderboardScreenProps['navigation'],
      makeRoute()
    );

    expect(await findByText('Ada')).toBeTruthy();
    expect(await findByText('Lin')).toBeTruthy();
    expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, undefined);
  });

  it('refetches filtered by operation when a filter tab is tapped', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([]);

    const { findByText, getByText } = await renderLeaderboard(
      {} as LeaderboardScreenProps['navigation'],
      makeRoute()
    );
    await findByText(/No scores yet/);

    await fireEvent.press(getByText('×'));

    await waitFor(() => {
      expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, 'multiplication');
    });
  });
});
