import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from './AnimatedPressable';
import { AvatarPicker } from './AvatarPicker';
import { Stars } from './Stars';
import { Sunny } from './Sunny';
import { TopPlayersPreview } from './TopPlayersPreview';
import { starsForScore } from '../game/stars';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, radius, staticColors } from '../theme/tokens';
import { frameSize, READABLE_MAX_WIDTH, useLayout } from '../layout/layout';
import { pointsLabel } from '../utils/format';
import type { AvatarId, ScoreEntry } from '../types/game';

type SummarySizes = {
  sunny: number;
  title: number;
  stars: number;
  avatar: number;
  playHeight: number;
  homeHeight: number;
};

const SIZES = {
  // A phone turned sideways has little height, so everything is drawn smaller there.
  short: { sunny: 96, title: 26, stars: 40, avatar: 48, playHeight: 56, homeHeight: 48 },
  compact: { sunny: 120, title: 32, stars: 56, avatar: 48, playHeight: 64, homeHeight: 56 },
  medium: { sunny: 200, title: 44, stars: 64, avatar: 56, playHeight: 72, homeHeight: 64 },
  wide: { sunny: 150, title: 44, stars: 64, avatar: 56, playHeight: 72, homeHeight: 72 },
} satisfies Record<string, SummarySizes>;

const TITLES = { 1: 'Good try!', 2: 'Great job!', 3: 'Amazing!' } as const;
const TOP_PLAYERS_WIDTH = 420;

type RoundSummaryProps = {
  score: number;
  /** The player's best on this operation and level before this round; null if none. */
  previousBest: number | null;
  avatar: AvatarId;
  /** The best few scores, shown beside the result on a wide landscape window. */
  topScores: ScoreEntry[];
  /** True when the score could not be saved. */
  saveFailed: boolean;
  onSelectAvatar: (id: AvatarId) => void;
  onRetrySave: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
};

/** Shown when a round ends: how it went, and who is playing. */
export function RoundSummary({
  score,
  previousBest,
  avatar,
  topScores,
  saveFailed,
  onSelectAvatar,
  onRetrySave,
  onPlayAgain,
  onHome,
}: RoundSummaryProps) {
  const { colors } = useSettings();
  const layout = useLayout();
  const size = frameSize(layout);
  const sizes: SummarySizes = SIZES[layout.isShort ? 'short' : size];
  const isWide = size === 'wide';
  const stars = starsForScore(score, previousBest);
  const isNewBest = score > 0 && (previousBest === null || score > previousBest);

  const hero = (
    <View style={styles.hero}>
      <Sunny size={sizes.sunny} expression="cheer" />
      <Text
        accessibilityRole="header"
        style={[
          styles.title,
          { color: colors.textPrimary, fontSize: sizes.title, lineHeight: sizes.title * 1.1 },
        ]}
      >
        {TITLES[stars]}
      </Text>
      <Stars count={stars} size={sizes.stars} />
    </View>
  );

  const details = (
    <View style={styles.details}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text testID="summary-score" style={[styles.score, { color: colors.textPrimary }]}>
          {score}
        </Text>
        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
          {pointsLabel(score)}
        </Text>
        {(isNewBest || previousBest !== null) && (
          <Text style={[styles.best, { color: colors.streak }]}>
            {isNewBest ? 'New personal best!' : `Personal best: ${previousBest}`}
          </Text>
        )}
      </View>

      {saveFailed && (
        <View style={styles.failure}>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.failureText, { color: colors.danger }]}
          >
            {"Your score couldn't be saved."}
          </Text>
          <AnimatedPressable
            testID="retry-save-button"
            accessibilityRole="button"
            onPress={onRetrySave}
          >
            <Text style={[styles.retry, { color: colors.accentText }]}>Try again</Text>
          </AnimatedPressable>
        </View>
      )}

      <Text style={[styles.pickTitle, { color: colors.textPrimary }]}>Pick your player</Text>
      <AvatarPicker selected={avatar} onSelect={onSelectAvatar} size={sizes.avatar} />

      <View style={[styles.buttons, isWide && styles.buttonsWide]}>
        <AnimatedPressable
          testID="play-again-button"
          accessibilityRole="button"
          wrapperStyle={isWide && styles.buttonWrapper}
          style={[styles.button, { backgroundColor: colors.accent, height: sizes.playHeight }]}
          onPress={onPlayAgain}
        >
          <Text style={[styles.buttonLabel, { color: staticColors.onColor }]}>Play again</Text>
        </AnimatedPressable>
        <AnimatedPressable
          testID="home-button"
          accessibilityRole="button"
          wrapperStyle={isWide && styles.buttonWrapper}
          style={[
            styles.button,
            styles.homeButton,
            { borderColor: colors.border, height: sizes.homeHeight },
          ]}
          onPress={onHome}
        >
          <Text style={[styles.buttonLabel, { color: colors.textPrimary }]}>Home</Text>
        </AnimatedPressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        testID="summary-scroll"
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
      >
        {isWide ? (
          <>
            <View style={styles.resultPane}>
              {hero}
              {details}
            </View>
            <View
              testID="summary-top-players"
              style={[
                styles.topPlayers,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TopPlayersPreview scores={topScores} />
            </View>
          </>
        ) : layout.isShort ? (
          <View style={styles.sideways}>
            {hero}
            {details}
          </View>
        ) : (
          <View style={styles.column}>
            {hero}
            {details}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentWide: {
    flexDirection: 'row',
    gap: 48,
    paddingHorizontal: 48,
  },
  column: {
    width: '100%',
    maxWidth: READABLE_MAX_WIDTH,
    gap: 20,
  },
  sideways: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  resultPane: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 16,
  },
  details: {
    width: '100%',
    maxWidth: READABLE_MAX_WIDTH,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: radius.xl,
  },
  score: {
    fontSize: 44,
    // Baloo's digits stand taller than 44 dp of line, and are clipped by less.
    lineHeight: 52,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
  scoreLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: fontFamily.regular,
  },
  best: {
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  failure: {
    alignItems: 'center',
    gap: 4,
  },
  failureText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  },
  retry: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  pickTitle: {
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  buttonsWide: {
    flexDirection: 'row',
    gap: 16,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
  },
  homeButton: {
    borderWidth: 2,
  },
  buttonLabel: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  topPlayers: {
    width: TOP_PLAYERS_WIDTH,
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderWidth: 2,
    borderRadius: radius.xl,
  },
});
