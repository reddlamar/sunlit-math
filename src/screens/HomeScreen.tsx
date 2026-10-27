import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { OperationButton } from '../components/OperationButton';
import { UnlockModal } from '../components/UnlockModal';
import { OPERATIONS } from '../game/operations';
import { getTopScores } from '../storage/scoresRepository';
import { isOperationLocked } from '../purchases/entitlements';
import { usePurchase } from '../purchases/PurchaseContext';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, operationColors } from '../theme/tokens';
import { cardShadow } from '../theme/shadow';
import { scaled, useLayout } from '../layout/layout';
import type { HomeScreenProps } from '../navigation/types';
import type { Operation, ScoreEntry } from '../types/game';

export function HomeScreen({ navigation }: Readonly<HomeScreenProps>) {
  const [topScore, setTopScore] = useState<ScoreEntry | null>(null);
  const [isUnlockModalVisible, setIsUnlockModalVisible] = useState(false);
  const { isUnlocked } = usePurchase();
  const { colors } = useSettings();
  const { isLandscape, isShort, contentWidth, scale } = useLayout();
  const labelSize = { fontSize: scaled(13, scale) };

  // Home stays mounted under the Game screen, so reload on every focus rather
  // than on mount; otherwise a score saved during a game never shows up here.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getTopScores(1).then(([entry]) => {
        if (!cancelled) {
          setTopScore(entry ?? null);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handleSelectOperation = (operation: Operation) => {
    if (isOperationLocked(operation, isUnlocked)) {
      setIsUnlockModalVisible(true);
      return;
    }
    navigation.navigate('Game', { operation });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/home-header-banner.png')}
          testID="header-banner"
          style={[styles.headerBanner, isShort && styles.headerBannerShort]}
          resizeMode="contain"
        />
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="View leaderboard"
          onPress={() => navigation.navigate('Leaderboard', {})}
        >
          <Text style={[styles.leaderboardIcon, { fontSize: 28 * scale }]}>🏆</Text>
        </AnimatedPressable>
      </View>
      <ScrollView
        testID="home-scroll"
        contentContainerStyle={[styles.content, isShort && styles.contentShort]}
      >
        <View
          testID="operation-grid"
          style={[styles.grid, !isLandscape && { maxWidth: contentWidth }]}
        >
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
            isShort && styles.topScoreCardShort,
            { maxWidth: contentWidth },
            { backgroundColor: colors.surface },
            {
              borderColor: topScore ? operationColors[topScore.operation] : colors.border,
            },
          ]}
          onPress={() => navigation.navigate('Leaderboard', {})}
        >
          <Text style={[styles.topScoreIcon, { fontSize: scaled(30, scale) }]}>🏆</Text>
          {topScore ? (
            <View>
              <Text style={[styles.topScoreLabel, labelSize, { color: colors.textSecondary }]}>
                Top Score
              </Text>
              <Text
                style={[
                  styles.topScoreValue,
                  { color: operationColors[topScore.operation], fontSize: scaled(18, scale) },
                ]}
              >
                {topScore.name} · {topScore.score}
              </Text>
            </View>
          ) : (
            <Text style={[styles.topScoreLabel, labelSize, { color: colors.textSecondary }]}>
              No scores yet — be the first!
            </Text>
          )}
        </AnimatedPressable>
      </ScrollView>
      <UnlockModal visible={isUnlockModalVisible} onClose={() => setIsUnlockModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  // The banner is 7:1; capping its width caps its height at 56 dp on a phone turned sideways.
  headerBannerShort: {
    maxWidth: 392,
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
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  contentShort: {
    paddingTop: 12,
  },
  grid: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  topScoreCard: {
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 18,
    borderRadius: 24,
    borderWidth: 2,
    ...cardShadow({ elevation: 3, opacity: 0.12, radius: 6, offsetHeight: 4 }),
  },
  topScoreCardShort: {
    marginTop: 16,
  },
  topScoreIcon: {
    marginRight: 14,
  },
  topScoreLabel: {
    fontWeight: '600',
    fontFamily: fontFamily.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topScoreValue: {
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    marginTop: 2,
  },
});
