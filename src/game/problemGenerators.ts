import type { Difficulty, Operation, ProblemGenerator } from '../types/game';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildChoices(answer: number, spread: number): number[] {
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(1, spread);
    const candidate = Math.random() < 0.5 ? answer - offset : answer + offset;
    if (candidate !== answer && candidate >= 0) {
      distractors.add(candidate);
    }
  }
  return shuffle([answer, ...distractors]);
}

function makeId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

const ADDITION_SUBTRACTION_MAX: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 50,
};

const MULTIPLICATION_DIVISION_MAX: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 12,
};

export const generateAddition: ProblemGenerator = (difficulty) => {
  const max = ADDITION_SUBTRACTION_MAX[difficulty];
  const a = randomInt(1, max);
  const b = randomInt(1, max);
  const answer = a + b;
  return {
    id: makeId(),
    question: `${a} + ${b}`,
    answer,
    choices: buildChoices(answer, Math.max(3, Math.floor(max / 4))),
  };
};

export const generateSubtraction: ProblemGenerator = (difficulty) => {
  const max = ADDITION_SUBTRACTION_MAX[difficulty];
  const a = randomInt(1, max);
  const b = randomInt(0, a);
  const answer = a - b;
  return {
    id: makeId(),
    question: `${a} - ${b}`,
    answer,
    choices: buildChoices(answer, Math.max(3, Math.floor(max / 4))),
  };
};

export const generateMultiplication: ProblemGenerator = (difficulty) => {
  const max = MULTIPLICATION_DIVISION_MAX[difficulty];
  const a = randomInt(1, max);
  const b = randomInt(1, max);
  const answer = a * b;
  return {
    id: makeId(),
    question: `${a} × ${b}`,
    answer,
    choices: buildChoices(answer, Math.max(3, max)),
  };
};

export const generateDivision: ProblemGenerator = (difficulty) => {
  const max = MULTIPLICATION_DIVISION_MAX[difficulty];
  const b = randomInt(1, max);
  const answer = randomInt(1, max);
  const a = b * answer;
  return {
    id: makeId(),
    question: `${a} ÷ ${b}`,
    answer,
    choices: buildChoices(answer, Math.max(3, max)),
  };
};

const GENERATORS: Record<Operation, ProblemGenerator> = {
  addition: generateAddition,
  subtraction: generateSubtraction,
  multiplication: generateMultiplication,
  division: generateDivision,
};

export function generatorForOperation(operation: Operation): ProblemGenerator {
  return GENERATORS[operation];
}
