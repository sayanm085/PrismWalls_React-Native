/**
 * =============================================================================
 * Hooks Index
 * =============================================================================
 *
 * Central export point for all custom hooks. 
 * Import from '@/src/hooks' or '../../hooks'
 *
 * =============================================================================
 */

// Animation hooks
export * from './useAnimatedPress';
// Wallpaper hooks
export {
  wallpaperKeys,
  useCuratedWallpapers,
  useCuratedWallpapersInfinite,
  useTrendingWallpapers,
  useTrendingWallpapersInfinite,
  useCategoryWallpapers,
  useCategoryWallpapersInfinite,
  usePhoto,
  getFlattenedWallpapers,
  getTotalCount,
} from './useWallpapers';

// Search hooks
export {
  searchKeys,
  useDebounce,
  useSearchWallpapers,
  useSearchWallpapersInfinite,
  useDebouncedSearch,
  useSearchState,
  useSearchSuggestions,
} from './useSearch';