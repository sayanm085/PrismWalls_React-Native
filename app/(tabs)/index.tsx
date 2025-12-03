/**
 * =============================================================================
 * PRISMWALLS - Home Screen (With Working Favorites)
 * =============================================================================
 *
 * Features:
 * - Zustand favorites integration
 * - FlashList for 120 FPS
 * - Professional loading architecture
 * - Working heart button
 * - Animated header with search
 * - Banner carousel
 * - Category section
 * - Infinite scroll
 *
 * Author: PRISMWALLS Team
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

// Components
import { SectionHeader } from '@/src/components/common';
import {
  BannerCarousel,
  CategorySection,
  HomeHeader,
} from '@/src/components/home';
import { BottomNavBar } from '@/src/components/navigation';

// Data & Constants
import { COLORS } from '@/src/constants';
import { BANNERS, CATEGORIES } from '@/src/data/mockData';

// API
import { searchWallpapers } from '@/src/api/pexels';

// Store
import { useFavoritesStore } from '@/src/store/useFavoritesStore';

// Types & Constants
import { CACHE_TIMES } from '@/src/constants/apiKeys';
import { BannerItem, TabName } from '@/src/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2);
const MIN_CARD_HEIGHT = 180;
const MAX_CARD_HEIGHT = 300;

// Professional loading settings
const PER_PAGE = 10;
const MAX_PAGES = 30;
const DRAW_DISTANCE = SCREEN_HEIGHT * 0.5;

// Gradient
const CARD_GRADIENT: [string, string] = ['transparent', 'rgba(0,0,0,0.6)'];
const GRADIENT_LOCATIONS: [number, number] = [0.5, 1];

// =============================================================================
// TYPES
// =============================================================================

interface OptimizedWallpaper {
  id: string;
  imageUri: string;
  fullImageUri: string;
  photographer: string;
  cardHeight: number;
  avgColor: string;
  width: number;
  height: number;
}

// =============================================================================
// TRANSFORM: Pre-calculate everything
// =============================================================================

function transformToOptimized(photos: any[]): OptimizedWallpaper[] {
  return photos.map((photo) => {
    const aspectRatio = photo.width / photo.height;
    const calculatedHeight = Math.round(CARD_WIDTH / aspectRatio);
    const cardHeight = Math.max(MIN_CARD_HEIGHT, Math.min(calculatedHeight, MAX_CARD_HEIGHT));

    return {
      id: String(photo.id),
      imageUri: photo.src?.medium || photo.src?.small || '',
      fullImageUri: photo.src?.large2x || photo.src?.large || photo.src?.medium || '',
      photographer: photo.photographer || 'Unknown',
      cardHeight,
      avgColor: photo.avg_color || '#E2E8F0',
      width: photo.width || 1080,
      height: photo.height || 1920,
    };
  });
}

// =============================================================================
// WALLPAPER CARD (With Favorites)
// =============================================================================

const WallpaperCard = React.memo(
  function WallpaperCard({
    item,
    index,
    onPress,
    onFavoritePress,
    isFavorite,
  }: {
    item: OptimizedWallpaper;
    index: number;
    onPress: () => void;
    onFavoritePress: () => void;
    isFavorite: boolean;
  }) {
    const imagePriority = index < 6 ? 'high' : 'low';

    return (
      <Pressable
        onPress={onPress}
        style={[styles.card, { height: item.cardHeight }]}
        android_ripple={RIPPLE_CONFIG}
      >
        {/* Image */}
        <Image
          source={{ uri: item.imageUri }}
          style={[styles.cardImage, { backgroundColor: item.avgColor }]}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority={imagePriority}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={CARD_GRADIENT}
          locations={GRADIENT_LOCATIONS}
          style={styles.cardOverlay}
          pointerEvents="none"
        />

        {/* Photographer Name */}
        <View style={styles.cardInfo}>
          <Text style={styles.photographerName} numberOfLines={1}>
            {item.photographer}
          </Text>
        </View>

        {/* ✅ Favorite Button - Connected to Store */}
        <Pressable
          onPress={onFavoritePress}
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive,
          ]}
          hitSlop={HITSLOP}
          android_ripple={RIPPLE_LIGHT}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
          />
        </Pressable>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.index === next.index &&
    prev.isFavorite === next.isFavorite
);

