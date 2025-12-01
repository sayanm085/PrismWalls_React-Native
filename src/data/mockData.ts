import { BannerItem, CategoryItem, WallpaperItem } from '../types';

export const BANNERS: BannerItem[] = [
  {
    id: '1',
    title: 'WALLPAPER',
    subtitle: 'OF THE DAY',
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    gradient: ['#6366F1', '#8B5CF6'],
  },
  {
    id: '2',
    title: 'TRENDING',
    subtitle: 'THIS WEEK',
    uri: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
    gradient: ['#EC4899', '#F43F5E'],
  },
  {
    id: '3',
    title: 'EDITORS',
    subtitle: 'CHOICE',
    uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    gradient: ['#14B8A6', '#22C55E'],
  },
];

export const CATEGORIES: CategoryItem[] = [
  { id: '1', title: 'Nature', subtitle: '2.5k', color: '#22C55E' },
  { id: '2', title: 'Abstract', subtitle: '1.8k', color: '#8B5CF6' },
  { id: '3', title: 'Animals', subtitle: '3.2k', color: '#F97316' },
  { id: '4', title: 'Space', subtitle: '980', color: '#3B82F6' },
  { id: '5', title: 'Minimal', subtitle: '1.2k', color: '#EC4899' },
  { id: '6', title: 'Dark', subtitle: '2.1k', color: '#1E293B' },
];

export const WALLPAPERS: WallpaperItem[] = [
  {
    id: '1',
    src: {
      medium: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
    photographer: 'John Doe',
    width: 400,
    height: 600,
  },
  {
    id: '2',
    src: {
      medium: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    },
    photographer: 'Jane Smith',
    width: 600,
    height: 400,
  },
  {
    id: '3',
    src: {
      medium: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
    },
    photographer: 'Alex Johnson',
    width: 400,
    height: 650,
  },
  {
    id: '4',
    src: {
      medium: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
    },
    photographer: 'Mike Brown',
    width: 500,
    height: 380,
  },
  {
    id: '5',
    src: {
      medium: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400',
    },
    photographer: 'Sarah Wilson',
    width: 450,
    height: 500,
  },
  {
    id: '6',
    src: {
      medium: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
    photographer: 'Chris Lee',
    width: 600,
    height: 350,
  },
  {
    id: '7',
    src: {
      medium: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
    },
    photographer: 'Emma Davis',
    width: 400,
    height: 620,
  },
  {
    id: '8',
    src: {
      medium: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400',
    },
    photographer: 'David Kim',
    width: 500,
    height: 450,
  },
  {
    id: '9',
    src: {
      medium: 'https://images.unsplash.com/photo-1518173946687-a4c036bc6c95?w=400',
    },
    photographer: 'Lisa Chen',
    width: 550,
    height: 380,
  },
  {
    id: '10',
    src: {
      medium: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    },
    photographer: 'Tom Wilson',
    width: 400,
    height: 580,
  },
];