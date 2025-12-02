/**
 * =============================================================================
 * Application Types
 * =============================================================================
 * 
 * Centralized TypeScript type definitions. 
 * Includes UI types, API response types, and navigation types.
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export type TabName = 'home' | 'favorites' | 'category' | 'trending' | 'settings';

export type IconName = keyof typeof Ionicons.glyphMap;

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

export type WallpaperItem = {
  id: string;
  src: {
    tiny?: string;
    small?: string;
    medium?: string;
    large?: string;
    large2x?: string;
    portrait?: string;
    landscape?: string;
    original?: string;
  };
  photographer?: string;
  photographerUrl?: string;
  avgColor?: string;
  width?: number;
  height?: number;
  isFavorite?: boolean;
  alt?: string;
};

export type BannerItem = {
  id: string;
  title: string;
  subtitle: string;
  uri: string;
  gradient?: string[];
};

export type CategoryItem = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon?: IconName;
  count?: number;
};

// =============================================================================
// PEXELS API TYPES
// =============================================================================

export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  liked: boolean;
  alt: string;
}

export interface PexelsResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
  photos: PexelsPhoto[];
}

export interface FetchWallpapersParams {
  page?: number;
  perPage?: number;
}

export interface SearchWallpapersParams extends FetchWallpapersParams {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  color?: string;
}

// =============================================================================
// APP STATE TYPES
// =============================================================================

export interface FavoriteWallpaper {
  id: string;
  src: WallpaperItem['src'];
  photographer?: string;
  avgColor?: string;
  addedAt: number;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// =============================================================================
// TRANSFORM HELPERS
// =============================================================================

/**
 * Convert PexelsPhoto to WallpaperItem
 */
export const pexelsToWallpaper = (photo: PexelsPhoto): WallpaperItem => ({
  id: String(photo.id),
  src: {
    tiny: photo.src.tiny,
    small: photo.src.small,
    medium: photo.src.medium,
    large: photo.src.large,
    large2x: photo.src.large2x,
    portrait: photo.src.portrait,
    landscape: photo.src.landscape,
    original: photo.src.original,
  },
  photographer: photo.photographer,
  photographerUrl: photo.photographer_url,
  avgColor: photo.avg_color,
  width: photo.width,
  height: photo.height,
  isFavorite: false,
  alt: photo.alt,
});

/**
 * Convert array of PexelsPhotos to WallpaperItems
 */
export const pexelsArrayToWallpapers = (photos: PexelsPhoto[]): WallpaperItem[] => {
  return photos.map(pexelsToWallpaper);
};