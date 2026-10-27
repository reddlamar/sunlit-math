import { useWindowDimensions } from 'react-native';

/**
 * Window size classes, using Android's breakpoints so one rule serves phones, iPads and
 * Android tablets: compact under 600 dp, medium 600 to 839, expanded 840 and up.
 */
export type LayoutClass = 'compact' | 'medium' | 'expanded';

export const MEDIUM_MIN_WIDTH = 600;
export const EXPANDED_MIN_WIDTH = 840;
/** A phone turned sideways is wide but under this tall, so it keeps the compact sizes. */
export const SHORT_MAX_HEIGHT = 480;
/** Text and form screens stop growing at this width and center instead. */
export const READABLE_MAX_WIDTH = 640;

export type Layout = {
  layoutClass: LayoutClass;
  width: number;
  height: number;
  isLandscape: boolean;
  isShort: boolean;
};

export function layoutClassForWidth(width: number): LayoutClass {
  if (width >= EXPANDED_MIN_WIDTH) {
    return 'expanded';
  }
  return width >= MEDIUM_MIN_WIDTH ? 'medium' : 'compact';
}

export function describeLayout(width: number, height: number): Layout {
  return {
    layoutClass: layoutClassForWidth(width),
    width,
    height,
    isLandscape: width > height,
    isShort: height < SHORT_MAX_HEIGHT,
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

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  return describeLayout(width, height);
}

export function useLayoutClass(): LayoutClass {
  return useLayout().layoutClass;
}
