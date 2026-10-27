import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from './AnimatedPressable';
import { useSettings } from '../settings/SettingsContext';
import { cardShadow } from '../theme/shadow';
import { fontFamily, operationColors, staticColors } from '../theme/tokens';
import { scaled, useLayout } from '../layout/layout';
import type { Operation } from '../types/game';

type RoundSummaryProps = {
  name: string;
  score: number;
  operation: Operation;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
};

/** Shown after a round's score has been saved. */
export function RoundSummary({
  name,
  score,
  operation,
  onPlayAgain,
  onViewLeaderboard,
}: RoundSummaryProps) {
  const { colors } = useSettings();
  const { scale } = useLayout();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.emoji, { fontSize: scaled(56, scale) }]}>🎉</Text>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: scaled(24, scale) }]}>
          Nice work, {name}!
        </Text>
        <Text
          style={[styles.score, { color: operationColors[operation], fontSize: scaled(40, scale) }]}
        >
          {score} {Math.abs(score) === 1 ? 'point' : 'points'}
        </Text>
        <AnimatedPressable
          testID="play-again-button"
          accessibilityRole="button"
          wrapperStyle={styles.buttonWrapper}
          style={[styles.button, { backgroundColor: operationColors[operation] }]}
          onPress={onPlayAgain}
        >
          <Text style={styles.buttonLabel}>Play Again</Text>
        </AnimatedPressable>
        <AnimatedPressable accessibilityRole="button" onPress={onViewLeaderboard}>
          <Text style={[styles.secondaryLabel, { color: colors.accent }]}>View Leaderboard</Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    marginBottom: 8,
  },
  // alignItems centers each Text's box, but a name long enough to wrap makes the box
  // full-width and its lines default to left-aligned, so centering must be explicit.
  title: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    textAlign: 'center',
    marginBottom: 8,
  },
  score: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  button: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 40,
    ...cardShadow({ elevation: 6, opacity: 0.18, radius: 8 }),
  },
  buttonLabel: {
    color: staticColors.onColor,
    fontSize: 19,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
});
