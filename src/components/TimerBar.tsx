import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import { scaled, useLayout } from '../layout/layout';

type TimerBarProps = {
  timeLeft: number;
  duration: number;
};

export function TimerBar({ timeLeft, duration }: TimerBarProps) {
  const { colors } = useSettings();
  const { scale } = useLayout();
  const trackHeight = scaled(16, scale);
  const fraction = duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;
  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <View style={styles.container}>
      <View
        testID="timer-bar-track"
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
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(fraction * 100),
          }}
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
      <Text style={[styles.seconds, { color: colors.timer, fontSize: scaled(22, scale) }]}>
        {seconds}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  seconds: {
    marginTop: 6,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
