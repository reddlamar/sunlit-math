import { useCallback, useMemo, useState } from 'react';
import { Animated } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

const STEP_MS = 45;
const DISTANCE = 9;

/**
 * A short horizontal wiggle: spread `shakeStyle` onto an Animated.View and call `shake()`.
 * It stays still when the player has asked for reduced motion.
 */
export function useShake() {
  const [offset] = useState(() => new Animated.Value(0));
  const isReduced = useReducedMotion();

  // Stable identities so memoized children that receive these don't re-render.
  const shake = useCallback(() => {
    if (isReduced) {
      return;
    }
    offset.setValue(0);
    Animated.sequence(
      [1, -1, 1, -1, 0].map((toValue) =>
        Animated.timing(offset, { toValue, duration: STEP_MS, useNativeDriver: true })
      )
    ).start();
  }, [offset, isReduced]);

  const shakeStyle = useMemo(() => {
    const translateX = offset.interpolate({
      inputRange: [-1, 1],
      outputRange: [-DISTANCE, DISTANCE],
    });
    return { transform: [{ translateX }] };
  }, [offset]);

  return { shake, shakeStyle };
}
