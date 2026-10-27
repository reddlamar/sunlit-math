import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { HomeGreeting } from './HomeGreeting';
import { SettingsProvider } from '../settings/SettingsContext';
import {
  IPAD_LANDSCAPE,
  IPAD_PORTRAIT,
  PHONE,
  PHONE_LANDSCAPE,
  setWindow,
} from '../testUtils/window';

const HIDDEN = { includeHiddenElements: true };

const renderGreeting = () =>
  render(
    <SettingsProvider>
      <HomeGreeting />
    </SettingsProvider>
  );

describe('HomeGreeting', () => {
  afterEach(() => setWindow(PHONE));

  it('greets the player and marks the greeting as a heading', async () => {
    const { getByRole, getByText } = await renderGreeting();

    expect(getByRole('header')).toHaveTextContent('Hi there!');
    expect(getByText('Pick a game')).toBeTruthy();
  });

  it.each([
    ['a phone', PHONE, 96, 32],
    ['an iPad in portrait', IPAD_PORTRAIT, 160, 44],
    ['a large iPad held upright', { width: 1032, height: 1376 }, 160, 44],
    ['an iPad in landscape', IPAD_LANDSCAPE, 180, 44],
    ['a phone turned sideways', PHONE_LANDSCAPE, 64, 26],
  ])('sizes Sunny and the title for %s', async (_name, window, sunny, title) => {
    setWindow(window);
    const { getByTestId, getByText } = await renderGreeting();

    expect(getByTestId('sunny', HIDDEN).props.width).toBe(sunny);
    expect(getByText('Hi there!')).toHaveStyle({ fontSize: title });
  });

  it.each([
    ['a phone', PHONE, 'row'],
    ['a large iPad held upright', { width: 1032, height: 1376 }, 'row'],
    ['an iPad in landscape', IPAD_LANDSCAPE, 'column'],
  ])('lays Sunny out in a %s as a %s', async (_name, window, direction) => {
    setWindow(window);
    const { getByTestId } = await renderGreeting();

    expect(StyleSheet.flatten(getByTestId('home-greeting').props.style).flexDirection).toBe(
      direction
    );
  });
});
