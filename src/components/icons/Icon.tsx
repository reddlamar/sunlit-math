import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ICON_GRID, iconPaths, type IconName } from './iconPaths';

type IconProps = {
  name: IconName;
  /** Side length in dp; the artwork scales from its 24 dp grid. */
  size?: number;
  color: string;
};

/**
 * A decorative icon. It is hidden from screen readers, so the control around it must
 * carry the accessibility label.
 */
export function Icon({ name, size = ICON_GRID, color }: IconProps) {
  return (
    <Svg
      testID={`icon-${name}`}
      width={size}
      height={size}
      viewBox={`0 0 ${ICON_GRID} ${ICON_GRID}`}
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {iconPaths[name].map(({ d, filled, strokeWidth }) => (
        <Path
          key={d}
          d={d}
          fill={filled ? color : 'none'}
          stroke={strokeWidth > 0 ? color : 'none'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
