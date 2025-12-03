/**
 * =============================================================================
 * Hook for Favorite Action
 * =============================================================================
 */

import { useCallback } from 'react';
import { useFavoritesStore } from '@/src/store/useFavoritesStore';

export function useFavoriteAction() {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  const handleToggleFavorite = useCallback(
    (wallpaper: {
      id: string;
      imageUri: string;
      fullImageUri: string;
      photographer: string;
      avgColor: string;
      width: number;
      height: number;
    }) => {
      toggleFavorite({
        id: wallpaper.id,
        imageUri: wallpaper.imageUri,
        fullImageUri: wallpaper.fullImageUri,
        photographer: wallpaper.photographer,
        avgColor: wallpaper.avgColor,
        width: wallpaper.width,
        height: wallpaper.height,
      });
    },
    [toggleFavorite]
  );

  return { handleToggleFavorite, isFavorite };
}