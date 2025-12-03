/**
 * =============================================================================
 * Wallpaper Hooks - Optimized with Higher Limits
 * =============================================================================
 */

import {
  useQuery,
  useInfiniteQuery,
} from '@tanstack/react-query';

import {
  searchWallpapers,
  fetchPhotoById,
  transformPhotosToWallpapers,
} from '../api/pexels';
import { CACHE_TIMES } from '../constants/apiKeys';
import { WallpaperItem } from '../types';

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_PAGES_HOME = 5;        // Home screen: 100 wallpapers (memory safe)
const MAX_PAGES_SEARCH = 20;     // Search: 400 wallpapers (user requested more)
const DEFAULT_PER_PAGE = 20;
const DEFAULT_ORIENTATION = 'portrait';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const wallpaperKeys = {
  all: ['wallpapers'] as const,
  curated: () => [...wallpaperKeys.all, 'curated'] as const,
  trending: () => [...wallpaperKeys.all, 'trending'] as const,
  category: (category: string) => [...wallpaperKeys.all, 'category', category] as const,
  search: (query: string) => [...wallpaperKeys.all, 'search', query] as const,
  photo: (id: number) => [...wallpaperKeys.all, 'photo', id] as const,
};

// =============================================================================
// CURATED WALLPAPERS (HOME SCREEN - Limited)
// =============================================================================

export const useCuratedWallpapers = (
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE
) => {
  return useQuery({
    queryKey: [...wallpaperKeys.curated(), page, perPage],
    queryFn: async () => {
      const response = await searchWallpapers(
        'nature wallpaper',
        page,
        perPage,
        DEFAULT_ORIENTATION
      );
      return {
        ...response,
        wallpapers: transformPhotosToWallpapers(response.photos),
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.WALLPAPERS,
  });
};

export const useCuratedWallpapersInfinite = (perPage: number = DEFAULT_PER_PAGE) => {
  return useInfiniteQuery({
    queryKey: wallpaperKeys.curated(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchWallpapers(
        'nature wallpaper',
        pageParam,
        perPage,
        DEFAULT_ORIENTATION
      );
      return {
        ...response,
        wallpapers: transformPhotosToWallpapers(response.photos),
        currentPage: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPageCount = allPages.length;

      // HOME SCREEN: Limited to 5 pages (100 wallpapers)
      if (currentPageCount >= MAX_PAGES_HOME) {
        return undefined;
      }

      const totalFetched = currentPageCount * perPage;
      if (totalFetched < lastPage.total_results) {
        return currentPageCount + 1;
      }
      return undefined;
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.WALLPAPERS,
  });
};

// =============================================================================
// TRENDING WALLPAPERS (Limited)
// =============================================================================

export const useTrendingWallpapers = (
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE
) => {
  return useQuery({
    queryKey: [...wallpaperKeys.trending(), page, perPage],
    queryFn: async () => {
      const response = await searchWallpapers(
        'trending wallpaper',
        page,
        perPage,
        DEFAULT_ORIENTATION
      );
      return {
        ...response,
        wallpapers: transformPhotosToWallpapers(response.photos),
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.TRENDING,
  });
};

export const useTrendingWallpapersInfinite = (perPage: number = DEFAULT_PER_PAGE) => {
  return useInfiniteQuery({
    queryKey: wallpaperKeys.trending(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchWallpapers(
        'abstract wallpaper',
        pageParam,
        perPage,
        DEFAULT_ORIENTATION
      );
      return {
        ...response,
        wallpapers: transformPhotosToWallpapers(response.photos),
        currentPage: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPageCount = allPages.length;

      if (currentPageCount >= MAX_PAGES_HOME) {
        return undefined;
      }

      const totalFetched = currentPageCount * perPage;
      if (totalFetched < lastPage.total_results) {
        return currentPageCount + 1;
      }
      return undefined;
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.TRENDING,
  });
};

// =============================================================================
// CATEGORY/SEARCH WALLPAPERS (Higher Limit for Search)
// =============================================================================

export const useCategoryWallpapers = (
  category: string,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE
) => {
  return useQuery({
    queryKey: [...wallpaperKeys.category(category), page, perPage],
    queryFn: async () => {
      const response = await searchWallpapers(
        category,
        page,
        perPage,
        DEFAULT_ORIENTATION
      );
      return {
        ...response,
        wallpapers: transformPhotosToWallpapers(response.photos),
      };
    },
    enabled: !!category && category.trim().length > 0,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.WALLPAPERS,
  });
};

/**
 * Category/Search with HIGHER limit (400 wallpapers)
 * Used for search screen where users want more results
 */
export const useCategoryWallpapersInfinite = (
  category: string,
  perPage: number = DEFAULT_PER_PAGE
) => {
  return useInfiniteQuery({
    queryKey: wallpaperKeys.category(category),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchWallpapers(
        category,
        pageParam,
        perPage,
        DEFAULT_ORIENTATION
      );
      return {
        ...response,
        wallpapers: transformPhotosToWallpapers(response.photos),
        currentPage: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPageCount = allPages.length;

      // SEARCH SCREEN: Higher limit (20 pages = 400 wallpapers)
      if (currentPageCount >= MAX_PAGES_SEARCH) {
        return undefined;
      }

      const totalFetched = currentPageCount * perPage;
      if (totalFetched < lastPage.total_results) {
        return currentPageCount + 1;
      }
      return undefined;
    },
    enabled: !!category && category.trim().length > 0,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.WALLPAPERS,
  });
};

// =============================================================================
// SINGLE PHOTO HOOK
// =============================================================================

export const usePhoto = (id: number) => {
  return useQuery({
    queryKey: wallpaperKeys.photo(id),
    queryFn: async () => {
      const photo = await fetchPhotoById(id);
      return photo;
    },
    enabled: !!id && id > 0,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.WALLPAPERS,
  });
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getFlattenedWallpapers = (
  data: ReturnType<typeof useCuratedWallpapersInfinite>['data']
): WallpaperItem[] => {
  if (!data?.pages) return [];
  return data.pages.flatMap((page) => page.wallpapers);
};

export const getTotalCount = (
  data: ReturnType<typeof useCuratedWallpapersInfinite>['data']
): number => {
  if (!data?.pages || data.pages.length === 0) return 0;
  return data.pages[0].total_results;
};

export const getLoadedPageCount = (
  data: ReturnType<typeof useCuratedWallpapersInfinite>['data']
): number => {
  if (!data?.pages) return 0;
  return data.pages.length;
};

export const getLoadedCount = (
  data: ReturnType<typeof useCuratedWallpapersInfinite>['data']
): number => {
  return getFlattenedWallpapers(data).length;
};