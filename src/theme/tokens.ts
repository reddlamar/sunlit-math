import type { Operation } from '../types/game';

export const fontFamily = {
  regular: 'Baloo2_500Medium',
  bold: 'Baloo2_700Bold',
  extraBold: 'Baloo2_800ExtraBold',
};

export const operationColors: Record<Operation, string> = {
  addition: '#3DBE6C',
  subtraction: '#FF9F45',
  multiplication: '#4D8DFF',
  division: '#FF6B9D',
};

export const choiceColors: string[] = ['#5B4FCF', '#22B8CF', '#FF9F45', '#FF6B9D'];

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
  timer: '#22B8CF',
  streak: '#FF9F45',
  streakSoft: '#FFF1E6',
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
};
