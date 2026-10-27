import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useShake } from './useShake';
import { fontFamily, operationColors, radius, staticColors } from '../theme/tokens';
import { cardShadow } from '../theme/shadow';
import { operationTileSize, scaled, useLayout } from '../layout/layout';
import type { Operation } from '../types/game';

type OperationButtonProps = {
  operation: Operation;
  symbol: string;
  label: string;
  locked?: boolean;
  onPress: (operation: Operation) => void;
};

export function OperationButton({
  operation,
  symbol,
  label,
  locked = false,
  onPress,
}: OperationButtonProps) {
  const { shake, shakeStyle } = useShake();
  const layout = useLayout();
  const size = operationTileSize(layout);

  const handlePress = () => {
    shake();
    onPress(operation);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={locked ? `${label} (locked, unlock to play)` : label}
      style={[
        styles.button,
        {
          backgroundColor: operationColors[operation],
          width: size,
          height: size,
        },
      ]}
      onPress={handlePress}
    >
      <Animated.View style={[styles.content, shakeStyle]}>
        <Text style={[styles.symbol, { fontSize: scaled(52, layout.scale) }]}>{symbol}</Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.label, { fontSize: scaled(19, layout.scale) }]}
        >
          {label}
        </Text>
      </Animated.View>
      {locked && (
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow({ elevation: 6, opacity: 0.18, radius: 8 }),
  },
  content: {
    alignItems: 'center',
  },
  symbol: {
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: staticColors.onColor,
  },
  label: {
    marginTop: 8,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: staticColors.onColor,
  },
  // Locked buttons keep their full color: fading the fill would drop the white label
  // below readable contrast. The lock badge carries the locked state instead.
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow({ elevation: 2, opacity: 0.2, radius: 3, offsetHeight: 1 }),
  },
  lockIcon: {
    fontSize: 16,
  },
});
