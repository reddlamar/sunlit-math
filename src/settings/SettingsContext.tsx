import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setMuted as setSoundMuted } from '../audio/sounds';
import { dark, light, type ColorTokens } from '../theme/tokens';
import { defaultStoredSettings, parseSettings, resolveTheme, type StoredSettings } from './settings';
import type { Difficulty, Settings, Theme } from '../types/game';

const STORAGE_KEY = 'math60_settings_v1';

type SettingsContextValue = Settings & {
  colors: ColorTokens;
  /** What the player chose: a theme, or null to follow the phone's appearance (Auto). */
  themePreference: Theme | null;
  setMuted: (next: boolean) => Promise<void>;
  /** Pass null to go back to following the phone. */
  setTheme: (next: Theme | null) => Promise<void>;
  setDifficulty: (next: Difficulty) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [stored, setStored] = useState<StoredSettings>(defaultStoredSettings);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName | null | undefined>(
    Appearance.getColorScheme()
  );
  // Always the newest settings, even between renders. Each setter builds the next
  // settings from this instead of from its render's closure, so two changes made in
  // the same tick can't overwrite each other when they are saved.
  const latest = useRef(stored);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(parseSettings, () => defaultStoredSettings())
      .then((hydrated) => {
        latest.current = hydrated;
        setStored(hydrated);
        setSoundMuted(hydrated.muted);
      });
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const update = useCallback(async (patch: Partial<StoredSettings>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setStored(next);
    if (patch.muted !== undefined) {
      setSoundMuted(next.muted);
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The change still applies for this session; failing to remember it isn't worth
      // interrupting a child over.
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => update({ muted }), [update]);
  const setTheme = useCallback((theme: Theme | null) => update({ theme }), [update]);
  const setDifficulty = useCallback((difficulty: Difficulty) => update({ difficulty }), [update]);

  const theme = resolveTheme(stored.theme, systemScheme);

  const value = useMemo<SettingsContextValue>(
    () => ({
      muted: stored.muted,
      theme,
      themePreference: stored.theme,
      difficulty: stored.difficulty,
      colors: theme === 'dark' ? dark : light,
      setMuted,
      setTheme,
      setDifficulty,
    }),
    [stored.muted, stored.difficulty, stored.theme, theme, setMuted, setTheme, setDifficulty]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
