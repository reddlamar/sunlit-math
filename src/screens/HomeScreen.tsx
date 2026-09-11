import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { OperationButton } from '../components/OperationButton';
import { UnlockModal } from '../components/UnlockModal';
import { getTopScores } from '../storage/scoresRepository';
import { isOperationLocked } from '../purchases/entitlements';
import { usePurchase } from '../purchases/PurchaseContext';
import { fontFamily, light, operationColors } from '../theme/tokens';
import { cardShadow } from '../theme/shadow';
import type { HomeScreenProps } from '../navigation/types';
import type { Operation, ScoreEntry } from '../types/game';

const OPERATIONS: { operation: Operation; symbol: string; label: string }[] = [
  { operation: 'addition', symbol: '+', label: 'Addition' },
  { operation: 'subtraction', symbol: '−', label: 'Subtraction' },
  { operation: 'multiplication', symbol: '×', label: 'Multiplication' },
  { operation: 'division', symbol: '÷', label: 'Division' },
];

export function HomeScreen({ navigation }: Readonly<HomeScreenProps>) {
  const [topScore, setTopScore] = useState<ScoreEntry | null>(null);
  const [isUnlockModalVisible, setIsUnlockModalVisible] = useState(false);
  const { isUnlocked } = usePurchase();

  useEffect(() => {
    let cancelled = false;
    getTopScores(1).then(([entry]) => {
      if (!cancelled) {
        setTopScore(entry ?? null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectOperation = (operation: Operation) => {
    if (isOperationLocked(operation, isUnlocked)) {
      setIsUnlockModalVisible(true);
      return;
    }
    navigation.navigate('Game', { operation });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/home-header-banner.png')}
          style={styles.headerBanner}
          resizeMode="contain"
        />
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="View leaderboard"
          onPress={() => navigation.navigate('Leaderboard', {})}
        >
          <Text style={styles.leaderboardIcon}>🏆</Text>
        </AnimatedPressable>
      </View>
      <View style={styles.content}>
        <View style={styles.grid}>
          {OPERATIONS.map(({ operation, symbol, label }) => (
            <OperationButton
              key={operation}
              operation={operation}
              symbol={symbol}
              label={label}
              locked={isOperationLocked(operation, isUnlocked)}
              onPress={handleSelectOperation}
            />
          ))}
        </View>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="View top score on the leaderboard"
          style={[
            styles.topScoreCard,
            { borderColor: topScore ? operationColors[topScore.operation] : light.border },
          ]}
          onPress={() => navigation.navigate('Leaderboard', {})}
        >
          <Text style={styles.topScoreIcon}>🏆</Text>
          {topScore ? (
            <View>
              <Text style={styles.topScoreLabel}>Top Score</Text>
              <Text style={[styles.topScoreValue, { color: operationColors[topScore.operation] }]}>
                {topScore.name} · {topScore.score}
              </Text>
            </View>
          ) : (
            <Text style={styles.topScoreLabel}>No scores yet — be the first!</Text>
          )}
        </AnimatedPressable>
      </View>
      <UnlockModal
        visible={isUnlockModalVisible}
        onClose={() => setIsUnlockModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerBanner: {
    flex: 1,
    aspectRatio: 7,
    marginRight: 16,
  },
  leaderboardIcon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  topScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 18,
    borderRadius: 24,
    backgroundColor: light.surface,
    borderWidth: 2,
    ...cardShadow({ elevation: 3, opacity: 0.12, radius: 6, offsetHeight: 4 }),
  },
  topScoreIcon: {
    fontSize: 30,
    marginRight: 14,
  },
  topScoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
    color: light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topScoreValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: light.textPrimary,
    marginTop: 2,
  },
});
