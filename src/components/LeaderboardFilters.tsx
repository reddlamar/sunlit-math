import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { OPERATIONS } from '../game/operations';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, operationColors, staticColors, touchTarget } from '../theme/tokens';
import { DIFFICULTIES, type Difficulty, type Operation } from '../types/game';

const RING = 4;
const LEVEL_LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

type LeaderboardFiltersProps = {
  operation: Operation | undefined;
  difficulty: Difficulty | undefined;
  onOperationChange: (operation: Operation | undefined) => void;
  onDifficultyChange: (difficulty: Difficulty | undefined) => void;
  /** Stack the levels under their own heading, for the wide layout's side column. */
  isColumn?: boolean;
};

/** Which game and which level the leaderboard shows; "All" on either removes the filter. */
export function LeaderboardFilters({
  operation,
  difficulty,
  onOperationChange,
  onDifficultyChange,
  isColumn = false,
}: LeaderboardFiltersProps) {
  const { colors } = useSettings();

  const gamePills: { value: Operation | undefined; label: string; color: string }[] = [
    { value: undefined, label: 'All', color: colors.accent },
    ...OPERATIONS.map(({ operation: op, symbol }) => ({
      value: op,
      label: symbol,
      color: operationColors[op],
    })),
  ];
  const levelChips: { value: Difficulty | undefined; label: string }[] = [
    { value: undefined, label: 'All levels' },
    ...DIFFICULTIES.map((level) => ({ value: level, label: LEVEL_LABELS[level] })),
  ];

  const caption = (text: string) =>
    isColumn && <Text style={[styles.caption, { color: colors.textSecondary }]}>{text}</Text>;

  return (
    <View style={styles.container}>
      {caption('Game')}
      <View style={styles.pills}>
        {gamePills.map(({ value, label, color }) => {
          const isSelected = value === operation;
          return (
            <AnimatedPressable
              key={label}
              testID={`filter-game-${value ?? 'all'}`}
              accessibilityRole="button"
              accessibilityLabel={value ? `Show ${label}` : 'Show all games'}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.pill,
                label === 'All' ? styles.pillAll : styles.pillRound,
                { backgroundColor: color },
              ]}
              onPress={() => onOperationChange(value)}
            >
              <Text style={styles.pillLabel}>{label}</Text>
              {isSelected && (
                <View
                  pointerEvents="none"
                  style={[styles.ring, { borderColor: colors.textPrimary }]}
                />
              )}
            </AnimatedPressable>
          );
        })}
      </View>

      {caption('Level')}
      <View style={[styles.chips, isColumn && styles.chipsColumn]}>
        {levelChips.map(({ value, label }) => {
          const isSelected = value === difficulty;
          return (
            <AnimatedPressable
              key={label}
              testID={`filter-level-${value ?? 'all'}`}
              accessibilityRole="button"
              accessibilityLabel={`Show ${label}`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.chip,
                { borderColor: isSelected ? colors.textPrimary : colors.border },
                isSelected && { backgroundColor: colors.textPrimary },
              ]}
              onPress={() => onDifficultyChange(value)}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: isSelected ? colors.background : colors.textPrimary },
                ]}
              >
                {label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  caption: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fontFamily.semiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: -8,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    height: touchTarget.play,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: touchTarget.play / 2,
  },
  pillAll: {
    paddingHorizontal: 22,
  },
  pillRound: {
    width: touchTarget.play,
  },
  pillLabel: {
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: staticColors.onColor,
  },
  // Drawn outside the pill, in the gap between pills, so selecting never shifts the row.
  ring: {
    position: 'absolute',
    top: -RING,
    left: -RING,
    right: -RING,
    bottom: -RING,
    borderWidth: RING,
    borderRadius: 999,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsColumn: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  chip: {
    minHeight: touchTarget.min,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 999,
  },
  chipLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    fontFamily: fontFamily.regular,
  },
});
