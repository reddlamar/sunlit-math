import React from 'react';
import Svg, { Path } from 'react-native-svg';

/** Faces Sunny can wear; the sun and its rays are the same in every one. */
export type SunnyExpression = 'happy';

type SunnyProps = {
  /** Side length in dp; the artwork scales from its 120 dp master. */
  size: number;
  expression?: SunnyExpression;
};

const MASTER_SIZE = 120;
const BODY_COLOR = '#F9C535';
const FEATURE_COLOR = '#4A2E1F';
const CHEEK_COLOR = '#FF548E';

// Each ray is one of the app's palette colors, so the sun reads as part of the game.
const RAYS = [
  { d: 'M60 13V3', color: '#FFB870' },
  { d: 'M83.5 19.3L88.5 10.64', color: '#36A75F' },
  { d: 'M100.7 36.5L109.36 31.5', color: '#FF548E' },
  { d: 'M107 60H117', color: '#4D8DFF' },
  { d: 'M100.7 83.5L109.36 88.5', color: '#FFB870' },
  { d: 'M83.5 100.7L88.5 109.36', color: '#36A75F' },
  { d: 'M60 107V117', color: '#FF548E' },
  { d: 'M36.5 100.7L31.5 109.36', color: '#4D8DFF' },
  { d: 'M19.3 83.5L10.64 88.5', color: '#FFB870' },
  { d: 'M13 60H3', color: '#36A75F' },
  { d: 'M19.3 36.5L10.64 31.5', color: '#FF548E' },
  { d: 'M36.5 19.3L31.5 10.64', color: '#4D8DFF' },
];

const SUN_BODY =
  'M60 97C80.4345 97 97 80.4345 97 60C97 39.5655 80.4345 23 60 23C39.5655 23 23 39.5655 23 60C23 80.4345 39.5655 97 60 97Z';
const SHINE =
  'M36 50C37.526 45.647 40.1826 41.7783 43.6972 38.7908C47.2118 35.8034 51.458 33.8048 56 33';
const LEFT_CHEEK =
  'M42 74C45.3137 74 48 71.3137 48 68C48 64.6863 45.3137 62 42 62C38.6863 62 36 64.6863 36 68C36 71.3137 38.6863 74 42 74Z';
const RIGHT_CHEEK =
  'M78 74C81.3137 74 84 71.3137 84 68C84 64.6863 81.3137 62 78 62C74.6863 62 72 64.6863 72 68C72 71.3137 74.6863 74 78 74Z';

const FACES: Record<SunnyExpression, string[]> = {
  // Closed, smiling eyes and a wide smile.
  happy: [
    'M42 56C46 50.6667 50 50.6667 54 56',
    'M66 56C70 50.6667 74 50.6667 78 56',
    'M45 68C55 77.3333 65 77.3333 75 68',
  ],
};

/**
 * The sun mascot. It is decoration, so it is hidden from screen readers; whatever it sits
 * next to ("Hi there!") carries the meaning.
 */
export function Sunny({ size, expression = 'happy' }: SunnyProps) {
  return (
    <Svg
      testID="sunny"
      width={size}
      height={size}
      viewBox={`0 0 ${MASTER_SIZE} ${MASTER_SIZE}`}
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {RAYS.map(({ d, color }) => (
        <Path key={d} d={d} stroke={color} strokeWidth={5.5} strokeLinecap="round" />
      ))}
      <Path d={SUN_BODY} fill={BODY_COLOR} />
      <Path d={SHINE} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
      <Path d={LEFT_CHEEK} fill={CHEEK_COLOR} opacity={0.6} />
      <Path d={RIGHT_CHEEK} fill={CHEEK_COLOR} opacity={0.6} />
      {FACES[expression].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={FEATURE_COLOR}
          strokeWidth={3.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
