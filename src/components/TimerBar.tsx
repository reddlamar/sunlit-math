import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamily, light } from '../theme/tokens';

type TimerBarProps = {
  timeLeft: number;
  duration: number;
};

export function TimerBar({ timeLeft, duration }: TimerBarProps) {
  const fraction = duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;
  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View
          testID="timer-bar-fill"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
          style={[styles.fill, { width: `${fraction * 100}%` }]}
        />
      </View>
      <Text style={styles.seconds}>{seconds}</Text>
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
    backgroundColor: light.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#22B8CF',
  },
  seconds: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: '#22B8CF',
  },
});
