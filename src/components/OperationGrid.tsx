import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OperationButton } from './OperationButton';
import { OPERATIONS } from '../game/operations';
import type { HomeArrangement, FrameSize } from '../layout/layout';
import type { Operation } from '../types/game';

/** Medium tiles are 310 x 250 in the design; compact and sideways tiles are square. */
const MEDIUM_TILE_ASPECT = 310 / 250;

/** The space between tiles and the tile shape for each way Home can be arranged. */
export function tileMetrics(arrangement: HomeArrangement, size: FrameSize) {
  if (arrangement === 'twoPane') {
    // The tiles fill the whole pane, so they take whatever shape it leaves.
    return { gap: 24, aspectRatio: undefined };
  }
  if (arrangement === 'stacked' && size === 'medium') {
    return { gap: 20, aspectRatio: MEDIUM_TILE_ASPECT };
  }
  return { gap: 16, aspectRatio: 1 };
}

type OperationGridProps = {
  arrangement: HomeArrangement;
  size: FrameSize;
  isLocked: (operation: Operation) => boolean;
  onSelect: (operation: Operation) => void;
};

/** The four operation tiles: 2 x 2, or one row of four on a phone turned sideways. */
export function OperationGrid({
  arrangement,
  size,
  isLocked,
  onSelect,
}: OperationGridProps) {
  const { gap, aspectRatio } = tileMetrics(arrangement, size);
  const fillsPane = arrangement === 'twoPane';
  const rows = arrangement === 'row' ? [OPERATIONS] : [OPERATIONS.slice(0, 2), OPERATIONS.slice(2)];

  return (
    <View testID="operation-grid" style={[{ gap }, fillsPane && styles.fill]}>
      {rows.map((row) => (
        <View key={row[0].operation} style={[styles.row, { gap }, fillsPane && styles.fill]}>
          {row.map(({ operation, symbol, label }) => (
            <OperationButton
              key={operation}
              operation={operation}
              symbol={symbol}
              label={label}
              locked={isLocked(operation)}
              onPress={onSelect}
              wrapperStyle={[styles.tile, { aspectRatio }]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
  },
});
