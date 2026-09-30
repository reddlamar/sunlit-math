import { renderHook, act } from '@testing-library/react-native';
import { useGameEngine } from './useGameEngine';

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
});
