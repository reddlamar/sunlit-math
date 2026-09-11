import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { playTapSound } from '../audio/sounds';

type AnimatedPressableProps = PressableProps & {
  scaleTo?: number;
  wrapperStyle?: StyleProp<ViewStyle>;
};

export function AnimatedPressable({
  scaleTo = 0.94,
  wrapperStyle,
  style,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[wrapperStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...rest}
        style={style}
        onPressIn={(event) => {
          animateTo(scaleTo);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          playTapSound();
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          animateTo(1);
          onPressOut?.(event);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
