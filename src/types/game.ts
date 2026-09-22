export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type Difficulty = 'easy' | 'medium' | 'hard';

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

export type Theme = 'light' | 'dark';

export type Settings = {
  muted: boolean;
  theme: Theme;
  difficulty: Difficulty;
};
