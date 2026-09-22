import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SettingsScreen } from './SettingsScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import type { SettingsScreenProps } from '../navigation/types';

function renderSettingsScreen() {
  return render(
    <SettingsProvider>
      <SettingsScreen
        navigation={{} as SettingsScreenProps['navigation']}
        route={{} as SettingsScreenProps['route']}
      />
    </SettingsProvider>
  );
}

describe('SettingsScreen', () => {
  it('defaults to Sound On, and Easy difficulty', async () => {
    const { findByTestId } = await renderSettingsScreen();

    expect((await findByTestId('mute-on')).props.accessibilityState).toEqual({ selected: true });
    expect((await findByTestId('difficulty-easy')).props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('mutes sound when Off is pressed', async () => {
    const { findByTestId, getByTestId } = await renderSettingsScreen();
    await findByTestId('mute-off');

    await fireEvent.press(getByTestId('mute-off'));

    await waitFor(() =>
      expect(getByTestId('mute-off').props.accessibilityState).toEqual({ selected: true })
    );
  });

  it('switches theme when Dark is pressed', async () => {
    const { findByTestId, getByTestId } = await renderSettingsScreen();
    await findByTestId('theme-dark');

    await fireEvent.press(getByTestId('theme-dark'));

    await waitFor(() =>
      expect(getByTestId('theme-dark').props.accessibilityState).toEqual({ selected: true })
    );
  });

  it('switches difficulty when Hard is pressed', async () => {
    const { findByTestId, getByTestId } = await renderSettingsScreen();
    await findByTestId('difficulty-hard');

    await fireEvent.press(getByTestId('difficulty-hard'));

    await waitFor(() =>
      expect(getByTestId('difficulty-hard').props.accessibilityState).toEqual({ selected: true })
    );
  });
});
