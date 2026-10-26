import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LeaderboardScreen } from './LeaderboardScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import * as scoresRepository from '../storage/scoresRepository';
import { fontFamily } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';
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
    expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, undefined, undefined);
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
      expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, 'multiplication', undefined);
    });
  });

  it('refetches filtered by difficulty when a level is tapped, keeping the operation filter', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([]);

    const { findByText, getByText } = await renderLeaderboard(
      {} as LeaderboardScreenProps['navigation'],
      makeRoute('division')
    );
    await findByText(/No scores yet/);

    await fireEvent.press(getByText('Hard'));

    await waitFor(() => {
      expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, 'division', 'hard');
    });
  });

  it('labels each row with its operation and level, and omits the level for older scores', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([
      { id: '1', name: 'Ada', score: 20, operation: 'addition', difficulty: 'hard', createdAt: 1 },
      { id: '2', name: 'Lin', score: 15, operation: 'division', createdAt: 2 },
    ]);

    const { findByText, getAllByText, queryByText } = await renderLeaderboard(
      {} as LeaderboardScreenProps['navigation'],
      makeRoute()
    );

    expect(await findByText('+ · Hard')).toBeTruthy();
    // The older score shows just its operation: the '÷' in the filter row plus its own row.
    expect(getAllByText('÷')).toHaveLength(2);
    expect(queryByText(/÷ ·/)).toBeNull();
  });

  it('writes rank numbers in the app font, like everything else on the row', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue(
      ['a', 'b', 'c', 'd'].map((id, i) => ({
        id,
        name: id.toUpperCase(),
        score: 10 - i,
        operation: 'addition' as const,
        createdAt: i,
      }))
    );

    const { findByText } = await renderLeaderboard(makeNavigation(), makeRoute());

    const rank = await findByText('4.');
    expect(hasStyleValue(rank.props.style, 'fontFamily', fontFamily.bold)).toBe(true);
  });
});
