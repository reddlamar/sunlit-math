export const MAX_STARS = 3;
export type StarCount = 1 | 2 | 3;

/** How close to the old best still earns two stars. */
const TWO_STAR_SHARE = 0.75;

/**
 * Stars for a finished round, judged against the player's best before it (null if they have
 * none yet). Three for beating it, two for coming within three quarters of it, one
 * otherwise. A first round gets two, as there is nothing to beat. A round that scored
 * nothing, or less, always gets one: finishing is worth a star, not a celebration.
 */
export function starsForScore(score: number, previousBest: number | null): StarCount {
  if (score <= 0) {
    return 1;
  }
  if (previousBest === null) {
    return 2;
  }
  if (score > previousBest) {
    return 3;
  }
  return score >= previousBest * TWO_STAR_SHARE ? 2 : 1;
}
