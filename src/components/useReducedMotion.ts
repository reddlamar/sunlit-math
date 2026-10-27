import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Whether the player asked their device to cut down on motion. Bounces and shakes should
 * give way to fades while it is on; it updates if they change the setting mid-game.
 */
export function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setIsReduced(enabled);
        }
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduced);
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return isReduced;
}