// =============================================================================
// LOADING COMPONENT
// =============================================================================

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading wallpapers... </Text>
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

  // ✅ Zustand Favorites Store
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // ✅ Create a Set for O(1) lookup of favorites
  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((f) => f.id));
  }, [favorites]);

  // ==========================================================================
  // DATA FETCHING
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
  } = useInfiniteQuery({
    queryKey: ['home', 'curated'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchWallpapers(
        'beautiful wallpaper aesthetic',
        pageParam,
        PER_PAGE,
        'portrait'
      );

      return {
        wallpapers: transformToOptimized(response.photos),
        total_results: response.total_results,
        page: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length >= MAX_PAGES) return undefined;
      if (allPages.length * PER_PAGE >= lastPage.total_results) return undefined;
      return allPages.length + 1;
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.WALLPAPERS,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  // Flattened wallpapers
  const wallpapers = useMemo((): OptimizedWallpaper[] => {
    if (!data?.pages) return EMPTY_ARRAY;
    return data.pages.flatMap((page) => page.wallpapers);
  }, [data?.pages]);

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
      router.push('/viewer');
    },
    [router]
  );

  const handleCategoryPress = useCallback(
    (id?: string | number) => {
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
    (item: OptimizedWallpaper) => {
      router.push({
        pathname: '/viewer',
        params: { id: item.id },
      });
    },
    [router]
  );

  // ✅ Working Favorite Handler
  const handleFavoritePress = useCallback(
    (item: OptimizedWallpaper) => {
      toggleFavorite({
        id: item.id,
        imageUri: item.imageUri,
        fullImageUri: item.fullImageUri,
        photographer: item.photographer,
        avgColor: item.avgColor,
        width: item.width,
        height: item.height,
      });
    },
    [toggleFavorite]
  );

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

  const renderItem = useCallback(
    ({ item, index }: { item: OptimizedWallpaper; index: number }) => (
      <WallpaperCard
        item={item}
        index={index}
        onPress={() => handleWallpaperPress(item)}
        onFavoritePress={() => handleFavoritePress(item)}
        isFavorite={favoriteIds.has(item.id)}
      />
    ),
    [handleWallpaperPress, handleFavoritePress, favoriteIds]
  );

  const keyExtractor = useCallback((item: OptimizedWallpaper) => item.id, []);

  const overrideItemLayout = useCallback(
    (layout: { span?: number; size?: number }, item: OptimizedWallpaper) => {
      layout.size = item.cardHeight + CARD_GAP;
      layout.span = 1;
    },
    []
  );

  // List Header
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

  // List Footer
  const ListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerText}>Loading more... </Text>
        </View>
      );
    }

    if (!hasNextPage && wallpapers.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <Ionicons name="checkmark-done-circle" size={20} color={COLORS.primary} />
          <Text style={styles.footerText}>All {wallpapers.length} loaded</Text>
        </View>
      );
    }

    return <View style={styles.footerSpacer} />;
  }, [isFetchingNextPage, hasNextPage, wallpapers.length]);

  // Empty
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

      {/* FlashList with Favorites */}
      <FlashList
        data={wallpapers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        estimatedItemSize={220}
        estimatedListSize={ESTIMATED_LIST_SIZE}
        overrideItemLayout={overrideItemLayout}
        drawDistance={DRAW_DISTANCE}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        extraData={favoriteIds}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={REFRESH_COLORS}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

// =============================================================================
// STATIC CONSTANTS
// =============================================================================

const EMPTY_ARRAY: OptimizedWallpaper[] = [];
const REFRESH_COLORS = [COLORS.primary];
const ESTIMATED_LIST_SIZE = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
const RIPPLE_CONFIG = { color: 'rgba(0,0,0,0.1)', borderless: false };
const RIPPLE_LIGHT = { color: 'rgba(255,255,255,0.3)', borderless: true };
const HITSLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // List
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 100,
  },

  // Card
  card: {
    flex: 1,
    margin: CARD_GAP / 2,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  photographerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
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
  footerSpacer: {
    height: 20,
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