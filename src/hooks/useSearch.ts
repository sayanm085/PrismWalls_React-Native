/**
 * =============================================================================
 * Search Hooks
 * =============================================================================
 *
 * React Query hooks for searching wallpapers with debounce support.
 *
 * Features:
 * - Debounced search input
 * - Search with infinite scroll
 * - Empty query protection
 * - Orientation and color filters
 *
 * =============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

import { searchWallpapers, transformPhotosToWallpapers } from '../api/pexels';
import { CACHE_TIMES } from '../constants/apiKeys';
import { WallpaperItem } from '../types';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const searchKeys = {
  all: ['search'] as const,
  query: (query: string) => [...searchKeys.all, query] as const,
  queryWithFilters: (
    query: string,
    orientation?: string,
    color?: string
  ) => [...searchKeys.all, query, orientation, color] as const,
};

// =============================================================================
// DEBOUNCE HOOK
// =============================================================================

/**
 * Custom debounce hook for search input
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

// =============================================================================
// SEARCH WALLPAPERS HOOK
// =============================================================================

/**
 * Search wallpapers with pagination
 */
export const useSearchWallpapers = (
  query: string,
  page: number = 1,
  perPage: number = 20,
  orientation?: 'landscape' | 'portrait' | 'square',
  color?: string
) => {
  return useQuery({
    queryKey: [...searchKeys.queryWithFilters(query, orientation, color), page, perPage],
    queryFn: async () => {
      const response = await searchWallpapers(query, page, perPage, orientation, undefined, color);
      return {
        ...response,
        wallpapers: transformPhotosToWallpapers(response.photos),
      };
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.SEARCH,
  });
};

/**
 * Search wallpapers with infinite scroll
 */
export const useSearchWallpapersInfinite = (
  query: string,
  perPage: number = 20,
  orientation?: 'landscape' | 'portrait' | 'square',
  color?: string
) => {
  return useInfiniteQuery({
    queryKey: searchKeys.queryWithFilters(query, orientation, color),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchWallpapers(query, pageParam, perPage, orientation, undefined, color);
      return {
        ...response,
        wallpapers: transformPhotosToWallpapers(response.photos),
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * perPage;
      if (totalFetched < lastPage.total_results) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.SEARCH,
  });
};

// =============================================================================
// DEBOUNCED SEARCH HOOK
// =============================================================================

/**
 * Search wallpapers with debounced input
 * Combines useDebounce and useSearchWallpapers
 *
 * @param query - Search query (will be debounced)
 * @param debounceDelay - Debounce delay in ms (default: 500)
 * @param perPage - Results per page
 * @param orientation - Filter by orientation
 * @param color - Filter by color
 */
export const useDebouncedSearch = (
  query: string,
  debounceDelay: number = 500,
  perPage: number = 20,
  orientation?: 'landscape' | 'portrait' | 'square',
  color?: string
) => {
  const debouncedQuery = useDebounce(query, debounceDelay);

  const queryResult = useSearchWallpapersInfinite(
    debouncedQuery,
    perPage,
    orientation,
    color
  );

  return {
    ...queryResult,
    debouncedQuery,
    isDebouncing: query !== debouncedQuery,
  };
};

// =============================================================================
// SEARCH STATE HOOK
// =============================================================================

/**
 * Complete search state management hook
 * Manages search input, filters, and results
 */
export const useSearchState = (debounceDelay: number = 500) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | 'square' | undefined>();
  const [color, setColor] = useState<string | undefined>();

  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useSearchWallpapersInfinite(debouncedQuery, 20, orientation, color);

  // Get flattened wallpapers
  const wallpapers: WallpaperItem[] = data?.pages.flatMap((page) => page.wallpapers) || [];

  // Get total results
  const totalResults = data?.pages[0]?.total_results || 0;

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setOrientation(undefined);
    setColor(undefined);
  }, []);

  // Check if actively searching
  const isSearching = searchQuery.trim().length > 0;
  const isDebouncing = searchQuery !== debouncedQuery;

  return {
    // State
    searchQuery,
    debouncedQuery,
    orientation,
    color,
    wallpapers,
    totalResults,

    // Setters
    setSearchQuery,
    setOrientation,
    setColor,
    clearSearch,

    // Query state
    isLoading,
    isFetching,
    isError,
    error,
    isSearching,
    isDebouncing,

    // Pagination
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,

    // Actions
    refetch,
  };
};

// =============================================================================
// SEARCH SUGGESTIONS HOOK (Optional)
// =============================================================================

/**
 * Popular search suggestions
 */
export const useSearchSuggestions = () => {
  const suggestions = [
    'Nature',
    'Abstract',
    'Minimal',
    'Dark',
    'Space',
    'Ocean',
    'Mountains',
    'City',
    'Sunset',
    'Flowers',
    'Animals',
    'Art',
  ];

  return { suggestions };
};