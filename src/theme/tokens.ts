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
};
