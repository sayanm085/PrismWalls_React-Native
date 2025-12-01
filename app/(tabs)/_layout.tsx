/**
 * =============================================================================
 * Tab Layout - Persistent Bottom Navigation
 * =============================================================================
 * 
 * 5 Tabs: Home, Favorites, Search, Trending, Settings
 * Clean, professional navigation without animations
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

// =============================================================================
// CONSTANTS
// =============================================================================

const COLORS = {
  primary: '#4F46E5',
  surface: '#FFFFFF',
  textSecondary: '#64748B',
};

// =============================================================================
// TAB ICON COMPONENT (No Animation)
// =============================================================================

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  nameOutline: keyof typeof Ionicons.glyphMap;
  focused: boolean;
};

const TabIcon = React.memo(function TabIcon({
  name,
  nameOutline,
  focused,
}: TabIconProps) {
  return (
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: focused ? COLORS.primary : 'transparent' },
      ]}
    >
      <Ionicons
        name={focused ? name : nameOutline}
        size={24}
        color={focused ? '#fff' : COLORS. textSecondary}
      />
    </View>
  );
});

// =============================================================================
// CUSTOM TAB BAR (No Animation)
// =============================================================================

function CustomTabBar({ state, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (! isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get icon names based on route
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        let iconNameOutline: keyof typeof Ionicons. glyphMap = 'home-outline';

        switch (route.name) {
          case 'index':
            iconName = 'home';
            iconNameOutline = 'home-outline';
            break;
          case 'favorites':
            iconName = 'heart';
            iconNameOutline = 'heart-outline';
            break;
          case 'search':
            iconName = 'grid';
            iconNameOutline = 'grid-outline';
            break;
          case 'trending':
            iconName = 'flame';
            iconNameOutline = 'flame-outline';
            break;
          case 'settings':
            iconName = 'settings';
            iconNameOutline = 'settings-outline';
            break;
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <TabIcon
              name={iconName}
              nameOutline={iconNameOutline}
              focused={isFocused}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// TAB LAYOUT
// =============================================================================

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      backBehavior="history"
    >
      <Tabs. Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favorites' }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Search' }}
      />
      <Tabs.Screen
        name="trending"
        options={{ title: 'Trending' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
    </Tabs>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 28,
    left: 24,
    right: 24,
    height: 70,
    backgroundColor: COLORS.surface,
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    ... Platform.select({
      ios: {
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});