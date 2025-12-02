/**
 * =============================================================================
 * API Configuration
 * =============================================================================
 * 
 * Centralized API keys and endpoints configuration. 
 * 
 * @see https://www.pexels.com/api/documentation/
 * =============================================================================
 */

// Pexels API Configuration
export const PEXELS_CONFIG = {
  API_KEY: 'xWcle4dkBjOhUmzbGLtUZAuDonCfhaC8hIhvyYyjJ8MJsT4z7qU2N22S', // Replace with API key
  BASE_URL: 'https://api.pexels.com/v1',
  ENDPOINTS: {
    CURATED: '/curated',
    SEARCH: '/search',
    PHOTO: '/photos', // For single photo: /photos/:id
  },
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 80,
} as const;

// API Request Timeouts (milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 10000,
  LONG: 30000,
} as const;

// Cache Times (milliseconds) - Used with React Query
export const CACHE_TIMES = {
  WALLPAPERS: 1000 * 60 * 5,      // 5 minutes
  SEARCH: 1000 * 60 * 2,          // 2 minutes
  TRENDING: 1000 * 60 * 10,       // 10 minutes
  STALE_TIME: 1000 * 60 * 1,      // 1 minute
} as const;