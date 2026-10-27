import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon } from './icons/Icon';
import { operationInfo } from '../game/operations';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, radius } from '../theme/tokens';
import { cardShadow } from '../theme/shadow';
import { frameSize, useLayout, type FrameSize } from '../layout/layout';
import { formatPoints } from '../utils/format';
import type { ScoreEntry } from '../types/game';

type CardSizes = {
  icon: number;
  paddingHorizontal: number;
  paddingVertical: number;
  gap: number;
  valueSize: number;
  valueFont: string;
};

const SIZES: Record<FrameSize, CardSizes> = {
  compact: {
    icon: 36,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    valueSize: 20,
    valueFont: fontFamily.bold,
  },
  medium: {
    icon: 48,
    paddingHorizontal: 28,
    paddingVertical: 20,
    gap: 16,
    valueSize: 26,
    valueFont: fontFamily.extraBold,
  },
  wide: {
    icon: 44,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 14,
    valueSize: 20,
    valueFont: fontFamily.bold,
  },
};

type PersonalBestCardProps = {
  best: ScoreEntry | null;
  onPress: () => void;
};

/** The player's highest score on this device. Tapping it opens the leaderboard. */
export function PersonalBestCard({ best, onPress }: PersonalBestCardProps) {
  const { colors } = useSettings();
  const sizes = SIZES[frameSize(useLayout())];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="View personal best on the leaderboard"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingHorizontal: sizes.paddingHorizontal,
          paddingVertical: sizes.paddingVertical,
          gap: sizes.gap,
        },
      ]}
      onPress={onPress}
    >
      <Icon name="trophy" size={sizes.icon} color={colors.streak} />
      <View style={styles.text}>
        <Text style={[styles.caption, { color: colors.textSecondary }]}>Personal best</Text>
        <Text
          style={[
            styles.value,
            { color: colors.textPrimary, fontSize: sizes.valueSize, fontFamily: sizes.valueFont },
          ]}
        >
          {best
            ? `${formatPoints(best.score)} · ${operationInfo(best.operation).label}`
            : 'No scores yet — be the first!'}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radius.xl,
    ...cardShadow({ elevation: 3, opacity: 0.12, radius: 6, offsetHeight: 4 }),
  },
  text: {
    flexShrink: 1,
  },
  caption: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontWeight: '700',
  },
});
