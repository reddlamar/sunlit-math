import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, View } from 'react-native';
import { usePreventRemove } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { AnswerGrid } from '../components/AnswerGrid';
import { TimerBar } from '../components/TimerBar';
import { StreakIndicator } from '../components/StreakIndicator';
import { NameEntryModal } from '../components/NameEntryModal';
import { RoundSummary } from '../components/RoundSummary';
import { GetReadyModal } from '../components/GetReadyModal';
import { useShake } from '../components/useShake';
import { playCorrectSound, playWrongSound } from '../audio/sounds';
import { useGameEngine } from '../game/useGameEngine';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, operationColors, staticColors } from '../theme/tokens';
import { cardShadow } from '../theme/shadow';
import { scaled, useLayout } from '../layout/layout';
import type { GameScreenProps } from '../navigation/types';
import type { ScoreEntry } from '../types/game';

export function GameScreen({ navigation, route }: GameScreenProps) {
  const { operation } = route.params;
  const { colors, difficulty } = useSettings();
  const engine = useGameEngine(operation, difficulty);
  const [savedEntry, setSavedEntry] = useState<ScoreEntry | null>(null);
  const [isGetReadyVisible, setIsGetReadyVisible] = useState(true);
  const { shake, shakeStyle } = useShake();
  const { isLandscape, isShort, contentWidth, scale } = useLayout();
  // Play controls grow on tablets; never below 48 dp on a phone.
  const controlSize = scale > 1 ? 56 : 48;

  const { submitAnswer, pause } = engine;
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        testID="top-bar"
        style={[
          styles.topBar,
          isShort && styles.topBarShort,
          !isLandscape && { maxWidth: contentWidth },
        ]}
      >
        <View style={isShort && styles.timerShort}>
          <TimerBar timeLeft={engine.timeLeft} duration={engine.duration} />
        </View>
        <View style={[styles.statsRow, isShort && styles.statsRowShort]}>
          <Text
            testID="score-value"
            style={[
              styles.score,
              {
                color: operationColors[operation],
                fontSize: scaled(26, scale),
              },
            ]}
          >
            {engine.score}
          </Text>
          <View style={styles.controls}>
            {isRoundInProgress && (
              <AnimatedPressable
                testID="restart-button"
                accessibilityRole="button"
                accessibilityLabel="Restart game"
                wrapperStyle={styles.controlButtonWrapper}
                style={[styles.controlButton, styles.restartButton, controlStyle(controlSize)]}
                onPress={handleRestartPress}
              >
                <Text style={styles.controlIcon}>↻</Text>
              </AnimatedPressable>
            )}
            {engine.status === 'playing' && (
              <AnimatedPressable
                testID="pause-button"
                accessibilityRole="button"
                accessibilityLabel="Pause game"
                style={[
                  styles.controlButton,
                  { backgroundColor: operationColors[operation] },
                  controlStyle(controlSize),
                ]}
                onPress={engine.pause}
              >
                <Text style={styles.controlIcon}>⏸</Text>
              </AnimatedPressable>
            )}
          </View>
          <StreakIndicator streak={engine.streak} />
        </View>
      </View>

      {engine.problem && (
        <View
          testID="problem-area"
          style={[styles.problemArea, isLandscape && styles.problemAreaLandscape]}
        >
          {engine.status === 'paused' ? (
            <View>
              <Text style={styles.pausedEmoji}>⏸</Text>
              <Text style={[styles.pausedTitle, { color: colors.textPrimary }]}>Paused</Text>
              <AnimatedPressable
                testID="resume-button"
                accessibilityRole="button"
                wrapperStyle={styles.primaryButtonWrapper}
                style={[styles.primaryButton, { backgroundColor: operationColors[operation] }]}
                onPress={engine.resume}
              >
                <Text style={styles.primaryButtonLabel}>Resume</Text>
              </AnimatedPressable>
            </View>
          ) : (
            <>
              <Text
                testID="problem-question"
                style={[
                  styles.question,
                  { color: colors.textPrimary, fontSize: scaled(44, scale) },
                  isLandscape && styles.questionLandscape,
                ]}
              >
                {engine.problem.question}
              </Text>
              <AnswerGrid
                choices={engine.problem.choices}
                disabled={engine.status !== 'playing'}
                onAnswer={handleAnswer}
                shakeStyle={shakeStyle}
              />
            </>
          )}
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

const controlStyle = (size: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  // A phone turned sideways has about 360 dp of height, so the timer, score and
  // controls share one row instead of stacking.
  topBarShort: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerShort: {
    flex: 1,
    marginRight: 16,
  },
  statsRowShort: {
    marginTop: 0,
    columnGap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  score: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButtonWrapper: {
    marginRight: 18,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow({ elevation: 3, opacity: 0.15, radius: 4 }),
  },
  restartButton: {
    backgroundColor: staticColors.neutralControl,
  },
  controlIcon: {
    fontSize: 18,
    color: staticColors.onColor,
  },
  problemArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sideways, the question and the answers sit side by side so the board never
  // has to squeeze into the little height a phone has.
  problemAreaLandscape: {
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  pausedEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 8,
  },
  pausedTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    textAlign: 'center',
    marginBottom: 24,
  },
  question: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    marginBottom: 24,
  },
  questionLandscape: {
    flex: 1,
    textAlign: 'center',
    marginBottom: 0,
  },
  primaryButtonWrapper: {
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 40,
    ...cardShadow({ elevation: 6, opacity: 0.18, radius: 8 }),
  },
  primaryButtonLabel: {
    color: staticColors.onColor,
    fontSize: 19,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
});
