import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, radius } from '../theme/tokens';

type SettingCardProps = {
  title: string;
  children: ReactNode;
};

/** One setting in the grown-up area: its name over its controls, on a card. */
export function SettingCard({ title, children }: SettingCardProps) {
  const { colors } = useSettings();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: radius.xl,
  },
  title: {
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
});
