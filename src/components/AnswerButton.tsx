import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon } from './icons/Icon';
import { useSettings } from '../settings/SettingsContext';
import { cardShadow } from '../theme/shadow';
import { fontFamily, staticColors, choiceColors, radius } from '../theme/tokens';
import { frameSize, useLayout, type FrameSize } from '../layout/layout';

const HEIGHT: Record<FrameSize, number> = { compact: 110, medium: 190, wide: 150 };
const FONT_SIZE: Record<FrameSize, number> = { compact: 32, medium: 44, wide: 44 };
/** A phone turned sideways has little height, so the board stays compact there. */
const SHORT_HEIGHT = 72;
const MARK_BORDER = 4;
const DIMMED_OPACITY = 0.45;

/**
 * How an answer looks once the round has judged it: the right one and the one tapped wrong
 * carry a mark as well as a color, and the rest step back.
 */
export type AnswerState = 'default' | 'correct' | 'wrong' | 'dimmed';

type AnswerButtonProps = {
  value: number;
  onPress: (value: number) => void;
  disabled?: boolean;
  color?: string;
  state?: AnswerState;
};

const STATE_LABEL: Record<AnswerState, string> = {
  default: '',
  dimmed: '',
  correct: ', correct',
  wrong: ', not correct',
};

export const AnswerButton = memo(function AnswerButton({
  value,
  onPress,
  disabled,
  color = choiceColors[0],
  state = 'default',
}: AnswerButtonProps) {
  const { colors } = useSettings();
  const layout = useLayout();
  const size = frameSize(layout);
  const isMarked = state === 'correct' || state === 'wrong';
  const fontSize = FONT_SIZE[size];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Answer ${value}${STATE_LABEL[state]}`}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={() => onPress(value)}
      wrapperStyle={styles.wrapper}
      style={[
        styles.button,
        { backgroundColor: color, height: layout.isShort ? SHORT_HEIGHT : HEIGHT[size] },
        isMarked && {
          backgroundColor: state === 'correct' ? colors.success : colors.error,
          borderWidth: MARK_BORDER,
          borderColor: colors.textPrimary,
        },
        // A marked answer must never fade, even though the whole board is disabled.
        (state === 'dimmed' || (disabled && !isMarked)) && styles.dimmed,
      ]}
    >
      <View style={styles.content}>
        {isMarked && (
          <Icon
            name={state === 'correct' ? 'check' : 'cross'}
            size={fontSize}
            color={colors.onStatus}
          />
        )}
        <Text
          testID="answer-choice"
          style={[styles.label, { fontSize }, isMarked && { color: colors.onStatus }]}
        >
          {value}
        </Text>
      </View>
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
  dimmed: {
    opacity: DIMMED_OPACITY,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: staticColors.onColor,
  },
});
