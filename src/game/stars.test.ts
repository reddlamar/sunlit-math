import { starsForScore } from './stars';

describe('starsForScore', () => {
  it('gives three stars for beating the previous best', () => {
    expect(starsForScore(35, 34)).toBe(3);
  });

  it('does not give three stars for only matching the best', () => {
    expect(starsForScore(34, 34)).toBe(2);
  });

  it('gives two stars from three quarters of the best up to it', () => {
    expect(starsForScore(26, 34)).toBe(2); // 25.5 is the cut-off
    expect(starsForScore(30, 34)).toBe(2);
  });

  it('gives one star below three quarters of the best', () => {
    expect(starsForScore(25, 34)).toBe(1);
    expect(starsForScore(1, 34)).toBe(1);
  });

  it('counts exactly three quarters as two stars', () => {
    expect(starsForScore(15, 20)).toBe(2);
    expect(starsForScore(14, 20)).toBe(1);
  });

  it('gives a first round two stars, since there is nothing to beat', () => {
    expect(starsForScore(5, null)).toBe(2);
  });

  it('gives one star for a round that scored nothing, even a first one', () => {
    expect(starsForScore(0, null)).toBe(1);
    expect(starsForScore(-3, null)).toBe(1);
    expect(starsForScore(0, 10)).toBe(1);
  });

  it('gives three stars for a positive score that beats a best of zero or less', () => {
    expect(starsForScore(4, 0)).toBe(3);
    expect(starsForScore(2, -5)).toBe(3);
  });

  it('gives one star for a score of zero against a best of zero', () => {
    expect(starsForScore(0, 0)).toBe(1);
  });
});
