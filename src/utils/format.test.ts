import { formatPoints } from './format';

describe('formatPoints', () => {
  it('uses the singular for exactly one point', () => {
    expect(formatPoints(1)).toBe('1 point');
    expect(formatPoints(-1)).toBe('-1 point');
  });

  it('uses the plural for zero and for every other count', () => {
    expect(formatPoints(0)).toBe('0 points');
    expect(formatPoints(24)).toBe('24 points');
    expect(formatPoints(-3)).toBe('-3 points');
  });
});
