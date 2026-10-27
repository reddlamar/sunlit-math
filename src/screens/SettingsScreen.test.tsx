import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { SettingsScreen } from './SettingsScreen';
import { SettingsProvider } from '../settings/SettingsContext';
import { PHONE, PHONE_LANDSCAPE, IPAD_PORTRAIT, setWindow } from '../testUtils/window';

function renderSettingsScreen() {
  return render(
    <SettingsProvider>
      <SettingsScreen />
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

describe('SettingsScreen layout', () => {
  afterEach(() => setWindow(PHONE));

  it('uses the whole width on a phone', async () => {
    setWindow(PHONE);
    const { getByTestId } = await renderSettingsScreen();
    expect(getByTestId('settings-column')).toHaveStyle({ width: '100%', maxWidth: 640 });
  });

  it('keeps a readable centered column on an iPad', async () => {
    setWindow(IPAD_PORTRAIT);
    const { getByTestId } = await renderSettingsScreen();
    expect(getByTestId('settings-column')).toHaveStyle({ maxWidth: 640, alignSelf: 'center' });
  });
});

describe('SettingsScreen scrolling and scale', () => {
  afterEach(() => setWindow(PHONE));

  it('scrolls, so the last setting is reachable on a short window', async () => {
    setWindow(PHONE_LANDSCAPE);
    const { getByTestId } = await renderSettingsScreen();
    expect(within(getByTestId('settings-scroll')).getByTestId('difficulty-hard')).toBeTruthy();
  });

  it('grows the title and section labels on an iPad', async () => {
    setWindow(IPAD_PORTRAIT);
    const { getByText } = await renderSettingsScreen();
    expect(getByText(/Settings/)).toHaveStyle({ fontSize: 36.4 });
    expect(getByText('Sound')).toHaveStyle({ fontSize: 18.2 });
  });
});
