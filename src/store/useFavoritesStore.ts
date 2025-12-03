/**
 * =============================================================================
 * PRISMWALLS - Favorites Store (Zustand + AsyncStorage)
 * =============================================================================
 *
 * Professional state management for favorites:
 * - Persistent storage with AsyncStorage
 * - Optimistic updates
 * - Type-safe actions
 * - Hydration on app start
 *
 * Author: PRISMWALLS Team
 * =============================================================================
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// TYPES
// =============================================================================

export interface FavoriteWallpaper {
  id: string;
  imageUri: string;
  fullImageUri: string;
  photographer: string;
  avgColor: string;
  width: number;
  height: number;
  addedAt: number; // timestamp
}

interface FavoritesState {
  favorites: FavoriteWallpaper[];
  isHydrated: boolean;
  
  // Actions
  addFavorite: (wallpaper: Omit<FavoriteWallpaper, 'addedAt'>) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (wallpaper: Omit<FavoriteWallpaper, 'addedAt'>) => void;
  isFavorite: (id: string) => boolean;
  clearAllFavorites: () => void;
  setHydrated: () => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isHydrated: false,

      addFavorite: (wallpaper) => {
        const exists = get().favorites.some((f) => f.id === wallpaper.id);
        if (exists) return;

        set((state) => ({
          favorites: [
            { ...wallpaper, addedAt: Date.now() },
            ...state.favorites,
          ],
        }));
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },

      toggleFavorite: (wallpaper) => {
        const exists = get().favorites.some((f) => f.id === wallpaper.id);
        
        if (exists) {
          get().removeFavorite(wallpaper.id);
        } else {
          get().addFavorite(wallpaper);
        }
      },

      isFavorite: (id) => {
        return get().favorites.some((f) => f.id === id);
      },

      clearAllFavorites: () => {
        set({ favorites: [] });
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: '@prismwalls_favorites',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// =============================================================================
// SELECTORS (For performance - prevents unnecessary re-renders)
// =============================================================================

export const selectFavorites = (state: FavoritesState) => state.favorites;
export const selectFavoritesCount = (state: FavoritesState) => state.favorites.length;
export const selectIsFavorite = (id: string) => (state: FavoritesState) => 
  state.favorites.some((f) => f.id === id);
export const selectIsHydrated = (state: FavoritesState) => state.isHydrated;