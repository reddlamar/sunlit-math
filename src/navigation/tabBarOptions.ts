import type { Platform } from 'react-native';
import type { LayoutClass } from '../layout/layout';

export type TabBarPosition = 'bottom' | 'left';

/**
 * Wide windows put the tabs in a rail down the left edge, where a thumb on a tablet reaches
 * them. A medium window keeps iOS's tab bar but follows Android's guidance and uses a rail.
 */
export function tabBarPosition(layoutClass: LayoutClass, os: typeof Platform.OS): TabBarPosition {
  if (layoutClass === 'expanded') {
    return 'left';
  }
  return layoutClass === 'medium' && os === 'android' ? 'left' : 'bottom';
}

/** Tab icon sizes from the design: they grow with the window. */
export const TAB_ICON_SIZE: Record<LayoutClass, number> = {
  compact: 28,
  medium: 32,
  expanded: 36,
};

export const RAIL_WIDTH = 96;
export const RAIL_PADDING = 4;
/** Space between the floating bottom tab bar and the screen edges. */
export const TAB_BAR_MARGIN = 20;
