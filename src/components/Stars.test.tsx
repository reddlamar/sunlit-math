import React from 'react';
import { render } from '@testing-library/react-native';
import { Stars } from './Stars';
import { SettingsProvider } from '../settings/SettingsContext';

const HIDDEN = { includeHiddenElements: true };
const renderStars = (count: number, size = 56) =>
  render(
    <SettingsProvider>
      <Stars count={count} size={size} />
    </SettingsProvider>
  );

describe('Stars', () => {
  it.each([0, 1, 2, 3])('shows %i earned stars and the rest empty', async (count) => {
    const { queryAllByTestId } = await renderStars(count);

    expect(queryAllByTestId('star-earned', HIDDEN)).toHaveLength(count);
    expect(queryAllByTestId('star-empty', HIDDEN)).toHaveLength(3 - count);
  });

  it('reads as one thing to a screen reader, not three pictures', async () => {
    const { getByLabelText } = await renderStars(2);

    expect(getByLabelText('2 of 3 stars').props.accessible).toBe(true);
  });

  it('draws each star at the size asked for', async () => {
    const { queryAllByTestId } = await renderStars(1, 64);

    for (const star of [
      ...queryAllByTestId('star-earned', HIDDEN),
      ...queryAllByTestId('star-empty', HIDDEN),
    ]) {
      expect(star.props.width).toBe(64);
      expect(star.props.height).toBe(64);
    }
  });
});
