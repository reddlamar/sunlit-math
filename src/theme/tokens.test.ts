import { light, dark, operationColors, choiceColors, type ColorTokens } from './tokens';

const TOKEN_KEYS: (keyof ColorTokens)[] = [
  'background',
  'surface',
  'textPrimary',
  'textSecondary',
  'success',
  'error',
  'accent',
  'border',
  'timer',
  'streak',
  'streakSoft',
];

describe('theme tokens', () => {
  it('defines every ColorTokens key as a non-empty string for dark, matching light', () => {
    for (const key of TOKEN_KEYS) {
      expect(typeof dark[key]).toBe('string');
      expect(dark[key].length).toBeGreaterThan(0);
    }
  });

  it('gives dark a different background than light, since it is a distinct palette', () => {
    expect(dark.background).not.toBe(light.background);
    expect(dark.surface).not.toBe(light.surface);
  });

  it('gives dark its own timer and streak highlight colors, distinct from light', () => {
    expect(dark.timer).not.toBe(light.timer);
    expect(dark.streak).not.toBe(light.streak);
    expect(dark.streakSoft).not.toBe(light.streakSoft);
  });

  it('keeps operationColors and choiceColors theme-independent, single exports', () => {
    expect(Object.keys(operationColors)).toEqual([
      'addition',
      'subtraction',
      'multiplication',
      'division',
    ]);
    expect(choiceColors.length).toBeGreaterThan(0);
  });
});
