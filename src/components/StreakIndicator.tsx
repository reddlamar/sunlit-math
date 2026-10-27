import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Icon } from './icons/Icon';
import { StatChip } from './StatChip';
import { useReducedMotion } from './useReducedMotion';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import { playStreakSound } from '../audio/sounds';

const LIT_THRESHOLD = 3;
const MILESTONE_INTERVAL = 3;
const FLAME_SIZE = 20;

type StreakIndicatorProps = {
  streak: number;
};

export function StreakIndicator({ streak }: StreakIndicatorProps) {
  const { colors } = useSettings();
  const isLit = streak >= LIT_THRESHOLD;
  const isReduced = useReducedMotion();
  const [pop] = useState(() => new Animated.Value(1));
  const previousStreak = useRef(streak);

  useEffect(() => {
    const isNewMilestone =
      streak > previousStreak.current && streak > 0 && streak % MILESTONE_INTERVAL === 0;
    previousStreak.current = streak;

    if (!isNewMilestone) {
      return;
    }

    playStreakSound();
    if (isReduced) {
      return;
    }
    pop.setValue(1);
    Animated.sequence([
      Animated.spring(pop, {
        toValue: 1.6,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(pop, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [streak, pop, isReduced]);

  const color = isLit ? colors.streak : colors.textSecondary;

  return (
    <StatChip testID="streak-container" warm={isLit}>
      <Animated.View
        testID="streak-flame"
        accessibilityState={{ selected: isLit }}
        style={[!isLit && styles.unlit, { transform: [{ scale: pop }] }]}
      >
        <Icon name="flame" size={FLAME_SIZE} color={color} />
      </Animated.View>
      <Text style={[styles.count, { color: isLit ? colors.streak : colors.textPrimary }]}>
        {streak}
      </Text>
    </StatChip>
  );
}

const styles = StyleSheet.create({
  unlit: {
    opacity: 0.4,
  },
  count: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
});
