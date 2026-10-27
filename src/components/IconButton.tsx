import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon } from './icons/Icon';
import type { IconName } from './icons/iconPaths';
import { useSettings } from '../settings/SettingsContext';
import { cardShadow } from '../theme/shadow';
import { touchTarget } from '../theme/tokens';

const ICON_SIZE = 24;

type IconButtonProps = {
  icon: IconName;
  /** What a screen reader says: the icon alone says nothing. */
  label: string;
  onPress: () => void;
  testID?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
};

/** A round button with one icon, at the 56 dp the design sets for controls in play. */
export function IconButton({ icon, label, onPress, testID, wrapperStyle }: IconButtonProps) {
  const { colors } = useSettings();

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      wrapperStyle={wrapperStyle}
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Icon name={icon} size={ICON_SIZE} color={colors.textPrimary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget.play,
    height: touchTarget.play,
    borderRadius: touchTarget.play / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow({ elevation: 2, opacity: 0.1, radius: 4, offsetHeight: 2 }),
  },
});
