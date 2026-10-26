export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type GameState = {
  score: number;
  streak: number;
};

export type Problem = {
  id: string;
  question: string;
  answer: number;
  choices: number[];
};

export type ProblemGenerator = (difficulty: Difficulty) => Problem;

export type ScoreEntry = {
  id: string;
  name: string;
  score: number;
  operation: Operation;
  createdAt: number;
};

export type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export type Settings = {
  muted: boolean;
  theme: Theme;
  difficulty: Difficulty;
};
