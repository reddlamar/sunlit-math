import React from 'react';
import { Appearance, Text } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsProvider, useSettings } from './SettingsContext';
import * as sounds from '../audio/sounds';

const STORAGE_KEY = 'math60_settings_v1';

jest.spyOn(sounds, 'setMuted');

function Probe() {
  const { muted, theme, themePreference, difficulty, colors, setMuted, setTheme, setDifficulty } =
    useSettings();
  return (
    <>
      <Text testID="muted">{muted ? 'muted' : 'unmuted'}</Text>
      <Text testID="theme">{theme}</Text>
      <Text testID="preference">{String(themePreference)}</Text>
      <Text testID="difficulty">{difficulty}</Text>
      <Text testID="background">{colors.background}</Text>
      <Text testID="toggle-mute" onPress={() => setMuted(!muted)}>
        toggle-mute
      </Text>
      <Text testID="set-dark" onPress={() => setTheme('dark')}>
        set-dark
      </Text>
 <Text testID="set-auto" onPress={() => setTheme(null)}>
        set-auto
      </Text>
      <Text testID="set-hard" onPress={() => setDifficulty('hard')}>
        set-hard
      </Text>
      <Text
        testID="change-all"
        onPress={() => {
          setMuted(true);
          setTheme('dark');
          setDifficulty('hard');
        }}
      >
        change-all
      </Text>
    </>
  );
}

