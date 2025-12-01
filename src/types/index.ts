import { Ionicons } from '@expo/vector-icons';

export type WallpaperItem = {
  id: string;
  src: {
    tiny?: string;
    small?: string;
    medium?: string;
    large?: string;
    original?: string;
  };
  photographer?: string;
  width?: number;
  height?: number;
};

export type BannerItem = {
  id: string;
  title: string;      // e.g., "EDITORS"
  subtitle: string;   // e. g., "CHOICE"
  uri: string;        // Image URL
  gradient?: string[];
};
export type CategoryItem = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
};

export type TabName = 'home' | 'favorites' | 'category' | 'trending' | 'settings';

export type IconName = keyof typeof Ionicons.glyphMap;