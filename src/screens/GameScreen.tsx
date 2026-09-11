import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { AnswerButton } from '../components/AnswerButton';
import { TimerBar } from '../components/TimerBar';
import { StreakIndicator } from '../components/StreakIndicator';
import { NameEntryModal } from '../components/NameEntryModal';
import { useGameEngine } from '../game/useGameEngine';
import { choiceColors, fontFamily, light, operationColors } from '../theme/tokens';
import { cardShadow } from '../theme/shadow';
import type { GameScreenProps } from '../navigation/types';
import type { ScoreEntry } from '../types/game';

export function GameScreen({ navigation, route }: GameScreenProps) {
  const { operation } = route.params;
  const engine = useGameEngine(operation);
  const [savedEntry, setSavedEntry] = useState<ScoreEntry | null>(null);

  useEffect(() => {
    engine.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayAgain = () => {
    setSavedEntry(null);
    engine.start();
  };

  const handleRestart = () => {
    engine.start();
  };

  const handleViewLeaderboard = () => {
    navigation.navigate('Leaderboard', { operation });
  };

  if (savedEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.summary}>
          <Text style={styles.summaryEmoji}>🎉</Text>
          <Text style={styles.summaryTitle}>Nice work, {savedEntry.name}!</Text>
          <Text style={[styles.summaryScore, { color: operationColors[operation] }]}>
            {savedEntry.score} points
          </Text>
          <AnimatedPressable
            testID="play-again-button"
            accessibilityRole="button"
            wrapperStyle={styles.primaryButtonWrapper}
            style={[styles.primaryButton, { backgroundColor: operationColors[operation] }]}
            onPress={handlePlayAgain}
          >
            <Text style={styles.primaryButtonLabel}>Play Again</Text>
          </AnimatedPressable>
          <AnimatedPressable accessibilityRole="button" onPress={handleViewLeaderboard}>
            <Text style={styles.secondaryButtonLabel}>View Leaderboard</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TimerBar timeLeft={engine.timeLeft} duration={engine.duration} />
        <View style={styles.statsRow}>
          <Text testID="score-value" style={[styles.score, { color: operationColors[operation] }]}>
            {engine.score}
          </Text>
          <View style={styles.controls}>
            {(engine.status === 'playing' || engine.status === 'paused') && (
              <AnimatedPressable
                testID="restart-button"
                accessibilityRole="button"
                accessibilityLabel="Restart game"
                wrapperStyle={styles.controlButtonWrapper}
                style={[styles.controlButton, styles.restartButton]}
                onPress={handleRestart}
              >
                <Text style={styles.controlIcon}>↻</Text>
              </AnimatedPressable>
            )}
            {engine.status === 'playing' && (
              <AnimatedPressable
                testID="pause-button"
                accessibilityRole="button"
                accessibilityLabel="Pause game"
                style={[styles.controlButton, { backgroundColor: operationColors[operation] }]}
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
        <View style={styles.problemArea}>
          {engine.status === 'paused' ? (
            <View>
              <Text style={styles.pausedEmoji}>⏸</Text>
              <Text style={styles.pausedTitle}>Paused</Text>
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
              <Text testID="problem-question" style={styles.question}>
                {engine.problem.question}
              </Text>
              <View style={styles.choices}>
                {engine.problem.choices.map((choice, index) => (
                  <AnswerButton
                    key={choice}
                    value={choice}
                    color={choiceColors[index % choiceColors.length]}
                    onPress={engine.submitAnswer}
                    disabled={engine.status !== 'playing'}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <NameEntryModal
        visible={engine.status === 'ended'}
        score={engine.score}
        operation={operation}
        onSaved={setSavedEntry}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.background,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
    marginRight: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow({ elevation: 3, opacity: 0.15, radius: 4 }),
  },
  restartButton: {
    backgroundColor: '#8B95A1',
  },
  controlIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  problemArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: light.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  question: {
    fontSize: 44,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: light.textPrimary,
    marginBottom: 24,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  summary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  summaryEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: light.textPrimary,
    marginBottom: 8,
  },
  summaryScore: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    marginBottom: 32,
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  secondaryButtonLabel: {
    color: light.accent,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.regular,
  },
});
