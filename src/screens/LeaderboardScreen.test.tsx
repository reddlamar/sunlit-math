import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { LeaderboardScreen } from './LeaderboardScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import * as scoresRepository from '../storage/scoresRepository';
import {
  PHONE,
  PHONE_LANDSCAPE,
  IPAD_LANDSCAPE,
  IPAD_PORTRAIT,
  setWindow,
} from '../testUtils/window';
import type { LeaderboardScreenProps } from '../navigation/types';
import type { ScoreEntry } from '../types/game';

jest.mock('../storage/scoresRepository');

const HIDDEN = { includeHiddenElements: true };

function makeRoute(
  operation?: LeaderboardScreenProps['route']['params']['operation']
): LeaderboardScreenProps['route'] {
  return { key: 'Leaderboard', name: 'Leaderboard', params: { operation } };
}

function renderLeaderboard(route = makeRoute()) {
  return render(
    <SettingsProvider>
      <LeaderboardScreen navigation={{} as LeaderboardScreenProps['navigation']} route={route} />
    </SettingsProvider>
  );
}

const entry = (overrides: Partial<ScoreEntry>): ScoreEntry => ({
  id: 'id',
  name: 'Ada',
  score: 20,
  operation: 'addition',
  createdAt: 1,
  ...overrides,
});

