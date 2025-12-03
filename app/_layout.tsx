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
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import { AnimatedSplashScreen } from '@/src/components/splash';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc. 
        // Add any initialization logic here
        
        // Simulate loading time (remove in production)
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
      await SplashScreen.hideAsync();
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
          <StatusBar style="dark" />
          
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
            <Stack.Screen
              name="search"
              options={{
                animation: 'slide_from_right',
              }}
            />
          </Stack>

          {/* Animated Splash Screen Overlay */}
          {!splashAnimationComplete && (
            <AnimatedSplashScreen
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
  },
});