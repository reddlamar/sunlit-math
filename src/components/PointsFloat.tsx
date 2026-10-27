import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useReducedMotion } from './useReducedMotion';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import type { AnswerOutcome } from '../types/game';

const FLOAT_MS = 800;
const RISE = 48;

/** "+3" for points won, "−1" (a true minus sign) for the point a miss costs. */
export function formatPointsChange(points: number): string {
  return points >= 0 ? `+${points}` : `−${Math.abs(points)}`;
}

type PointsFloatProps = {
  /** The latest answer; each new one sends a fresh number floating up. */
  outcome: AnswerOutcome | null;
};

/**
 * The points an answer just earned or cost, rising and fading over the play area. With
 * reduced motion it fades in place instead of rising.
 */
export function PointsFloat({ outcome }: PointsFloatProps) {
  const { colors } = useSettings();
  const isReduced = useReducedMotion();
  // 0 is the moment of the answer and 1 is when the number has gone, which is also how it
  // starts, so nothing shows before the first answer.
  const [progress] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!outcome) {
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: FLOAT_MS,
      useNativeDriver: true,
    }).start();
  }, [outcome, progress]);

  if (!outcome) {
    return null;
  }

  return (
    <Animated.Text
      testID="points-float"
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.text,
        {
          color: outcome.result === 'correct' ? colors.success : colors.error,
          opacity: progress.interpolate({
            inputRange: [0, 0.15, 0.7, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateY: isReduced
                ? 0
                : progress.interpolate({ inputRange: [0, 1], outputRange: [0, -RISE] }),
            },
          ],
        },
      ]}
    >
      {formatPointsChange(outcome.points)}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 44,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
