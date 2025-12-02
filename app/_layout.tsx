/**
 * =============================================================================
 * Root Layout
 * =============================================================================
 *
 * App entry point with providers:
 * - React Query for data fetching
 * - Safe Area context
 * - Navigation setup
 * - Status bar configuration
 *
 * =============================================================================
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CACHE_TIMES } from '../src/constants/apiKeys';

// =============================================================================
// ROOT LAYOUT
// =============================================================================

export default function RootLayout() {
  // Create QueryClient inside component with useState
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: CACHE_TIMES.STALE_TIME,
            gcTime: CACHE_TIMES.WALLPAPERS,
            retry: 2,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="viewer"
              options={{
                presentation: 'fullScreenModal',
                animation: 'fade',
              }}
            />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}