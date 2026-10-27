import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import { frameSize, useLayout, type FrameSize } from '../layout/layout';

const TRACK_HEIGHT: Record<FrameSize, number> = { compact: 24, medium: 32, wide: 32 };
/** A phone turned sideways keeps the bar slim so the question and answers get the height. */
const SHORT_TRACK_HEIGHT = 16;

type TimerBarProps = {
  timeLeft: number;
  duration: number;
};

export function TimerBar({ timeLeft, duration }: TimerBarProps) {
  const { colors } = useSettings();
  const layout = useLayout();
  const size = frameSize(layout);
  const trackHeight = layout.isShort ? SHORT_TRACK_HEIGHT : TRACK_HEIGHT[size];
  const fraction = duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;
  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <View style={styles.container}>
      {/* The bar is decoration: the words under it say how much time is left. */}
      <View
        testID="timer-bar-track"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.track,
          {
            backgroundColor: colors.border,
            height: trackHeight,
            borderRadius: trackHeight / 2,
          },
        ]}
      >
        <View
          testID="timer-bar-fill"
          style={[
            styles.fill,
            {
              width: `${fraction * 100}%`,
              backgroundColor: colors.timer,
              borderRadius: trackHeight / 2,
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.seconds,
          size === 'wide' ? styles.secondsWide : styles.secondsDefault,
          { color: colors.textSecondary },
        ]}
      >
        {seconds === 1 ? '1 second left' : `${seconds} seconds left`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  seconds: {
    fontWeight: '500',
  },
  secondsDefault: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
  },
  secondsWide: {
    fontSize: 18,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
});
