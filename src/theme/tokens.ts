import type { Operation } from '../types/game';

export const fontFamily = {
  regular: 'Baloo2_500Medium',
  semiBold: 'Baloo2_600SemiBold',
  bold: 'Baloo2_700Bold',
  extraBold: 'Baloo2_800ExtraBold',
};

/** Corner radii shared by cards, tiles and answer buttons. */
export const radius = {
  lg: 22,
  xl: 32,
} as const;

// Every button fill below carries white text, so each one keeps at least 3:1 contrast
// against white (the WCAG minimum for large text). Small white labels on these fills are
// sized at 19px bold or more so they count as large text. tokens.test.ts enforces the ratio.
export const operationColors: Record<Operation, string> = {
  addition: '#36A75F',
  subtraction: '#EB7200',
  multiplication: '#4D8DFF',
  division: '#FF548E',
};

/** Colors that stay the same in light and dark mode. */
export const staticColors = {
  /** Text and icons drawn on top of a saturated button fill. */
  onColor: '#FFFFFF',
  /** Secondary round controls, like Restart, that shouldn't compete with Pause. */
  neutralControl: '#8B95A1',
  /** The splash screen background; matches the native splash in app.json. */
  splash: '#0A1F44',
  /** Dimmed area behind a modal card. */
  backdrop: 'rgba(0,0,0,0.4)',
} as const;

export const choiceColors: string[] = ['#5B4FCF', '#1EA3B7', '#EB7200', '#FF548E'];

export type ColorTokens = {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  error: string;
  accent: string;
  border: string;
  timer: string;
  streak: string;
  streakSoft: string;
  /** Validation errors: an empty name, a wrong parental-gate answer, a failed purchase. */
  danger: string;
};

export const light: ColorTokens = {
  background: '#F2EFE9',
  surface: '#FFFFFF',
  textPrimary: '#1F2933',
  textSecondary: '#5A6672',
  success: '#2E9E5B',
  error: '#E4572E',
  accent: '#5B4FCF',
  border: '#E6E1D6',
  // Timer and streak are darker than the answer-button cyan and orange so their numbers
  // clear 3:1 on the cream page (tokens.test.ts checks both themes).
  timer: '#19899A',
  streak: '#D66800',
  streakSoft: '#FFF1E6',
  danger: '#D92D20',
};

// Cozy bedtime palette, not a muted dev-tool dark mode — warm plum background,
// high-contrast text, and brighter accent colors so they still read against it.
export const dark: ColorTokens = {
  background: '#1F1440',
  surface: '#2E2158',
  textPrimary: '#FFF8EF',
  textSecondary: '#C9B8F5',
  success: '#5EE39B',
  error: '#FF7A59',
  accent: '#8B7CFF',
  border: '#4A3B7A',
  timer: '#3FD4EC',
  streak: '#FFB870',
  streakSoft: '#4A2E1F',
  // Lighter than light's red: #D92D20 is only 2.95:1 on the dark modal surface.
  danger: '#FF8A7A',
};
