import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { LeaderboardScreen } from './LeaderboardScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import * as scoresRepository from '../storage/scoresRepository';
import { fontFamily, light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';
import {
  PHONE,
  PHONE_LANDSCAPE,
  IPAD_LANDSCAPE,
  IPAD_PORTRAIT,
  setWindow,
} from '../testUtils/window';
import type { LeaderboardScreenProps } from '../navigation/types';

jest.mock('../storage/scoresRepository');

function makeRoute(
  operation?: LeaderboardScreenProps['route']['params']['operation']
): LeaderboardScreenProps['route'] {
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

describe('LeaderboardScreen layout', () => {
  afterEach(() => setWindow(PHONE));

  it.each([
    ['a phone', PHONE],
    ['an iPad in landscape', IPAD_LANDSCAPE],
  ])('keeps the list in a readable centered column on %s', async (_name, window) => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([]);
    setWindow(window);
    const { getByTestId } = await renderLeaderboard(makeNavigation(), makeRoute());
    expect(getByTestId('leaderboard-column')).toHaveStyle({ maxWidth: 640, alignSelf: 'center' });
  });
});

describe('LeaderboardScreen readability', () => {
  afterEach(() => setWindow(PHONE));

  const fourScores = [1, 2, 3, 4].map((n) => ({
    id: String(n),
    name: `Player ${n}`,
    score: 50 - n,
    operation: 'addition' as const,
    createdAt: n,
  }));

  it('draws ranks 4 and up in the theme text color so they stay visible in dark mode', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue(fourScores);
    const { findByText } = await renderLeaderboard(makeNavigation(), makeRoute());
    expect(await findByText('4.')).toHaveStyle({ color: light.textPrimary });
  });

  it('grows the title, names and scores on an iPad', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue(fourScores);
    setWindow(IPAD_PORTRAIT);
    const { findByText, getByText } = await renderLeaderboard(makeNavigation(), makeRoute());
    expect(await findByText('Player 1')).toHaveStyle({ fontSize: 22.4 });
    expect(getByText('49')).toHaveStyle({ fontSize: 25.2 });
    expect(getByText(/Leaderboard/)).toHaveStyle({ fontSize: 36.4 });
    expect(getByText('Hard')).toHaveStyle({ fontSize: 19.6 });
  });
});

describe('LeaderboardScreen on a short window', () => {
  afterEach(() => setWindow(PHONE));

  it('scrolls the title and filters with the list, so the rows get the whole screen', async () => {
    jest
      .mocked(scoresRepository.getTopScores)
      .mockResolvedValue([
        { id: '1', name: 'Ada', score: 20, operation: 'addition', createdAt: 1 },
      ]);
    setWindow(PHONE_LANDSCAPE);
    const { getByTestId } = await renderLeaderboard(makeNavigation(), makeRoute());
    const list = within(getByTestId('leaderboard-list'));
    expect(list.getByText(/Leaderboard/)).toBeTruthy();
    expect(list.getByText('All levels')).toBeTruthy();
    expect(await list.findByText('Ada')).toBeTruthy();
  });

  it('keeps the empty message inside the list too', async () => {
    jest.mocked(scoresRepository.getTopScores).mockResolvedValue([]);
    const { getByTestId } = await renderLeaderboard(makeNavigation(), makeRoute());
    expect(await within(getByTestId('leaderboard-list')).findByText(/No scores yet/)).toBeTruthy();
  });
});
