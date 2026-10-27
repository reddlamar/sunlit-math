import React, { memo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { AnswerButton } from './AnswerButton';
import { choiceColors } from '../theme/tokens';
import { scaled, useLayout } from '../layout/layout';

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
  const { scale } = useLayout();
  return (
    <Animated.View
      testID="answer-grid"
      style={[styles.choices, { maxWidth: scaled(440, scale) }, shakeStyle]}
    >
      {choices.map((choice, index) => (
        <AnswerButton
          key={choice}
          value={choice}
          color={choiceColors[index % choiceColors.length]}
          onPress={onAnswer}
          disabled={disabled}
        />
      ))}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  choices: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
