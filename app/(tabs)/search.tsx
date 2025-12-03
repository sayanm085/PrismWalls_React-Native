/**
 * =============================================================================
 * PRISMWALLS - Search Screen (With Working Favorites)
 * =============================================================================
 *
 * Features:
 * - Zustand favorites integration
 * - FlashList for 120 FPS
 * - Professional loading architecture
 * - Working heart button
 *
 * Author: PRISMWALLS Team
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
const MIN_CARD_HEIGHT = 180;
const MAX_CARD_HEIGHT = 300;

// Professional loading settings
const PER_PAGE = 10;
const MAX_PAGES = 30;
const DRAW_DISTANCE = SCREEN_HEIGHT * 0.5;
const DEBOUNCE_DELAY = 400;

// Storage
const STORAGE_KEY = '@prismwalls_recent_searches';
const MAX_RECENT_SEARCHES = 20;

// =============================================================================
// CATEGORIES DATA
// =============================================================================

const CATEGORIES: ReadonlyArray<CategoryItem> = [
  { id: '1', name: 'Abstract', icon: 'shapes-outline', color: '#8B5CF6', query: 'abstract art' },
  { id: '2', name: 'Nature', icon: 'leaf-outline', color: '#22C55E', query: 'nature landscape' },
  { id: '3', name: 'Animals', icon: 'paw-outline', color: '#F97316', query: 'wild animals' },
  { id: '4', name: 'Space', icon: 'planet-outline', color: '#3B82F6', query: 'galaxy space' },
  { id: '5', name: 'Anime', icon: 'star-outline', color: '#EC4899', query: 'anime art' },
  { id: '6', name: 'Cars', icon: 'car-sport-outline', color: '#EF4444', query: 'luxury cars' },
  { id: '7', name: 'Music', icon: 'musical-notes-outline', color: '#14B8A6', query: 'music aesthetic' },
  { id: '8', name: 'Games', icon: 'game-controller-outline', color: '#6366F1', query: 'gaming setup' },
  { id: '9', name: 'Minimal', icon: 'remove-outline', color: '#64748B', query: 'minimal aesthetic' },
  { id: '10', name: 'Dark', icon: 'moon-outline', color: '#1E293B', query: 'dark moody' },
  { id: '11', name: 'Ocean', icon: 'water-outline', color: '#0EA5E9', query: 'ocean waves' },
  { id: '12', name: 'Mountain', icon: 'triangle-outline', color: '#78716C', query: 'mountain peaks' },
] as const;

const TRENDING_SEARCHES: ReadonlyArray<string> = [
  'Aesthetic',
  'Dark mode',
  'Sunset',
  'Nature',
  'Abstract',
  'Minimal',
  'Neon',
  'Gradient',
] as const;

// Gradient
const CARD_GRADIENT: [string, string] = ['transparent', 'rgba(0,0,0,0.6)'];
const GRADIENT_LOCATIONS: [number, number] = [0.5, 1];

// =============================================================================
// TYPES
// =============================================================================

type CategoryItem = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  query: string;
};

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
    const aspectRatio = photo. width / photo.height;
    const calculatedHeight = Math.round(CARD_WIDTH / aspectRatio);
    const cardHeight = Math.max(MIN_CARD_HEIGHT, Math. min(calculatedHeight, MAX_CARD_HEIGHT));

    return {
      id: String(photo.id),
      // Medium for grid (fast loading)
      imageUri: photo.src?. medium || photo.src?. small || '',
      // Large for viewer/favorites
      fullImageUri: photo.src?. large2x || photo.src?. large || photo.src?.medium || '',
      photographer: photo.photographer || 'Unknown',
      cardHeight,
      avgColor: photo. avg_color || '#E2E8F0',
      width: photo.width || 1080,
      height: photo.height || 1920,
    };
  });
}

// =============================================================================
// CUSTOM HOOK: Debounced Value
// =============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// CUSTOM HOOK: Recent Searches
// =============================================================================

function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage. getItem(STORAGE_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  };

  const addRecentSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (! trimmed) return;

    setRecentSearches((prev) => {
      const updated = [
        trimmed,
        ... prev.filter((item) => item. toLowerCase() !== trimmed. toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)). catch(() => {});
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(STORAGE_KEY). catch(() => {});
  }, []);

  const removeRecentSearch = useCallback(async (query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== query.toLowerCase());
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  return { recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch };
}

// =============================================================================
// RESULT CARD COMPONENT (With Favorites)
// =============================================================================

const ResultCard = React.memo(
  function ResultCard({
    item,
    index,
    onPress,
    onFavorite,
    isFavorite,
  }: {
    item: OptimizedWallpaper;
    index: number;
    onPress: () => void;
    onFavorite: () => void;
    isFavorite: boolean;
  }) {
    const imagePriority = index < 4 ? 'high' : 'low';

    return (
      <Pressable
        onPress={onPress}
        style={[styles.resultCard, { height: item.cardHeight }]}
        android_ripple={RIPPLE_CONFIG}
      >
        {/* Image */}
        <Image
          source={{ uri: item.imageUri }}
          style={[styles.resultImage, { backgroundColor: item.avgColor }]}
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
          <Text style={styles. photographerName} numberOfLines={1}>
            {item. photographer}
          </Text>
        </View>

        {/* ✅ Favorite Button - Connected to Store */}
        <Pressable
          onPress={onFavorite}
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
            color={isFavorite ?  '#EF4444' : '#FFFFFF'}
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
// CATEGORY CARD COMPONENT
// =============================================================================

