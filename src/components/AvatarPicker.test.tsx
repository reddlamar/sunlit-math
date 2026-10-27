import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { AvatarPicker } from './AvatarPicker';
import { SettingsProvider } from '../settings/SettingsContext';
import { AVATARS } from '../game/avatars';
import { light } from '../theme/tokens';
import { hasStyleValue } from '../testUtils/styleAssertions';

const renderPicker = async (props: Partial<React.ComponentProps<typeof AvatarPicker>> = {}) => {
  const onSelect = jest.fn();
  const screen = await render(
    <SettingsProvider>
      <AvatarPicker selected="owl" onSelect={onSelect} {...props} />
    </SettingsProvider>
  );
  return { onSelect, ...screen };
};

describe('AvatarPicker', () => {
  it('offers every animal as a labeled choice in one group', async () => {
    const { getByLabelText } = await renderPicker();

    // Not itself an accessibility element, or a screen reader would swallow the choices.
    expect(getByLabelText('Pick your player').props.accessibilityRole).toBe('radiogroup');
    for (const { name } of AVATARS) {
      expect(getByLabelText(name).props.accessibilityRole).toBe('radio');
    }
  });

  it('marks only the selected animal as selected', async () => {
    const { getByLabelText } = await renderPicker({ selected: 'cat' });

    const states = AVATARS.map(
      ({ name }) => getByLabelText(name).props.accessibilityState.selected
    );
    expect(states).toEqual([false, false, false, true, false, false]);
  });

  it('rings the selected animal in the text color, and no other', async () => {
    const { getByTestId, queryByTestId } = await renderPicker({ selected: 'fox' });

    expect(
      hasStyleValue(getByTestId('avatar-ring-fox').props.style, 'borderColor', light.textPrimary)
    ).toBe(true);
    expect(queryByTestId('avatar-ring-owl')).toBeNull();
  });

  it('can have nothing selected', async () => {
    const { getByLabelText } = await renderPicker({ selected: null });

    for (const { name } of AVATARS) {
      expect(getByLabelText(name).props.accessibilityState.selected).toBe(false);
    }
  });

  it('reports the animal tapped', async () => {
    const { onSelect, getByLabelText } = await renderPicker();

    await fireEvent.press(getByLabelText('Bunny'));

    expect(onSelect).toHaveBeenCalledWith('bunny');
  });

  it('keeps each choice at 48 dp to tap, the ring sitting outside so six fit in a row', async () => {
    const { getByTestId } = await renderPicker({ selected: 'fox' });

    expect(getByTestId('avatar-option-fox')).toHaveStyle({ width: 48, height: 48 });
    expect(getByTestId('avatar-option-owl')).toHaveStyle({ width: 48, height: 48 });
  });

  it('can be drawn larger', async () => {
    const { getByTestId } = await renderPicker({ size: 56 });

    expect(getByTestId('avatar-option-fox')).toHaveStyle({ width: 56, height: 56 });
  });

  it('is as wide as the design at most, and shrinks to fit a narrower screen', async () => {
    const { getByLabelText } = await renderPicker();

    const style = StyleSheet.flatten(getByLabelText('Pick your player').props.style);
    // Six 48 dp animals and five 12 dp gaps; 100% lets it be narrower than that.
    expect(style.maxWidth).toBe(6 * 48 + 5 * 12);
    expect(style.width).toBe('100%');
    expect(style.justifyContent).toBe('space-between');
    // Down to 8 dp apart before it would wrap, so an iPhone SE's 335 dp still holds all six.
    expect(style.gap).toBe(8);
    expect(6 * 48 + 5 * 8).toBeLessThanOrEqual(335);
  });
});
