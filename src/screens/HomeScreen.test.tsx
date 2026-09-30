import React from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';
import { PurchaseProvider } from '../purchases/PurchaseContext';
import { SettingsProvider } from '../settings/SettingsContext';
import { addScore } from '../storage/scoresRepository';
import type { GameScreenProps, HomeScreenProps, RootStackParamList } from '../navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function makeNavigation() {
  return { navigate: jest.fn() } as unknown as HomeScreenProps['navigation'];
}

// HomeScreen reloads its data on focus, which needs a real navigation container.
function renderInNavigator(screens: React.ReactNode) {
  return render(
    <SettingsProvider>
      <PurchaseProvider>
        <NavigationContainer>
          <Stack.Navigator>{screens}</Stack.Navigator>
        </NavigationContainer>
      </PurchaseProvider>
    </SettingsProvider>
  );
}

function renderHomeScreen(navigation = makeNavigation()) {
  return renderInNavigator(
    <Stack.Screen name="MainTabs">
      {() => <HomeScreen navigation={navigation} route={{} as HomeScreenProps['route']} />}
    </Stack.Screen>
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

describe('HomeScreen top score', () => {
  function GameStub({ navigation }: GameScreenProps) {
    return (
      <Text
        onPress={async () => {
          await addScore({ id: '1', name: 'Ada', score: 12, operation: 'addition', createdAt: 1 });
          navigation.goBack();
        }}
      >
        finish game
      </Text>
    );
  }

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('refreshes the top score when returning to Home from a game', async () => {
    const { getByText, findByText } = await renderInNavigator(
      <>
        <Stack.Screen name="MainTabs" component={HomeScreen as never} />
        <Stack.Screen name="Game" component={GameStub} />
      </>
    );

    expect(await findByText(/No scores yet/)).toBeTruthy();

    await fireEvent.press(getByText('+'));
    await fireEvent.press(await findByText('finish game'));

    expect(await findByText('Ada · 12')).toBeTruthy();
  });
});
