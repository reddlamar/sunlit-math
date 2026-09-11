import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { fontFamily, operationColors } from '../theme/tokens';
import { cardShadow } from '../theme/shadow';
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
  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = () => {
    triggerShake();
    onPress(operation);
  };

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] });

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={locked ? `${label} (locked, unlock to play)` : label}
      wrapperStyle={styles.wrapper}
      style={[
        styles.button,
        { backgroundColor: operationColors[operation] },
        locked && styles.buttonLocked,
      ]}
      onPress={handlePress}
    >
      <Animated.View style={[styles.content, { transform: [{ translateX }] }]}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.label}>{label}</Text>
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
  wrapper: {
    flexBasis: '42%',
    maxWidth: 220,
    aspectRatio: 1,
  },
  button: {
    flex: 1,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow({ elevation: 6, opacity: 0.18, radius: 8 }),
  },
  content: {
    alignItems: 'center',
  },
  symbol: {
    fontSize: 52,
    fontWeight: '800',
    fontFamily: fontFamily.extraBold,
    color: '#FFFFFF',
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  buttonLocked: {
    opacity: 0.55,
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  lockIcon: {
    fontSize: 18,
  },
});
