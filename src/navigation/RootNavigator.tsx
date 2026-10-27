import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GameScreen } from '../screens/GameScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { Icon } from '../components/icons/Icon';
import { useSettings } from '../settings/SettingsContext';
import { fontFamily, radius } from '../theme/tokens';
import { useLayoutClass } from '../layout/layout';
import {
  RAIL_PADDING,
  RAIL_WIDTH,
  TAB_BAR_MARGIN,
  TAB_ICON_SIZE,
  tabBarPosition,
} from './tabBarOptions';
import type { MainTabParamList, RootStackParamList } from './types';

const styles = StyleSheet.create({
  tabLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { colors } = useSettings();
  const layoutClass = useLayoutClass();
  const position = tabBarPosition(layoutClass, Platform.OS);
  const isRail = position === 'left';
  const iconSize = TAB_ICON_SIZE[layoutClass];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarPosition: position,
        tabBarVariant: isRail ? 'material' : 'uikit',
        // The rail stacks each label under its icon; without this a sidebar spreads them out.
        tabBarLabelPosition: isRail ? 'below-icon' : undefined,
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        // The bottom bar floats as a rounded card; the rail is a full-height column.
        tabBarStyle: isRail
          ? {
              backgroundColor: colors.surface,
              borderWidth: 0,
              width: RAIL_WIDTH,
              // The default side padding leaves "SETTINGS" too little room in 96 dp.
              paddingStart: RAIL_PADDING,
              paddingEnd: RAIL_PADDING,
            }
          : {
              backgroundColor: colors.surface,
              borderTopWidth: 0,
              borderRadius: radius.xl,
              marginHorizontal: TAB_BAR_MARGIN,
              marginBottom: TAB_BAR_MARGIN / 2,
            },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="home" size={iconSize} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="settings" size={iconSize} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { colors } = useSettings();
  // The default theme paints the area behind the floating tab bar light grey.
  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: colors.background },
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitle: '',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
