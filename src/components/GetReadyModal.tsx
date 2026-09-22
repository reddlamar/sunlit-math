import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { ModalCard } from './ModalCard';
import { useGameTimer } from '../game/useGameTimer';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';

const COUNTDOWN_MS = 3000;

type GetReadyModalProps = {
  visible: boolean;
  onReady: () => void;
};

export function GetReadyModal({ visible, onReady }: GetReadyModalProps) {
  const { colors } = useSettings();
  const [phase, setPhase] = useState<'intro' | 'countdown'>('intro');
  const countdown = useGameTimer(COUNTDOWN_MS, onReady);

  useEffect(() => {
    if (visible) {
      setPhase('intro');
      countdown.reset();
    }
    // countdown.reset is stable (useGameTimer memoizes it on COUNTDOWN_MS,
    // a constant), so depending on it directly here is safe and exhaustive.
  }, [visible, countdown.reset]);

  const handleStart = () => {
    setPhase('countdown');
    countdown.start();
  };

  const secondsLeft = Math.ceil(countdown.timeLeft / 1000);

  return (
    <ModalCard visible={visible} centered transparentCard={phase === 'countdown'}>
      {phase === 'intro' ? (
        <>
          <Text style={styles.emoji}>⏱️</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            You have 60 seconds — solve as many problems as you can!
          </Text>
          <AnimatedPressable
            testID="get-ready-start-button"
            accessibilityRole="button"
            style={[styles.startButton, { backgroundColor: colors.accent }]}
            onPress={handleStart}
          >
            <Text style={styles.startLabel}>Start</Text>
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
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  startLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  countdown: {
    fontSize: 72,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    paddingVertical: 20,
  },
});
