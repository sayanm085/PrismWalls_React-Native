/**
 * =============================================================================
 * Pexels API Service
 * =============================================================================
 *
 * Professional API layer for Pexels wallpaper service. 
 *
 * Features:
 * - Type-safe API calls
 * - Centralized error handling
 * - Request timeout support
 * - Clean separation of concerns
 *
 * @see https://www.pexels.com/api/documentation/
 * =============================================================================
 */

import { PEXELS_CONFIG, API_TIMEOUTS } from '../constants/apiKeys';
import { PexelsResponse, PexelsPhoto, WallpaperItem } from '../types';

// =============================================================================
// API CLIENT SETUP
// =============================================================================

/**
 * Creates headers for Pexels API requests
 */
const getHeaders = (): HeadersInit => ({
  Authorization: PEXELS_CONFIG.API_KEY,
  'Content-Type': 'application/json',
});

/**
 * Custom error class for API errors
 */
export class PexelsApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'PexelsApiError';
  }
}

/**
 * Fetch with timeout support
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = API_TIMEOUTS.DEFAULT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Generic API request handler with error handling
 */
const apiRequest = async <T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<T> => {
  const url = new URL(`${PEXELS_CONFIG.BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  try {
    const response = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorMessages: Record<number, string> = {
        400: 'Bad request. Please check your parameters.',
        401: 'Invalid API key. Please check your Pexels API key.',
        403: 'Access forbidden. API key may have exceeded rate limits.',
        404: 'Resource not found.',
        429: 'Too many requests. Please try again later.',
        500: 'Pexels server error. Please try again later.',
        503: 'Pexels service unavailable. Please try again later.',
      };

      throw new PexelsApiError(
        errorMessages[response.status] || `HTTP Error: ${response.status}`,
        response.status,
        `HTTP_${response.status}`
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof PexelsApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new PexelsApiError(
          'Request timeout. Please check your connection.',
          408,
          'TIMEOUT'
        );
      }

      throw new PexelsApiError(
        error.message || 'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    throw new PexelsApiError('An unexpected error occurred.', 0, 'UNKNOWN_ERROR');
  }
};

// =============================================================================
// PUBLIC API FUNCTIONS
// =============================================================================

/**
 * Fetch curated wallpapers
 * Returns high-quality photos hand-picked by Pexels team
 *
 * @param page - Page number (default: 1)
 * @param perPage - Results per page (default: 20, max: 80)
 * @returns Promise<PexelsResponse>
 *
 * @example
 * const { photos } = await fetchCuratedWallpapers(1, 20);
 */
export const fetchCuratedWallpapers = async (
  page: number = 1,
  perPage: number = PEXELS_CONFIG.DEFAULT_PER_PAGE
): Promise<PexelsResponse> => {
  return apiRequest<PexelsResponse>(PEXELS_CONFIG.ENDPOINTS.CURATED, {
    page,
    per_page: Math.min(perPage, PEXELS_CONFIG.MAX_PER_PAGE),
  });
};

/**
 * Search wallpapers by query
 *
 * @param query - Search term (required)
 * @param page - Page number (default: 1)
 * @param perPage - Results per page (default: 20, max: 80)
 * @param orientation - Filter by orientation
 * @param size - Filter by size
 * @param color - Filter by color (hex without #, or color name)
 * @returns Promise<PexelsResponse>
 *
 * @example
 * const { photos } = await searchWallpapers('nature', 1, 20, 'portrait');
 */
export const searchWallpapers = async (
  query: string,
  page: number = 1,
  perPage: number = PEXELS_CONFIG.DEFAULT_PER_PAGE,
  orientation?: 'landscape' | 'portrait' | 'square',
  size?: 'large' | 'medium' | 'small',
  color?: string
): Promise<PexelsResponse> => {
  if (!query || query.trim().length === 0) {
    return {
      page: 1,
      per_page: perPage,
      total_results: 0,
      photos: [],
    };
  }

  return apiRequest<PexelsResponse>(PEXELS_CONFIG.ENDPOINTS.SEARCH, {
    query: query.trim(),
    page,
    per_page: Math.min(perPage, PEXELS_CONFIG.MAX_PER_PAGE),
    orientation,
    size,
    color,
  });
};

/**
 * Fetch a single photo by ID
 *
 * @param id - Photo ID
 * @returns Promise<PexelsPhoto>
 *
 * @example
 * const photo = await fetchPhotoById(12345);
 */
export const fetchPhotoById = async (id: number): Promise<PexelsPhoto> => {
  return apiRequest<PexelsPhoto>(`${PEXELS_CONFIG.ENDPOINTS.PHOTO}/${id}`);
};

/**
 * Fetch wallpapers by category
 * Uses search with predefined category queries
 *
 * @param category - Category name
 * @param page - Page number
 * @param perPage - Results per page
 * @returns Promise<PexelsResponse>
 */
export const fetchWallpapersByCategory = async (
  category: string,
  page: number = 1,
  perPage: number = PEXELS_CONFIG.DEFAULT_PER_PAGE
): Promise<PexelsResponse> => {
  const categoryQueries: Record<string, string> = {
    nature: 'nature landscape',
    abstract: 'abstract art pattern',
    animals: 'wildlife animals',
    space: 'space galaxy stars',
    anime: 'anime art illustration',
    cars: 'sports cars luxury',
    music: 'music concert instruments',
    games: 'gaming esports',
    minimal: 'minimal simple clean',
    dark: 'dark moody black',
    colorful: 'colorful vibrant bright',
    city: 'city urban skyline',
  };

  const query = categoryQueries[category.toLowerCase()] || category;

  return searchWallpapers(query, page, perPage, 'portrait');
};

/**
 * Fetch trending wallpapers
 * Uses curated endpoint as trending source
 *
 * @param page - Page number
 * @param perPage - Results per page
 * @returns Promise<PexelsResponse>
 */
export const fetchTrendingWallpapers = async (
  page: number = 1,
  perPage: number = PEXELS_CONFIG.DEFAULT_PER_PAGE
): Promise<PexelsResponse> => {
  return fetchCuratedWallpapers(page, perPage);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Transform PexelsPhoto to app's WallpaperItem format
 * Matches the WallpaperItem type structure with src object
 */
export const transformToWallpaperItem = (photo: PexelsPhoto): WallpaperItem => ({
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
 * Transform array of PexelsPhotos to WallpaperItems
 */
export const transformPhotosToWallpapers = (photos: PexelsPhoto[]): WallpaperItem[] => {
  return photos.map(transformToWallpaperItem);
};

/**
 * Get optimal image URL based on required size
 */
export const getOptimalImageUrl = (
  src: PexelsPhoto['src'],
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'large'
): string => {
  const sizeMap = {
    thumbnail: src.tiny || src.small,
    medium: src.medium || src.large,
    large: src.large2x || src.large,
    original: src.original,
  };
  return sizeMap[size] || src.large;
};