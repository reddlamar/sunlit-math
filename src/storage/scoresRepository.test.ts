import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addScore,
  getAllScores,
  getLastPlayerName,
  getTopScores,
  setLastPlayerName,
} from './scoresRepository';
import type { ScoreEntry } from '../types/game';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

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

  it('filters top scores by difficulty, leaving out scores saved before difficulty was recorded', async () => {
    await addScore(makeEntry({ id: 'a', score: 10, difficulty: 'easy' }));
    await addScore(makeEntry({ id: 'b', score: 20, difficulty: 'hard' }));
    await addScore(makeEntry({ id: 'c', score: 30 }));

    const hard = await getTopScores(10, undefined, 'hard');
    expect(hard.map((s) => s.id)).toEqual(['b']);

    const all = await getTopScores(10);
    expect(all.map((s) => s.id)).toEqual(['c', 'b', 'a']);
  });

  it('combines the operation and difficulty filters', async () => {
    await addScore(makeEntry({ id: 'a', score: 10, operation: 'addition', difficulty: 'hard' }));
    await addScore(makeEntry({ id: 'b', score: 20, operation: 'division', difficulty: 'hard' }));
    await addScore(makeEntry({ id: 'c', score: 30, operation: 'division', difficulty: 'easy' }));

    const scores = await getTopScores(10, 'division', 'hard');
    expect(scores.map((s) => s.id)).toEqual(['b']);
  });

  it('remembers the last player name, defaulting to empty', async () => {
    expect(await getLastPlayerName()).toBe('');
    await setLastPlayerName('Ada');
    expect(await getLastPlayerName()).toBe('Ada');
  });
});
