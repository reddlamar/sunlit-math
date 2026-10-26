import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { cardShadow } from '../theme/shadow';
import { fontFamily, staticColors, choiceColors } from '../theme/tokens';

type AnswerButtonProps = {
  value: number;
  onPress: (value: number) => void;
  disabled?: boolean;
  color?: string;
};

export const AnswerButton = memo(function AnswerButton({
  value,
  onPress,
  disabled,
  color = choiceColors[0],
}: AnswerButtonProps) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Answer ${value}`}
      disabled={disabled}
      onPress={() => onPress(value)}
      wrapperStyle={styles.wrapper}
      style={[styles.button, { backgroundColor: color }, disabled && styles.disabled]}
    >
      <Text testID="answer-choice" style={styles.label}>
        {value}
      </Text>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  // Two per row, always: the grid is a fixed 2x2 so four choices never wrap 3+1
  // on narrower phones.
  wrapper: {
    width: '50%',
    padding: 8,
  },
  button: {
    minHeight: 96,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    ...cardShadow({ elevation: 4, opacity: 0.16, radius: 6 }),
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: staticColors.onColor,
  },
});
