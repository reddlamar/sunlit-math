import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { ModalCard } from './ModalCard';
import { useGameTimer } from '../game/useGameTimer';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import { modalStyles } from './modalStyles';

const COUNTDOWN_MS = 3000;

type GetReadyModalProps = {
  visible: boolean;
  onReady: () => void;
  onExit: () => void;
};

export function GetReadyModal({ visible, onReady, onExit }: GetReadyModalProps) {
  const { colors } = useSettings();
  const [phase, setPhase] = useState<'intro' | 'countdown'>('intro');
  const [wasVisible, setWasVisible] = useState(visible);
  const { timeLeft, start, reset } = useGameTimer(COUNTDOWN_MS, onReady);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setPhase('intro');
    }
  }

  useEffect(() => {
    if (visible) {
      reset();
    }
  }, [visible, reset]);

  const handleStart = () => {
    setPhase('countdown');
    start();
  };

  const secondsLeft = Math.ceil(timeLeft / 1000);

  return (
    // The modal covers the stack header and blocks the back swipe, so it has to
    // provide its own way out.
    <ModalCard
      visible={visible}
      onRequestClose={onExit}
      centered
      transparentCard={phase === 'countdown'}
    >
      {phase === 'intro' ? (
        <>
          <Text style={modalStyles.emoji}>⏱️</Text>
          <Text style={[modalStyles.title, styles.title, { color: colors.textPrimary }]}>
            You have 60 seconds — solve as many problems as you can!
          </Text>
          <AnimatedPressable
            testID="get-ready-start-button"
            accessibilityRole="button"
            style={[modalStyles.primaryButton, styles.startButton, { backgroundColor: colors.accent }]}
            onPress={handleStart}
          >
            <Text style={[modalStyles.primaryLabel, styles.startLabel]}>Start</Text>
          </AnimatedPressable>
          <AnimatedPressable
            testID="get-ready-exit-button"
            accessibilityRole="button"
            style={styles.exitButton}
            onPress={onExit}
          >
            <Text style={[modalStyles.subtleLabel, { color: colors.textSecondary }]}>Back</Text>
          </AnimatedPressable>
        </>
      ) : (
        <Text testID="get-ready-countdown" style={[styles.countdown, { color: colors.accent }]}>
          {secondsLeft}
        </Text>
      )}
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    marginBottom: 20,
  },
  startButton: {
    paddingHorizontal: 40,
  },
  startLabel: {
    fontSize: 18,
  },
  exitButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
  countdown: {
    fontSize: 72,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    paddingVertical: 20,
  },
});
