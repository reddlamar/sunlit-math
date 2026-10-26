import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { OPERATIONS, operationInfo } from '../game/operations';
import { getTopScores } from '../storage/scoresRepository';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, operationColors, staticColors } from '../theme/tokens';
import type { LeaderboardScreenProps } from '../navigation/types';
import type { Difficulty, Operation, ScoreEntry } from '../types/game';

const MEDALS = ['🥇', '🥈', '🥉'];

const LEVEL_LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const LEVEL_FILTERS: { difficulty?: Difficulty; label: string }[] = [
  { difficulty: undefined, label: 'All levels' },
  { difficulty: 'easy', label: 'Easy' },
  { difficulty: 'medium', label: 'Medium' },
  { difficulty: 'hard', label: 'Hard' },
];

export function LeaderboardScreen({ navigation, route }: LeaderboardScreenProps) {
  const [operation, setOperation] = useState<Operation | undefined>(route.params?.operation);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const { colors } = useSettings();

  const filters: { operation?: Operation; label: string; color: string }[] = [
    { operation: undefined, label: 'All', color: colors.accent },
    ...OPERATIONS.map(({ operation: op, symbol }) => ({
      operation: op,
      label: symbol,
      color: operationColors[op],
    })),
  ];

  useEffect(() => {
    let cancelled = false;
    getTopScores(10, operation, difficulty).then((results) => {
      if (!cancelled) {
        setScores(results);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [operation, difficulty]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>🏆 Leaderboard</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to home screen"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.homeIcon}>🏠</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {filters.map(({ operation: filterOp, label, color }) => {
          const active = operation === filterOp;
          return (
            <AnimatedPressable
              key={label}
              accessibilityRole="button"
              wrapperStyle={styles.filterTabWrapper}
              style={[
                styles.filterTab,
                { borderColor: color },
                active && { backgroundColor: color },
              ]}
              onPress={() => setOperation(filterOp)}
            >
              <Text style={[styles.filterLabel, { color: active ? staticColors.onColor : color }]}>
                {label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <View style={styles.levelRow}>
        {LEVEL_FILTERS.map(({ difficulty: levelValue, label }) => {
          const active = difficulty === levelValue;
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Show ${label}`}
              style={styles.levelTab}
              onPress={() => setDifficulty(levelValue)}
            >
              <Text
                style={[
                  styles.levelLabel,
                  { color: active ? colors.accent : colors.textSecondary },
                  active && styles.levelLabelActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {scores.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No scores yet — be the first!
          </Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.row,
                { backgroundColor: colors.surface, borderColor: operationColors[item.operation] },
              ]}
            >
              <Text style={styles.rank}>{MEDALS[index] ?? `${index + 1}.`}</Text>
              <View style={styles.nameBlock}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.detail, { color: colors.textSecondary }]}>
                  {operationInfo(item.operation).symbol}
                  {item.difficulty ? ` · ${LEVEL_LABELS[item.difficulty]}` : ''}
                </Text>
              </View>
              <Text style={[styles.score, { color: operationColors[item.operation] }]}>
                {item.score}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
  homeIcon: {
    fontSize: 28,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTabWrapper: {
    marginRight: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  filterLabel: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    fontSize: 19,
  },
  levelRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  levelTab: {
    marginRight: 18,
    paddingVertical: 4,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
  levelLabelActive: {
    fontFamily: fontFamily.extraBold,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rank: {
    width: 36,
    fontSize: 20,
  },
  nameBlock: {
    flex: 1,
  },
  detail: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
