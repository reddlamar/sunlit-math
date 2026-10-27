import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, radius, staticColors, touchTarget } from '../theme/tokens';

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  testID?: string;
};

/** A row of big choices where exactly one is on: the chosen one filled, the rest outlined. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testID,
}: SegmentedControlProps<T>) {
  const { colors } = useSettings();
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
              { borderColor: selected ? colors.accent : colors.border },
              selected && { backgroundColor: colors.accent },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? staticColors.onColor : colors.textPrimary },
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
    gap: 8,
  },
  segmentWrapper: {
    flex: 1,
  },
  segment: {
    minHeight: touchTarget.play,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
});
