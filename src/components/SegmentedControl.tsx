import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { fontFamily, light, staticColors } from '../theme/tokens';
import { scaled, useLayout } from '../layout/layout';

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
  const { scale } = useLayout();
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
              { borderColor: color, paddingVertical: scaled(10, scale) },
              selected && { backgroundColor: color },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? staticColors.onColor : color, fontSize: scaled(14, scale) },
              ]}
            >
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
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  label: {
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
});
