import { MotiView } from 'moti';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { COLORS, LAYOUT } from '../../constants';
import { BannerItem } from '../../types';
import { BannerCard } from './BannerCard';

type Props = {
  data: BannerItem[];
  onBannerPress: (item: BannerItem) => void;
};

export const BannerCarousel = React.memo(function BannerCarousel({
  data,
  onBannerPress,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const handleScroll = useCallback((event: any) => {
    const offset = event.nativeEvent.contentOffset. x;
    const index = Math.round(offset / LAYOUT. BANNER_WIDTH);
    setActiveIndex(index);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: BannerItem; index: number }) => (
      <BannerCard
        item={item}
        index={index}
        onPress={() => onBannerPress(item)}
      />
    ),
    [onBannerPress]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={LAYOUT.BANNER_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <MotiView
            key={index}
            animate={{
              width: activeIndex === index ? 24 : 8,
              backgroundColor: activeIndex === index ?  COLORS.primary : '#CBD5E1',
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            style={styles.dot}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  list: {
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});