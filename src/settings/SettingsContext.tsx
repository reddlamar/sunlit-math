import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setMuted as setSoundMuted } from '../audio/sounds';
import { dark, light, type ColorTokens } from '../theme/tokens';
import { defaultStoredSettings, parseSettings, resolveTheme } from './settings';
import type { Difficulty, Settings, Theme } from '../types/game';

const STORAGE_KEY = 'math60_settings_v1';

type SettingsContextValue = Settings & {
  colors: ColorTokens;
  setMuted: (next: boolean) => Promise<void>;
  setTheme: (next: Theme) => Promise<void>;
  setDifficulty: (next: Difficulty) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [muted, setMutedState] = useState(defaultStoredSettings().muted);
  const [explicitTheme, setExplicitTheme] = useState<Theme | null>(defaultStoredSettings().theme);
  const [difficulty, setDifficultyState] = useState<Difficulty>(defaultStoredSettings().difficulty);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName | null | undefined>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const stored = parseSettings(raw);
      setMutedState(stored.muted);
      setExplicitTheme(stored.theme);
      setDifficultyState(stored.difficulty);
      setSoundMuted(stored.muted);
    });
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const persist = async (next: {
    muted: boolean;
    theme: Theme | null;
    difficulty: Difficulty;
  }) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const setMuted = async (next: boolean) => {
    setMutedState(next);
    setSoundMuted(next);
    await persist({ muted: next, theme: explicitTheme, difficulty });
  };

  const setTheme = async (next: Theme) => {
    setExplicitTheme(next);
    await persist({ muted, theme: next, difficulty });
  };

  const setDifficulty = async (next: Difficulty) => {
    setDifficultyState(next);
    await persist({ muted, theme: explicitTheme, difficulty: next });
  };

  const theme = resolveTheme(explicitTheme, systemScheme);
  const colors = useMemo(() => (theme === 'dark' ? dark : light), [theme]);

  const value: SettingsContextValue = {
    muted,
    theme,
    difficulty,
    colors,
    setMuted,
    setTheme,
    setDifficulty,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
