/**
 * =============================================================================
 * Root Layout
 * =============================================================================
 * 
 * Main app layout - handles navigation stack
 * Settings and Viewer open as stack screens (overlay tabs)
 * =============================================================================
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tab screens */}
        <Stack.Screen name="(tabs)" />
        
        {/* Stack screens (open on top of tabs) */}
        <Stack.Screen 
          name="settings" 
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="viewer" 
          options={{
            presentation: 'card',
            animation: 'fade',
          }}
        />
      </Stack>
    </>
  );
}