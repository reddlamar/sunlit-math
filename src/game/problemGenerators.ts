import { createId, randomInt, shuffle } from '../utils/random';
import type { Difficulty, Operation, Problem, ProblemGenerator } from '../types/game';

const DISTRACTOR_COUNT = 3;
const MIN_SPREAD = 3;

/**
 * The answer plus three distinct, non-negative wrong answers within `spread` of it,
 * in random order. Candidates are enumerated and sampled (instead of rejection
 * sampling), so this always terminates: with spread >= 3 there are always at least
 * three candidates, even for an answer of 0.
 */
export function buildChoices(answer: number, spread: number): number[] {
  const candidates: number[] = [];
  for (let offset = -spread; offset <= spread; offset++) {
    const candidate = answer + offset;
    if (offset !== 0 && candidate >= 0) {
      candidates.push(candidate);
    }
  }
  return shuffle([answer, ...shuffle(candidates).slice(0, DISTRACTOR_COUNT)]);
}

/** What differs between operations; everything else is shared by `createGenerator`. */
type OperationSpec = {
  /** Largest operand per difficulty. */
  maxOperand: Record<Difficulty, number>;
  /** How far wrong answers may stray from the right one. */
  spread: (maxOperand: number) => number;
  /** Picks operands within `maxOperand` and states the question and its answer. */
  makeQuestion: (maxOperand: number) => { question: string; answer: number };
};

const ADDITION_SUBTRACTION_MAX: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 50 };
const MULTIPLICATION_DIVISION_MAX: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 12 };

const quarterSpread = (max: number) => Math.max(MIN_SPREAD, Math.floor(max / 4));
const fullSpread = (max: number) => Math.max(MIN_SPREAD, max);

const SPECS: Record<Operation, OperationSpec> = {
  addition: {
    maxOperand: ADDITION_SUBTRACTION_MAX,
    spread: quarterSpread,
    makeQuestion: (max) => {
      const a = randomInt(1, max);
      const b = randomInt(1, max);
      return { question: `${a} + ${b}`, answer: a + b };
    },
  },
  subtraction: {
    maxOperand: ADDITION_SUBTRACTION_MAX,
    spread: quarterSpread,
    makeQuestion: (max) => {
      const a = randomInt(1, max);
      const b = randomInt(0, a);
      return { question: `${a} - ${b}`, answer: a - b };
    },
  },
  multiplication: {
    maxOperand: MULTIPLICATION_DIVISION_MAX,
    spread: fullSpread,
    makeQuestion: (max) => {
      const a = randomInt(1, max);
      const b = randomInt(1, max);
      return { question: `${a} × ${b}`, answer: a * b };
    },
  },
  division: {
    maxOperand: MULTIPLICATION_DIVISION_MAX,
    spread: fullSpread,
    makeQuestion: (max) => {
      // Built from the answer so the division is always exact and the divisor is never 0.
      const divisor = randomInt(1, max);
      const answer = randomInt(1, max);
      return { question: `${divisor * answer} ÷ ${divisor}`, answer };
    },
  },
};

function createGenerator(spec: OperationSpec): ProblemGenerator {
  return (difficulty): Problem => {
    const max = spec.maxOperand[difficulty];
    const { question, answer } = spec.makeQuestion(max);
    return {
      id: createId(),
      question,
      answer,
      choices: buildChoices(answer, spec.spread(max)),
    };
  };
}

export const generateAddition = createGenerator(SPECS.addition);
export const generateSubtraction = createGenerator(SPECS.subtraction);
export const generateMultiplication = createGenerator(SPECS.multiplication);
export const generateDivision = createGenerator(SPECS.division);

const GENERATORS: Record<Operation, ProblemGenerator> = {
  addition: generateAddition,
  subtraction: generateSubtraction,
  multiplication: generateMultiplication,
  division: generateDivision,
};

export function generatorForOperation(operation: Operation): ProblemGenerator {
  return GENERATORS[operation];
}
