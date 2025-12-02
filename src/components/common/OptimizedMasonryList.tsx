/**
 * =============================================================================
 * Optimized Masonry List - Fixed Layout
 * =============================================================================
 *
 * High-performance masonry grid with:
 * - Proper centering
 * - Equal column widths
 * - Consistent gaps
 *
 * =============================================================================
 */

import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { COLORS } from '../../constants';
import { WallpaperItem } from '../../types';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;
const COLUMN_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;
const ESTIMATED_ITEM_SIZE = 250;

// =============================================================================
// TYPES
// =============================================================================

type MasonryRow = {
  id: string;
  left: WallpaperItem;
  right: WallpaperItem | null;
};

type Props = {
  data: WallpaperItem[];
  renderItem: (item: WallpaperItem, index: number) => React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onScroll?: (event: any) => void;
};

// =============================================================================
// COMPONENT
// =============================================================================

export const OptimizedMasonryList = React.memo(function OptimizedMasonryList({
  data,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  onRefresh,
  isRefreshing = false,
  onScroll,
}: Props) {
  // Convert flat list to rows (pairs of 2)
  const rows = useMemo(() => {
    const result: MasonryRow[] = [];
    for (let i = 0; i < data.length; i += 2) {
      result.push({
        id: `row-${data[i].id}-${data[i + 1]?.id || 'single'}`,
        left: data[i],
        right: data[i + 1] || null,
      });
    }
    return result;
  }, [data]);

  // Render a single row with two items
  const renderRow = useCallback(
    ({ item, index }: { item: MasonryRow; index: number }) => (
      <View style={styles.row}>
        {/* Left Column */}
        <View style={styles.column}>
          {renderItem(item.left, index * 2)}
        </View>

        {/* Gap */}
        <View style={styles.gap} />

        {/* Right Column */}
        <View style={styles.column}>
          {item.right ? (
            renderItem(item.right, index * 2 + 1)
          ) : (
            <View style={styles.emptyColumn} />
          )}
        </View>
      </View>
    ),
    [renderItem]
  );

  // Key extractor
  const keyExtractor = useCallback((item: MasonryRow) => item.id, []);

  // Empty state
  if (data.length === 0 && ListEmptyComponent) {
    return (
      <View style={styles.container}>
        {ListHeaderComponent}
        {ListEmptyComponent}
      </View>
    );
  }

  return (
    <FlashList
      data={rows}
      renderItem={renderRow}
      keyExtractor={keyExtractor}
      estimatedItemSize={ESTIMATED_ITEM_SIZE}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        ) : undefined
      }
    />
  );
});

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  gap: {
    width: COLUMN_GAP,
  },
  emptyColumn: {
    flex: 1,
  },
});