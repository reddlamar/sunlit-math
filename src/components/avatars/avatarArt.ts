import type { AvatarId } from '../../types/game';

/** The grid every avatar is drawn on; it scales to any size. */
export const AVATAR_GRID = 48;
/** The cream the animals' faces are drawn in, and the dark their eyes and noses are. */
export const FACE_COLOR = '#FFF8EF';
export const FEATURE_COLOR = '#1F2933';

type Shape =
  | { kind: 'path'; d: string; fill?: string; stroke?: string; strokeWidth?: number }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill: string };

export type AvatarArt = {
  /** The disc the animal sits on; also the avatar's color in lists. */
  background: string;
  /** Drawn back to front over the disc. */
  shapes: Shape[];
};

const circle = (cx: number, cy: number, r: number, fill: string): Shape => ({
  kind: 'circle',
  cx,
  cy,
  r,
  fill,
});
const path = (d: string, fill = FACE_COLOR): Shape => ({ kind: 'path', d, fill });
const line = (d: string): Shape => ({
  kind: 'path',
  d,
  stroke: FEATURE_COLOR,
  strokeWidth: 1.6,
});
const HEAD = circle(24, 28, 14, FACE_COLOR);
const eyes = (y = 26, r = 2): Shape[] => [
  circle(18, y, r, FEATURE_COLOR),
  circle(30, y, r, FEATURE_COLOR),
];
const nose = (y = 31): Shape => circle(24, y, 2.2, FEATURE_COLOR);

export const AVATAR_ART: Record<AvatarId, AvatarArt> = {
  fox: {
    background: '#EB7200',
    shapes: [
      path('M10 22L12 6L23 15Z'),
      path('M38 22L36 6L25 15Z'),
      HEAD,
      path('M17 31C20 38 28 38 31 31C28 33 20 33 17 31Z', '#FFE3C2'),
      ...eyes(),
      nose(),
    ],
  },
  owl: {
    background: '#1EA3B7',
    shapes: [
      path('M11 21L11 8L21 14Z'),
      path('M37 21L37 8L27 14Z'),
      HEAD,
      circle(17.5, 26, 6, '#FFFFFF'),
      circle(30.5, 26, 6, '#FFFFFF'),
      circle(17.5, 26, 2.8, FEATURE_COLOR),
      circle(30.5, 26, 2.8, FEATURE_COLOR),
      path('M21.5 31L26.5 31L24 36Z', '#EB7200'),
    ],
  },
  bear: {
    background: '#A9744F',
    shapes: [
      circle(12, 14, 5.5, FACE_COLOR),
      circle(36, 14, 5.5, FACE_COLOR),
      HEAD,
      circle(24, 33, 6, '#F2DCC4'),
      ...eyes(),
      nose(31),
    ],
  },
  cat: {
    background: '#5B4FCF',
    shapes: [
      path('M10 24L11 7L22 15Z'),
      path('M38 24L37 7L26 15Z'),
      HEAD,
      ...eyes(),
      path('M22 31L26 31L24 33.4Z', '#FF548E'),
      line('M6 30L16 31'),
      line('M6 35L16 33'),
      line('M42 30L32 31'),
      line('M42 35L32 33'),
    ],
  },
  frog: {
    background: '#36A75F',
    shapes: [
      HEAD,
      circle(15, 17, 6, FACE_COLOR),
      circle(33, 17, 6, FACE_COLOR),
      circle(15, 17, 2.4, FEATURE_COLOR),
      circle(33, 17, 2.4, FEATURE_COLOR),
      {
        kind: 'path',
        d: 'M16 32C20 38 28 38 32 32',
        stroke: FEATURE_COLOR,
        strokeWidth: 2,
      },
      circle(20, 28, 1.2, FEATURE_COLOR),
      circle(28, 28, 1.2, FEATURE_COLOR),
    ],
  },
  bunny: {
    background: '#FF548E',
    shapes: [
      { kind: 'path', d: 'M13 18C11 6 14 3 17 3C20 3 21 10 20 18Z', fill: FACE_COLOR },
      { kind: 'path', d: 'M35 18C37 6 34 3 31 3C28 3 27 10 28 18Z', fill: FACE_COLOR },
      path('M15.5 16C14.6 8 15.8 6 17 6C18.2 6 18.6 9 18.4 16Z', '#FFC2D6'),
      path('M32.5 16C33.4 8 32.2 6 31 6C29.8 6 29.4 9 29.6 16Z', '#FFC2D6'),
      HEAD,
      ...eyes(27),
      circle(24, 31.5, 2, '#FF548E'),
      circle(15, 32, 2.6, '#FFC2D6'),
      circle(33, 32, 2.6, '#FFC2D6'),
    ],
  },
};
