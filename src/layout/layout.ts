import { useContext } from 'react';
import { useWindowDimensions } from 'react-native';
import { SafeAreaInsetsContext, type EdgeInsets } from 'react-native-safe-area-context';

/**
 * Window size classes, using Android's breakpoints so one rule serves phones, iPads and
 * Android tablets: compact under 600 dp, medium 600 to 839, expanded 840 and up.
 */
export type LayoutClass = 'compact' | 'medium' | 'expanded';

export const MEDIUM_MIN_WIDTH = 600;
export const EXPANDED_MIN_WIDTH = 840;
/** A phone turned sideways is wide but under this tall; it must not be scaled up. */
export const SHORT_MAX_HEIGHT = 480;
/** Text and form screens stop growing at this width and center instead. */
export const READABLE_MAX_WIDTH = 640;
/** How much sizes grow on a tablet-sized window. */
const TABLET_SCALE = 1.4;

const TILE_BASE_SIZE = 220;
const SCREEN_PADDING = 24;
const TILE_GAP = 20;
/** Vertical space the Home header, paddings and tab bar take in landscape. */
const HOME_CHROME_HEIGHT = 190;
/** A tile never shrinks below this to fit the height; Home scrolls instead. */
const MIN_TILE_SIZE = 140;

export type Layout = {
  layoutClass: LayoutClass;
  width: number;
  height: number;
  isLandscape: boolean;
  isShort: boolean;
  /** Multiplier for sizes designed at phone scale (type, buttons, boards). */
  scale: number;
  /** Width of the readable column: the full width on a phone, capped on bigger windows. */
  contentWidth: number;
  /** Window size minus the notch, home indicator and rounded corners. */
  safeWidth: number;
  safeHeight: number;
};

const NO_INSETS: EdgeInsets = { top: 0, bottom: 0, left: 0, right: 0 };

export function layoutClassForWidth(width: number): LayoutClass {
  if (width >= EXPANDED_MIN_WIDTH) {
    return 'expanded';
  }
  return width >= MEDIUM_MIN_WIDTH ? 'medium' : 'compact';
}

export function describeLayout(
  width: number,
  height: number,
  insets: EdgeInsets = NO_INSETS
): Layout {
  const layoutClass = layoutClassForWidth(width);
  const isShort = height < SHORT_MAX_HEIGHT;
  const safeWidth = width - insets.left - insets.right;
  return {
    layoutClass,
    width,
    height,
    isLandscape: width > height,
    isShort,
    scale: layoutClass === 'compact' || isShort ? 1 : TABLET_SCALE,
    contentWidth: Math.min(safeWidth, READABLE_MAX_WIDTH),
    safeWidth,
    safeHeight: height - insets.top - insets.bottom,
  };
}

/** Side length of a Home operation tile: 2 x 2 upright, one row of four sideways. */
export function operationTileSize({
  isLandscape,
  scale,
  safeWidth,
  safeHeight,
  contentWidth,
}: Layout) {
  const maxSize = TILE_BASE_SIZE * scale;
  if (isLandscape) {
    const fitWidth = (safeWidth - SCREEN_PADDING * 2 - TILE_GAP * 3) / 4;
    const fitHeight = Math.max(safeHeight - HOME_CHROME_HEIGHT, MIN_TILE_SIZE);
    return Math.floor(Math.min(maxSize, fitWidth, fitHeight));
  }
  const fitWidth = (contentWidth - SCREEN_PADDING * 2 - TILE_GAP) / 2;
  return Math.floor(Math.min(maxSize, fitWidth));
}

/** A phone-scale size grown for the current layout, rounded to a tenth of a dp. */
export function scaled(value: number, scale: number): number {
  return Math.round(value * scale * 10) / 10;
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  // Without a provider (unit tests) there are no insets.
  const insets = useContext(SafeAreaInsetsContext) ?? NO_INSETS;
  return describeLayout(width, height, insets);
}

export function useLayoutClass(): LayoutClass {
  return useLayout().layoutClass;
}
