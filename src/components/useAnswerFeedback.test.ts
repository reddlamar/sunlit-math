import { AccessibilityInfo } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { REVEAL_MS, useAnswerFeedback } from './useAnswerFeedback';
import type { AnswerOutcome } from '../types/game';

const problem = { id: 'p', question: '8 × 7', answer: 56, choices: [54, 56, 58, 63] };
const miss = (id = 1): AnswerOutcome => ({ id, problem, chosen: 54, result: 'wrong', points: -1 });
const hit = (id = 1): AnswerOutcome => ({ id, problem, chosen: 56, result: 'correct', points: 1 });

describe('useAnswerFeedback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const renderFeedback = (initial: AnswerOutcome | null) =>
    renderHook(({ outcome }: { outcome: AnswerOutcome | null }) => useAnswerFeedback(outcome), {
      initialProps: { outcome: initial },
    });

  it('reveals nothing before the first answer', async () => {
    const { result } = await renderFeedback(null);

    expect(result.current).toBeNull();
  });

  it('reveals a miss on the very render it arrives, with no frame of the next sum between', async () => {
    const { result, rerender } = await renderFeedback(null);

    const outcome = miss();
    await rerender({ outcome });

    expect(result.current).toBe(outcome);
  });

  it('never holds a right answer', async () => {
    const { result } = await renderFeedback(hit());

    expect(result.current).toBeNull();
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it('lets go of a miss after the reveal time, and not before', async () => {
    const { result } = await renderFeedback(miss());

    await act(async () => {
      jest.advanceTimersByTime(REVEAL_MS - 1);
    });
    expect(result.current).not.toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBeNull();
  });

  it('announces the right answer to screen readers once per miss', async () => {
    const { rerender } = await renderFeedback(miss(1));
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Not quite. 8 × 7 is 56'
    );

    await act(async () => {
      jest.advanceTimersByTime(REVEAL_MS);
    });
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);

    await rerender({ outcome: miss(2) });
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(2);
  });

  it('drops a miss the moment a right answer follows', async () => {
    const { result, rerender } = await renderFeedback(miss(1));

    await rerender({ outcome: hit(2) });

    expect(result.current).toBeNull();
  });

  it('clears when a new round resets the answer', async () => {
    const { result, rerender } = await renderFeedback(miss(1));

    await rerender({ outcome: null });

    expect(result.current).toBeNull();
  });

  it('reveals a miss in the next round even though it carries the same id as an old one', async () => {
    const first = miss(1);
    const { result, rerender } = await renderFeedback(first);
    await act(async () => {
      jest.advanceTimersByTime(REVEAL_MS);
    });
    expect(result.current).toBeNull();
    await rerender({ outcome: null });

    const second = miss(1);
    await rerender({ outcome: second });

    expect(result.current).toBe(second);
  });

  it('does not let an old timer cut a newer reveal short', async () => {
    const { result, rerender } = await renderFeedback(miss(1));
    await act(async () => {
      jest.advanceTimersByTime(REVEAL_MS - 100);
    });

    const next = miss(2);
    await rerender({ outcome: next });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(next);
  });
});
