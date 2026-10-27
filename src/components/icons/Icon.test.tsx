import React from 'react';
import { render } from '@testing-library/react-native';
import { Icon } from './Icon';
import { iconPaths, type IconName } from './iconPaths';

// Icons are hidden from screen readers on purpose, which testing-library's queries skip by default.
const HIDDEN = { includeHiddenElements: true };

const ICON_NAMES = Object.keys(iconPaths) as IconName[];

type RenderedNode = {
  props: Record<string, unknown>;
  children: (RenderedNode | string)[] | null;
};

const COLOR = '#ABCDEF';
/** How react-native-svg hands an opaque color to the native view. */
const PAINTED = { type: 0, payload: 0xffabcdef };

/** Every path in a rendered tree, found by walking the host elements. */
function pathsIn(tree: RenderedNode | RenderedNode[] | null): RenderedNode[] {
  const nodes = Array.isArray(tree) ? tree : tree ? [tree] : [];
  return nodes.flatMap((node) => [
    ...(typeof node.props.d === 'string' ? [node] : []),
    ...pathsIn(
      (node.children ?? []).filter((child): child is RenderedNode => typeof child !== 'string')
    ),
  ]);
}

describe('Icon', () => {
  it.each(ICON_NAMES)('renders the %s icon', async (name) => {
    const { getByTestId } = await render(<Icon name={name} color="#123456" />);

    expect(getByTestId(`icon-${name}`, HIDDEN)).toBeTruthy();
  });

  it('defaults to the 24 dp grid size', async () => {
    const { getByTestId } = await render(<Icon name="home" color="#123456" />);

    const svg = getByTestId('icon-home', HIDDEN);
    expect(svg.props.width).toBe(24);
    expect(svg.props.height).toBe(24);
  });

  it('scales to the requested size', async () => {
    const { getByTestId } = await render(<Icon name="trophy" size={64} color="#123456" />);

    const svg = getByTestId('icon-trophy', HIDDEN);
    expect(svg.props.width).toBe(64);
    expect(svg.props.height).toBe(64);
  });

  it('is hidden from screen readers', async () => {
    const { getByTestId } = await render(<Icon name="lock" color="#123456" />);

    const svg = getByTestId('icon-lock', HIDDEN);
    expect(svg.props.accessibilityElementsHidden).toBe(true);
    expect(svg.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('draws every path of the icon in the given color', async () => {
    const { toJSON } = await render(<Icon name="trophy" color={COLOR} />);

    const paths = pathsIn(toJSON());
    expect(paths).toHaveLength(iconPaths.trophy.length);
    for (const { props } of paths) {
      // Each path is painted by its fill, its outline, or both, never in another color.
      expect([props.fill, props.stroke]).toContainEqual(PAINTED);
    }
  });

  it('outlines line icons without filling them', async () => {
    const { toJSON } = await render(<Icon name="back" color={COLOR} />);

    const [path] = pathsIn(toJSON());
    expect(path.props.fill).toBeNull();
    expect(path.props.stroke).toEqual(PAINTED);
    expect(path.props.strokeWidth).toBe(2.2);
  });

  it('fills solid icons without an outline', async () => {
    const { toJSON } = await render(<Icon name="flame" color={COLOR} />);

    const [path] = pathsIn(toJSON());
    expect(path.props.fill).toEqual(PAINTED);
    expect(path.props.stroke).toBeNull();
  });
});

describe('iconPaths', () => {
  it('has unique path data within each icon (paths are used as React keys)', () => {
    for (const name of ICON_NAMES) {
      const data = iconPaths[name].map(({ d }) => d);
      expect(new Set(data).size).toBe(data.length);
    }
  });
});
