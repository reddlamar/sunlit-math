import { defaultStoredSettings, resolveTheme, parseSettings } from './settings';

describe('defaultStoredSettings', () => {
  it('defaults to unmuted, no explicit theme, and easy difficulty', () => {
    expect(defaultStoredSettings()).toEqual({ muted: false, theme: null, difficulty: 'easy' });
  });
});

describe('resolveTheme', () => {
  it('uses the explicit theme when the player has chosen one', () => {
    expect(resolveTheme('dark', 'light')).toBe('dark');
    expect(resolveTheme('light', 'dark')).toBe('light');
  });

  it('falls back to the system scheme when nothing has been explicitly chosen', () => {
    expect(resolveTheme(null, 'dark')).toBe('dark');
    expect(resolveTheme(null, 'light')).toBe('light');
  });

  it('falls back to light when the system scheme is unknown', () => {
    expect(resolveTheme(null, null)).toBe('light');
  });
});

describe('parseSettings', () => {
  it('returns the defaults when there is nothing stored yet', () => {
    expect(parseSettings(null)).toEqual(defaultStoredSettings());
  });

  it('round-trips a previously stored settings blob', () => {
    const stored = { muted: true, theme: 'dark', difficulty: 'hard' };
    expect(parseSettings(JSON.stringify(stored))).toEqual(stored);
  });

  it('falls back to defaults when the stored value is malformed JSON', () => {
    expect(parseSettings('{not json')).toEqual(defaultStoredSettings());
  });

  it('falls back to defaults when the stored value is missing expected fields', () => {
    expect(parseSettings(JSON.stringify({}))).toEqual(defaultStoredSettings());
  });
});
