import type { ColorSchemeName } from 'react-native';
import type { Difficulty, Theme } from '../types/game';

export type StoredSettings = {
  muted: boolean;
  theme: Theme | null;
  difficulty: Difficulty;
};

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const THEMES: Theme[] = ['light', 'dark'];

export function defaultStoredSettings(): StoredSettings {
  return { muted: false, theme: null, difficulty: 'easy' };
}

export function resolveTheme(
  stored: Theme | null,
  systemScheme: ColorSchemeName | null | undefined
): Theme {
  if (stored) {
    return stored;
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function parseSettings(raw: string | null): StoredSettings {
  const fallback = defaultStoredSettings();
  if (!raw) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    const muted = typeof parsed.muted === 'boolean' ? parsed.muted : fallback.muted;
    const theme = THEMES.includes(parsed.theme) ? parsed.theme : fallback.theme;
    const difficulty = DIFFICULTIES.includes(parsed.difficulty)
      ? parsed.difficulty
      : fallback.difficulty;
    return { muted, theme, difficulty };
  } catch {
    return fallback;
  }
}
