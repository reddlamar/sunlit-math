import {
  buildChoices,
  generateAddition,
  generateSubtraction,
  generateMultiplication,
  generateDivision,
  generatorForOperation,
} from './problemGenerators';
import { DIFFICULTIES, type Problem } from '../types/game';

function expectValidProblemShape(problem: Problem) {
  expect(typeof problem.id).toBe('string');
  expect(problem.id.length).toBeGreaterThan(0);
  expect(typeof problem.question).toBe('string');
  expect(problem.choices).toContain(problem.answer);
  expect(new Set(problem.choices).size).toBe(problem.choices.length);
  expect(problem.choices).toHaveLength(4);
  problem.choices.forEach((choice) => expect(choice).toBeGreaterThanOrEqual(0));
}

describe('buildChoices', () => {
  it('always yields the answer plus three distinct, non-negative distractors', () => {
    for (const answer of [0, 1, 2, 7, 100]) {
      for (let i = 0; i < 100; i++) {
        const choices = buildChoices(answer, 3);
        expect(choices).toHaveLength(4);
        expect(choices).toContain(answer);
        expect(new Set(choices).size).toBe(4);
        choices.forEach((choice) => expect(choice).toBeGreaterThanOrEqual(0));
      }
    }
  });

  it('keeps distractors within the spread of the answer', () => {
    for (let i = 0; i < 100; i++) {
      buildChoices(20, 5).forEach((choice) => expect(Math.abs(choice - 20)).toBeLessThanOrEqual(5));
    }
  });

  it('terminates even when the only valid distractors are the minimum possible', () => {
    // answer 0 with spread 3 leaves exactly {1, 2, 3} as candidates.
    expect([...buildChoices(0, 3)].sort()).toEqual([0, 1, 2, 3]);
  });
});

describe('generateAddition', () => {
  it.each(DIFFICULTIES)('produces a valid, correct problem for %s difficulty', (difficulty) => {
    for (let i = 0; i < 100; i++) {
      const problem = generateAddition(difficulty);
      expectValidProblemShape(problem);
      const [a, b] = problem.question.split('+').map((n) => Number(n.trim()));
      expect(a + b).toBe(problem.answer);
    }
  });

  it('generates harder (larger) numbers as difficulty increases', () => {
    const easyMax = Math.max(
      ...Array.from({ length: 50 }, () => generateAddition('easy').answer)
    );
    const hardMax = Math.max(
      ...Array.from({ length: 50 }, () => generateAddition('hard').answer)
    );
    expect(hardMax).toBeGreaterThan(easyMax);
  });
});

describe('generateSubtraction', () => {
  it.each(DIFFICULTIES)('never produces a negative answer for %s difficulty', (difficulty) => {
    for (let i = 0; i < 100; i++) {
      const problem = generateSubtraction(difficulty);
      expectValidProblemShape(problem);
      expect(problem.answer).toBeGreaterThanOrEqual(0);
      const [a, b] = problem.question.split('-').map((n) => Number(n.trim()));
      expect(a).toBeGreaterThanOrEqual(b);
      expect(a - b).toBe(problem.answer);
    }
  });
});

describe('generateMultiplication', () => {
  it.each(DIFFICULTIES)('produces a valid, correct problem for %s difficulty', (difficulty) => {
    for (let i = 0; i < 100; i++) {
      const problem = generateMultiplication(difficulty);
      expectValidProblemShape(problem);
      const [a, b] = problem.question.split('×').map((n) => Number(n.trim()));
      expect(a * b).toBe(problem.answer);
    }
  });
});

describe('generateDivision', () => {
  it.each(DIFFICULTIES)('never generates a divisor of 0 for %s difficulty', (difficulty) => {
    for (let i = 0; i < 200; i++) {
      const problem = generateDivision(difficulty);
      const [, b] = problem.question.split('÷').map((n) => Number(n.trim()));
      expect(b).toBeGreaterThan(0);
    }
  });

  it.each(DIFFICULTIES)('always produces a whole-number answer for %s difficulty', (difficulty) => {
    for (let i = 0; i < 200; i++) {
      const problem = generateDivision(difficulty);
      expectValidProblemShape(problem);
      const [a, b] = problem.question.split('÷').map((n) => Number(n.trim()));
      expect(a % b).toBe(0);
      expect(a / b).toBe(problem.answer);
    }
  });
});

describe('generatorForOperation', () => {
  it('maps each operation name to its matching generator function', () => {
    expect(generatorForOperation('addition')).toBe(generateAddition);
    expect(generatorForOperation('subtraction')).toBe(generateSubtraction);
    expect(generatorForOperation('multiplication')).toBe(generateMultiplication);
    expect(generatorForOperation('division')).toBe(generateDivision);
  });
});
