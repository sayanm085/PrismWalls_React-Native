/**
 * =============================================================================
 * PRISMWALLS - Root Layout with Animated Splash
 * =============================================================================
 *
 * Author: Shotlin Team
 * =============================================================================
 */

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import { SimpleSplashScreen } from '@/src/components/splash';

// ✅ Ignore this warning - it's harmless
LogBox.ignoreLogs([
  'Unable to activate keep awake',
]);

// ✅ Wrap in try-catch to prevent crash
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  // Ignore error
}

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // ✅ Wrap in try-catch
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Ignore error
      }
    }
  }, [appIsReady]);

  const handleSplashAnimationComplete = useCallback(() => {
    setSplashAnimationComplete(true);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <StatusBar style="light" />
          
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="viewer"
              options={{
                animation: 'fade',
                presentation: 'fullScreenModal',
              }}
            />
          </Stack>

          {/* Animated Splash Screen Overlay */}
          {!splashAnimationComplete && (
            <SimpleSplashScreen
              onAnimationComplete={handleSplashAnimationComplete}
            />
          )}
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
});