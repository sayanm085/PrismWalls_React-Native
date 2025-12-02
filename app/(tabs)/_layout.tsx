/**
 * =============================================================================
 * Tab Layout - Premium Bottom Navigation
 * =============================================================================
 * 
 * 5 Tabs: Home, Favorites, Search, Trending, Settings
 * Professional smooth animations
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_MARGIN = 24;
const TAB_BAR_WIDTH = SCREEN_WIDTH - TAB_BAR_MARGIN * 2;
const TAB_COUNT = 5;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;
const INDICATOR_SIZE = 50;
const INDICATOR_OFFSET = (TAB_WIDTH - INDICATOR_SIZE) / 2;

const COLORS = {
  primary: '#4F46E5',
  surface: '#FFFFFF',
  textSecondary: '#94A3B8',
};

// Smooth easing
const EASING = {
  smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
  bounce: Easing.bezier(0.68, -0.15, 0.27, 1.15),
};

// =============================================================================
// TAB DATA
// =============================================================================

const TABS = [
  { name: 'index', icon: 'home', iconOutline: 'home-outline' },
  { name: 'favorites', icon: 'heart', iconOutline: 'heart-outline' },
  { name: 'search', icon: 'grid', iconOutline: 'grid-outline' },
  { name: 'trending', icon: 'flame', iconOutline: 'flame-outline' },
  { name: 'settings', icon: 'settings', iconOutline: 'settings-outline' },
] as const;

// =============================================================================
// ANIMATED TAB ICON
// =============================================================================

type TabIconProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress: () => void;
};

const TabIcon = React.memo(function TabIcon({
  icon,
  iconOutline,
  focused,
  onPress,
}: TabIconProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      // Bounce animation on selection
      scale.value = withSequence(
        withTiming(0.9, { duration: 100, easing: EASING.smooth }),
        withSpring(1.1, { damping: 12, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 180 })
      );

      translateY.value = withSequence(
        withTiming(3, { duration: 100 }),
        withSpring(-2, { damping: 14, stiffness: 180 }),
        withSpring(0, { damping: 12, stiffness: 150 })
      );
    } else {
      scale.value = withTiming(1, { duration: 200, easing: EASING.smooth });
      translateY.value = withTiming(0, { duration: 200, easing: EASING.smooth });
    }
  }, [focused, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      android_ripple={{ color: 'transparent' }}
    >
      <Animated.View style={[styles.iconWrapper, animatedStyle]}>
        <Ionicons
          name={focused ? icon : iconOutline}
          size={24}
          color={focused ? '#fff' : COLORS.textSecondary}
        />
      </Animated.View>
    </Pressable>
  );
});

// =============================================================================
// ANIMATED INDICATOR
// =============================================================================

type IndicatorProps = {
  activeIndex: number;
  prevIndex: number;
};

const AnimatedIndicator = React.memo(function AnimatedIndicator({
  activeIndex,
  prevIndex,
}: IndicatorProps) {
  const translateX = useSharedValue(activeIndex * TAB_WIDTH + INDICATOR_OFFSET);
  const scaleX = useSharedValue(1);

  useEffect(() => {
    const distance = Math.abs(activeIndex - prevIndex);
    
    // Stretch effect based on travel distance
    if (distance > 0) {
      scaleX.value = withSequence(
        withTiming(1 + distance * 0.12, { duration: 120, easing: EASING.smooth }),
        withSpring(1, { damping: 15, stiffness: 180 })
      );
    }

    // Move to new position
    translateX.value = withTiming(
      activeIndex * TAB_WIDTH + INDICATOR_OFFSET,
      { duration: 280, easing: EASING.bounce }
    );
  }, [activeIndex, prevIndex, translateX, scaleX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleX: scaleX.value },
    ],
  }));

  return <Animated.View style={[styles.indicator, animatedStyle]} />;
});

// =============================================================================
// CUSTOM TAB BAR
// =============================================================================

function CustomTabBar({ state, navigation }: any) {
  const prevIndexRef = useRef(0);

  const handlePress = (index: number, routeName: string, routeKey: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });

    if (state.index !== index && !event.defaultPrevented) {
      prevIndexRef.current = state.index;
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {/* Animated Indicator */}
        <AnimatedIndicator
          activeIndex={state.index}
          prevIndex={prevIndexRef.current}
        />

        {/* Tab Items */}
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const tabData = TABS.find((t) => t.name === route.name);

          return (
            <TabIcon
              key={route.key}
              icon={tabData?.icon as keyof typeof Ionicons.glyphMap}
              iconOutline={tabData?.iconOutline as keyof typeof Ionicons.glyphMap}
              focused={isFocused}
              onPress={() => handlePress(index, route.name, route.key)}
            />
          );
        })}
      </View>
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
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="trending" options={{ title: 'Trending' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 24,
    left: TAB_BAR_MARGIN,
    right: TAB_BAR_MARGIN,
  },

  tabBar: {
    height: 68,
    backgroundColor: COLORS.surface,
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },

  indicator: {
    position: 'absolute',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: COLORS.primary,
    top: (68 - INDICATOR_SIZE) / 2,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },

  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});