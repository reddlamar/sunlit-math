import { renderHook, act } from '@testing-library/react-native';
import { useGameEngine } from './useGameEngine';
import * as sounds from '../audio/sounds';

describe('useGameEngine', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts idle with a full 60 second clock and no problem', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));
    expect(result.current.status).toBe('idle');
    expect(result.current.timeLeft).toBe(60000);
    expect(result.current.duration).toBe(60000);
    expect(result.current.problem).toBeNull();
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
  });

  it('loads a problem and moves to playing status on start', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));

    await act(async () => {
      result.current.start();
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.problem).not.toBeNull();
  });

  it('increases score and loads a new problem on a correct submitAnswer', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));
    await act(async () => {
      result.current.start();
    });
    const correctAnswer = result.current.problem!.answer;
    const previousId = result.current.problem!.id;

    await act(async () => {
      result.current.submitAnswer(correctAnswer);
    });

    expect(result.current.score).toBe(1);
    expect(result.current.streak).toBe(1);
    expect(result.current.problem!.id).not.toBe(previousId);
  });

  it('decreases score and resets streak on a wrong submitAnswer', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));
    await act(async () => {
      result.current.start();
    });
    const wrongAnswer = result.current.problem!.answer + 1000;

    await act(async () => {
      result.current.submitAnswer(wrongAnswer);
    });

    expect(result.current.score).toBe(-1);
    expect(result.current.streak).toBe(0);
  });

  it('ignores submitAnswer while idle or ended', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));

    await act(async () => {
      result.current.submitAnswer(0);
    });
    expect(result.current.score).toBe(0);
  });

  it('moves to ended status when the timer expires', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));
    await act(async () => {
      result.current.start();
    });

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    expect(result.current.status).toBe('ended');
    expect(result.current.timeLeft).toBe(0);
  });

  it('pauses and resumes, ignoring answers while paused', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));
    await act(async () => {
      result.current.start();
    });

    await act(async () => {
      result.current.pause();
    });
    expect(result.current.status).toBe('paused');
    const timeLeftAtPause = result.current.timeLeft;

    await act(async () => {
      result.current.submitAnswer(result.current.problem!.answer);
    });
    expect(result.current.score).toBe(0);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.timeLeft).toBe(timeLeftAtPause);

    await act(async () => {
      result.current.resume();
    });
    expect(result.current.status).toBe('playing');
  });

  it('ignores pause when not playing and resume when not paused', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));

    await act(async () => {
      result.current.pause();
    });
    expect(result.current.status).toBe('idle');

    await act(async () => {
      result.current.start();
    });
    await act(async () => {
      result.current.resume();
    });
    expect(result.current.status).toBe('playing');
  });

  it('resets score and streak when starting a new round', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));
    await act(async () => {
      result.current.start();
    });
    await act(async () => {
      result.current.submitAnswer(result.current.problem!.answer);
    });
    expect(result.current.score).toBe(1);

    await act(async () => {
      result.current.start();
    });
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.status).toBe('playing');
  });

  it('reports whether each submitted answer was correct, wrong, or ignored', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));

    expect(result.current.submitAnswer(0)).toBe('ignored');

    await act(async () => {
      result.current.start();
    });

    let outcome: ReturnType<typeof result.current.submitAnswer> | undefined;
    await act(async () => {
      outcome = result.current.submitAnswer(result.current.problem!.answer + 1000);
    });
    expect(outcome).toBe('wrong');

    await act(async () => {
      outcome = result.current.submitAnswer(result.current.problem!.answer);
    });
    expect(outcome).toBe('correct');
  });

  describe('lastAnswer', () => {
    const startRound = async () => {
      const hook = await renderHook(() => useGameEngine('addition'));
      await act(async () => {
        hook.result.current.start();
      });
      return hook.result;
    };

    it('is null before the first answer', async () => {
      const result = await startRound();
      expect(result.current.lastAnswer).toBeNull();
    });

    it('records a correct answer with the sum it answered and the points it earned', async () => {
      const result = await startRound();
      const answered = result.current.problem!;

      await act(async () => {
        result.current.submitAnswer(answered.answer);
      });

      expect(result.current.lastAnswer).toEqual({
        id: 1,
        problem: answered,
        chosen: answered.answer,
        result: 'correct',
        points: 1,
      });
    });

    it('records a wrong answer with the button that was tapped and the point it cost', async () => {
      const result = await startRound();
      const answered = result.current.problem!;
      const wrong = answered.answer + 1000;

      await act(async () => {
        result.current.submitAnswer(wrong);
      });

      expect(result.current.lastAnswer).toMatchObject({
        id: 1,
        problem: answered,
        chosen: wrong,
        result: 'wrong',
        points: -1,
      });
    });

    it('reports the streak bonus as the points of the fourth right answer in a row', async () => {
      const result = await startRound();

      for (let answer = 1; answer <= 4; answer++) {
        await act(async () => {
          result.current.submitAnswer(result.current.problem!.answer);
        });
        expect(result.current.lastAnswer!.id).toBe(answer);
      }

      expect(result.current.lastAnswer!.points).toBe(3);
    });

    it('judges two answers made in the same frame one after the other', async () => {
      const result = await startRound();
      const first = result.current.problem!.answer;

      await act(async () => {
        result.current.submitAnswer(first);
        result.current.submitAnswer(result.current.problem!.answer + 1000);
      });

      expect(result.current.score).toBe(0);
      expect(result.current.lastAnswer).toMatchObject({ id: 2, result: 'wrong', points: -1 });
    });

    it('clears when a new round starts and counts from 1 again', async () => {
      const result = await startRound();
      await act(async () => {
        result.current.submitAnswer(result.current.problem!.answer);
      });

      await act(async () => {
        result.current.start();
      });
      expect(result.current.lastAnswer).toBeNull();

      await act(async () => {
        result.current.submitAnswer(result.current.problem!.answer);
      });
      expect(result.current.lastAnswer!.id).toBe(1);
    });

    it('is not touched by an ignored answer', async () => {
      const result = await startRound();
      await act(async () => {
        result.current.pause();
      });

      await act(async () => {
        result.current.submitAnswer(result.current.problem!.answer);
      });

      expect(result.current.lastAnswer).toBeNull();
    });
  });

  describe('holding the clock', () => {
    const startRound = async () => {
      const hook = await renderHook(() => useGameEngine('addition'));
      await act(async () => {
        hook.result.current.start();
      });
      return hook.result;
    };
    const wait = (ms: number) =>
      act(async () => {
        jest.advanceTimersByTime(ms);
      });

    it('stops the clock without pausing the round', async () => {
      const result = await startRound();
      await wait(1000);

      await act(async () => {
        result.current.holdClock();
      });
      const heldAt = result.current.timeLeft;
      await wait(5000);

      expect(result.current.timeLeft).toBe(heldAt);
      expect(result.current.status).toBe('playing');
    });

    it('lets the clock run on again from where it stopped, losing no time', async () => {
      const result = await startRound();
      await wait(1000);
      await act(async () => {
        result.current.holdClock();
      });
      const heldAt = result.current.timeLeft;
      await wait(5000);

      await act(async () => {
        result.current.releaseClock();
      });
      await wait(1000);

      expect(result.current.timeLeft).toBeLessThan(heldAt);
      expect(result.current.timeLeft).toBeGreaterThanOrEqual(heldAt - 1100);
    });

    it('does not let the round expire while held', async () => {
      const result = await startRound();
      await act(async () => {
        result.current.holdClock();
      });

      await wait(120000);

      expect(result.current.status).toBe('playing');
    });

    it('keeps the clock stopped when the player resumes from a pause during a hold', async () => {
      const result = await startRound();
      await act(async () => {
        result.current.holdClock();
        result.current.pause();
      });
      await act(async () => {
        result.current.resume();
      });
      const heldAt = result.current.timeLeft;
      await wait(3000);

      expect(result.current.status).toBe('playing');
      expect(result.current.timeLeft).toBe(heldAt);
    });

    it('restarts the clock on release if the round was resumed in the meantime', async () => {
      const result = await startRound();
      await act(async () => {
        result.current.holdClock();
        result.current.pause();
        result.current.resume();
      });

      await act(async () => {
        result.current.releaseClock();
      });
      const releasedAt = result.current.timeLeft;
      await wait(1000);

      expect(result.current.timeLeft).toBeLessThan(releasedAt);
    });

    it('leaves a paused round paused when released, for its own resume to restart', async () => {
      const result = await startRound();
      await act(async () => {
        result.current.holdClock();
        result.current.pause();
      });

      await act(async () => {
        result.current.releaseClock();
      });
      const pausedAt = result.current.timeLeft;
      await wait(3000);

      expect(result.current.status).toBe('paused');
      expect(result.current.timeLeft).toBe(pausedAt);

      await act(async () => {
        result.current.resume();
      });
      await wait(1000);
      expect(result.current.timeLeft).toBeLessThan(pausedAt);
    });

    it('does nothing on release when the clock was not held', async () => {
      const result = await startRound();
      await wait(1000);
      const before = result.current.timeLeft;

      await act(async () => {
        result.current.releaseClock();
      });
      await wait(1000);

      // The clock kept running as normal; a stray release neither restarted nor stopped it.
      expect(result.current.timeLeft).toBeLessThan(before);
    });

    it('forgets a hold when a new round starts', async () => {
      const result = await startRound();
      await act(async () => {
        result.current.holdClock();
      });

      await act(async () => {
        result.current.start();
      });
      await wait(1000);

      expect(result.current.timeLeft).toBeLessThan(60000);
    });

    it('can hold before a round has started without breaking it', async () => {
      const hook = await renderHook(() => useGameEngine('addition'));
      await act(async () => {
        hook.result.current.holdClock();
        hook.result.current.releaseClock();
      });

      expect(hook.result.current.status).toBe('idle');
      expect(hook.result.current.timeLeft).toBe(60000);
    });
  });

  it('keeps start, submitAnswer, pause and resume stable across timer ticks', async () => {
    const { result } = await renderHook(() => useGameEngine('addition'));
    await act(async () => {
      result.current.start();
    });
    const before = {
      start: result.current.start,
      submitAnswer: result.current.submitAnswer,
      pause: result.current.pause,
      resume: result.current.resume,
      holdClock: result.current.holdClock,
      releaseClock: result.current.releaseClock,
    };

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBeLessThan(60000);
    expect(result.current.start).toBe(before.start);
    expect(result.current.submitAnswer).toBe(before.submitAnswer);
    expect(result.current.pause).toBe(before.pause);
    expect(result.current.resume).toBe(before.resume);
    expect(result.current.holdClock).toBe(before.holdClock);
    expect(result.current.releaseClock).toBe(before.releaseClock);
  });

  it('stays free of side effects: sound is the screen\'s job, not the engine\'s', async () => {
    const correct = jest.spyOn(sounds, 'playCorrectSound');
    const wrong = jest.spyOn(sounds, 'playWrongSound');
    const { result } = await renderHook(() => useGameEngine('addition'));
    await act(async () => {
      result.current.start();
    });

    await act(async () => {
      result.current.submitAnswer(result.current.problem!.answer);
    });
    await act(async () => {
      result.current.submitAnswer(result.current.problem!.answer + 1000);
    });

    expect(correct).not.toHaveBeenCalled();
    expect(wrong).not.toHaveBeenCalled();
  });
});
