/** "point" for exactly one, "points" otherwise. */
export function pointsLabel(score: number): string {
  return Math.abs(score) === 1 ? 'point' : 'points';
}

/** "1 point", "24 points": the score as a child reads it. */
export function formatPoints(score: number): string {
  return `${score} ${pointsLabel(score)}`;
}
