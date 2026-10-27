import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { cardShadow } from '../theme/shadow';
import { fontFamily, staticColors, choiceColors, radius } from '../theme/tokens';
import { frameSize, useLayout, type FrameSize } from '../layout/layout';

const HEIGHT: Record<FrameSize, number> = { compact: 110, medium: 190, wide: 150 };
const FONT_SIZE: Record<FrameSize, number> = { compact: 32, medium: 44, wide: 44 };
/** A phone turned sideways has little height, so the board stays compact there. */
const SHORT_HEIGHT = 72;

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
  const layout = useLayout();
  const size = frameSize(layout);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Answer ${value}`}
      disabled={disabled}
      onPress={() => onPress(value)}
      wrapperStyle={styles.wrapper}
      style={[
        styles.button,
        { backgroundColor: color, height: layout.isShort ? SHORT_HEIGHT : HEIGHT[size] },
        disabled && styles.disabled,
      ]}
    >
      <Text testID="answer-choice" style={[styles.label, { fontSize: FONT_SIZE[size] }]}>
        {value}
      </Text>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
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
