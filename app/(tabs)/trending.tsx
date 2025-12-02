/**
 * =============================================================================
 * WALLPERS - Trending Screen
 * =============================================================================
 * 
 * Shows trending/popular wallpapers sorted by likes
 * Features: Time filter tabs, Rank badges, Like counts, Grid layout
 * 
 * Author: WALLPERS Team
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { COLORS } from '../../src/constants';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// =============================================================================
// DEMO DATA
// =============================================================================

const trendingWallpapers = [
  { 
    id: '1', 
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    title: 'Mystic Mountains',
    likes: '12.5k',
    downloads: '8.2k',
    category: 'Nature'
  },
  { 
    id: '2', 
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    title: 'Snow Peaks',
    likes: '9.8k',
    downloads: '6.1k',
    category: 'Nature'
  },
  { 
    id: '3', 
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
    title: 'Aurora Dreams',
    likes: '8.2k',
    downloads: '5.4k',
    category: 'Nature'
  },
  { 
    id: '4', 
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
    title: 'Golden Hour',
    likes: '7.5k',
    downloads: '4.9k',
    category: 'Travel'
  },
  { 
    id: '5', 
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400',
    title: 'Desert Sunset',
    likes: '6.9k',
    downloads: '4.2k',
    category: 'Nature'
  },
  { 
    id: '6', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    title: 'Minimal Desk',
    likes: '5.4k',
    downloads: '3.8k',
    category: 'Minimal'
  },
  { 
    id: '7', 
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
    title: 'Starry Night',
    likes: '4.8k',
    downloads: '3.2k',
    category: 'Space'
  },
  { 
    id: '8', 
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400',
    title: 'Lake Reflection',
    likes: '3.2k',
    downloads: '2.1k',
    category: 'Nature'
  },
  { 
    id: '9', 
    image: 'https://images.unsplash.com/photo-1518173946687-a4c036bc6c95?w=400',
    title: 'Desert Road',
    likes: '2.9k',
    downloads: '1.8k',
    category: 'Travel'
  },
  { 
    id: '10', 
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    title: 'Foggy Hills',
    likes: '2.5k',
    downloads: '1.5k',
    category: 'Nature'
  },
  { 
    id: '11', 
    image: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400',
    title: 'Ocean Waves',
    likes: '2.1k',
    downloads: '1.2k',
    category: 'Nature'
  },
  { 
    id: '12', 
    image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400',
    title: 'Waterfall',
    likes: '1.8k',
    downloads: '980',
    category: 'Nature'
  },
];

// =============================================================================
// TYPES
// =============================================================================

type TrendingItem = {
  id: string;
  image: string;
  title: string;
  likes: string;
  downloads: string;
  category: string;
};

type FilterType = 'today' | 'week' | 'month' | 'all';

// =============================================================================
// TRENDING CARD COMPONENT
// =============================================================================

const TrendingCard = React.memo(function TrendingCard({
  item,
  index,
  onPress,
  onFavoritePress,
}: {
  item: TrendingItem;
  index: number;
  onPress: () => void;
  onFavoritePress: () => void;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoritePress = useCallback(() => {
    setIsFavorite(!isFavorite);
    onFavoritePress();
  }, [isFavorite, onFavoritePress]);

  // Get rank badge color based on position
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return COLORS.primary;
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'timing',
        duration: 350,
        delay: index * 50,
      }}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Wallpaper Image */}
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />

        {/* Gradient Overlay */}
        <View style={styles.cardOverlay} />

        {/* Rank Badge */}
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(index + 1) }]}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={handleFavoritePress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#EF4444' : '#fff'}
          />
        </TouchableOpacity>

        {/* Card Info */}
        <View style={styles.cardInfo}>
          {/* Category Tag */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Likes */}
            <View style={styles.statItem}>
              <Ionicons name="heart" size={12} color="#EF4444" />
              <Text style={styles.statText}>{item.likes}</Text>
            </View>

            {/* Downloads */}
            <View style={styles.statItem}>
              <Ionicons name="download" size={12} color="#22C55E" />
              <Text style={styles.statText}>{item.downloads}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
});

// =============================================================================
// FILTER TAB COMPONENT
// =============================================================================

const FilterTab = React.memo(function FilterTab({
  filter,
  label,
  isActive,
  onPress,
}: {
  filter: FilterType;
  label: string;
  isActive: boolean;
  onPress: (filter: FilterType) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterTab, isActive && styles.filterTabActive]}
      onPress={() => onPress(filter)}
      activeOpacity={0.8}
    >
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TrendingScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('today');

  /**
   * Handle wallpaper press - navigate to viewer
   */
  const handleWallpaperPress = useCallback((item: TrendingItem) => {
    console.log('Trending wallpaper pressed:', item.id);
    router.push('/viewer');
  }, [router]);

  /**
   * Handle favorite press
   */
  const handleFavoritePress = useCallback((item: TrendingItem) => {
    console.log('Toggle favorite:', item.id);
    // TODO: Implement with state management
  }, []);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    // TODO: Fetch data based on filter
  }, []);

  /**
   * Render trending item
   */
  const renderItem = useCallback(
    ({ item, index }: { item: TrendingItem; index: number }) => (
      <TrendingCard
        item={item}
        index={index}
        onPress={() => handleWallpaperPress(item)}
        onFavoritePress={() => handleFavoritePress(item)}
      />
    ),
    [handleWallpaperPress, handleFavoritePress]
  );

  /**
   * Render list header
   */
  const ListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>12.5k</Text>
            <Text style={styles.statBoxLabel}>Total Likes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>8.2k</Text>
            <Text style={styles.statBoxLabel}>Downloads</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>156</Text>
            <Text style={styles.statBoxLabel}>New Today</Text>
          </View>
        </View>
      </View>
    ),
    []
  );

  /**
   * Render empty state
   */
  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          style={styles.emptyIconContainer}
        >
          <Ionicons name="flame-outline" size={60} color={COLORS.primary} />
        </MotiView>
        <Text style={styles.emptyTitle}>No trending wallpapers</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for popular wallpapers
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      {/* ===================================================================
          HEADER
          =================================================================== */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', delay: 100 }}
        style={styles.header}
      >
        <View style={styles.headerTitleRow}>
          <View style={styles.fireIconContainer}>
            <Ionicons name="flame" size={24} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Trending</Text>
        </View>
        <Text style={styles.headerSubtitle}>Most popular wallpapers right now</Text>
      </MotiView>

      {/* ===================================================================
          FILTER TABS
          =================================================================== */}
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'spring', delay: 200 }}
        style={styles.filterContainer}
      >
        <FilterTab
          filter="today"
          label="Today"
          isActive={activeFilter === 'today'}
          onPress={handleFilterChange}
        />
        <FilterTab
          filter="week"
          label="This Week"
          isActive={activeFilter === 'week'}
          onPress={handleFilterChange}
        />
        <FilterTab
          filter="month"
          label="This Month"
          isActive={activeFilter === 'month'}
          onPress={handleFilterChange}
        />
        <FilterTab
          filter="all"
          label="All Time"
          isActive={activeFilter === 'all'}
          onPress={handleFilterChange}
        />
      </MotiView>

      {/* ===================================================================
          TRENDING GRID
          =================================================================== */}
      <FlatList
        data={trendingWallpapers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
      />
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

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  fireIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginLeft: 56,
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
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
    color: '#fff',
  },

  // List Header
  listHeader: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statBoxValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },

  statBoxLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Grid
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    margin: 6,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  rankBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },

  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },

  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    lineHeight: 20,
  },
});