import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LAYOUT = {
  SCREEN_WIDTH,
  PADDING: 16,
  GAP: 12,
  COLUMNS: 2,
  CARD_WIDTH: Math.floor((SCREEN_WIDTH - 16 * 2 - 12) / 2),
  BANNER_WIDTH: SCREEN_WIDTH - 48,
  BANNER_HEIGHT: 200,
  NAV_HEIGHT: 70,
} as const;