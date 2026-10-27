/** "1 point", "24 points": the score as a child reads it. */
export function formatPoints(score: number): string {
  return `${score} ${Math.abs(score) === 1 ? 'point' : 'points'}`;
}
