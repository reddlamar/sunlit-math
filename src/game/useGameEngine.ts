import { useCallback, useMemo, useRef, useState } from 'react';
import { onCorrectAnswer, onWrongAnswer } from './scoring';
import { generatorForOperation } from './problemGenerators';
import { useGameTimer } from './useGameTimer';
import type {
  AnswerOutcome,
  Difficulty,
  GameState,
  GameStatus,
  Operation,
  Problem,
} from '../types/game';

const GAME_DURATION_MS = 60000;

// The engine is pure game logic: it reports each answer's result and leaves feedback
// (sound, shake) to the screen, so this layer depends on neither audio nor the UI.
export type AnswerResult = 'correct' | 'wrong' | 'ignored';

export type UseGameEngineResult = {
  problem: Problem | null;
  /** The most recent answer of this round, for feedback. Null before the first one. */
  lastAnswer: AnswerOutcome | null;
  score: number;
  streak: number;
  timeLeft: number;
  duration: number;
  status: GameStatus;
  start: () => void;
  submitAnswer: (value: number) => AnswerResult;
  pause: () => void;
  resume: () => void;
};

export function useGameEngine(
  operation: Operation,
  difficulty: Difficulty = 'easy'
): UseGameEngineResult {
  const generator = useMemo(() => generatorForOperation(operation), [operation]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [gameState, setGameState] = useState<GameState>({ score: 0, streak: 0 });
  const [status, setStatus] = useState<GameStatus>('idle');
  const [lastAnswer, setLastAnswer] = useState<AnswerOutcome | null>(null);

  // The current problem and status are mirrored in refs so the callbacks below read
  // the latest values synchronously. Two quick taps in one frame can't both be
  // judged against the same stale problem, and the callbacks keep a stable identity
  // across the 10 timer re-renders per second (which lets the answer grid skip them).
  const problemRef = useRef<Problem | null>(null);
  const statusRef = useRef<GameStatus>('idle');
  const gameStateRef = useRef<GameState>({ score: 0, streak: 0 });
  const answerCountRef = useRef(0);

  const updateProblem = useCallback((next: Problem | null) => {
    problemRef.current = next;
    setProblem(next);
  }, []);

  const updateStatus = useCallback((next: GameStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const handleExpire = useCallback(() => {
    updateStatus('ended');
  }, [updateStatus]);

  const {
    timeLeft,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
  } = useGameTimer(GAME_DURATION_MS, handleExpire);

  const updateGameState = useCallback((next: GameState) => {
    gameStateRef.current = next;
    setGameState(next);
  }, []);

  const start = useCallback(() => {
    updateGameState({ score: 0, streak: 0 });
    answerCountRef.current = 0;
    setLastAnswer(null);
    updateProblem(generator(difficulty));
    updateStatus('playing');
    startTimer();
  }, [generator, difficulty, startTimer, updateGameState, updateProblem, updateStatus]);

  const submitAnswer = useCallback(
    (value: number): AnswerResult => {
      const current = problemRef.current;
      if (statusRef.current !== 'playing' || !current) {
        return 'ignored';
      }
      const isCorrect = value === current.answer;
      const before = gameStateRef.current;
      const after = isCorrect ? onCorrectAnswer(before) : onWrongAnswer(before);
      updateGameState(after);
      answerCountRef.current += 1;
      setLastAnswer({
        id: answerCountRef.current,
        problem: current,
        chosen: value,
        result: isCorrect ? 'correct' : 'wrong',
        points: after.score - before.score,
      });
      updateProblem(generator(difficulty));
      return isCorrect ? 'correct' : 'wrong';
    },
    [generator, difficulty, updateGameState, updateProblem]
  );

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') {
      return;
    }
    pauseTimer();
    updateStatus('paused');
  }, [pauseTimer, updateStatus]);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') {
      return;
    }
    resumeTimer();
    updateStatus('playing');
  }, [resumeTimer, updateStatus]);

  return {
    problem,
    lastAnswer,
    score: gameState.score,
    streak: gameState.streak,
    timeLeft,
    duration: GAME_DURATION_MS,
    status,
    start,
    submitAnswer,
    pause,
    resume,
  };
}
