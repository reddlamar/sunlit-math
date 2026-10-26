import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPERATIONS } from '../game/operations';
import type { Operation, ScoreEntry } from '../types/game';

const KEY = 'math60_scores_v1';

const OPERATION_NAMES: readonly string[] = OPERATIONS.map((entry) => entry.operation);

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.score === 'number' &&
    Number.isFinite(entry.score) &&
    typeof entry.createdAt === 'number' &&
    typeof entry.operation === 'string' &&
    OPERATION_NAMES.includes(entry.operation)
  );
}

/** Parses the stored list, skipping anything corrupt. Throws only if storage can't be read. */
async function readScores(): Promise<ScoreEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isScoreEntry) : [];
  } catch {
    return [];
  }
}

/**
 * Reads every saved score for display. Storage is outside our control, and the Home
 * and Leaderboard screens must still open, so an unreadable store counts as "no
 * scores" and malformed entries are skipped.
 */
export async function getAllScores(): Promise<ScoreEntry[]> {
  try {
    return await readScores();
  } catch {
    return [];
  }
}

// addScore is a read-modify-write of one storage key, so two overlapping calls would
// each read the same list and the later write would drop the earlier score. Chaining
// every write onto this promise makes them run one at a time.
let writeQueue: Promise<unknown> = Promise.resolve();

/** Saves a score. Rejects if the write fails so the caller can tell the player. */
export function addScore(entry: ScoreEntry): Promise<void> {
  const write = writeQueue.then(async () => {
    // Unlike display, a failed read must abort the save: writing back an empty list
    // would erase every score already stored.
    const scores = await readScores();
    scores.push(entry);
    await AsyncStorage.setItem(KEY, JSON.stringify(scores));
  });
  writeQueue = write.catch(() => {});
  return write;
}

export async function getTopScores(limit = 10, operation?: Operation): Promise<ScoreEntry[]> {
  const scores = await getAllScores();
  return scores
    .filter((entry) => !operation || entry.operation === operation)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
