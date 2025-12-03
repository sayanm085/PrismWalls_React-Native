/**
 * =============================================================================
 * PRISMWALLS - Settings Store (Zustand)
 * =============================================================================
 *
 * Persisted settings store for app preferences:
 * - High Quality downloads
 * - Save to Gallery
 * - Auto Download (coming soon)
 * - Notifications (coming soon)
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

interface SettingsState {
  // Download Settings
  highQuality: boolean;
  saveToGallery: boolean;
  autoDownload: boolean;

  // Notification Settings (Coming Soon)
  notificationsEnabled: boolean;

  // Hydration
  _hasHydrated: boolean;

  // Actions
  setHighQuality: (value: boolean) => void;
  setSaveToGallery: (value: boolean) => void;
  setAutoDownload: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  resetSettings: () => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const DEFAULT_SETTINGS = {
  highQuality: true,        // Download in original quality by default
  saveToGallery: true,      // Save to gallery by default
  autoDownload: false,      // Disabled by default
  notificationsEnabled: false, // Disabled (coming soon)
};

// =============================================================================
// STORE
// =============================================================================

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial State
      ...DEFAULT_SETTINGS,
      _hasHydrated: false,

      // Actions
      setHighQuality: (value: boolean) => set({ highQuality: value }),

      setSaveToGallery: (value: boolean) => set({ saveToGallery: value }),

      setAutoDownload: (value: boolean) => set({ autoDownload: value }),

      setNotificationsEnabled: (value: boolean) => set({ notificationsEnabled: value }),

      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'prismwalls-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // Only persist these keys
      partialize: (state) => ({
        highQuality: state.highQuality,
        saveToGallery: state.saveToGallery,
        autoDownload: state.autoDownload,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);

// =============================================================================
// SELECTORS (for optimized re-renders)
// =============================================================================

export const selectHighQuality = (state: SettingsState) => state.highQuality;
export const selectSaveToGallery = (state: SettingsState) => state.saveToGallery;
export const selectAutoDownload = (state: SettingsState) => state.autoDownload;
export const selectNotificationsEnabled = (state: SettingsState) => state.notificationsEnabled;
export const selectIsHydrated = (state: SettingsState) => state._hasHydrated;