import { createGateChallenge, isGateAnswerCorrect, numberToWords } from './parentalGate';

describe('numberToWords', () => {
  it.each([
    [0, 'zero'],
    [7, 'seven'],
    [13, 'thirteen'],
    [40, 'forty'],
    [58, 'fifty-eight'],
    [100, 'one hundred'],
    [101, 'one hundred one'],
    [119, 'one hundred nineteen'],
    [438, 'four hundred thirty-eight'],
    [570, 'five hundred seventy'],
    [999, 'nine hundred ninety-nine'],
  ])('spells %i as "%s"', (value, words) => {
    expect(numberToWords(value)).toBe(words);
  });

  it('rejects numbers outside 0-999 and non-integers', () => {
    expect(() => numberToWords(-1)).toThrow(RangeError);
    expect(() => numberToWords(1000)).toThrow(RangeError);
    expect(() => numberToWords(2.5)).toThrow(RangeError);
  });
});

describe('createGateChallenge', () => {
  it('always picks a three-digit number from 101 to 999', () => {
    expect(createGateChallenge(() => 0).answer).toBe(101);
    expect(createGateChallenge(() => 0.999999).answer).toBe(999);
  });

  it('spells out the answer it expects', () => {
    const challenge = createGateChallenge(() => 0.5);
    expect(challenge).toEqual({
      words: numberToWords(challenge.answer),
      answer: challenge.answer,
    });
  });
});

describe('isGateAnswerCorrect', () => {
  const challenge = { words: 'four hundred thirty-eight', answer: 438 };

  it('accepts the digits, ignoring surrounding spaces', () => {
    expect(isGateAnswerCorrect(challenge, '438')).toBe(true);
    expect(isGateAnswerCorrect(challenge, ' 438 ')).toBe(true);
  });

  it('rejects wrong, empty or non-numeric answers', () => {
    expect(isGateAnswerCorrect(challenge, '437')).toBe(false);
    expect(isGateAnswerCorrect(challenge, '')).toBe(false);
    expect(isGateAnswerCorrect(challenge, '4e2')).toBe(false);
    expect(isGateAnswerCorrect(challenge, 'four hundred thirty-eight')).toBe(false);
  });
});
