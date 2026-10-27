import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSettings } from '../settings/SettingsContext';
import { MAX_STARS } from '../game/stars';

const STAR_GRID = 56;
const STAR_COLOR = '#F9C535';
const STAR =
  'M28 0L34.2864 19.3475H54.6296L38.1716 31.305L44.458 50.6525L28 38.695L11.542 50.6525L17.8284 31.305L1.37042 19.3475H21.7136L28 0Z';

type StarsProps = {
  /** How many of the three are earned. */
  count: number;
  /** Side length of one star in dp. */
  size: number;
};

/** Three stars, the earned ones gold and the rest outlined. */
export function Stars({ count, size }: StarsProps) {
  const { colors } = useSettings();

  return (
    <View
      testID="stars"
      accessible
      accessibilityLabel={`${count} of ${MAX_STARS} stars`}
      style={[styles.row, { gap: size / 7 }]}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => (
        <Svg
          key={index}
          testID={index < count ? 'star-earned' : 'star-empty'}
          width={size}
          height={size}
          viewBox={`0 0 ${STAR_GRID} ${STAR_GRID}`}
        >
          {index < count ? (
            <Path d={STAR} fill={STAR_COLOR} />
          ) : (
            <Path
              d={STAR}
              fill="none"
              stroke={colors.border}
              strokeWidth={5}
              strokeLinejoin="round"
            />
          )}
        </Svg>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
