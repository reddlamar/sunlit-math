import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Operation } from '../types/game';

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Game: { operation: Operation };
  Leaderboard: { operation?: Operation };
};

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'Game'>;
export type LeaderboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;
