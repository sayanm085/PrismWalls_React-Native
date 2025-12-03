/**
 * =============================================================================
 * PRISMWALLS - Favorites Screen (FIXED)
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Components
import { BottomNavBar } from '@/src/components/navigation';

// Store
import {
  useFavoritesStore,
  selectFavorites,
  selectIsHydrated,
  FavoriteWallpaper,
} from '@/src/store/useFavoritesStore';

// Types & Constants
import { COLORS } from '@/src/constants';
import { TabName } from '@/src/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2);
const MIN_CARD_HEIGHT = 180;
const MAX_CARD_HEIGHT = 280;

// Gradient
const CARD_GRADIENT: [string, string] = ['transparent', 'rgba(0,0,0,0.7)'];
const GRADIENT_LOCATIONS: [number, number] = [0.5, 1];

// =============================================================================
// TYPES
// =============================================================================

type SortType = 'recent' | 'oldest' | 'name';

// =============================================================================
// HELPER: Calculate card height
// =============================================================================

const calculateCardHeight = (width: number, height: number): number => {
  const aspectRatio = width / height;
  const calculatedHeight = Math.round(CARD_WIDTH / aspectRatio);
  return Math.max(MIN_CARD_HEIGHT, Math.min(calculatedHeight, MAX_CARD_HEIGHT));
};

// =============================================================================
// HELPER: Format date
// =============================================================================

function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// =============================================================================
// FAVORITE CARD COMPONENT
// =============================================================================

const FavoriteCard = React.memo(
  function FavoriteCard({
    item,
    index,
    onPress,
    onRemove,
  }: {
    item: FavoriteWallpaper;
    index: number;
    onPress: () => void;
    onRemove: () => void;
  }) {
    const cardHeight = calculateCardHeight(item.width, item.height);
    const imagePriority = index < 6 ? 'high' : 'low';

    return (
      <Pressable
        onPress={onPress}
        style={[styles.card, { height: cardHeight }]}
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

        {/* Remove Button */}
        <Pressable
          onPress={onRemove}
          style={styles.removeButton}
          hitSlop={HITSLOP}
          android_ripple={RIPPLE_LIGHT}
        >
          <Ionicons name="heart" size={20} color="#EF4444" />
        </Pressable>

        {/* Bottom Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.photographerName} numberOfLines={1}>
            {item.photographer}
          </Text>
          <Text style={styles.addedDate}>{formatDate(item.addedAt)}</Text>
        </View>
      </Pressable>
    );
  },
  (prev, next) => prev.item.id === next.item.id && prev.item.addedAt === next.item.addedAt
);

// =============================================================================
// SORT TAB COMPONENT (FIXED)
// =============================================================================

const SortTab = React.memo(
  function SortTab({
    label,
    isActive,
    onPress,
  }: {
    label: string;
    isActive: boolean;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.sortTab, isActive && styles.sortTabActive]}
        android_ripple={RIPPLE_CONFIG}
      >
        <Text style={[styles.sortText, isActive && styles.sortTextActive]}>
          {label}
        </Text>
      </Pressable>
    );
  }
  // ✅ REMOVED bad memo comparison - let it re-render on isActive change
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function FavoritesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('favorites');
  const [activeSort, setActiveSort] = useState<SortType>('recent');

  // ✅ FlashList ref for scrolling to top
  const listRef = useRef<FlashList<FavoriteWallpaper>>(null);

  // Zustand store
  const favorites = useFavoritesStore(selectFavorites);
  const isHydrated = useFavoritesStore(selectIsHydrated);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const clearAllFavorites = useFavoritesStore((state) => state.clearAllFavorites);

  // ==========================================================================
  // SORTED FAVORITES
  // ==========================================================================

  const sortedFavorites = useMemo(() => {
    const sorted = [...favorites];

    switch (activeSort) {
      case 'recent':
        return sorted.sort((a, b) => b.addedAt - a.addedAt);
      case 'oldest':
        return sorted.sort((a, b) => a.addedAt - b.addedAt);
      case 'name':
        return sorted.sort((a, b) => a.photographer.localeCompare(b.photographer));
      default:
        return sorted;
    }
  }, [favorites, activeSort]);

  // ==========================================================================
  // FOCUS EFFECT
  // ==========================================================================

  useFocusEffect(
    useCallback(() => {
      setActiveTab('favorites');
    }, [])
  );

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleTabPress = useCallback(
    (tab: TabName) => {
      if (tab === 'favorites') return;
      setActiveTab(tab);

      const routes: Record<TabName, string | null> = {
        home: '/',
        favorites: null,
        category: '/search',
        trending: '/trending',
        settings: '/settings',
      };

      const route = routes[tab];
      if (route) router.push(route as any);
    },
    [router]
  );

  const handleWallpaperPress = useCallback(
    (item: FavoriteWallpaper) => {
      router.push({
        pathname: '/viewer',
        params: { id: item.id },
      });
    },
    [router]
  );

  const handleRemoveFavorite = useCallback(
    (item: FavoriteWallpaper) => {
      Alert.alert(
        'Remove Favorite',
        `Remove "${item.photographer}" from favorites?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeFavorite(item.id),
          },
        ]
      );
    },
    [removeFavorite]
  );

  const handleClearAll = useCallback(() => {
    if (favorites.length === 0) return;

    Alert.alert(
      'Clear All Favorites',
      `Remove all ${favorites.length} favorites? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllFavorites,
        },
      ]
    );
  }, [favorites.length, clearAllFavorites]);

  // ✅ FIXED: Scroll to top when sort changes
  const handleSortChange = useCallback((sort: SortType) => {
    setActiveSort(sort);
    // Scroll to top after sort changes
    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  }, []);

  // ==========================================================================
  // RENDER FUNCTIONS
  // ==========================================================================

  const renderItem = useCallback(
    ({ item, index }: { item: FavoriteWallpaper; index: number }) => (
      <FavoriteCard
        item={item}
        index={index}
        onPress={() => handleWallpaperPress(item)}
        onRemove={() => handleRemoveFavorite(item)}
      />
    ),
    [handleWallpaperPress, handleRemoveFavorite]
  );

  const keyExtractor = useCallback((item: FavoriteWallpaper) => item.id, []);

  const overrideItemLayout = useCallback(
    (layout: { span?: number; size?: number }, item: FavoriteWallpaper) => {
      layout.size = calculateCardHeight(item.width, item.height) + CARD_GAP;
      layout.span = 1;
    },
    []
  );

  // Header
  const ListHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.countText}>
          {sortedFavorites.length} {sortedFavorites.length === 1 ? 'favorite' : 'favorites'}
        </Text>
      </View>
    ),
    [sortedFavorites.length]
  );

  // Empty
  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="heart-outline" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the heart icon on any wallpaper to save it here
        </Text>
        <Pressable
          style={styles.exploreButton}
          onPress={() => router.push('/')}
          android_ripple={RIPPLE_CONFIG}
        >
          <Ionicons name="compass-outline" size={20} color="#FFFFFF" />
          <Text style={styles.exploreButtonText}>Explore Wallpapers</Text>
        </Pressable>
      </View>
    ),
    [router]
  );

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </View>
    );
  }

  // ==========================================================================
  // MAIN RENDER
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

        <Text style={styles.headerTitle}>Favorites</Text>

        <Pressable
          style={[
            styles.headerButton,
            favorites.length === 0 && styles.headerButtonDisabled,
          ]}
          onPress={handleClearAll}
          android_ripple={favorites.length > 0 ?  RIPPLE_CONFIG : undefined}
          disabled={favorites.length === 0}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={favorites.length > 0 ? COLORS.primary : '#CBD5E1'}
          />
        </Pressable>
      </View>

      {/* ✅ FIXED Sort Tabs - Always show all 3 with proper labels */}
      {favorites.length > 0 && (
        <View style={styles.sortContainer}>
          <SortTab
            label="Recent"
            isActive={activeSort === 'recent'}
            onPress={() => handleSortChange('recent')}
          />
          <SortTab
            label="Oldest"
            isActive={activeSort === 'oldest'}
            onPress={() => handleSortChange('oldest')}
          />
          <SortTab
            label="Name"
            isActive={activeSort === 'name'}
            onPress={() => handleSortChange('name')}
          />
        </View>
      )}

      {/* Favorites Grid */}
      <FlashList
        ref={listRef}
        data={sortedFavorites}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        estimatedItemSize={220}
        estimatedListSize={ESTIMATED_LIST_SIZE}
        overrideItemLayout={overrideItemLayout}
        ListHeaderComponent={sortedFavorites.length > 0 ? ListHeader : null}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        extraData={activeSort}
      />

      {/* Bottom Navigation */}
      {/* <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} /> */}
    </View>
  );
}

// =============================================================================
// STATIC CONSTANTS
// =============================================================================

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

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
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
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // ✅ FIXED Sort Tabs Styles
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  sortTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortTabActive: {
    backgroundColor: COLORS.primary,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sortTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 120,
  },
  listHeader: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 14,
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
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  photographerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  addedDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});