export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const AVATAR_IDS = ['fox', 'owl', 'bear', 'cat', 'frog', 'bunny'] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

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
  // Optional: scores saved before 1.2.2 have no difficulty recorded.
  difficulty?: Difficulty;
  // Optional: scores saved before avatars have a typed name and no animal.
  avatar?: AvatarId;
  createdAt: number;
};

/** What one answer did: which sum, which button, and the points it earned or cost. */
export type AnswerOutcome = {
  /** Counts up from 1 within a round, so a screen can tell two identical outcomes apart. */
  id: number;
  problem: Problem;
  chosen: number;
  result: 'correct' | 'wrong';
  points: number;
};

export type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export type Settings = {
  muted: boolean;
  theme: Theme;
  difficulty: Difficulty;
};
