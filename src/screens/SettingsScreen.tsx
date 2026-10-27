import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { SegmentedControl } from '../components/SegmentedControl';
import { SettingCard } from '../components/SettingCard';
import { UnlockModal } from '../components/UnlockModal';
import { DIFFICULTY_LABELS } from '../game/difficulties';
import { usePurchase } from '../purchases/PurchaseContext';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import { READABLE_MAX_WIDTH } from '../layout/layout';
import { DIFFICULTIES, type Theme } from '../types/game';

type ThemeChoice = Theme | 'auto';

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DIFFICULTY_OPTIONS = DIFFICULTIES.map((value) => ({
  value,
  label: DIFFICULTY_LABELS[value],
}));

const MUTE_OPTIONS: { value: 'on' | 'off'; label: string }[] = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
];

/** The settings, for grown-ups: sound, theme, difficulty, and the one-time unlock. */
export function SettingsScreen() {
  const { muted, themePreference, difficulty, colors, setMuted, setTheme, setDifficulty } =
    useSettings();
  const { isUnlocked } = usePurchase();
  const [isUnlockModalVisible, setIsUnlockModalVisible] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView testID="settings-scroll" contentContainerStyle={styles.scrollContent}>
        <View testID="settings-column" style={styles.column}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
            Grown-up area
          </Text>

          <SettingCard title="Sound">
            <SegmentedControl
              options={MUTE_OPTIONS}
              value={muted ? 'off' : 'on'}
              onChange={(value) => setMuted(value === 'off')}
              accessibilityLabel="Sound"
              testID="mute"
            />
          </SettingCard>

          <SettingCard title="Theme">
            <SegmentedControl
              options={THEME_OPTIONS}
              value={themePreference ?? 'auto'}
              onChange={(value) => setTheme(value === 'auto' ? null : value)}
              accessibilityLabel="Theme"
              testID="theme"
            />
          </SettingCard>

          <SettingCard title="Difficulty">
            <SegmentedControl
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
              accessibilityLabel="Difficulty"
              testID="difficulty"
            />
          </SettingCard>

          {!isUnlocked && (
            <AnimatedPressable
              testID="unlock-card"
              accessibilityRole="button"
              accessibilityLabel="Unlock all games"
              accessibilityHint="Opens a parent check first"
              onPress={() => setIsUnlockModalVisible(true)}
            >
              <SettingCard title="Unlock all games">
                <Text style={[styles.unlockText, { color: colors.textSecondary }]}>
                  For grown-ups. A parent check comes first.
                </Text>
                <Text style={[styles.unlockText, { color: colors.accentText }]}>
                  Restore purchases
                </Text>
              </SettingCard>
            </AnimatedPressable>
          )}
        </View>
      </ScrollView>
      <UnlockModal visible={isUnlockModalVisible} onClose={() => setIsUnlockModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  column: {
    width: '100%',
    maxWidth: READABLE_MAX_WIDTH,
    gap: 20,
  },
  title: {
    fontSize: 32,
    lineHeight: 35,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
  unlockText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    fontFamily: fontFamily.regular,
  },
});
