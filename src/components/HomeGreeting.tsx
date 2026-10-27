import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sunny } from './Sunny';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily } from '../theme/tokens';
import { frameSize, useLayout, type FrameSize } from '../layout/layout';

type GreetingSizes = { sunny: number; title: number; subtitle: number };

const SIZES: Record<'short' | FrameSize, GreetingSizes> = {
  // A phone turned sideways has little height to spare.
  short: { sunny: 64, title: 26, subtitle: 16 },
  compact: { sunny: 96, title: 32, subtitle: 18 },
  medium: { sunny: 160, title: 44, subtitle: 20 },
  wide: { sunny: 180, title: 44, subtitle: 20 },
};

/** Sunny and the greeting: side by side, or stacked in the wide layout's left pane. */
export function HomeGreeting() {
  const { colors } = useSettings();
  const layout = useLayout();
  const size = frameSize(layout);
  const sizes = SIZES[layout.isShort ? 'short' : size];
  const isStacked = size === 'wide';

  return (
    <View testID="home-greeting" style={[styles.container, isStacked && styles.stacked]}>
      <Sunny size={sizes.sunny} />
      <View>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.textPrimary, fontSize: sizes.title }]}
        >
          Hi there!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: sizes.subtitle }]}>
          Pick a game
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontWeight: '800',
  },
  subtitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
});