describe('LeaderboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([]);
  });

  afterEach(() => setWindow(PHONE));

  it('shows an empty state with Sunny when there are no scores yet', async () => {
    const { findByText, getByTestId } = await renderLeaderboard();

    expect(await findByText(/No scores yet/)).toBeTruthy();
    expect(getByTestId('sunny', HIDDEN)).toBeTruthy();
  });

  it('titles the screen as a heading', async () => {
    const { getByRole } = await renderLeaderboard();

    expect(getByRole('header')).toHaveTextContent('Leaderboard');
  });

  it('lists the top scores it loads, ranked from 1, each with its animal', async () => {
    jest
      .mocked(scoresRepository.getTopScores)
      .mockResolvedValue([
        entry({ id: '1', name: 'Fox', avatar: 'fox', score: 34 }),
        entry({ id: '2', name: 'Maya', score: 15 }),
      ]);

    const { findByText, getAllByTestId, getByTestId } = await renderLeaderboard();

    expect(await findByText('Fox')).toBeTruthy();
    expect(await findByText('Maya')).toBeTruthy();
    expect(getAllByTestId('score-row')).toHaveLength(2);
    expect(getByTestId('avatar-fox', HIDDEN)).toBeTruthy();
    // A score saved before avatars shows its first letter instead.
    expect(getByTestId('avatar-initial', HIDDEN)).toBeTruthy();
    expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, undefined, undefined);
  });

  it('opens on the operation it was asked to show', async () => {
    const { getByTestId } = await renderLeaderboard(makeRoute('division'));

    expect(getByTestId('filter-game-division').props.accessibilityState).toEqual({
      selected: true,
    });
    await waitFor(() => {
      expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, 'division', undefined);
    });
  });

  it('refetches filtered by operation when a game filter is tapped', async () => {
    const { findByText, getByText } = await renderLeaderboard();
    await findByText(/No scores yet/);

    await fireEvent.press(getByText('×'));

    await waitFor(() => {
      expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, 'multiplication', undefined);
    });
  });

  it('refetches filtered by difficulty when a level is tapped, keeping the operation filter', async () => {
    const { findByText, getByText } = await renderLeaderboard(makeRoute('division'));
    await findByText(/No scores yet/);

    await fireEvent.press(getByText('Hard'));

    await waitFor(() => {
      expect(scoresRepository.getTopScores).toHaveBeenCalledWith(10, 'division', 'hard');
    });
  });

  it('goes back to every game and every level with the All filters', async () => {
    const { findByText, getByTestId } = await renderLeaderboard(makeRoute('division'));
    await findByText(/No scores yet/);
    await fireEvent.press(getByTestId('filter-level-hard'));

    await fireEvent.press(getByTestId('filter-game-all'));
    await fireEvent.press(getByTestId('filter-level-all'));

    await waitFor(() => {
      expect(scoresRepository.getTopScores).toHaveBeenLastCalledWith(10, undefined, undefined);
    });
  });

  it('ignores a slow answer for filters the player has already moved on from', async () => {
    let resolveFirst: (scores: ScoreEntry[]) => void = () => {};
    jest
      .mocked(scoresRepository.getTopScores)
      .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
      .mockResolvedValue([entry({ id: 'fresh', name: 'Fresh' })]);
    const { getByText, findByText, queryByText } = await renderLeaderboard();

    await fireEvent.press(getByText('+'));
    expect(await findByText('Fresh')).toBeTruthy();
    resolveFirst([entry({ id: 'stale', name: 'Stale' })]);

    await waitFor(() => expect(queryByText('Stale')).toBeNull());
  });

  it('labels each row with its operation and level, and omits the level for older scores', async () => {
    jest
      .mocked(scoresRepository.getTopScores)
      .mockResolvedValue([
        entry({ id: '1', name: 'Ada', score: 20, difficulty: 'hard' }),
        entry({ id: '2', name: 'Lin', score: 15, operation: 'division' }),
      ]);

    const { findByText, getAllByText, queryByText } = await renderLeaderboard();

    expect(await findByText('+ · Hard')).toBeTruthy();
    // The older score shows just its operation: the '÷' filter plus its own row.
    expect(getAllByText('÷')).toHaveLength(2);
    expect(queryByText(/÷ ·/)).toBeNull();
  });

  it('reads each row as one thing, with its place, name, points and operation', async () => {
    jest
      .mocked(scoresRepository.getTopScores)
      .mockResolvedValue([
        entry({ name: 'Fox', score: 34, operation: 'addition', difficulty: 'easy' }),
      ]);

    const { findByLabelText } = await renderLeaderboard();

    expect(await findByLabelText('1. Fox, 34 points, Addition, Easy')).toBeTruthy();
  });

  describe('layout', () => {
    it.each([
      ['a phone', PHONE],
      ['an iPad in portrait', IPAD_PORTRAIT],
    ])('keeps one readable centered column on %s', async (_name, window) => {
      setWindow(window);
      const { getByTestId, queryByTestId } = await renderLeaderboard();

      expect(getByTestId('leaderboard-column')).toHaveStyle({ maxWidth: 680, alignSelf: 'center' });
      expect(queryByTestId('leaderboard-side')).toBeNull();
    });

    it('puts the title and filters in a side column beside the list on a wide landscape window', async () => {
      setWindow(IPAD_LANDSCAPE);
      const { getByTestId, queryByTestId } = await renderLeaderboard();

      expect(queryByTestId('leaderboard-column')).toBeNull();
      const side = within(getByTestId('leaderboard-side'));
      expect(side.getByText('Leaderboard')).toBeTruthy();
      expect(side.getByText('Game')).toBeTruthy();
      expect(side.getByText('Level')).toBeTruthy();
      expect(side.getByText('All levels')).toBeTruthy();
      expect(StyleSheet.flatten(getByTestId('leaderboard-side').props.style).width).toBe(300);
      // The list is not inside the side column.
      expect(side.queryByTestId('leaderboard-list')).toBeNull();
    });

    it('scrolls the title and filters with the list on a phone, so the rows get the screen', async () => {
      jest.mocked(scoresRepository.getTopScores).mockResolvedValue([entry({})]);
      setWindow(PHONE_LANDSCAPE);
      const { getByTestId } = await renderLeaderboard();

      const list = within(getByTestId('leaderboard-list'));
      expect(list.getByText('Leaderboard')).toBeTruthy();
      expect(list.getByText('All levels')).toBeTruthy();
      expect(await list.findByText('Ada')).toBeTruthy();
    });

    it('keeps the empty message inside the list too', async () => {
      const { getByTestId } = await renderLeaderboard();

      expect(
        await within(getByTestId('leaderboard-list')).findByText(/No scores yet/)
      ).toBeTruthy();
    });
  });
});
