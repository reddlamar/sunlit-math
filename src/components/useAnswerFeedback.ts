import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import type { AnswerOutcome } from '../types/game';

/** How long a missed sum stays up with its right answer lit. The round clock keeps running. */
export const REVEAL_MS = 800;

/**
 * Turns the latest answer into what the board should show. A right answer moves straight
 * on; a wrong one holds the sum it was for ("the reveal") so the child sees the right
 * answer, and is announced to screen readers. Returns null when nothing is being revealed.
 */
export function useAnswerFeedback(lastAnswer: AnswerOutcome | null): AnswerOutcome | null {
  // The reveal is derived while rendering, not set from an effect, so the new sum never
  // flashes up for a frame before the missed one is shown.
  const [dismissed, setDismissed] = useState<AnswerOutcome | null>(null);
  const reveal = lastAnswer?.result === 'wrong' && lastAnswer !== dismissed ? lastAnswer : null;

  useEffect(() => {
    if (!reveal) {
      return;
    }
    AccessibilityInfo.announceForAccessibility(
      `Not quite. ${reveal.problem.question} is ${reveal.problem.answer}`
    );
    const timer = setTimeout(() => setDismissed(reveal), REVEAL_MS);
    return () => clearTimeout(timer);
  }, [reveal]);

  return reveal;
}
