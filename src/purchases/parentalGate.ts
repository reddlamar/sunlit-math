// A sum would be a weak parental gate in a math practice app, so the gate asks
// for a three-digit number written in words to be typed as digits instead.

const ONES = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export type GateChallenge = {
  words: string;
  answer: number;
};

/** Spells out a whole number from 0 to 999, e.g. 438 → "four hundred thirty-eight". */
export function numberToWords(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 999) {
    throw new RangeError(`numberToWords supports 0-999, got ${value}`);
  }
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const parts: string[] = [];
  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} hundred`);
  }
  if (rest >= 20) {
    const ones = rest % 10;
    parts.push(ones > 0 ? `${TENS[Math.floor(rest / 10)]}-${ONES[ones]}` : TENS[rest / 10]);
  } else if (rest > 0 || hundreds === 0) {
    parts.push(ONES[rest]);
  }
  return parts.join(' ');
}

/** A random number from 101 to 999, so the answer always has three digits. */
export function createGateChallenge(random: () => number = Math.random): GateChallenge {
  const answer = 101 + Math.floor(random() * 899);
  return { words: numberToWords(answer), answer };
}

export function isGateAnswerCorrect(challenge: GateChallenge, input: string): boolean {
  const trimmed = input.trim();
  return /^\d+$/.test(trimmed) && Number(trimmed) === challenge.answer;
}
