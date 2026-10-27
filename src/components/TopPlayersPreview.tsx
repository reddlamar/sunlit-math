import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerAvatar } from './avatars/PlayerAvatar';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, operationColors, radius } from '../theme/tokens';
import type { ScoreEntry } from '../types/game';

const AVATAR_SIZE = 44;

type TopPlayersPreviewProps = {
  scores: ScoreEntry[];
};

/** The best few scores, shown beside the tiles on wide windows. Nothing if there are none. */
export function TopPlayersPreview({ scores }: TopPlayersPreviewProps) {
  const { colors } = useSettings();

  if (scores.length === 0) {
    return null;
  }

  return (
    <View testID="top-players" style={styles.container}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
        Top players
      </Text>
      {scores.map((entry, index) => (
        <View
          key={entry.id}
          style={[
            styles.row,
            { backgroundColor: colors.surface, borderColor: operationColors[entry.operation] },
          ]}
        >
          <Text style={[styles.rank, { color: colors.textSecondary }]}>{index + 1}</Text>
          <PlayerAvatar entry={entry} size={AVATAR_SIZE} />
          <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
            {entry.name}
          </Text>
          <Text style={[styles.score, { color: operationColors[entry.operation] }]}>
            {entry.score}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
  row: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderRadius: radius.xl,
  },
  rank: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  name: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
  score: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
