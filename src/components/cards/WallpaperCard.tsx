/**
 * =============================================================================
 * Wallpaper Card - Fully Optimized & Fixed Layout
 * =============================================================================
 *
 * Memory-optimized card with:
 * - Medium resolution images
 * - Proper caching policy
 * - Low priority loading
 * - Recycling support
 * - Placeholder with avg_color
 * - Fixed margins for grid layout
 *
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WallpaperItem } from '../../types';

// =============================================================================
// TYPES
// =============================================================================

type Props = {
  item: WallpaperItem;
  onPress?: (item: WallpaperItem) => void;
  onToggleFavorite?: (item: WallpaperItem) => void;
  showPhotographer?: boolean;
};

// =============================================================================
// CONSTANTS
// =============================================================================

const MIN_HEIGHT = 150;
const MAX_HEIGHT = 280;

// =============================================================================
// COMPONENT
// =============================================================================

const WallpaperCard: React.FC<Props> = ({
  item,
  onPress,
  onToggleFavorite,
  showPhotographer = false,
}) => {
  // Get best available image source (MEDIUM priority for grid view)
  const imageUri = useMemo(() => {
    return (
      item?.src?.medium ||
      item?.src?.small ||
      item?.src?.large ||
      item?.src?.original ||
      ''
    );
  }, [item?.src]);

  // Calculate aspect ratio for dynamic height
  const cardHeight = useMemo(() => {
    const aspectRatio =
      item?.width && item?.height ? item.width / item.height : 0.75;
    const calculatedHeight = Math.round(170 / aspectRatio); // Base width ~170
    return Math.max(MIN_HEIGHT, Math.min(calculatedHeight, MAX_HEIGHT));
  }, [item?.width, item?.height]);

  // Placeholder color from Pexels avg_color
  const placeholderColor = item?.avgColor || '#E2E8F0';

  // Handlers
  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  const handleFav = useCallback(() => {
    onToggleFavorite?.(item);
  }, [item, onToggleFavorite]);

  // Don't render if no image
  if (!imageUri) {
    return null;
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          height: cardHeight,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Optimized Image */}
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { backgroundColor: placeholderColor }]}
        contentFit="cover"
        transition={200}
        recyclingKey={item.id}
        cachePolicy="memory-disk"
        priority="low"
      />

      {/* Favorite Button */}
      <Pressable
        onPress={handleFav}
        style={({ pressed }) => [
          styles.favButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        hitSlop={8}
      >
        <Ionicons
          name={item?.isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={item?.isFavorite ? '#EF4444' : '#fff'}
        />
      </Pressable>

      {/* Photographer Credit (optional) */}
      {showPhotographer && item?.photographer ? (
        <View style={styles.photographer}>
          <Text numberOfLines={1} style={styles.photographerText}>
            📷 {item.photographer}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

// =============================================================================
// MEMOIZATION
// =============================================================================

export default React.memo(WallpaperCard, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.isFavorite === nextProps.item.isFavorite &&
    prevProps.showPhotographer === nextProps.showPhotographer
  );
});

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',

    // Shadow for iOS
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,

    // Shadow for Android
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photographer: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  photographerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
});