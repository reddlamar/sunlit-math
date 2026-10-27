import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerAvatar } from './avatars/PlayerAvatar';
import { DIFFICULTY_LABELS } from '../game/difficulties';
import { operationInfo } from '../game/operations';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, operationColors, radius } from '../theme/tokens';
import { formatPoints } from '../utils/format';
import type { ScoreEntry } from '../types/game';

const AVATAR_SIZE = 44;

type ScoreRowProps = {
  /** Place on the board, starting at 1. */
  rank: number;
  entry: ScoreEntry;
};

/** One score on the leaderboard, outlined in the color of the operation it was earned on. */
export function ScoreRow({ rank, entry }: ScoreRowProps) {
  const { colors } = useSettings();
  const { symbol, label } = operationInfo(entry.operation);
  const level = entry.difficulty ? DIFFICULTY_LABELS[entry.difficulty] : null;

  return (
    <View
      testID="score-row"
      accessible
      accessibilityLabel={`${rank}. ${entry.name}, ${formatPoints(entry.score)}, ${label}${
        level ? `, ${level}` : ''
      }`}
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: operationColors[entry.operation] },
      ]}
    >
      <Text style={[styles.rank, { color: colors.textSecondary }]}>{rank}</Text>
      <PlayerAvatar entry={entry} size={AVATAR_SIZE} />
      <View style={styles.nameBlock}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
          {entry.name}
        </Text>
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          {symbol}
          {level ? ` · ${level}` : ''}
        </Text>
      </View>
      <Text style={[styles.score, { color: operationColors[entry.operation] }]}>{entry.score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderRadius: radius.xl,
  },
  rank: {
    minWidth: 24,
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  detail: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: fontFamily.semiBold,
  },
  score: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
  },
});
