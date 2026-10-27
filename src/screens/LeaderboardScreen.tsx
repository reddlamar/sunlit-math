import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LeaderboardFilters } from '../components/LeaderboardFilters';
import { ScoreRow } from '../components/ScoreRow';
import { Sunny } from '../components/Sunny';
import { getTopScores } from '../storage/scoresRepository';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import { frameSize, READABLE_MAX_WIDTH, useLayout } from '../layout/layout';
import type { LeaderboardScreenProps } from '../navigation/types';
import type { Difficulty, Operation, ScoreEntry } from '../types/game';

const SCORES_SHOWN = 10;
const SIDE_COLUMN_WIDTH = 300;
const EMPTY_SUNNY_SIZE = 96;

export function LeaderboardScreen({ route }: LeaderboardScreenProps) {
  const [operation, setOperation] = useState<Operation | undefined>(route.params?.operation);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const { colors } = useSettings();
  const isWide = frameSize(useLayout()) === 'wide';

  useEffect(() => {
    let cancelled = false;
    getTopScores(SCORES_SHOWN, operation, difficulty).then((results) => {
      if (!cancelled) {
        setScores(results);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [operation, difficulty]);

  const title = (
    <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
      Leaderboard
    </Text>
  );
  const filters = (
    <LeaderboardFilters
      operation={operation}
      difficulty={difficulty}
      onOperationChange={setOperation}
      onDifficultyChange={setDifficulty}
      isColumn={isWide}
    />
  );
  const empty = (
    <View style={styles.emptyState}>
      <Sunny size={EMPTY_SUNNY_SIZE} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No scores yet — be the first!
      </Text>
    </View>
  );
  const list = (header?: React.ReactElement) => (
    <FlatList
      testID="leaderboard-list"
      ListHeaderComponent={header}
      ListHeaderComponentStyle={styles.listHeader}
      ListEmptyComponent={empty}
      contentContainerStyle={[styles.listContent, !isWide && styles.listContentPadded]}
      showsVerticalScrollIndicator={false}
      data={scores}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => <ScoreRow rank={index + 1} entry={item} />}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {isWide ? (
        <View testID="leaderboard-panes" style={styles.panes}>
          <View testID="leaderboard-side" style={styles.side}>
            {title}
            {filters}
          </View>
          <View style={styles.main}>{list()}</View>
        </View>
      ) : (
        <View testID="leaderboard-column" style={styles.column}>
          {list(
            <View style={styles.header}>
              {title}
              {filters}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: READABLE_MAX_WIDTH + 40,
    alignSelf: 'center',
    paddingTop: 16,
  },
  panes: {
    flex: 1,
    flexDirection: 'row',
    gap: 48,
    paddingHorizontal: 48,
    paddingTop: 24,
  },
  side: {
    width: SIDE_COLUMN_WIDTH,
    gap: 20,
  },
  main: {
    flex: 1,
  },
  header: {
    gap: 20,
  },
  listHeader: {
    marginBottom: 20,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  // The side padding is inside the list, not around it, so a selected filter's ring (drawn
  // outside its pill) is not clipped at the list's edge.
  listContentPadded: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    lineHeight: 35,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
});
