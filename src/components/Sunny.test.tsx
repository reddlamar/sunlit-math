import React from 'react';
import { render } from '@testing-library/react-native';
import { Sunny } from './Sunny';

const HIDDEN = { includeHiddenElements: true };

describe('Sunny', () => {
  it('draws at the requested size', async () => {
    const { getByTestId } = await render(<Sunny size={160} />);

    const svg = getByTestId('sunny', HIDDEN);
    expect(svg.props.width).toBe(160);
    expect(svg.props.height).toBe(160);
  });

  it('is decoration: hidden from screen readers', async () => {
    const { getByTestId } = await render(<Sunny size={96} />);

    const svg = getByTestId('sunny', HIDDEN);
    expect(svg.props.accessibilityElementsHidden).toBe(true);
    expect(svg.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it.each(['happy', 'cheer'] as const)('draws the %s face', async (expression) => {
    const { getByTestId } = await render(<Sunny size={96} expression={expression} />);

    expect(getByTestId('sunny', HIDDEN)).toBeTruthy();
  });

  it('gives the cheering face its open mouth and sparkles, which the happy one lacks', async () => {
    const countPaths = async (expression: 'happy' | 'cheer') => {
      const { toJSON } = await render(<Sunny size={96} expression={expression} />);
      const count = (node: any): number =>
        (typeof node?.props?.d === 'string' ? 1 : 0) +
        (node?.children ?? []).reduce((total: number, child: unknown) => total + count(child), 0);
      return count(toJSON());
    };

    expect(await countPaths('cheer')).toBeGreaterThan(await countPaths('happy'));
  });
});
