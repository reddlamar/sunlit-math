import React from 'react';
import { Animated, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon } from './icons/Icon';
import { useShake } from './useShake';
import { fontFamily, operationColors, radius, staticColors } from '../theme/tokens';
import { cardShadow } from '../theme/shadow';
import type { Operation } from '../types/game';

const LOCK_SIZE = 28;

type OperationButtonProps = {
  operation: Operation;
  symbol: string;
  label: string;
  locked?: boolean;
  onPress: (operation: Operation) => void;
  /** Sizes the tile: it fills whatever box this gives it. */
  wrapperStyle?: StyleProp<ViewStyle>;
};

export function OperationButton({
  operation,
  symbol,
  label,
  locked = false,
  onPress,
  wrapperStyle,
}: OperationButtonProps) {
  const { shake, shakeStyle } = useShake();

  const handlePress = () => {
    shake();
    onPress(operation);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={locked ? `${label} (locked, unlock to play)` : label}
      wrapperStyle={wrapperStyle}
      style={[styles.button, { backgroundColor: operationColors[operation] }]}
      onPress={handlePress}
    >
      <Animated.View style={[styles.content, shakeStyle]}>
        {/* Locked tiles keep their full color: fading the fill would drop the white text
            below readable contrast, so the lock and the word "Locked" carry the state. */}
        {locked && <Icon name="lock" size={LOCK_SIZE} color={staticColors.onColor} />}
        <Text style={styles.symbol}>{symbol}</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.label, styles.fullWidth]}>
          {label}
        </Text>
        {locked && <Text style={styles.label}>Locked</Text>}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    ...cardShadow({ elevation: 6, opacity: 0.18, radius: 8 }),
  },
  content: {
    alignItems: 'center',
    gap: 4,
  },
  symbol: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: staticColors.onColor,
  },
  // A defined width lets the label measure itself, so a long word shrinks to fit the tile.
  fullWidth: {
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: staticColors.onColor,
  },
});
