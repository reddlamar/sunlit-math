import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, View } from 'react-native';
import { usePreventRemove } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { AnswerGrid } from '../components/AnswerGrid';
import { FeedbackHint } from '../components/FeedbackHint';
import { IconButton } from '../components/IconButton';
import { PointsFloat } from '../components/PointsFloat';
import { QuestionCard } from '../components/QuestionCard';
import { StatChip } from '../components/StatChip';
import { StreakIndicator } from '../components/StreakIndicator';
import { TimerBar } from '../components/TimerBar';
import { NameEntryModal } from '../components/NameEntryModal';
import { RoundSummary } from '../components/RoundSummary';
import { GetReadyModal } from '../components/GetReadyModal';
import { useAnswerFeedback } from '../components/useAnswerFeedback';
import { useShake } from '../components/useShake';
import { playCorrectSound, playWrongSound } from '../audio/sounds';
import { useGameEngine } from '../game/useGameEngine';
import { useSettings } from '../settings/SettingsContext';
import { Icon } from '../components/icons/Icon';
import { fontFamily, operationColors, staticColors } from '../theme/tokens';
import { frameSize, gameArrangement, READABLE_MAX_WIDTH, useLayout } from '../layout/layout';
import type { GameScreenProps } from '../navigation/types';
import type { ScoreEntry } from '../types/game';

