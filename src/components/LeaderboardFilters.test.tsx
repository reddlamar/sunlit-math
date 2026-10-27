import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LeaderboardFilters } from './LeaderboardFilters';
import { SettingsProvider } from '../settings/SettingsContext';
import { light, operationColors } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

const renderFilters = async (
  props: Partial<React.ComponentProps<typeof LeaderboardFilters>> = {}
) => {
  const onOperationChange = jest.fn();
  const onDifficultyChange = jest.fn();
  const screen = await render(
    <SettingsProvider>
      <LeaderboardFilters
        operation={undefined}
        difficulty={undefined}
        onOperationChange={onOperationChange}
        onDifficultyChange={onDifficultyChange}
        {...props}
      />
    </SettingsProvider>
  );
  return { onOperationChange, onDifficultyChange, ...screen };
};

describe('LeaderboardFilters', () => {
  it('offers All and each operation as a game filter, all filled in their own color', async () => {
    const { getByTestId } = await renderFilters();

    expect(
      hasStyleValue(getByTestId('filter-game-all').props.style, 'backgroundColor', light.accent)
    ).toBe(true);
    for (const operation of ['addition', 'subtraction', 'multiplication', 'division'] as const) {
      expect(
        hasStyleValue(
          getByTestId(`filter-game-${operation}`).props.style,
          'backgroundColor',
          operationColors[operation]
        )
      ).toBe(true);
    }
  });

  it('rings only the selected game, outside the pill, and marks it selected', async () => {
    const { getByTestId } = await renderFilters({ operation: 'subtraction' });

    expect(getByTestId('filter-game-subtraction').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByTestId('filter-game-all').props.accessibilityState).toEqual({ selected: false });
    // The ring is the pill's only child besides its label.
    expect(getByTestId('filter-game-subtraction').children).toHaveLength(2);
    expect(getByTestId('filter-game-all').children).toHaveLength(1);
  });

  it('selects All when no filter is set, for games and for levels', async () => {
    const { getByTestId } = await renderFilters();

    expect(getByTestId('filter-game-all').props.accessibilityState).toEqual({ selected: true });
    expect(getByTestId('filter-level-all').props.accessibilityState).toEqual({ selected: true });
  });

  it('fills the selected level and outlines the others', async () => {
    const { getByTestId } = await renderFilters({ difficulty: 'hard' });

    expect(
      hasStyleValue(
        getByTestId('filter-level-hard').props.style,
        'backgroundColor',
        light.textPrimary
      )
    ).toBe(true);
    expect(
      hasStyleValue(getByTestId('filter-level-easy').props.style, 'borderColor', light.border)
    ).toBe(true);
  });

  it('reports the game and the level tapped', async () => {
    const { getByTestId, onOperationChange, onDifficultyChange } = await renderFilters();

    await fireEvent.press(getByTestId('filter-game-multiplication'));
    await fireEvent.press(getByTestId('filter-level-medium'));

    expect(onOperationChange).toHaveBeenCalledWith('multiplication');
    expect(onDifficultyChange).toHaveBeenCalledWith('medium');
  });

  it('reports undefined when All is tapped, clearing the filter', async () => {
    const { getByTestId, onOperationChange, onDifficultyChange } = await renderFilters({
      operation: 'division',
      difficulty: 'easy',
    });

    await fireEvent.press(getByTestId('filter-game-all'));
    await fireEvent.press(getByTestId('filter-level-all'));

    expect(onOperationChange).toHaveBeenCalledWith(undefined);
    expect(onDifficultyChange).toHaveBeenCalledWith(undefined);
  });

  it('keeps every filter at 48 dp or more to tap', async () => {
    const { getByTestId } = await renderFilters();

    expect(getByTestId('filter-game-division')).toHaveStyle({ width: 56, height: 56 });
    expect(getByTestId('filter-level-easy')).toHaveStyle({ minHeight: 48 });
  });

  it('labels the game filters for a screen reader, since a symbol alone says little', async () => {
    const { getByLabelText } = await renderFilters();

    expect(getByLabelText('Show all games')).toBeTruthy();
    expect(getByLabelText('Show ×')).toBeTruthy();
    expect(getByLabelText('Show All levels')).toBeTruthy();
  });

  it('adds Game and Level headings only in the side column', async () => {
    const stacked = await renderFilters();
    expect(stacked.queryByText('Game')).toBeNull();
    expect(stacked.queryByText('Level')).toBeNull();
  });

  it('shows the headings and stacks the levels in the side column', async () => {
    const { getByText, getByTestId } = await renderFilters({ isColumn: true });

    expect(getByText('Game')).toBeTruthy();
    expect(getByText('Level')).toBeTruthy();
    expect(getByTestId('filter-level-easy')).toBeTruthy();
  });
});
