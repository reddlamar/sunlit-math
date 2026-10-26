/** Random integer in the inclusive range [min, max]. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Fisher-Yates shuffle that returns a new array and leaves the input untouched. */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let sequence = 0;

/**
 * A unique-enough id for problems and score entries. The counter guarantees two ids
 * created in the same millisecond still differ; the random part keeps ids from
 * different app launches apart.
 */
export function createId(): string {
  sequence += 1;
  return `${Date.now()}-${sequence}-${randomInt(0, 999_999)}`;
}
