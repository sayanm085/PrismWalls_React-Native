/**
 * =============================================================================
 * WALLPERS - Home Screen
 * =============================================================================
 * 
 * Main home screen with:
 * - Animated header with search
 * - Banner carousel with pagination
 * - Category horizontal list
 * - Masonry grid of wallpapers
 * - Persistent bottom navigation
 * 
 * Author: WALLPERS Team
 * =============================================================================
 */

import MasonryList from '@react-native-seoul/masonry-list';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

// Components
import { SectionHeader } from '@/src/components/common';
import {
  AnimatedWallpaperCard,
  BannerCarousel,
  CategorySection,
  HomeHeader,
} from '@/src/components/home';

// Data & Constants
import { COLORS, LAYOUT } from '@/src/constants';
import { BANNERS, CATEGORIES, WALLPAPERS } from '@/src/data/mockData';
import { BannerItem, TabName, WallpaperItem } from '@/src/types';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const scrollY = useSharedValue(0);

  /**
   * Reset tab to 'home' when this screen is focused
   * This runs every time user comes back to this screen
   */
  useFocusEffect(
    useCallback(() => {
      setActiveTab('home');
    }, [])
  );

  /**
   * Animated header opacity on scroll
   */
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95],
      Extrapolation.CLAMP
    ),
  }));

  /**
   * Handle bottom tab navigation
   */
  const handleTabPress = useCallback(
    (tab: TabName) => {
      if (tab === 'home') {
        setActiveTab('home');
        return;
      }

      setActiveTab(tab);

      const routes: Record<TabName, string | null> = {
        home: null,
        favorites: '/favorites',
        category: '/search',
        trending: '/trending',
        settings: '/settings',
      };

      const route = routes[tab];
      if (route) {
        router.push(route as any);
      }
    },
    [router]
  );

  /**
   * Handle search button press
   */
  const handleSearchPress = useCallback(() => {
    router. push('/search');
  }, [router]);

  /**
   * Handle banner press
   */
  const handleBannerPress = useCallback(
    (item: BannerItem) => {
      console.log('Banner pressed:', item.id);
      router. push('/viewer');
    },
    [router]
  );

  /**
   * Handle category press
   */
  const handleCategoryPress = useCallback(
    (id?: string | number) => {
      console.log('Category pressed:', id);
      router.push('/search');
    },
    [router]
  );

  /**
   * Handle wallpaper press
   */
  const handleWallpaperPress = useCallback(
    (item: WallpaperItem) => {
      console.log('Wallpaper pressed:', item.id);
      router.push('/viewer');
    },
    [router]
  );

  /**
   * Handle favorite toggle
   */
  const handleToggleFavorite = useCallback((item: WallpaperItem) => {
    console.log('Toggle favorite:', item.id);
    // TODO: Implement with state management
  }, []);

  /**
   * Handle scroll for header animation
   */
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY. value = event.nativeEvent.contentOffset.y;
    },
    [scrollY]
  );

  /**
   * Render wallpaper item in masonry grid
   */
  const renderWallpaperItem = useCallback(
    ({ item, i }: { item: unknown; i: number }) => (
      <AnimatedWallpaperCard
        item={item as WallpaperItem}
        index={i}
        onPress={handleWallpaperPress}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [handleWallpaperPress, handleToggleFavorite]
  );

  /**
   * List header component (memoized for performance)
   */
  const ListHeader = useMemo(
    () => (
      <View>
        <HomeHeader
          onSearchPress={handleSearchPress}
          animatedStyle={animatedHeaderStyle}
        />
        <BannerCarousel data={BANNERS} onBannerPress={handleBannerPress} />
        <CategorySection
          data={CATEGORIES}
          onCategoryPress={handleCategoryPress}
        />
        <SectionHeader title="Explore" delay={350} />
      </View>
    ),
    [animatedHeaderStyle, handleSearchPress, handleBannerPress, handleCategoryPress]
  );

  return (
    <View style={styles. container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Masonry Grid */}
      <MasonryList
        data={WALLPAPERS}
        keyExtractor={(item) => (item as WallpaperItem).id}
        numColumns={LAYOUT.COLUMNS}
        renderItem={renderWallpaperItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Bottom Navigation */}
      {/* <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: LAYOUT.PADDING,
    paddingBottom: LAYOUT.NAV_HEIGHT + 50,
  },
});