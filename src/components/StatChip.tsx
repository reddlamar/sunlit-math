import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';

type StatChipProps = {
  children: ReactNode;
  /** The warm fill the streak chip takes once the flame is lit. */
  warm?: boolean;
  testID?: string;
};

/** A pill that holds one number the player watches: the score or the streak. */
export function StatChip({ children, warm = false, testID }: StatChipProps) {
  const { colors } = useSettings();

  return (
    <View
      testID={testID}
      style={[styles.chip, { backgroundColor: warm ? colors.streakSoft : colors.surface }]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
});
