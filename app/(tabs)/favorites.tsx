/**
 * =============================================================================
 * WALLPERS - Favorites Screen
 * =============================================================================
 * 
 * Shows user's favorite wallpapers and ringtones
 * Features: Filter tabs, Grid layout, Empty state
 * 
 * Author: WALLPERS Team
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Components

// Types & Constants
import { COLORS } from '@/src/constants';
import { TabName } from '@/src/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// =============================================================================
// DEMO DATA
// =============================================================================

const favoriteItems = [
  { id: '1', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300', type: 'wallpaper', title: 'Mountain Sunset' },
  { id: '2', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300', type: 'wallpaper', title: 'Ocean Waves' },
  { id: '3', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300', type: 'ringtone', title: 'Summer Vibes', color: '#8B5CF6' },
  { id: '4', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300', type: 'wallpaper', title: 'Night Sky' },
  { id: '5', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=300', type: 'ringtone', title: 'Chill Beat', color: '#F97316' },
  { id: '6', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', type: 'wallpaper', title: 'Forest Path' },
  { id: '7', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300', type: 'wallpaper', title: 'City Lights' },
  { id: '8', image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300', type: 'ringtone', title: 'Morning Call', color: '#22C55E' },
];

// =============================================================================
// TYPES
// =============================================================================

type FavoriteItem = {
  id: string;
  image: string;
  type: string;
  title: string;
  color?: string;
};

type FilterType = 'all' | 'wallpaper' | 'ringtone';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function FavoritesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('favorites');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  /**
   * Reset tab to 'favorites' when screen is focused
   */
  useFocusEffect(
    useCallback(() => {
      setActiveTab('favorites');
    }, [])
  );

  /**
   * Handle bottom tab navigation
   */
  const handleTabPress = useCallback(
    (tab: TabName) => {
      if (tab === 'favorites') return;

      setActiveTab(tab);

      if (tab === 'home') {
        router.back();
        return;
      }

      const routes: Record<TabName, string | null> = {
        home: null,
        favorites: null,
        category: '/search',
        trending: '/trending',
        settings: '/settings',
      };

      const route = routes[tab];
      if (route) {
        router.replace(route as any);
      }
    },
    [router]
  );

  /**
   * Filter items based on active filter
   */
  const filteredItems = favoriteItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  /**
   * Render favorite item card
   */
  const renderItem = useCallback(
    ({ item }: { item: FavoriteItem }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/viewer')}
        activeOpacity={0.9}
      >
        {item.type === 'wallpaper' ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.ringtoneCard, { backgroundColor: item.color }]}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color={item.color} />
            </View>
          </View>
        )}

        {/* Favorite Heart Button */}
        <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.8}>
          <Ionicons name="heart" size={20} color="#EF4444" />
        </TouchableOpacity>

        {/* Card Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardType}>
            {item.type === 'wallpaper' ? 'Wallpaper' : 'Ringtone'}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [router]
  );

  /**
   * Render filter tab button
   */
  const renderFilterTab = useCallback(
    (filter: FilterType, label: string) => (
      <TouchableOpacity
        key={filter}
        style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
        onPress={() => setActiveFilter(filter)}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    ),
    [activeFilter]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ===================================================================
          HEADER
          =================================================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Favorites</Text>

        <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ===================================================================
          FILTER TABS
          =================================================================== */}
      <View style={styles.filterContainer}>
        {renderFilterTab('all', 'All')}
        {renderFilterTab('wallpaper', 'Wallpapers')}
        {renderFilterTab('ringtone', 'Ringtones')}
      </View>

      {/* ===================================================================
          ITEMS COUNT
          =================================================================== */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{filteredItems.length} items</Text>
      </View>

      {/* ===================================================================
          FAVORITES GRID / EMPTY STATE
          =================================================================== */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Start adding wallpapers and ringtones to your favorites
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreButtonText}>Explore Wallpapers</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ===================================================================
          BOTTOM NAVIGATION
          =================================================================== */}
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
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
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },

  filterTabActive: {
    backgroundColor: COLORS.primary,
  },

  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  filterTextActive: {
    color: '#fff',
  },

  // Count
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  countText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Grid
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    margin: 6,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  cardImage: {
    width: '100%',
    height: '75%',
  },

  ringtoneCard: {
    width: '100%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  cardInfo: {
    padding: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  cardType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
  },

  exploreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});