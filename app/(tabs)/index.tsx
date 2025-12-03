/**
 * =============================================================================
 * WALLPERS - Home Screen (Optimized with FlashList)
 * =============================================================================
 *
 * Main home screen with:
 * - Animated header with search
 * - Banner carousel with pagination
 * - Category horizontal list
 * - Optimized masonry grid (FlashList)
 * - Infinite scroll with pull-to-refresh
 * - Memory-efficient rendering
 *
 * Author: WALLPERS Team
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

// Components
import { OptimizedMasonryList, SectionHeader } from '@/src/components/common';
import {
  AnimatedWallpaperCard,
  BannerCarousel,
  CategorySection,
  HomeHeader,
} from '@/src/components/home';

// Data & Constants
import { COLORS, LAYOUT } from '@/src/constants';
import { BANNERS, CATEGORIES } from '@/src/data/mockData';

// Hooks
import {
  useCuratedWallpapersInfinite,
  getFlattenedWallpapers,
} from '@/src/hooks';

// Types
import { BannerItem, CategoryItem, TabName, WallpaperItem } from '@/src/types';

// =============================================================================
// LOADING COMPONENT
// =============================================================================

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading wallpapers...</Text>
  </View>
);

// =============================================================================
// ERROR COMPONENT
// =============================================================================

type ErrorViewProps = {
  message: string;
  onRetry: () => void;
};

const ErrorView = ({ message, onRetry }: ErrorViewProps) => (
  <View style={styles.errorContainer}>
    <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textSecondary} />
    <Text style={styles.errorText}>{message}</Text>
    <Pressable onPress={onRetry} style={styles.retryButton}>
      <Text style={styles.retryButtonText}>Try Again</Text>
    </Pressable>
  </View>
);

// =============================================================================
// HOME SCREEN
// =============================================================================

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const scrollY = useSharedValue(0);

  // ==========================================================================
  // API DATA FETCHING
  // ==========================================================================

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useCuratedWallpapersInfinite(20);

  // Get flattened wallpapers array from paginated data
  const wallpapers = useMemo(() => getFlattenedWallpapers(data), [data]);

  // ==========================================================================
  // FOCUS EFFECT
  // ==========================================================================

  useFocusEffect(
    useCallback(() => {
      setActiveTab('home');
    }, [])
  );

  // ==========================================================================
  // ANIMATED STYLES
  // ==========================================================================

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95],
      Extrapolation.CLAMP
    ),
  }));

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

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

  const handleSearchPress = useCallback(() => {
    router.push('/search');
  }, [router]);

  const handleBannerPress = useCallback(
    (item: BannerItem) => {
      console.log('Banner pressed:', item.id);
      router.push('/viewer');
    },
    [router]
  );

  const handleCategoryPress = useCallback(
    (id?: string | number) => {
      console.log('Category pressed:', id);
      const category = CATEGORIES.find((c) => c.id === id);
      if (category) {
        router.push({
          pathname: '/search',
          params: { category: category.title },
        });
      }
    },
    [router]
  );

  const handleWallpaperPress = useCallback(
    (item: WallpaperItem) => {
      console.log('Wallpaper pressed:', item.id);
      router.push({
        pathname: '/viewer',
        params: { id: item.id },
      });
    },
    [router]
  );

  const handleToggleFavorite = useCallback((item: WallpaperItem) => {
    console.log('Toggle favorite:', item.id);
    // TODO: Implement with state management
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = event.nativeEvent.contentOffset.y;
    },
    [scrollY]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // ==========================================================================
  // RENDER FUNCTIONS
  // ==========================================================================

  /**
   * Render single wallpaper item
   * Used by OptimizedMasonryList
   */
  const renderWallpaperItem = useCallback(
    (item: WallpaperItem, index: number) => (
      <AnimatedWallpaperCard
        item={item}
        index={index}
        onPress={handleWallpaperPress}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [handleWallpaperPress, handleToggleFavorite]
  );

  /**
   * List header component (memoized)
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

  /**
   * List footer component (loading indicator)
   */
  const ListFooter = useMemo(
    () =>
      isFetchingNextPage ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerText}>Loading more... </Text>
        </View>
      ) : null,
    [isFetchingNextPage]
  );

  /**
   * Empty state component
   */
  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={48} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No wallpapers found</Text>
      </View>
    ),
    []
  );

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        {ListHeader}
        <LoadingView />
      </View>
    );
  }

  // ==========================================================================
  // ERROR STATE
  // ==========================================================================

  if (isError) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        {ListHeader}
        <ErrorView
          message={error?.message || 'Failed to load wallpapers'}
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Optimized Masonry Grid with FlashList */}
      <OptimizedMasonryList
        data={wallpapers}
        renderItem={renderWallpaperItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        isRefreshing={isRefetching}
        onScroll={handleScroll}
      />

      {/* Bottom Navigation */}
      {/* <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} /> */}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Footer
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});