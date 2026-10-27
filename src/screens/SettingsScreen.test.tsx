import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsScreen } from './SettingsScreen';
import { PurchaseProvider } from '../purchases/PurchaseContext';
import { SettingsProvider } from '../settings/SettingsContext';
import { passParentalGate } from '../testUtils/parentalGate';
import { PHONE, PHONE_LANDSCAPE, IPAD_PORTRAIT, setWindow } from '../testUtils/window';

const SETTINGS_KEY = 'math60_settings_v1';
const UNLOCKED_KEY = 'math60_unlocked_v1';

function renderSettingsScreen() {
  return render(
    <SettingsProvider>
      <PurchaseProvider>
        <SettingsScreen />
      </PurchaseProvider>
    </SettingsProvider>
  );
}

const selected = (element: { props: { accessibilityState?: { selected?: boolean } } }) =>
  element.props.accessibilityState?.selected;

describe('SettingsScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setWindow(PHONE);
  });

  it('is the grown-up area, headed as such, with a card for each setting', async () => {
    const { getByRole, getByText } = await renderSettingsScreen();

    expect(getByRole('header', { name: 'Grown-up area' })).toBeTruthy();
    for (const title of ['Sound', 'Theme', 'Difficulty']) {
      expect(getByText(title)).toBeTruthy();
    }
  });

  it('defaults to Sound On, Auto theme and Easy difficulty', async () => {
    const { findByTestId } = await renderSettingsScreen();

    expect(selected(await findByTestId('mute-on'))).toBe(true);
    expect(selected(await findByTestId('theme-auto'))).toBe(true);
    expect(selected(await findByTestId('difficulty-easy'))).toBe(true);
  });

  it('mutes sound when Off is pressed', async () => {
    const { findByTestId, getByTestId } = await renderSettingsScreen();
    await findByTestId('mute-off');

    await fireEvent.press(getByTestId('mute-off'));

    await waitFor(() => expect(selected(getByTestId('mute-off'))).toBe(true));
    expect(selected(getByTestId('mute-on'))).toBe(false);
  });

  it('switches theme when Dark is pressed', async () => {
    const { findByTestId, getByTestId } = await renderSettingsScreen();
    await findByTestId('theme-dark');

    await fireEvent.press(getByTestId('theme-dark'));

    await waitFor(() => expect(selected(getByTestId('theme-dark'))).toBe(true));
    expect(selected(getByTestId('theme-auto'))).toBe(false);
  });

  it('goes back to following the phone when Auto is pressed, and remembers that', async () => {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ muted: false, theme: 'dark', difficulty: 'easy' })
    );
    const { findByTestId, getByTestId } = await renderSettingsScreen();
    await waitFor(async () => expect(selected(await findByTestId('theme-dark'))).toBe(true));

    await fireEvent.press(getByTestId('theme-auto'));

    await waitFor(() => expect(selected(getByTestId('theme-auto'))).toBe(true));
    await waitFor(async () =>
      expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!).theme).toBeNull()
    );
  });

  it('shows the theme that was chosen earlier', async () => {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ muted: true, theme: 'light', difficulty: 'hard' })
    );
    const { findByTestId } = await renderSettingsScreen();

    await waitFor(async () => expect(selected(await findByTestId('theme-light'))).toBe(true));
    expect(selected(await findByTestId('mute-off'))).toBe(true);
    expect(selected(await findByTestId('difficulty-hard'))).toBe(true);
  });

  it('switches difficulty when Hard is pressed', async () => {
    const { findByTestId, getByTestId } = await renderSettingsScreen();
    await findByTestId('difficulty-hard');

    await fireEvent.press(getByTestId('difficulty-hard'));

    await waitFor(() => expect(selected(getByTestId('difficulty-hard'))).toBe(true));
  });

  describe('unlock card', () => {
    it('invites a grown-up to unlock, and to restore a purchase', async () => {
      const { getByText, getByLabelText } = await renderSettingsScreen();

      expect(getByLabelText('Unlock all games')).toBeTruthy();
      expect(getByText('For grown-ups. A parent check comes first.')).toBeTruthy();
      expect(getByText('Restore purchases')).toBeTruthy();
    });

    it('opens the parental gate first, and only then the unlock offer', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const utils = await renderSettingsScreen();

      await fireEvent.press(utils.getByTestId('unlock-card'));

      expect(await utils.findByText('Ask a grown-up')).toBeTruthy();
      expect(utils.queryByText('Unlock All Operations')).toBeNull();

      await passParentalGate(utils);

      expect(await utils.findByText('Unlock All Operations')).toBeTruthy();
    });

    it('can be closed again without buying anything', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const utils = await renderSettingsScreen();
      await fireEvent.press(utils.getByTestId('unlock-card'));
      await passParentalGate(utils);

      await fireEvent.press(await utils.findByTestId('unlock-close-button'));

      await waitFor(() => expect(utils.queryByText('Unlock All Operations')).toBeNull());
      expect(utils.getByTestId('unlock-card')).toBeTruthy();
    });

    it('is not shown once everything is unlocked', async () => {
      await AsyncStorage.setItem(UNLOCKED_KEY, 'true');
      const { queryByTestId } = await renderSettingsScreen();

      await waitFor(() => expect(queryByTestId('unlock-card')).toBeNull());
    });
  });
});

describe('SettingsScreen layout', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(() => setWindow(PHONE));

  it('uses the whole width on a phone', async () => {
    const { getByTestId } = await renderSettingsScreen();
    expect(getByTestId('settings-column')).toHaveStyle({ width: '100%' });
  });

  it('keeps a readable centered column on an iPad', async () => {
    setWindow(IPAD_PORTRAIT);
    const { getByTestId } = await renderSettingsScreen();
    expect(getByTestId('settings-column')).toHaveStyle({ maxWidth: 640 });
  });

  it('scrolls, so the last setting is reachable on a short window', async () => {
    setWindow(PHONE_LANDSCAPE);
    const { getByTestId } = await renderSettingsScreen();
    expect(getByTestId('settings-scroll')).toBeTruthy();
    expect(getByTestId('difficulty-hard')).toBeTruthy();
  });
});
