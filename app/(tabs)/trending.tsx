/**
 * =============================================================================
 * PRISMWALLS - Trending Screen (With Working Favorites)
 * =============================================================================
 *
 * Features:
 * - Zustand favorites integration
 * - FlashList for 120 FPS
 * - Professional loading architecture
 * - Working heart button
 * - Unsplash/Pinterest style loading
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
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Components
import { BottomNavBar } from '@/src/components/navigation';

// API
import { searchWallpapers } from '@/src/api/pexels';

// Store
import { useFavoritesStore } from '@/src/store/useFavoritesStore';

// Types & Constants
import { COLORS } from '@/src/constants';
import { CACHE_TIMES } from '@/src/constants/apiKeys';
import { TabName } from '@/src/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2);
const MIN_CARD_HEIGHT = 200;
const MAX_CARD_HEIGHT = 320;

// Professional loading settings
const PER_PAGE = 10;
const MAX_PAGES = 30;
const DRAW_DISTANCE = SCREEN_HEIGHT * 0.5;

// =============================================================================
// FILTER QUERIES
// =============================================================================

const FILTER_QUERIES: Readonly<Record<FilterType, string>> = {
  today: 'trending aesthetic wallpaper',
  week: 'popular beautiful wallpaper',
  month: 'best nature wallpaper HD',
  all: 'amazing landscape wallpaper',
} as const;

// =============================================================================
// STATIC DATA
// =============================================================================

const STATIC_STATS: ReadonlyArray<{ likes: string; downloads: string }> = [
  { likes: '15.2k', downloads: '9.3k' },
  { likes: '12.8k', downloads: '7.2k' },
  { likes: '11.9k', downloads: '6.7k' },
  { likes: '10.4k', downloads: '5.4k' },
  { likes: '9.2k', downloads: '4.8k' },
] as const;

const CARD_GRADIENT: [string, string, string] = [
  'transparent',
  'rgba(0,0,0,0.1)',
  'rgba(0,0,0,0.75)',
];

const GRADIENT_LOCATIONS: [number, number, number] = [0, 0.5, 1];

// =============================================================================
// TYPES
// =============================================================================

type FilterType = 'today' | 'week' | 'month' | 'all';

// ✅ Updated type with all required fields for favorites
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
      // Medium for grid (fast loading)
      imageUri: photo.src?.medium || photo.src?.small || '',
      // Large for viewer/favorites
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
// HELPER FUNCTIONS
// =============================================================================

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
};

const RANK_STYLES: Record<number, { textColor: string; bgColor: string; emoji: string }> = {
  1: { textColor: '#92400E', bgColor: '#FEF3C7', emoji: '🥇' },
  2: { textColor: '#475569', bgColor: '#F1F5F9', emoji: '🥈' },
  3: { textColor: '#9A3412', bgColor: '#FFEDD5', emoji: '🥉' },
};

const DEFAULT_RANK = { textColor: '#FFFFFF', bgColor: COLORS.primary, emoji: '' };

// =============================================================================
// TRENDING CARD (With Favorites)
// =============================================================================

const TrendingCard = React.memo(
  function TrendingCard({
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
    const rank = index + 1;
    const stats = STATIC_STATS[index % 5];
    const rankStyle = RANK_STYLES[rank] || DEFAULT_RANK;
    const isTopThree = rank <= 3;
    const imagePriority = index < 4 ? 'high' : 'low';

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

        {/* Rank Badge */}
        <View style={[styles.rankBadge, { backgroundColor: rankStyle.bgColor }]}>
          {isTopThree && <Text style={styles.rankEmoji}>{rankStyle.emoji}</Text>}
          <Text style={[styles.rankText, { color: rankStyle.textColor }]}>
            #{rank}
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
            size={20}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
          />
        </Pressable>

        {/* Bottom Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.photographer}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={12} color="#F87171" />
              <Text style={styles.statText}>{stats.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="arrow-down-circle" size={12} color="#4ADE80" />
              <Text style={styles.statText}>{stats.downloads}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.index === next.index &&
    prev.isFavorite === next.isFavorite
);

// =============================================================================
// FILTER TAB
// =============================================================================

const FilterTab = React.memo(
  function FilterTab({
    filter,
    label,
    icon,
    isActive,
    onPress,
  }: {
    filter: FilterType;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    isActive: boolean;
    onPress: (filter: FilterType) => void;
  }) {
    const handlePress = useCallback(() => onPress(filter), [filter, onPress]);

    return (
      <Pressable
        onPress={handlePress}
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        android_ripple={RIPPLE_CONFIG}
      >
        <Ionicons
          name={icon}
          size={14}
          color={isActive ? '#FFFFFF' : COLORS.textSecondary}
        />
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}
        </Text>
      </Pressable>
    );
  },
  (prev, next) => prev.isActive === next.isActive
);

// =============================================================================
// STATS HEADER
// =============================================================================

const StatsHeader = React.memo(function StatsHeader({
  totalResults,
  loadedCount,
}: {
  totalResults: number;
  loadedCount: number;
}) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Ionicons name="images-outline" size={22} color={COLORS.primary} />
        <Text style={styles.statBoxValue}>{formatNumber(totalResults)}</Text>
        <Text style={styles.statBoxLabel}>Found</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statBox}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#4ADE80" />
        <Text style={styles.statBoxValue}>{loadedCount}</Text>
        <Text style={styles.statBoxLabel}>Loaded</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statBox}>
        <Ionicons name="sparkles-outline" size={22} color="#FB923C" />
        <Text style={styles.statBoxValue}>HD</Text>
        <Text style={styles.statBoxLabel}>Quality</Text>
      </View>
    </View>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TrendingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('trending');
  const [activeFilter, setActiveFilter] = useState<FilterType>('today');

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
    queryKey: ['trending', activeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const query = FILTER_QUERIES[activeFilter];
      const response = await searchWallpapers(query, pageParam, PER_PAGE, 'portrait');

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
    gcTime: CACHE_TIMES.TRENDING,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  // ==========================================================================
  // DERIVED DATA
  // ==========================================================================

  const wallpapers = useMemo((): OptimizedWallpaper[] => {
    if (!data?.pages) return EMPTY_ARRAY;
    return data.pages.flatMap((page) => page.wallpapers);
  }, [data?.pages]);

  const totalResults = data?.pages?.[0]?.total_results ?? 0;

  // ==========================================================================
  // FOCUS EFFECT
  // ==========================================================================

  useFocusEffect(
    useCallback(() => {
      setActiveTab('trending');
    }, [])
  );

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleTabPress = useCallback(
    (tab: TabName) => {
      if (tab === 'trending') return;
      setActiveTab(tab);

      const routes: Record<TabName, string | null> = {
        home: '/',
        favorites: '/favorites',
        category: '/search',
        trending: null,
        settings: '/settings',
      };

      const route = routes[tab];
      if (route) router.push(route as any);
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

  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

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
      <TrendingCard
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

  // Header
  const ListHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <StatsHeader totalResults={totalResults} loadedCount={wallpapers.length} />
      </View>
    ),
    [totalResults, wallpapers.length]
  );

  // Footer
  const ListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }

    if (!hasNextPage && wallpapers.length > 0) {
      return (
        <View style={styles.footer}>
          <Ionicons name="checkmark-done-circle" size={24} color={COLORS.primary} />
          <Text style={styles.footerText}>All {wallpapers.length} loaded</Text>
        </View>
      );
    }

    return <View style={styles.footerSpacer} />;
  }, [isFetchingNextPage, hasNextPage, wallpapers.length]);

  // Empty
  const ListEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading trending...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="flame-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>No wallpapers found</Text>
        <Text style={styles.emptySubtitle}>Try a different filter</Text>
      </View>
    );
  }, [isLoading]);

  // ==========================================================================
  // ERROR STATE
  // ==========================================================================

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="flame" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Trending</Text>
          </View>
        </View>

        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.errorTitle}>Failed to load</Text>
          <Text style={styles.errorText}>{error?.message || 'Unknown error'}</Text>
          <Pressable style={styles.retryButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>

        <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="flame" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Trending</Text>
            <Text style={styles.headerSubtitle}>Most popular right now</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <FilterTab
          filter="today"
          label="Today"
          icon="sunny-outline"
          isActive={activeFilter === 'today'}
          onPress={handleFilterChange}
        />
        <FilterTab
          filter="week"
          label="Week"
          icon="calendar-outline"
          isActive={activeFilter === 'week'}
          onPress={handleFilterChange}
        />
        <FilterTab
          filter="month"
          label="Month"
          icon="calendar"
          isActive={activeFilter === 'month'}
          onPress={handleFilterChange}
        />
        <FilterTab
          filter="all"
          label="All"
          icon="infinite-outline"
          isActive={activeFilter === 'all'}
          onPress={handleFilterChange}
        />
      </View>

      {/* FlashList with extraData for favorites */}
      <FlashList
        data={wallpapers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        estimatedItemSize={260}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={REFRESH_COLORS}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
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

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 16,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statBoxLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Card
  card: {
    flex: 1,
    margin: CARD_GAP / 2,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  rankEmoji: {
    fontSize: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerSpacer: {
    height: 24,
  },

  // Center Container
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    gap: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});