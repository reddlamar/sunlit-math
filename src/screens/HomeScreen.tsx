import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeGreeting } from '../components/HomeGreeting';
import { OperationGrid } from '../components/OperationGrid';
import { PersonalBestCard } from '../components/PersonalBestCard';
import { TopPlayersPreview } from '../components/TopPlayersPreview';
import { UnlockModal } from '../components/UnlockModal';
import { getTopScores } from '../storage/scoresRepository';
import { isOperationLocked } from '../purchases/entitlements';
import { usePurchase } from '../purchases/PurchaseContext';
import { useSettings } from '../settings/SettingsContext';
import { homeArrangement, frameSize, READABLE_MAX_WIDTH, useLayout } from '../layout/layout';
import type { HomeScreenProps } from '../navigation/types';
import type { Operation, ScoreEntry } from '../types/game';

/** How many scores the wide layout previews; the first is also the personal best. */
const PREVIEW_COUNT = 3;
const LEFT_PANE_WIDTH = 380;

export function HomeScreen({ navigation }: Readonly<HomeScreenProps>) {
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [isUnlockModalVisible, setIsUnlockModalVisible] = useState(false);
  const { isUnlocked } = usePurchase();
  const { colors } = useSettings();
  const layout = useLayout();
  const arrangement = homeArrangement(layout);

  // Home stays mounted under the Game screen, so reload on every focus rather
  // than on mount; otherwise a score saved during a game never shows up here.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getTopScores(PREVIEW_COUNT).then((entries) => {
        if (!cancelled) {
          setTopScores(entries);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const isLocked = (operation: Operation) => isOperationLocked(operation, isUnlocked);

  const handleSelectOperation = (operation: Operation) => {
    if (isLocked(operation)) {
      setIsUnlockModalVisible(true);
      return;
    }
    navigation.navigate('Game', { operation });
  };

  const openLeaderboard = () => navigation.navigate('Leaderboard', {});

  const tiles = (
    <OperationGrid
      arrangement={arrangement}
      size={frameSize(layout)}
      isLocked={isLocked}
      onSelect={handleSelectOperation}
    />
  );
  const personalBest = <PersonalBestCard best={topScores[0] ?? null} onPress={openLeaderboard} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {arrangement === 'twoPane' ? (
        <View style={styles.panes}>
          <ScrollView
            testID="home-scroll"
            style={styles.leftPane}
            contentContainerStyle={styles.leftPaneContent}
            showsVerticalScrollIndicator={false}
          >
            <HomeGreeting />
            {personalBest}
            <TopPlayersPreview scores={topScores} />
          </ScrollView>
          <View style={styles.rightPane}>{tiles}</View>
        </View>
      ) : (
        <ScrollView testID="home-scroll" contentContainerStyle={styles.scrollContent}>
          <View testID="home-column" style={[styles.column, { maxWidth: READABLE_MAX_WIDTH }]}>
            <HomeGreeting />
            {tiles}
            {personalBest}
          </View>
        </ScrollView>
      )}
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
    gap: 24,
  },
  panes: {
    flex: 1,
    flexDirection: 'row',
    gap: 48,
    paddingHorizontal: 48,
    paddingTop: 24,
    paddingBottom: 40,
  },
  leftPane: {
    flexGrow: 0,
    width: LEFT_PANE_WIDTH,
  },
  leftPaneContent: {
    gap: 24,
  },
  rightPane: {
    flex: 1,
  },
});
