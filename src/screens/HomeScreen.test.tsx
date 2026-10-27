import React from 'react';
import { StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { render, fireEvent, within } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';
import { PurchaseProvider } from '../purchases/PurchaseContext';
import { SettingsProvider } from '../settings/SettingsContext';
import { addScore } from '../storage/scoresRepository';
import { passParentalGate } from '../testUtils/parentalGate';
import {
  PHONE,
  PHONE_LANDSCAPE,
  IPAD_PORTRAIT,
  IPAD_LANDSCAPE,
  setWindow,
} from '../testUtils/window';
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
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('shows the parental gate, then the unlock modal, for a locked operation', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const navigation = makeNavigation();
    const utils = await renderHomeScreen(navigation);

    await fireEvent.press(utils.getByText('×'));

    expect(await utils.findByText('Ask a grown-up')).toBeTruthy();
    expect(utils.queryByText('Unlock All Operations')).toBeNull();

    await passParentalGate(utils);

    expect(utils.getByText('Unlock All Operations')).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('navigates to the Leaderboard when the personal best card is tapped', async () => {
    const navigation = makeNavigation();
    const { getByLabelText } = await renderHomeScreen(navigation);

    await fireEvent.press(getByLabelText('View personal best on the leaderboard'));

    expect(navigation.navigate).toHaveBeenCalledWith('Leaderboard', {});
  });
});

describe('HomeScreen personal best', () => {
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

  it('refreshes the personal best when returning to Home from a game', async () => {
    const { getByText, findByText } = await renderInNavigator(
      <>
        <Stack.Screen name="MainTabs" component={HomeScreen as never} />
        <Stack.Screen name="Game" component={GameStub} />
      </>
    );

    expect(await findByText(/No scores yet/)).toBeTruthy();

    await fireEvent.press(getByText('+'));
    await fireEvent.press(await findByText('finish game'));

    expect(await findByText('12 points · Addition')).toBeTruthy();
  });
});

describe('HomeScreen layout', () => {
  afterEach(() => setWindow(PHONE));

  it('greets the player with Sunny', async () => {
    const { getByText, getByTestId } = await renderHomeScreen();
    expect(getByText('Hi there!')).toBeTruthy();
    expect(getByText('Pick a game')).toBeTruthy();
    expect(getByTestId('sunny', { includeHiddenElements: true })).toBeTruthy();
  });

  it('stacks the greeting, tiles and personal best in a readable column', async () => {
    setWindow(IPAD_PORTRAIT);
    const { getByTestId } = await renderHomeScreen();
    expect(getByTestId('home-column')).toHaveStyle({ maxWidth: 640 });
    expect(StyleSheet.flatten(getByTestId('operation-grid').props.style).flex).toBeUndefined();
  });

  it('puts the greeting and scores beside the tiles when the window is expanded', async () => {
    setWindow(IPAD_LANDSCAPE);
    await addScore({ id: '1', name: 'Ada', score: 12, operation: 'addition', createdAt: 1 });
    const { getByTestId, queryByTestId, findByText } = await renderHomeScreen();
    expect(queryByTestId('home-column')).toBeNull();
    expect(StyleSheet.flatten(getByTestId('operation-grid').props.style).flex).toBe(1);
    expect(await findByText('Top players')).toBeTruthy();
  });

  it('lets the four tiles share one row on a phone turned sideways', async () => {
    setWindow(PHONE_LANDSCAPE);
    const { getByTestId, getByText } = await renderHomeScreen();
    expect(getByTestId('operation-grid').children).toHaveLength(1);
    expect(getByText('÷')).toBeTruthy();
  });
});

describe('HomeScreen on a short window', () => {
  afterEach(() => setWindow(PHONE));

  it('scrolls, so the personal best is never hidden behind the tab bar', async () => {
    setWindow(PHONE_LANDSCAPE);
    const { getByTestId } = await renderHomeScreen();
    const scroll = getByTestId('home-scroll');
    expect(within(scroll).getByTestId('operation-grid')).toBeTruthy();
    expect(within(scroll).getByLabelText('View personal best on the leaderboard')).toBeTruthy();
  });
});
