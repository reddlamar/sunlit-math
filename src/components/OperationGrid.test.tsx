import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { OperationGrid, tileMetrics } from './OperationGrid';

describe('tileMetrics', () => {
  it('uses square tiles with a 16 dp gap on a phone', () => {
    expect(tileMetrics('stacked', 'compact')).toEqual({ gap: 16, aspectRatio: 1 });
  });

  it('uses the 310 x 250 tiles and a 20 dp gap on a medium window', () => {
    const { gap, aspectRatio } = tileMetrics('stacked', 'medium');
    expect(gap).toBe(20);
    expect(aspectRatio).toBeCloseTo(310 / 250);
  });

  it('lets tiles fill their pane, with a 24 dp gap, in the two-pane layout', () => {
    expect(tileMetrics('twoPane', 'wide')).toEqual({ gap: 24, aspectRatio: undefined });
  });

  it('keeps tiles square in a single row, whatever the window class', () => {
    expect(tileMetrics('row', 'compact').aspectRatio).toBe(1);
    expect(tileMetrics('row', 'wide').aspectRatio).toBe(1);
  });
});

describe('OperationGrid', () => {
  const renderGrid = async (
    arrangement: 'stacked' | 'twoPane' | 'row',
    isLocked = (operation: string) => operation === 'division'
  ) => {
    const onSelect = jest.fn();
    const utils = await render(
      <OperationGrid
        arrangement={arrangement}
        size="compact"
        isLocked={isLocked}
        onSelect={onSelect}
      />
    );
    return { ...utils, onSelect };
  };

  it('lays the four operations out two by two when stacked', async () => {
    const { getByTestId } = await renderGrid('stacked');

    const rows = getByTestId('operation-grid').children;
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => (typeof row === 'string' ? 0 : row.children.length))).toEqual([2, 2]);
  });

  it('puts all four in one row when sideways', async () => {
    const { getByTestId } = await renderGrid('row');

    const [row] = getByTestId('operation-grid').children;
    expect(typeof row === 'string' ? 0 : row.children.length).toBe(4);
  });

  it('fills its pane in the two-pane layout', async () => {
    const { getByTestId } = await renderGrid('twoPane');

    expect(StyleSheet.flatten(getByTestId('operation-grid').props.style).flex).toBe(1);
  });

  it('keeps its natural height when stacked', async () => {
    const { getByTestId } = await renderGrid('stacked');

    expect(StyleSheet.flatten(getByTestId('operation-grid').props.style).flex).toBeUndefined();
  });

  it('marks only the locked operations and reports the one tapped', async () => {
    const { getByLabelText, queryByLabelText, onSelect } = await renderGrid('stacked');

    expect(getByLabelText('Division (locked, unlock to play)')).toBeTruthy();
    expect(queryByLabelText('Addition (locked, unlock to play)')).toBeNull();

    await fireEvent.press(getByLabelText('Subtraction'));
    expect(onSelect).toHaveBeenCalledWith('subtraction');
  });
});
