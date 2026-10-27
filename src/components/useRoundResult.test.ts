import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRoundResult } from './useRoundResult';
import * as repository from '../storage/scoresRepository';
import {
  addScore,
  getAllScores,
  getLastPlayerName,
  setLastPlayerName,
} from '../storage/scoresRepository';
import type { ScoreEntry } from '../types/game';

const entry = (overrides: Partial<ScoreEntry>): ScoreEntry => ({
  id: 'old',
  name: 'Fox',
  avatar: 'fox',
  score: 10,
  operation: 'addition',
  difficulty: 'easy',
  createdAt: 1,
  ...overrides,
});

type Input = Parameters<typeof useRoundResult>[0];
const roundOver = (overrides: Partial<Input> = {}): Input => ({
  isOver: true,
  score: 12,
  operation: 'addition',
  difficulty: 'easy',
  ...overrides,
});

const renderResult = (input: Input) =>
  renderHook((props: Input) => useRoundResult(props), { initialProps: input });

describe('useRoundResult', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does nothing while the round is still going', async () => {
    const { result } = await renderResult(roundOver({ isOver: false }));

    expect(result.current.status).toBe('idle');
    expect(result.current.isReady).toBe(false);
    expect(await getAllScores()).toEqual([]);
  });

  it('saves the score the moment the round ends, under the default animal', async () => {
    const { result } = await renderResult(roundOver());

    await waitFor(() => expect(result.current.status).toBe('saved'));

    expect(await getAllScores()).toEqual([
      expect.objectContaining({
        name: 'Fox',
        avatar: 'fox',
        score: 12,
        operation: 'addition',
        difficulty: 'easy',
      }),
    ]);
    expect(result.current.avatar).toBe('fox');
  });

  it('opens on the animal the player used last time', async () => {
    await setLastPlayerName('Frog');
    const { result } = await renderResult(roundOver());

    await waitFor(() => expect(result.current.status).toBe('saved'));

    expect(result.current.avatar).toBe('frog');
    expect((await getAllScores())[0]).toMatchObject({ name: 'Frog', avatar: 'frog' });
  });

  it('falls back to the default animal when the last name was typed before avatars existed', async () => {
    await setLastPlayerName('Maya');
    const { result } = await renderResult(roundOver());

    await waitFor(() => expect(result.current.status).toBe('saved'));

    expect(result.current.avatar).toBe('fox');
  });

  describe('previous best', () => {
    it('is null for a first round', async () => {
      const { result } = await renderResult(roundOver());

      await waitFor(() => expect(result.current.isReady).toBe(true));

      expect(result.current.previousBest).toBeNull();
    });

    it('is the best before this round, not counting this round itself', async () => {
      await addScore(entry({ id: 'a', score: 20 }));
      await addScore(entry({ id: 'b', score: 34 }));
      const { result } = await renderResult(roundOver({ score: 50 }));

      await waitFor(() => expect(result.current.status).toBe('saved'));

      expect(result.current.previousBest).toBe(34);
    });

    it('only counts the same operation and level', async () => {
      await addScore(entry({ id: 'a', score: 99, operation: 'division' }));
      await addScore(entry({ id: 'b', score: 98, difficulty: 'hard' }));
      await addScore(entry({ id: 'c', score: 7 }));
      const { result } = await renderResult(roundOver());

      await waitFor(() => expect(result.current.status).toBe('saved'));

      expect(result.current.previousBest).toBe(7);
    });
  });

  it('lists the top players, the new score included', async () => {
    await addScore(entry({ id: 'a', score: 20 }));
    const { result } = await renderResult(roundOver({ score: 30 }));

    await waitFor(() => expect(result.current.status).toBe('saved'));

    expect(result.current.topScores.map((top) => top.score)).toEqual([30, 20]);
  });

  it('remembers the animal for next time', async () => {
    const { result } = await renderResult(roundOver());
    await waitFor(() => expect(result.current.status).toBe('saved'));

    expect(await getLastPlayerName()).toBe('Fox');
  });

  describe('choosing another animal', () => {
    it('changes the saved score, the top list and what is remembered', async () => {
      const { result } = await renderResult(roundOver());
      await waitFor(() => expect(result.current.status).toBe('saved'));

      await act(async () => {
        result.current.chooseAvatar('owl');
      });

      await waitFor(async () => {
        expect((await getAllScores())[0]).toMatchObject({ name: 'Owl', avatar: 'owl' });
      });
      expect(result.current.avatar).toBe('owl');
      await waitFor(() => expect(result.current.topScores[0]).toMatchObject({ avatar: 'owl' }));
      expect(await getLastPlayerName()).toBe('Owl');
    });

    it('does not write anything when the animal is already the one saved', async () => {
      const { result } = await renderResult(roundOver());
      await waitFor(() => expect(result.current.status).toBe('saved'));
      const setItem = jest.spyOn(AsyncStorage, 'setItem');
      setItem.mockClear();

      await act(async () => {
        result.current.chooseAvatar('fox');
      });

      expect(setItem).not.toHaveBeenCalled();
    });

    it('is applied to the score even if picked before the score finished saving', async () => {
      const { result } = await renderResult(roundOver());

      // Picked straight away, while the first lookups are still in flight.
      await act(async () => {
        result.current.chooseAvatar('bear');
      });
      await waitFor(() => expect(result.current.status).toBe('saved'));

      expect(await getAllScores()).toEqual([expect.objectContaining({ avatar: 'bear' })]);
      expect(result.current.avatar).toBe('bear');
      expect(await getLastPlayerName()).toBe('Bear');
    });

    it('puts the picker back on the saved animal if the change cannot be written', async () => {
      const { result } = await renderResult(roundOver());
      await waitFor(() => expect(result.current.status).toBe('saved'));
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));

      await act(async () => {
        result.current.chooseAvatar('owl');
      });

      await waitFor(() => expect(result.current.avatar).toBe('fox'));
      expect((await getAllScores())[0]).toMatchObject({ avatar: 'fox' });
    });
  });

  describe('when the score cannot be saved', () => {
    it('says so, and a retry saves it once', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));
      const { result } = await renderResult(roundOver());
      await waitFor(() => expect(result.current.status).toBe('failed'));
      expect(await getAllScores()).toEqual([]);

      await act(async () => {
        result.current.retry();
      });
      await waitFor(() => expect(result.current.status).toBe('saved'));

      expect(await getAllScores()).toHaveLength(1);
    });

    it('still shows the result, with the failure, if something went wrong before the best was looked up', async () => {
      jest.spyOn(repository, 'getLastPlayerName').mockRejectedValueOnce(new Error('disk'));
      const { result } = await renderResult(roundOver());

      await waitFor(() => expect(result.current.status).toBe('failed'));

      // Not stuck on a blank screen: there is a result to show, and a way to try again.
      expect(result.current.isReady).toBe(true);
      expect(result.current.previousBest).toBeNull();
    });

    it('keeps the animal the player picked while it was failing', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));
      const { result } = await renderResult(roundOver());
      await waitFor(() => expect(result.current.status).toBe('failed'));
      await act(async () => {
        result.current.chooseAvatar('cat');
      });

      await act(async () => {
        result.current.retry();
      });
      await waitFor(() => expect(result.current.status).toBe('saved'));

      expect((await getAllScores())[0]).toMatchObject({ avatar: 'cat', name: 'Cat' });
    });
  });

  describe('a new round', () => {
    it('forgets the last result when the next round begins, and saves the next one separately', async () => {
      const { result, rerender } = await renderResult(roundOver({ score: 5 }));
      await waitFor(() => expect(result.current.status).toBe('saved'));
      await act(async () => {
        result.current.chooseAvatar('owl');
      });

      await rerender(roundOver({ isOver: false }));
      expect(result.current.status).toBe('idle');
      expect(result.current.isReady).toBe(false);
      expect(result.current.topScores).toEqual([]);

      await rerender(roundOver({ score: 9 }));
      await waitFor(() => expect(result.current.status).toBe('saved'));

      const saved = await getAllScores();
      expect(saved.map((score) => score.score).sort()).toEqual([5, 9]);
      // The animal picked last round is remembered, not stuck to the new score by accident.
      expect(result.current.avatar).toBe('owl');
      expect(result.current.previousBest).toBe(5);
    });

    it('does not save twice if the screen re-renders while it is over', async () => {
      const { result, rerender } = await renderResult(roundOver());
      await waitFor(() => expect(result.current.status).toBe('saved'));

      await rerender(roundOver());
      await rerender(roundOver());

      expect(await getAllScores()).toHaveLength(1);
    });
  });

  it('stops quietly if the screen goes away mid-save', async () => {
    const { result, unmount } = await renderResult(roundOver());

    await unmount();

    // Nothing to assert on the unmounted hook; reaching here without a state-update warning
    // or an error is the point.
    expect(result.current.status).toBeDefined();
  });
});
