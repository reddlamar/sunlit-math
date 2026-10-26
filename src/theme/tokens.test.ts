import {
  light,
  dark,
  operationColors,
  choiceColors,
  staticColors,
  type ColorTokens,
} from './tokens';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

const TOKEN_KEYS: (keyof ColorTokens)[] = [
  'danger',
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

  it('keeps the splash color in sync with the native splash configured in app.json', () => {
    const appConfig = require('../../app.json');
    const splashPlugin = appConfig.expo.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen'
    );
    expect(splashPlugin[1].backgroundColor).toBe(staticColors.splash);
  });

  it.each([
    ['light', light],
    ['dark', dark],
  ])('keeps error text readable (WCAG AA, 4.5:1) on the %s modal surface', (_name, tokens) => {
    expect(contrastRatio(tokens.danger, tokens.surface)).toBeGreaterThanOrEqual(4.5);
  });
});
