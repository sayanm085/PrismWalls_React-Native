/**
 * =============================================================================
 * WALLPERS - Search Screen
 * =============================================================================
 * 
 * Search for wallpapers and ringtones
 * Features: Search bar, Recent searches, Trending, Categories, Results grid
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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Components
import { BottomNavBar } from '@/src/components/navigation';

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

const categories = [
  { id: '1', name: 'Abstract', icon: 'shapes-outline', color: '#8B5CF6' },
  { id: '2', name: 'Nature', icon: 'leaf-outline', color: '#22C55E' },
  { id: '3', name: 'Animals', icon: 'paw-outline', color: '#F97316' },
  { id: '4', name: 'Space', icon: 'planet-outline', color: '#3B82F6' },
  { id: '5', name: 'Anime', icon: 'star-outline', color: '#EC4899' },
  { id: '6', name: 'Cars', icon: 'car-sport-outline', color: '#EF4444' },
  { id: '7', name: 'Music', icon: 'musical-notes-outline', color: '#14B8A6' },
  { id: '8', name: 'Games', icon: 'game-controller-outline', color: '#6366F1' },
];

const trendingSearches = [
  'Aesthetic wallpapers',
  'Dark mode',
  'Anime girls',
  'Nature sunset',
  'Abstract art',
  'Minimal',
];

const initialRecentSearches = [
  'Mountain landscape',
  'Ocean waves',
  'City night',
];

const searchResults = [
  { id: '1', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300' },
  { id: '2', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300' },
  { id: '3', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300' },
  { id: '4', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300' },
  { id: '5', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=300' },
  { id: '6', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
];

// =============================================================================
// TYPES
// =============================================================================

type CategoryItem = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type SearchResultItem = {
  id: string;
  image: string;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SearchScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearchList, setRecentSearchList] = useState(initialRecentSearches);

  /**
   * Reset tab to 'category' when screen is focused
   */
  useFocusEffect(
    useCallback(() => {
      setActiveTab('category');
    }, [])
  );

  /**
   * Handle bottom tab navigation
   */
  const handleTabPress = useCallback(
    (tab: TabName) => {
      if (tab === 'category' || tab === 'trending') return;

      setActiveTab(tab);

      if (tab === 'home') {
        router.back();
        return;
      }

      const routes: Record<TabName, string | null> = {
        home: null,
        favorites: '/favorites',
        category: null,
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
   * Handle search input
   */
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setIsSearching(text.length > 0);
  }, []);

  /**
   * Clear recent searches
   */
  const handleClearRecent = useCallback(() => {
    setRecentSearchList([]);
  }, []);

  /**
   * Handle recent search press
   */
  const handleRecentSearchPress = useCallback((searchTerm: string) => {
    setSearchQuery(searchTerm);
    setIsSearching(true);
  }, []);

  /**
   * Handle trending search press
   */
  const handleTrendingPress = useCallback((searchTerm: string) => {
    setSearchQuery(searchTerm);
    setIsSearching(true);
  }, []);

  /**
   * Handle category press
   */
  const handleCategoryPress = useCallback((categoryName: string) => {
    setSearchQuery(categoryName);
    setIsSearching(true);
  }, []);

  /**
   * Render category item
   */
  const renderCategory = useCallback(
    ({ item }: { item: CategoryItem }) => (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item.name)}
        activeOpacity={0.8}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#fff" />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    ),
    [handleCategoryPress]
  );

  /**
   * Render search result item
   */
  const renderSearchResult = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => router.push('/viewer')}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.resultImage} />

        <TouchableOpacity style={styles.resultFavorite} activeOpacity={0.8}>
          <Ionicons name="heart-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [router]
  );

  /**
   * Render recent search item
   */
  const renderRecentItem = useCallback(
    (item: string, index: number) => (
      <TouchableOpacity
        key={`recent-${index}`}
        style={styles.recentItem}
        onPress={() => handleRecentSearchPress(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={18} color="#94A3B8" />
        <Text style={styles.recentText}>{item}</Text>
        <Ionicons name="arrow-forward" size={18} color="#94A3B8" />
      </TouchableOpacity>
    ),
    [handleRecentSearchPress]
  );

  /**
   * Render trending tag
   */
  const renderTrendingTag = useCallback(
    (item: string, index: number) => (
      <TouchableOpacity
        key={`trending-${index}`}
        style={styles.tag}
        onPress={() => handleTrendingPress(item)}
        activeOpacity={0.8}
      >
        <Ionicons name="trending-up" size={14} color={COLORS.primary} />
        <Text style={styles.tagText}>{item}</Text>
      </TouchableOpacity>
    ),
    [handleTrendingPress]
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

        <Text style={styles.headerTitle}>Search</Text>

        <View style={{ width: 44 }} />
      </View>

      {/* ===================================================================
          SEARCH BAR
          =================================================================== */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search wallpapers, ringtones..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ===================================================================
          CONTENT - Browse or Results
          =================================================================== */}
      {!isSearching ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Recent Searches */}
          {recentSearchList.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleWithHeader}>Recent Searches</Text>
                <TouchableOpacity onPress={handleClearRecent} activeOpacity={0.7}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recentSearchList.map(renderRecentItem)}
            </View>
          )}

          {/* Trending Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Searches</Text>
            <View style={styles.tagsContainer}>
              {trendingSearches.map(renderTrendingTag)}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <FlatList
              data={categories as CategoryItem[]}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              numColumns={4}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesGrid}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>Results for "{searchQuery}"</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.resultsGrid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search-outline" size={50} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>
                  Try different keywords or browse categories
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* ===================================================================
          BOTTOM NAVIGATION
          =================================================================== */}
      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
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
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
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
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  sectionTitleWithHeader: {
    fontSize: 18,
    fontWeight: '600',
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
  },

  // Trending Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  tagText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Categories Grid
  categoriesGrid: {
    marginTop: 4,
  },

  categoryCard: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 16,
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  // Results
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },

  resultsGrid: {
    paddingBottom: 120,
  },

  resultCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    margin: 6,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
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

  resultImage: {
    width: '100%',
    height: '100%',
  },

  resultFavorite: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 20,
  },
});