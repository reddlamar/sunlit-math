import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from './IconButton';
import { SettingsProvider } from '../settings/SettingsContext';
import { dark, light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

const renderButton = (onPress = jest.fn()) =>
  render(
    <SettingsProvider>
      <IconButton icon="pause" label="Pause game" onPress={onPress} testID="icon-button" />
    </SettingsProvider>
  );

describe('IconButton', () => {
  it('is a labeled button, since its icon says nothing to a screen reader', async () => {
    const { getByLabelText } = await renderButton();

    expect(getByLabelText('Pause game')).toBeTruthy();
    expect(getByLabelText('Pause game').props.accessibilityRole).toBe('button');
  });

  it('is a 56 dp circle', async () => {
    const { getByTestId } = await renderButton();

    expect(getByTestId('icon-button')).toHaveStyle({ width: 56, height: 56, borderRadius: 28 });
  });

  it('shows its icon', async () => {
    const { getByTestId } = await renderButton();

    expect(getByTestId('icon-pause', { includeHiddenElements: true })).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderButton(onPress);

    await fireEvent.press(getByLabelText('Pause game'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('takes its fill and border from the theme', async () => {
    const { getByTestId } = await renderButton();

    const { style } = getByTestId('icon-button').props;
    expect(hasStyleValue(style, 'backgroundColor', light.surface)).toBe(true);
    expect(hasStyleValue(style, 'borderColor', light.border)).toBe(true);
    expect(hasStyleValue(style, 'backgroundColor', dark.surface)).toBe(false);
  });
});
