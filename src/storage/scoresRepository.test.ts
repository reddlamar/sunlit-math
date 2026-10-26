import AsyncStorage from '@react-native-async-storage/async-storage';
import { addScore, getAllScores, getTopScores } from './scoresRepository';
import type { ScoreEntry } from '../types/game';

function makeEntry(overrides: Partial<ScoreEntry>): ScoreEntry {
  return {
    id: 'id',
    name: 'Player',
    score: 0,
    operation: 'addition',
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('scoresRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns an empty array when no scores are saved', async () => {
    expect(await getAllScores()).toEqual([]);
    expect(await getTopScores()).toEqual([]);
  });

  it('persists an added score so it can be read back', async () => {
    const entry = makeEntry({ id: '1', name: 'Ada', score: 5 });
    await addScore(entry);
    expect(await getAllScores()).toEqual([entry]);
  });

  it('keeps only the top 10 scores, sorted descending', async () => {
    for (let i = 0; i < 12; i++) {
      await addScore(makeEntry({ id: String(i), name: `P${i}`, score: i }));
    }
    const scores = await getTopScores(10);
    expect(scores).toHaveLength(10);
    expect(scores[0].score).toBe(11);
    expect(scores[9].score).toBe(2);
  });

  it('filters top scores by operation when requested', async () => {
    await addScore(makeEntry({ id: 'a', score: 10, operation: 'addition' }));
    await addScore(makeEntry({ id: 'b', score: 20, operation: 'division' }));
    await addScore(makeEntry({ id: 'c', score: 15, operation: 'addition' }));

    const scores = await getTopScores(10, 'addition');
    expect(scores).toHaveLength(2);
    expect(scores.every((s) => s.operation === 'addition')).toBe(true);
    expect(scores[0].score).toBe(15);
  });

  describe('resilience', () => {
    const KEY = 'math60_scores_v1';

    afterEach(() => jest.restoreAllMocks());

    it('treats unparseable stored data as no scores instead of throwing', async () => {
      await AsyncStorage.setItem(KEY, '{not json');
      expect(await getAllScores()).toEqual([]);
    });

    it('treats a non-array payload as no scores', async () => {
      await AsyncStorage.setItem(KEY, JSON.stringify({ oops: true }));
      expect(await getAllScores()).toEqual([]);
    });

    it('drops malformed entries but keeps the valid ones', async () => {
      const good = makeEntry({ id: 'good', score: 4 });
      await AsyncStorage.setItem(
        KEY,
        JSON.stringify([good, null, { id: 1 }, { ...good, id: 'x', score: 'NaN' }, { ...good, operation: 'power' }])
      );
      expect(await getAllScores()).toEqual([good]);
    });

    it('returns no scores when storage itself fails to read', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
      expect(await getAllScores()).toEqual([]);
    });

    it('does not lose scores saved at the same time', async () => {
      await Promise.all(
        Array.from({ length: 5 }, (_, i) => addScore(makeEntry({ id: `c${i}`, score: i })))
      );
      expect(await getAllScores()).toHaveLength(5);
    });

    it('does not overwrite saved scores when they cannot be read while saving', async () => {
      const existing = makeEntry({ id: 'old', score: 9 });
      await addScore(existing);
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));

      await expect(addScore(makeEntry({ id: 'new' }))).rejects.toThrow('disk');
      expect(await getAllScores()).toEqual([existing]);
    });

    it('rejects when a write fails, then keeps accepting later scores', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));
      await expect(addScore(makeEntry({ id: 'lost' }))).rejects.toThrow('full');

      await addScore(makeEntry({ id: 'kept' }));
      expect((await getAllScores()).map((entry) => entry.id)).toEqual(['kept']);
    });
  });
});
