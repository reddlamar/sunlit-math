import React, { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { PurchaseProvider } from './src/purchases/PurchaseContext';
import { SettingsProvider, useSettings } from './src/settings/SettingsContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Android 12+ only allows a small centered icon in the native splash, so we
// hide it as soon as possible and hold this matching centered logo in its place.
const SPLASH_MIN_DURATION_MS = 1000;

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [fontsLoaded] = useFonts({
    Baloo2_500Medium,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  const onSplashLayout = useCallback(() => {
    // onLayout only guarantees layout is done, not that this view has actually
    // painted yet — hiding the native splash too early exposes a frame of the
    // real content underneath. Waiting two frames guarantees a paint happened.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashVisible(false), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PurchaseProvider>
          <RootNavigator />
          <ThemedStatusBar />
        </PurchaseProvider>
      </SettingsProvider>
      {(isSplashVisible || !fontsLoaded) && (
        <View style={styles.splash} onLayout={onSplashLayout}>
          <Image
            source={require('./assets/splash-icon.png')}
            style={styles.splashImage}
            resizeMode="contain"
          />
        </View>
      )}
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const { theme } = useSettings();
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0A1F44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: 340,
    height: 340,
  },
});