const CategoryCard = React.memo(
  function CategoryCard({
    item,
    onPress,
  }: {
    item: CategoryItem;
    onPress: () => void;
  }) {
    return (
      <Pressable
        style={styles.categoryCard}
        onPress={onPress}
        android_ripple={RIPPLE_CONFIG}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item. icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item. name}
        </Text>
      </Pressable>
    );
  },
  (prev, next) => prev.item.id === next.item.id
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SearchScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  // Debounce
  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Recent searches
  const {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  } = useRecentSearches();

  // ✅ Zustand Favorites Store
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Is searching
  const isSearching = activeSearchQuery.length > 0;

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['search', activeSearchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchWallpapers(
        activeSearchQuery,
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
      if (allPages. length * PER_PAGE >= lastPage. total_results) return undefined;
      return allPages.length + 1;
    },
    enabled: activeSearchQuery.length >= 2,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.WALLPAPERS,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  // Flattened wallpapers
  const wallpapers = useMemo((): OptimizedWallpaper[] => {
    if (!data?. pages) return EMPTY_ARRAY;
    return data.pages.flatMap((page) => page.wallpapers);
  }, [data?.pages]);

  const totalResults = data?.pages?.[0]?.total_results ?? 0;

  // ✅ Create a Set for O(1) lookup of favorites
  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((f) => f.id));
  }, [favorites]);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    if (debouncedQuery. trim(). length >= 2) {
      setActiveSearchQuery(debouncedQuery. trim());
      addRecentSearch(debouncedQuery. trim());
    } else if (debouncedQuery. length === 0) {
      setActiveSearchQuery('');
    }
  }, [debouncedQuery, addRecentSearch]);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('category');
    }, [])
  );

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleTabPress = useCallback(
    (tab: TabName) => {
      if (tab === 'category') return;
      setActiveTab(tab);

      const routes: Record<TabName, string | null> = {
        home: '/',
        favorites: '/favorites',
        category: null,
        trending: '/trending',
        settings: '/settings',
      };

      const route = routes[tab];
      if (route) router.push(route as any);
    },
    [router]
  );

  const handleSearchInput = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setActiveSearchQuery('');
    Keyboard.dismiss();
  }, []);

  const handleRecentSearchPress = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setActiveSearchQuery(query);
      addRecentSearch(query);
      Keyboard.dismiss();
    },
    [addRecentSearch]
  );

  const handleTrendingPress = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setActiveSearchQuery(query);
      addRecentSearch(query);
      Keyboard.dismiss();
    },
    [addRecentSearch]
  );

  const handleCategoryPress = useCallback(
    (category: CategoryItem) => {
      setSearchQuery(category.name);
      setActiveSearchQuery(category. query);
      addRecentSearch(category. name);
      Keyboard.dismiss();
    },
    [addRecentSearch]
  );

  const handleWallpaperPress = useCallback(
    (item: OptimizedWallpaper) => {
      router.push({
        pathname: '/viewer',
        params: { id: item. id },
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
        fullImageUri: item. fullImageUri,
        photographer: item. photographer,
        avgColor: item.avgColor,
        width: item.width,
        height: item.height,
      });
    },
    [toggleFavorite]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSubmitSearch = useCallback(() => {
    if (searchQuery. trim().length >= 2) {
      setActiveSearchQuery(searchQuery.trim());
      addRecentSearch(searchQuery.trim());
      Keyboard.dismiss();
    }
  }, [searchQuery, addRecentSearch]);

  // ==========================================================================
  // RENDER FUNCTIONS
  // ==========================================================================

  const renderResultItem = useCallback(
    ({ item, index }: { item: OptimizedWallpaper; index: number }) => (
      <ResultCard
        item={item}
        index={index}
        onPress={() => handleWallpaperPress(item)}
        onFavorite={() => handleFavoritePress(item)}
        isFavorite={favoriteIds. has(item.id)}
      />
    ),
    [handleWallpaperPress, handleFavoritePress, favoriteIds]
  );

  const keyExtractor = useCallback((item: OptimizedWallpaper) => item.id, []);

  const overrideItemLayout = useCallback(
    (layout: { span?: number; size?: number }, item: OptimizedWallpaper) => {
      layout.size = item.cardHeight + CARD_GAP;
      layout. span = 1;
    },
    []
  );

  const renderCategoryItem = useCallback(
    ({ item }: { item: CategoryItem }) => (
      <CategoryCard item={item} onPress={() => handleCategoryPress(item)} />
    ),
    [handleCategoryPress]
  );

  // List Header
  const ListHeader = useMemo(
    () => (
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {totalResults > 0 ?  `${totalResults. toLocaleString()} results` : 'Searching...'}
        </Text>
      </View>
    ),
    [totalResults]
  );

  // List Footer
  const ListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles. footerText}>Loading more...</Text>
        </View>
      );
    }

    if (! hasNextPage && wallpapers.length > 0) {
      return (
        <View style={styles.footer}>
          <Ionicons name="checkmark-done-circle" size={20} color={COLORS.primary} />
          <Text style={styles.footerText}>All {wallpapers.length} loaded</Text>
        </View>
      );
    }

    return <View style={styles. footerSpacer} />;
  }, [isFetchingNextPage, hasNextPage, wallpapers.length]);

  // Empty Component
  const ListEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles. centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="search-outline" size={50} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles. emptySubtitle}>Try different keywords</Text>
      </View>
    );
  }, [isLoading]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => router.back()}
          android_ripple={RIPPLE_CONFIG}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Search</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles. searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search wallpapers..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearchInput}
            onSubmitEditing={handleSubmitSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery. length > 0 && (
            <Pressable onPress={handleClearSearch} hitSlop={HITSLOP}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {! isSearching ?  (
        // Browse Mode
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleWithHeader}>Recent</Text>
                <Pressable onPress={clearRecentSearches} hitSlop={HITSLOP}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              </View>
              {recentSearches. slice(0, 5).map((item, index) => (
                <Pressable
                  key={`recent-${index}`}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearchPress(item)}
                  android_ripple={RIPPLE_CONFIG}
                >
                  <Ionicons name="time-outline" size={18} color="#94A3B8" />
                  <Text style={styles.recentText} numberOfLines={1}>
                    {item}
                  </Text>
                  <Pressable
                    onPress={() => removeRecentSearch(item)}
                    hitSlop={HITSLOP}
                  >
                    <Ionicons name="close" size={18} color="#94A3B8" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}

          {/* Trending Searches */}
          <View style={styles. section}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <View style={styles.tagsContainer}>
              {TRENDING_SEARCHES.map((item, index) => (
                <Pressable
                  key={`trending-${index}`}
                  style={styles.tag}
                  onPress={() => handleTrendingPress(item)}
                  android_ripple={RIPPLE_CONFIG}
                >
                  <Ionicons name="trending-up" size={14} color={COLORS.primary} />
                  <Text style={styles. tagText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={CATEGORIES as CategoryItem[]}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item. id}
              numColumns={4}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesGrid}
            />
          </View>
        </ScrollView>
      ) : (
        // Results Mode
        <View style={styles.resultsContainer}>
          {isError ? (
            <View style={styles.centerContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color="#94A3B8" />
              <Text style={styles.errorText}>Failed to load</Text>
              <Pressable style={styles.retryButton} onPress={handleRefresh}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <FlashList
              data={wallpapers}
              renderItem={renderResultItem}
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
              contentContainerStyle={styles.resultsGrid}
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
          )}
        </View>
      )}

      {/* Bottom Navigation */}
      {/* <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} /> */}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
    marginRight: 8,
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 120,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionTitleWithHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Recent Searches
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  recentText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: 12,
    marginRight: 12,
  },

  // Trending Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Categories Grid
  categoriesGrid: {
    marginTop: 4,
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 16,
    maxWidth: '25%',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Results
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  resultsGrid: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 120,
  },

  // Result Card
  resultCard: {
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
  resultImage: {
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

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerSpacer: {
    height: 20,
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
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});