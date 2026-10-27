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

/** A wide window held sideways: the design's expanded frames, with room for two panes. */
function isWideLandscape({ layoutClass, isShort, isLandscape }: Layout) {
  return layoutClass === 'expanded' && isLandscape && !isShort;
}

/**
 * How Home arranges itself: tiles stacked under the greeting, a greeting and scores pane
 * beside the tiles on a wide landscape window, or a single row of tiles on a phone turned
 * sideways. A wide window held upright keeps the stacked column.
 */
export type HomeArrangement = 'stacked' | 'twoPane' | 'row';

export function homeArrangement(layout: Layout): HomeArrangement {
  if (layout.isShort) {
    return 'row';
  }
  return isWideLandscape(layout) ? 'twoPane' : 'stacked';
}

/**
 * How the Game screen arranges itself: a column, a side panel of stats beside the play area
 * on a wide landscape window, or the question beside the answers on a phone turned sideways.
 */
export type GameArrangement = 'stacked' | 'sidePanel' | 'sideways';

export function gameArrangement(layout: Layout): GameArrangement {
  if (layout.isShort) {
    return 'sideways';
  }
  return isWideLandscape(layout) ? 'sidePanel' : 'stacked';
}

/** The size set screens are drawn at: the design's compact, medium and wide frames. */
export type FrameSize = 'compact' | 'medium' | 'wide';

export function frameSize(layout: Layout): FrameSize {
  if (isWideLandscape(layout)) {
    return 'wide';
  }
  return layout.isShort || layout.layoutClass === 'compact' ? 'compact' : 'medium';
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
