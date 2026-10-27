import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedControl } from '../components/SegmentedControl';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import { READABLE_MAX_WIDTH, scaled, useLayout } from '../layout/layout';
import type { Difficulty, Theme } from '../types/game';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const MUTE_OPTIONS: { value: 'on' | 'off'; label: string }[] = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
];

export function SettingsScreen() {
  const { muted, theme, difficulty, colors, setMuted, setTheme, setDifficulty } = useSettings();
  const { scale } = useLayout();
  const labelStyle = [
    styles.sectionLabel,
    { color: colors.textSecondary, fontSize: scaled(13, scale) },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView testID="settings-scroll" contentContainerStyle={styles.scrollContent}>
        <View testID="settings-column" style={styles.column}>
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: scaled(26, scale) }]}>
            ⚙️ Settings
          </Text>

          <View style={styles.section}>
            <Text style={labelStyle}>Sound</Text>
            <SegmentedControl
              options={MUTE_OPTIONS}
              value={muted ? 'off' : 'on'}
              onChange={(value) => setMuted(value === 'off')}
              accessibilityLabel="Sound"
              color={colors.accent}
              testID="mute"
            />
          </View>

          <View style={styles.section}>
            <Text style={labelStyle}>Theme</Text>
            <SegmentedControl
              options={THEME_OPTIONS}
              value={theme}
              onChange={setTheme}
              accessibilityLabel="Theme"
              color={colors.accent}
              testID="theme"
            />
          </View>

          <View style={styles.section}>
            <Text style={labelStyle}>Difficulty</Text>
            <SegmentedControl
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
              accessibilityLabel="Difficulty"
              color={colors.accent}
              testID="difficulty"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  column: {
    width: '100%',
    maxWidth: READABLE_MAX_WIDTH,
    alignSelf: 'center',
  },
  title: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontWeight: '600',
    fontFamily: fontFamily.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
});
