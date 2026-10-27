import { Dimensions } from 'react-native';

/** Window sizes the layout tests use, in dp. */
export const PHONE = { width: 390, height: 844 };
export const PHONE_LANDSCAPE = { width: 844, height: 390 };
export const IPAD_PORTRAIT = { width: 820, height: 1180 };
export const IPAD_LANDSCAPE = { width: 1180, height: 820 };

/** Sets the window a screen reads through useWindowDimensions. Call before rendering. */
export function setWindow({ width, height }: { width: number; height: number }) {
  Dimensions.set({
    window: { width, height, scale: 2, fontScale: 1 },
    screen: { width, height, scale: 2, fontScale: 1 },
  });
}
