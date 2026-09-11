import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { fontFamily, light } from '../theme/tokens';
import { playStreakSound } from '../audio/sounds';

const LIT_THRESHOLD = 3;
const MILESTONE_INTERVAL = 3;

type StreakIndicatorProps = {
  streak: number;
};

export function StreakIndicator({ streak }: StreakIndicatorProps) {
  const isLit = streak >= LIT_THRESHOLD;
  const pop = useRef(new Animated.Value(1)).current;
  const previousStreak = useRef(streak);

  useEffect(() => {
    const isNewMilestone =
      streak > previousStreak.current && streak > 0 && streak % MILESTONE_INTERVAL === 0;
    previousStreak.current = streak;

    if (!isNewMilestone) {
      return;
    }

    playStreakSound();
    pop.setValue(1);
    Animated.sequence([
      Animated.spring(pop, { toValue: 1.6, friction: 3, tension: 200, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }),
    ]).start();
  }, [streak, pop]);

  return (
    <View style={[styles.container, isLit && styles.containerLit]}>
      <Animated.Text
        testID="streak-flame"
        accessibilityState={{ selected: isLit }}
        style={[styles.flame, isLit && styles.flameLit, { transform: [{ scale: pop }] }]}
      >
        🔥
      </Animated.Text>
      <Text style={[styles.count, isLit && styles.countLit]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  containerLit: {
    backgroundColor: '#FFF1E6',
  },
  flame: {
    fontSize: 20,
    opacity: 0.3,
  },
  flameLit: {
    fontSize: 26,
    opacity: 1,
  },
  count: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: light.textPrimary,
  },
  countLit: {
    color: '#FF9F45',
  },
});
