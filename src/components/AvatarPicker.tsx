import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Avatar } from './avatars/Avatar';
import { AVATARS } from '../game/avatars';
import { useSettings } from '../settings/SettingsContext';
import { touchTarget } from '../theme/tokens';
import type { AvatarId } from '../types/game';

const RING = 4;
const GAP = 12;

type AvatarPickerProps = {
  selected: AvatarId | null;
  onSelect: (id: AvatarId) => void;
  /** Side length of each animal in dp; never under the 48 dp tap target. */
  size?: number;
};

/** The animals a child chooses from, in place of typing a name. */
export function AvatarPicker({ selected, onSelect, size = touchTarget.min }: AvatarPickerProps) {
  const { colors } = useSettings();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Pick your player" style={styles.row}>
      {AVATARS.map(({ id, name }) => {
        const isSelected = id === selected;
        return (
          <AnimatedPressable
            key={id}
            testID={`avatar-option-${id}`}
            accessibilityRole="radio"
            accessibilityLabel={name}
            accessibilityState={{ selected: isSelected }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            onPress={() => onSelect(id)}
          >
            <Avatar id={id} size={size} />
            {isSelected && (
              <View
                testID={`avatar-ring-${id}`}
                pointerEvents="none"
                style={[styles.ring, { borderColor: colors.textPrimary }]}
              />
            )}
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: GAP,
  },
  // Drawn outside the animal, in the gap between choices, so the row is as wide with a
  // ring as without one.
  ring: {
    position: 'absolute',
    top: -RING,
    left: -RING,
    right: -RING,
    bottom: -RING,
    borderWidth: RING,
    borderRadius: 999,
  },
});
