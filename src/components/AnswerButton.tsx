import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { cardShadow } from '../theme/shadow';
import { fontFamily, staticColors, choiceColors, radius } from '../theme/tokens';
import { scaled, useLayout } from '../layout/layout';

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
  const { scale, isShort } = useLayout();
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Answer ${value}`}
      disabled={disabled}
      onPress={() => onPress(value)}
      wrapperStyle={styles.wrapper}
      style={[
        styles.button,
        // A phone turned sideways has little height, so the board stays compact there.
        { backgroundColor: color, minHeight: isShort ? 72 : scaled(96, scale) },
        disabled && styles.disabled,
      ]}
    >
      <Text testID="answer-choice" style={[styles.label, { fontSize: scaled(32, scale) }]}>
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
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    ...cardShadow({ elevation: 4, opacity: 0.16, radius: 6 }),
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: staticColors.onColor,
  },
});