export function GameScreen({ navigation, route }: GameScreenProps) {
  const { operation } = route.params;
  const { colors, difficulty } = useSettings();
  const engine = useGameEngine(operation, difficulty);
  const [savedEntry, setSavedEntry] = useState<ScoreEntry | null>(null);
  const [isGetReadyVisible, setIsGetReadyVisible] = useState(true);
  const { shake, shakeStyle } = useShake();
  const reveal = useAnswerFeedback(engine.lastAnswer);
  const layout = useLayout();
  const arrangement = gameArrangement(layout);

  const { submitAnswer, pause, holdClock, releaseClock } = engine;
  const isRoundInProgress = engine.status === 'playing' || engine.status === 'paused';

  // The pressed button is usually gone after a wrong answer (the next problem has
  // new choices), so the whole grid shakes instead.
  const handleAnswer = useCallback(
    (value: number) => {
      const result = submitAnswer(value);
      if (result === 'correct') {
        playCorrectSound();
      } else if (result === 'wrong') {
        playWrongSound();
        shake();
      }
    },
    [submitAnswer, shake]
  );

  // Showing the right answer after a miss is teaching, not play, so it must not cost the
  // player time on the clock.
  const isRevealing = reveal !== null;
  useEffect(() => {
    if (!isRevealing) {
      return;
    }
    holdClock();
    return releaseClock;
  }, [isRevealing, holdClock, releaseClock]);

  // The timer runs on wall-clock time, so a phone call or app switch would otherwise
  // quietly burn the round. Pausing on background gives the player the round back.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        pause();
      }
    });
    return () => subscription.remove();
  }, [pause]);

  // Leaving mid-round (back button, swipe, Android back) throws the score away, so
  // ask first. Not while Get Ready is showing: that modal has its own exit.
  // usePreventRemove (rather than a raw beforeRemove listener) is what makes the iOS
  // native stack actually keep the screen on cancel; without it iOS pops the screen
  // natively and navigation state falls out of sync with what is on screen.
  const shouldConfirmLeave = isRoundInProgress && !isGetReadyVisible;
  usePreventRemove(shouldConfirmLeave, ({ data }) => {
    pause();
    Alert.alert('Leave this game?', 'Your score for this round will be lost.', [
      { text: 'Keep playing', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  const handleRoundReady = () => {
    setIsGetReadyVisible(false);
    engine.start();
  };

  const handlePlayAgain = () => {
    setSavedEntry(null);
    setIsGetReadyVisible(true);
  };

  const handleRestart = () => {
    // Freezes the old round's timer behind the modal so it can't tick to zero
    // while the player is looking at the Get Ready screen; no-op if not playing.
    engine.pause();
    setIsGetReadyVisible(true);
  };

  // Restart sits right next to Pause and wipes the round, so a mis-tap needs a safety net.
  // The round is paused while the question is up and stays paused if they keep playing.
  const handleRestartPress = () => {
    engine.pause();
    Alert.alert('Restart this round?', 'Your current score will be lost.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Restart', style: 'destructive', onPress: handleRestart },
    ]);
  };

  const handleViewLeaderboard = () => {
    navigation.navigate('Leaderboard', { operation });
  };

  if (savedEntry) {
    return (
      <RoundSummary
        name={savedEntry.name}
        score={savedEntry.score}
        operation={operation}
        onPlayAgain={handlePlayAgain}
        onViewLeaderboard={handleViewLeaderboard}
      />
    );
  }

  const controls = (
    <View style={styles.controls}>
      {engine.status === 'playing' && (
        <IconButton testID="pause-button" icon="pause" label="Pause game" onPress={engine.pause} />
      )}
      {isRoundInProgress && (
        <IconButton
          testID="restart-button"
          icon="restart"
          label="Restart game"
          onPress={handleRestartPress}
        />
      )}
    </View>
  );
  const score = (
    <StatChip>
      <Text testID="score-value" style={[styles.score, { color: colors.textPrimary }]}>
        {`Score ${engine.score}`}
      </Text>
    </StatChip>
  );
  const streak = <StreakIndicator streak={engine.streak} />;
  const timer = <TimerBar timeLeft={engine.timeLeft} duration={engine.duration} />;

  // A miss holds the sum it was for, so the child sees which answer was right.
  const shown = reveal?.problem ?? engine.problem;
  const hint = <FeedbackHint isMiss={reveal !== null} />;
  const isSideways = arrangement === 'sideways';
  const isPaused = engine.status === 'paused';
  const playArea = shown && (
    <View
      testID="problem-area"
      style={[
        styles.playArea,
        isPaused && styles.playAreaPaused,
        isSideways && styles.playAreaSideways,
        arrangement === 'sidePanel' && styles.playAreaSidePanel,
      ]}
    >
      {isPaused ? (
        <View style={styles.paused}>
          <Icon name="pause" size={56} color={colors.textPrimary} />
          <Text style={[styles.pausedTitle, { color: colors.textPrimary }]}>Paused</Text>
          <AnimatedPressable
            testID="resume-button"
            accessibilityRole="button"
            style={[styles.primaryButton, { backgroundColor: operationColors[operation] }]}
            onPress={engine.resume}
          >
            <Text style={styles.primaryButtonLabel}>Resume</Text>
          </AnimatedPressable>
        </View>
      ) : (
        <>
          <QuestionCard
            question={shown.question}
            fontSize={isSideways ? SIDEWAYS_QUESTION_SIZE : undefined}
            style={
              arrangement === 'stacked'
                ? { minHeight: QUESTION_MIN_HEIGHT[frameSize(layout)] }
                : styles.questionFills
            }
          />
          <View style={isSideways && styles.answersSideways}>
            <AnswerGrid
              choices={shown.choices}
              reveal={reveal ? { correct: reveal.problem.answer, wrong: reveal.chosen } : undefined}
              // The board is locked while a miss is shown, so a quick second tap can't land
              // on a sum the player hasn't seen yet.
              disabled={engine.status !== 'playing' || reveal !== null}
              onAnswer={handleAnswer}
              shakeStyle={shakeStyle}
            />
          </View>
          <PointsFloat outcome={engine.lastAnswer} />
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {arrangement === 'sidePanel' && (
        <View style={styles.panes}>
          <View testID="top-bar" style={styles.sidePanel}>
            {controls}
            {score}
            {streak}
            {timer}
            {hint}
          </View>
          {playArea}
        </View>
      )}
      {arrangement === 'sideways' && (
        <View style={styles.sidewaysScreen}>
          <View testID="top-bar" style={styles.sidewaysBar}>
            <View style={styles.sidewaysTimer}>{timer}</View>
            {controls}
            {score}
            {streak}
          </View>
          {playArea}
        </View>
      )}
      {arrangement === 'stacked' && (
        <View testID="game-column" style={styles.column}>
          <View testID="top-bar" style={styles.topBar}>
            {controls}
            {score}
            <View style={styles.spacer} />
            {streak}
          </View>
          {timer}
          {playArea}
          {hint}
        </View>
      )}

      {/* engine.status stays 'ended' until the next round's engine.start() actually
          runs (see handleRoundReady), so without the isGetReadyVisible check this
          would still be visible for the entire Get Ready screen after Play Again. */}
      <NameEntryModal
        visible={engine.status === 'ended' && !isGetReadyVisible}
        score={engine.score}
        operation={operation}
        onSaved={setSavedEntry}
      />
      <GetReadyModal
        visible={isGetReadyVisible}
        onReady={handleRoundReady}
        onExit={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}

const SIDEWAYS_QUESTION_SIZE = 48;
/** How tall the question card is in the column; the wide layout lets it fill instead. */
const QUESTION_MIN_HEIGHT = { compact: 132, medium: 260, wide: 0 } as const;
const SCREEN_PADDING = 20;
const SECTION_GAP = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Upright: one readable column, with the answers pushed down to the thumbs.
  column: {
    flex: 1,
    width: '100%',
    maxWidth: READABLE_MAX_WIDTH + SCREEN_PADDING * 2,
    alignSelf: 'center',
    gap: SECTION_GAP,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
  score: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  // A wide window held sideways: stats on the left, the question and answers on the right.
  panes: {
    flex: 1,
    flexDirection: 'row',
    gap: 48,
    paddingHorizontal: 48,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sidePanel: {
    width: 260,
    alignItems: 'flex-start',
    gap: SECTION_GAP,
  },
  // A phone turned sideways has about 360 dp of height, so the timer and stats share a row
  // and the question sits beside the answers.
  sidewaysScreen: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sidewaysBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sidewaysTimer: {
    flex: 1,
  },
  playArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  playAreaPaused: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playAreaSidePanel: {
    gap: 24,
  },
  playAreaSideways: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  answersSideways: {
    flex: 1,
  },
  // In the wide and sideways layouts the card takes whatever room the answers leave.
  questionFills: {
    flex: 1,
  },
  paused: {
    alignItems: 'center',
    gap: 8,
  },
  pausedTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  primaryButtonLabel: {
    color: staticColors.onColor,
    fontSize: 19,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
});
