import React, { memo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AnswerButton } from './AnswerButton';
import { choiceColors } from '../theme/tokens';
import { frameSize, useLayout } from '../layout/layout';

const GAP = { compact: 16, medium: 20, wide: 20 } as const;
const ROW_LENGTH = 2;

type AnswerGridProps = {
  choices: number[];
  disabled: boolean;
  onAnswer: (value: number) => void;
  shakeStyle: object;
};

// Memoized so the 10-per-second timer re-renders of the game screen don't rebuild the
// answer buttons; it only re-renders when the problem, disabled state, or shake changes.
export const AnswerGrid = memo(function AnswerGrid({
  choices,
  disabled,
  onAnswer,
  shakeStyle,
}: AnswerGridProps) {
  const gap = GAP[frameSize(useLayout())];
  // Two per row, always: four choices never wrap 3+1 on a narrow phone.
  const rows = [choices.slice(0, ROW_LENGTH), choices.slice(ROW_LENGTH)];

  return (
    <Animated.View testID="answer-grid" style={[styles.grid, { gap }, shakeStyle]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap }]}>
          {row.map((choice, index) => (
            <AnswerButton
              key={choice}
              value={choice}
              color={choiceColors[(rowIndex * ROW_LENGTH + index) % choiceColors.length]}
              onPress={onAnswer}
              disabled={disabled}
            />
          ))}
        </View>
      ))}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
});
