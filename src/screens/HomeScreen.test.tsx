import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';
import { PurchaseProvider } from '../purchases/PurchaseContext';
import { SettingsProvider } from '../settings/SettingsContext';
import type { HomeScreenProps } from '../navigation/types';

function makeNavigation() {
  return { navigate: jest.fn() } as unknown as HomeScreenProps['navigation'];
}

function renderHomeScreen(navigation = makeNavigation()) {
  return render(
    <SettingsProvider>
      <PurchaseProvider>
        <HomeScreen navigation={navigation} route={{} as HomeScreenProps['route']} />
      </PurchaseProvider>
    </SettingsProvider>
  );
}

describe('HomeScreen', () => {
  it('shows all four operation buttons', async () => {
    const { getByText } = await renderHomeScreen();
    expect(getByText('+')).toBeTruthy();
    expect(getByText('−')).toBeTruthy();
    expect(getByText('×')).toBeTruthy();
    expect(getByText('÷')).toBeTruthy();
  });

  it('navigates to Game with addition, which is free', async () => {
    const navigation = makeNavigation();
    const { getByText } = await renderHomeScreen(navigation);

    await fireEvent.press(getByText('+'));

    expect(navigation.navigate).toHaveBeenCalledWith('Game', { operation: 'addition' });
  });

  it('shows the unlock modal instead of navigating for a locked operation', async () => {
    const navigation = makeNavigation();
    const { getByText, findByText } = await renderHomeScreen(navigation);

    await fireEvent.press(getByText('×'));

    expect(await findByText('Unlock All Operations')).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('navigates to the Leaderboard when the leaderboard icon is tapped', async () => {
    const navigation = makeNavigation();
    const { getByLabelText } = await renderHomeScreen(navigation);

    await fireEvent.press(getByLabelText('View leaderboard'));

    expect(navigation.navigate).toHaveBeenCalledWith('Leaderboard', {});
  });
});
