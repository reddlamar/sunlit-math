import { createId, randomInt, shuffle } from './random';

describe('randomInt', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns the inclusive bounds at the extremes of Math.random', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(randomInt(3, 7)).toBe(3);
    jest.spyOn(Math, 'random').mockReturnValue(0.999999);
    expect(randomInt(3, 7)).toBe(7);
  });

  it('always stays within [min, max]', () => {
    for (let i = 0; i < 500; i++) {
      const value = randomInt(1, 4);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(4);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([9])).toEqual([9]);
  });
});

describe('createId', () => {
  it('returns distinct non-empty strings', () => {
    const ids = new Set(Array.from({ length: 200 }, () => createId()));
    expect(ids.size).toBe(200);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });
});
