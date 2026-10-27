import { renderHook } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';
import {
  describeLayout,
  layoutClassForWidth,
  gameArrangement,
  homeArrangement,
  frameSize,
  useLayout,
  useLayoutClass,
} from './layout';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockWindow = (width: number, height: number) =>
  (useWindowDimensions as jest.Mock).mockReturnValue({
    width,
    height,
    scale: 2,
    fontScale: 1,
  });

describe('layoutClassForWidth', () => {
  it.each([
    [320, 'compact'],
    [390, 'compact'],
    [599, 'compact'],
    [600, 'medium'],
    [820, 'medium'],
    [839, 'medium'],
    [840, 'expanded'],
    [1180, 'expanded'],
    [1920, 'expanded'],
  ])('puts %i dp in the %s class', (width, expected) => {
    expect(layoutClassForWidth(width)).toBe(expected);
  });
});

describe('describeLayout', () => {
  it('describes a phone held upright', () => {
    expect(describeLayout(390, 844)).toEqual({
      layoutClass: 'compact',
      width: 390,
      height: 844,
      isLandscape: false,
      isShort: false,
    });
  });

  it('describes an iPad in portrait as medium', () => {
    expect(describeLayout(820, 1180)).toMatchObject({
      layoutClass: 'medium',
      isLandscape: false,
      isShort: false,
    });
  });

  it('describes an iPad in landscape as expanded', () => {
    expect(describeLayout(1180, 820)).toMatchObject({
      layoutClass: 'expanded',
      isLandscape: true,
      isShort: false,
    });
  });

  it('treats a phone turned sideways as short: wide enough to be expanded, but not tall', () => {
    expect(describeLayout(844, 390)).toMatchObject({
      layoutClass: 'expanded',
      isLandscape: true,
      isShort: true,
    });
  });

  it('draws the line for short at 480 dp of height', () => {
    expect(describeLayout(900, 479).isShort).toBe(true);
    expect(describeLayout(900, 480).isShort).toBe(false);
  });

  it('treats a square window as portrait', () => {
    expect(describeLayout(700, 700).isLandscape).toBe(false);
  });
});

describe('homeArrangement', () => {
  it.each([
    ['a phone', 390, 844, 'stacked'],
    ['an iPad in portrait (medium)', 820, 1180, 'stacked'],
    ['an iPad in landscape (expanded)', 1180, 820, 'twoPane'],
    ['a large iPad held upright (expanded, but not landscape)', 1032, 1376, 'stacked'],
    ['a phone turned sideways, though it is wide enough to be expanded', 874, 402, 'row'],
  ])('arranges Home for %s', (_name, width, height, expected) => {
    expect(homeArrangement(describeLayout(width, height))).toBe(expected);
  });
});

describe('gameArrangement', () => {
  it.each([
    ['a phone', 390, 844, 'stacked'],
    ['an iPad in portrait', 820, 1180, 'stacked'],
    ['a large iPad held upright', 1032, 1376, 'stacked'],
    ['an iPad in landscape', 1180, 820, 'sidePanel'],
    ['a phone turned sideways, though it is wide enough to be expanded', 874, 402, 'sideways'],
  ])('arranges the game for %s', (_name, width, height, expected) => {
    expect(gameArrangement(describeLayout(width, height))).toBe(expected);
  });
});

describe('frameSize', () => {
  it.each([
    ['a phone', 390, 844, 'compact'],
    ['an iPad in portrait', 820, 1180, 'medium'],
    ['a large iPad held upright', 1032, 1376, 'medium'],
    ['an iPad in landscape', 1180, 820, 'wide'],
    ['a phone turned sideways, however wide it is', 874, 402, 'compact'],
  ])('draws Home for %s at the %s size', (_name, width, height, expected) => {
    expect(frameSize(describeLayout(width, height))).toBe(expected);
  });
});

describe('hooks', () => {
  it('useLayout follows the window size', async () => {
    mockWindow(820, 1180);
    const { result } = await renderHook(() => useLayout());
    expect(result.current.layoutClass).toBe('medium');
  });

  it('useLayoutClass returns only the class and updates when the window changes', async () => {
    mockWindow(390, 844);
    const { result, rerender } = await renderHook(() => useLayoutClass());
    expect(result.current).toBe('compact');
    mockWindow(1180, 820);
    await rerender({});
    expect(result.current).toBe('expanded');
  });
});
