import { useCallback, useMemo, useState } from 'react';
import { Animated } from 'react-native';

const STEP_MS = 45;
const DISTANCE = 9;

/** A short horizontal wiggle: spread `shakeStyle` onto an Animated.View and call `shake()`. */
export function useShake() {
  const [offset] = useState(() => new Animated.Value(0));

  // Stable identities so memoized children that receive these don't re-render.
  const shake = useCallback(() => {
    offset.setValue(0);
    Animated.sequence(
      [1, -1, 1, -1, 0].map((toValue) =>
        Animated.timing(offset, { toValue, duration: STEP_MS, useNativeDriver: true })
      )
    ).start();
  }, [offset]);

  const shakeStyle = useMemo(() => {
    const translateX = offset.interpolate({
      inputRange: [-1, 1],
      outputRange: [-DISTANCE, DISTANCE],
    });
    return { transform: [{ translateX }] };
  }, [offset]);

  return { shake, shakeStyle };
}
