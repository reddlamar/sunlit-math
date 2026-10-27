import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { useSettings } from '../../settings/SettingsContext';
import { fontFamily } from '../../theme/tokens';
import type { ScoreEntry } from '../../types/game';

type PlayerAvatarProps = {
  entry: Pick<ScoreEntry, 'name' | 'avatar'>;
  size: number;
};

/**
 * The picture beside a score: the player's animal, or for a score saved before avatars
 * existed, a plain disc with the first letter of the name they typed.
 */
export function PlayerAvatar({ entry, size }: PlayerAvatarProps) {
  const { colors } = useSettings();

  if (entry.avatar) {
    return <Avatar id={entry.avatar} size={size} />;
  }

  return (
    <View
      testID="avatar-initial"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.disc,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.border },
      ]}
    >
      <Text style={[styles.initial, { color: colors.textSecondary, fontSize: size * 0.45 }]}>
        {entry.name.trim().charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
