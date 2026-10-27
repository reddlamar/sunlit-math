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
});
