/**
 * =============================================================================
 * Animated Wallpaper Card - Optimized & Fixed Layout
 * =============================================================================
 *
 * Memory-optimized animated wrapper with:
 * - Proper memoization
 * - Reduced animation delay
 * - Custom comparison for React.memo
 * - Fixed layout for grid
 *
 * =============================================================================
 */

import { MotiView } from 'moti';
import React from 'react';

import { ANIM } from '../../constants';
import { WallpaperItem } from '../../types';
import WallpaperCard from '../cards/WallpaperCard';

// =============================================================================
// TYPES
// =============================================================================

type Props = {
  item: WallpaperItem;
  index: number;
  onPress: (item: WallpaperItem) => void;
  onToggleFavorite: (item: WallpaperItem) => void;
};

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_ANIMATION_DELAY = 400;
const STAGGER_LIMIT = 8;

// =============================================================================
// COMPONENT
// =============================================================================

export const AnimatedWallpaperCard = React.memo(
  function AnimatedWallpaperCard({
    item,
    index,
    onPress,
    onToggleFavorite,
  }: Props) {
    // Limit stagger delay for performance
    const delay =
      index < STAGGER_LIMIT
        ? Math.min(index * ANIM.STAGGER, MAX_ANIMATION_DELAY)
        : 0;

    return (
      <MotiView
        from={{
          opacity: ANIM.ENTRANCE.opacity.from,
          translateY: ANIM.ENTRANCE.translateY.from,
          scale: ANIM.ENTRANCE.scale.from,
        }}
        animate={{
          opacity: ANIM.ENTRANCE.opacity.to,
          translateY: ANIM.ENTRANCE.translateY.to,
          scale: ANIM.ENTRANCE.scale.to,
        }}
        transition={{
          type: 'timing',
          duration: ANIM.DURATION,
          delay,
        }}
        style={styles.container}
      >
        <WallpaperCard
          item={item}
          onPress={onPress}
          onToggleFavorite={onToggleFavorite}
          showPhotographer={false}
        />
      </MotiView>
    );
  },
  // Custom comparison - only re-render if these change
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.isFavorite === nextProps.item.isFavorite &&
      prevProps.index === nextProps.index
    );
  }
);

// =============================================================================
// STYLES
// =============================================================================

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});