import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';

type TimerBarProps = {
  timeLeft: number;
  duration: number;
};

export function TimerBar({ timeLeft, duration }: TimerBarProps) {
  const { colors } = useSettings();
  const fraction = duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;
  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          testID="timer-bar-fill"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
          style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: colors.timer }]}
        />
      </View>
      <Text style={[styles.seconds, { color: colors.timer }]}>{seconds}</Text>
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
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
  seconds: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
