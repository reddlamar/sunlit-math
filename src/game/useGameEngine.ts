import { useCallback, useMemo, useState } from 'react';
import { onCorrectAnswer, onWrongAnswer } from './scoring';
import { generatorForOperation } from './problemGenerators';
import { useGameTimer } from './useGameTimer';
import { playCorrectSound, playWrongSound } from '../audio/sounds';
import type { Difficulty, GameState, GameStatus, Operation, Problem } from '../types/game';

const GAME_DURATION_MS = 60000;

export type UseGameEngineResult = {
  problem: Problem | null;
  score: number;
  streak: number;
  timeLeft: number;
  duration: number;
  status: GameStatus;
  start: () => void;
  submitAnswer: (value: number) => void;
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

  const handleExpire = useCallback(() => {
    setStatus('ended');
  }, []);

  const timer = useGameTimer(GAME_DURATION_MS, handleExpire);

  const start = useCallback(() => {
    setGameState({ score: 0, streak: 0 });
    setProblem(generator(difficulty));
    setStatus('playing');
    timer.start();
  }, [generator, difficulty, timer]);

  const submitAnswer = useCallback(
    (value: number) => {
      if (status !== 'playing' || !problem) {
        return;
      }
      const isCorrect = value === problem.answer;
      setGameState((prev) => (isCorrect ? onCorrectAnswer(prev) : onWrongAnswer(prev)));
      setProblem(generator(difficulty));
      if (isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    },
    [status, problem, generator, difficulty]
  );

  const pause = useCallback(() => {
    if (status !== 'playing') {
      return;
    }
    timer.pause();
    setStatus('paused');
  }, [status, timer]);

  const resume = useCallback(() => {
    if (status !== 'paused') {
      return;
    }
    timer.resume();
    setStatus('playing');
  }, [status, timer]);

  return {
    problem,
    score: gameState.score,
    streak: gameState.streak,
    timeLeft: timer.timeLeft,
    duration: GAME_DURATION_MS,
    status,
    start,
    submitAnswer,
    pause,
    resume,
  };
}
