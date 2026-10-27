import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { AVATAR_ART, AVATAR_GRID } from './avatarArt';
import type { AvatarId } from '../../types/game';

type AvatarProps = {
  id: AvatarId;
  /** Side length in dp. */
  size: number;
};

/**
 * An animal on a colored disc. Decorative: the name beside or around it is what a screen
 * reader says.
 */
export function Avatar({ id, size }: AvatarProps) {
  const { background, shapes } = AVATAR_ART[id];

  return (
    <Svg
      testID={`avatar-${id}`}
      width={size}
      height={size}
      viewBox={`0 0 ${AVATAR_GRID} ${AVATAR_GRID}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle cx={AVATAR_GRID / 2} cy={AVATAR_GRID / 2} r={AVATAR_GRID / 2} fill={background} />
      {shapes.map((shape, index) =>
        shape.kind === 'circle' ? (
          <Circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} />
        ) : (
          <Path
            key={index}
            d={shape.d}
            fill={shape.fill ?? 'none'}
            stroke={shape.stroke ?? 'none'}
            strokeWidth={shape.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      )}
    </Svg>
  );
}