describe('SettingsProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.mocked(sounds.setMuted).mockClear();
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    jest.spyOn(Appearance, 'addChangeListener').mockReturnValue({ remove: jest.fn() });
  });

  it('defaults to the system color scheme when nothing is persisted', async () => {
    jest.mocked(Appearance.getColorScheme).mockReturnValue('dark');

    const { findByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );

    expect((await findByTestId('theme')).props.children).toBe('dark');
    expect((await findByTestId('muted')).props.children).toBe('unmuted');
    expect((await findByTestId('difficulty')).props.children).toBe('easy');
  });

  it('hydrates persisted settings on mount and mutes sound to match', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ muted: true, theme: 'dark', difficulty: 'hard' })
    );

    const { findByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );

    expect((await findByTestId('muted')).props.children).toBe('muted');
    expect((await findByTestId('theme')).props.children).toBe('dark');
    expect((await findByTestId('difficulty')).props.children).toBe('hard');
    await waitFor(() => expect(sounds.setMuted).toHaveBeenCalledWith(true));
  });

  it('setMuted updates state, persists it, and mutes the sound module', async () => {
    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('muted');

    fireEvent.press(getByTestId('toggle-mute'));

    await waitFor(() => expect(getByTestId('muted').props.children).toBe('muted'));
    expect(sounds.setMuted).toHaveBeenCalledWith(true);
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(raw!)).toEqual({ muted: true, theme: null, difficulty: 'easy' });
    });
  });

  it('setTheme persists an explicit choice and resolves colors to match', async () => {
    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('theme');

    fireEvent.press(getByTestId('set-dark'));

    await waitFor(() => expect(getByTestId('theme').props.children).toBe('dark'));
  });

  it('remembers whether the theme was chosen: null (Auto) until it is', async () => {
    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('theme');
    expect(getByTestId('preference').props.children).toBe('null');

    fireEvent.press(getByTestId('set-dark'));

    await waitFor(() => expect(getByTestId('preference').props.children).toBe('dark'));
  });

  it('setTheme(null) goes back to following the phone, and persists that', async () => {
    let systemListener: ((prefs: { colorScheme: 'light' | 'dark' | 'unspecified' }) => void) | null = null;
    jest.mocked(Appearance.addChangeListener).mockImplementation((listener) => {
      systemListener = listener;
      return { remove: jest.fn() };
    });
    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('theme');
    fireEvent.press(getByTestId('set-dark'));
    await waitFor(() => expect(getByTestId('theme').props.children).toBe('dark'));

    fireEvent.press(getByTestId('set-auto'));
    await waitFor(() => expect(getByTestId('preference').props.children).toBe('null'));
    // The phone says light, so Auto means light again...
    expect(getByTestId('theme').props.children).toBe('light');
    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!).theme).toBeNull();

    // ...and it follows the phone from then on.
    await act(async () => {
      systemListener?.({ colorScheme: 'dark' });
    });
    await waitFor(() => expect(getByTestId('theme').props.children).toBe('dark'));
  });

  it('setDifficulty updates state and persists it', async () => {
    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('difficulty');

    fireEvent.press(getByTestId('set-hard'));

    await waitFor(() => expect(getByTestId('difficulty').props.children).toBe('hard'));
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(raw!).difficulty).toBe('hard');
    });
  });

  it('once a theme is explicitly chosen, a later system appearance change is ignored', async () => {
    let systemListener: ((prefs: { colorScheme: 'light' | 'dark' | 'unspecified' }) => void) | null = null;
    jest.mocked(Appearance.addChangeListener).mockImplementation((listener) => {
      systemListener = listener;
      return { remove: jest.fn() };
    });

    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('theme');
    expect(getByTestId('theme').props.children).toBe('light');

    fireEvent.press(getByTestId('set-dark'));
    await waitFor(() => expect(getByTestId('theme').props.children).toBe('dark'));

    await act(async () => {
      systemListener?.({ colorScheme: 'light' });
    });

    expect(getByTestId('theme').props.children).toBe('dark');
  });

  it('follows live system appearance changes until the player explicitly chooses', async () => {
    let systemListener: ((prefs: { colorScheme: 'light' | 'dark' | 'unspecified' }) => void) | null = null;
    jest.mocked(Appearance.addChangeListener).mockImplementation((listener) => {
      systemListener = listener;
      return { remove: jest.fn() };
    });

    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('theme');
    expect(getByTestId('theme').props.children).toBe('light');

    await act(async () => {
      systemListener?.({ colorScheme: 'dark' });
    });

    await waitFor(() => expect(getByTestId('theme').props.children).toBe('dark'));
  });

  it('throws when useSettings is called outside a SettingsProvider', async () => {
    const ConsoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Probe />)).rejects.toThrow(
      'useSettings must be used within a SettingsProvider'
    );
    ConsoleErrorSpy.mockRestore();
  });

  it('keeps every change when several settings are changed in the same tick', async () => {
    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('theme');

    fireEvent.press(getByTestId('change-all'));

    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(raw!)).toEqual({ muted: true, theme: 'dark', difficulty: 'hard' });
    });
  });

  it('falls back to defaults when stored settings cannot be read', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));

    const { findByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );

    expect((await findByTestId('difficulty')).props.children).toBe('easy');
    expect((await findByTestId('muted')).props.children).toBe('unmuted');
  });

  it('still applies a change in this session when saving it fails', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));

    const { findByTestId, getByTestId } = await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    await findByTestId('difficulty');

    fireEvent.press(getByTestId('set-hard'));

    await waitFor(() => expect(getByTestId('difficulty').props.children).toBe('hard'));
  });

  it('hands out the same context value and setters until a setting actually changes', async () => {
    const seen: ReturnType<typeof useSettings>[] = [];
    function Capture() {
      seen.push(useSettings());
      return null;
    }
    const { rerender } = await render(
      <SettingsProvider>
        <Capture />
      </SettingsProvider>
    );
    await act(async () => {});
    await rerender(
      <SettingsProvider>
        <Capture />
      </SettingsProvider>
    );

    const last = seen[seen.length - 1];
    const previous = seen[seen.length - 2];
    expect(last.setMuted).toBe(previous.setMuted);
    expect(last.setTheme).toBe(previous.setTheme);
    expect(last.setDifficulty).toBe(previous.setDifficulty);
    expect(last).toBe(previous);
  });
});
