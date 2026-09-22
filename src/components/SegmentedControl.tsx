import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { fontFamily, light } from '../theme/tokens';

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  color?: string;
  testID?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  color = light.accent,
  testID,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.row} accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <AnimatedPressable
            key={option.value}
            testID={testID ? `${testID}-${option.value}` : undefined}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            wrapperStyle={styles.segmentWrapper}
            style={[
              styles.segment,
              { borderColor: color },
              selected && { backgroundColor: color },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, { color: selected ? '#FFFFFF' : color }]}>
              {option.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  segmentWrapper: {
    flex: 1,
    marginRight: 8,
  },
  segment: {
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
});
