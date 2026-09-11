import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { getTopScores } from '../storage/scoresRepository';
import { fontFamily, light, operationColors } from '../theme/tokens';
import type { LeaderboardScreenProps } from '../navigation/types';
import type { Operation, ScoreEntry } from '../types/game';

const FILTERS: { operation?: Operation; label: string; color: string }[] = [
  { operation: undefined, label: 'All', color: light.accent },
  { operation: 'addition', label: '+', color: operationColors.addition },
  { operation: 'subtraction', label: '−', color: operationColors.subtraction },
  { operation: 'multiplication', label: '×', color: operationColors.multiplication },
  { operation: 'division', label: '÷', color: operationColors.division },
];

const MEDALS = ['🥇', '🥈', '🥉'];

export function LeaderboardScreen({ navigation, route }: LeaderboardScreenProps) {
  const [operation, setOperation] = useState<Operation | undefined>(route.params?.operation);
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    getTopScores(10, operation).then((results) => {
      if (!cancelled) {
        setScores(results);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [operation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to home screen"
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeIcon}>🏠</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(({ operation: filterOp, label, color }) => {
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
              <Text style={[styles.filterLabel, { color: active ? '#FFFFFF' : color }]}>
                {label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {scores.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyText}>No scores yet — be the first!</Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={[styles.row, { borderColor: operationColors[item.operation] }]}>
              <Text style={styles.rank}>{MEDALS[index] ?? `${index + 1}.`}</Text>
              <Text style={styles.name}>{item.name}</Text>
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
    backgroundColor: light.background,
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
    color: light.textPrimary,
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
    fontSize: 16,
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
    color: light.textSecondary,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: light.surface,
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
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: light.textPrimary,
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
