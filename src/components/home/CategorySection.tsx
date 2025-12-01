import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SectionHeader } from '../common';
import CategoryCard from '../cards/CategoryCard';
import { ANIM } from '../../constants';
import { CategoryItem } from '../../types';

type Props = {
  data: CategoryItem[];
  onCategoryPress: (id?: string | number) => void;
  onSeeAll?: () => void;
};

export const CategorySection = React.memo(function CategorySection({
  data,
  onCategoryPress,
  onSeeAll,
}: Props) {
  const renderItem = useCallback(
    ({ item, index }: { item: CategoryItem; index: number }) => (
      <MotiView
        from={{ opacity: 0, translateX: 30, scale: 0.9 }}
        animate={{ opacity: 1, translateX: 0, scale: 1 }}
        transition={{
          type: 'spring',
          damping: ANIM.SPRING.damping,
          stiffness: ANIM.SPRING.stiffness,
          delay: 200 + index * 60,
        }}
      >
        <CategoryCard
          id={item.id}
          title={item.title}
          subtitle={item.subtitle}
          color={item.color}
          onPress={onCategoryPress}
        />
      </MotiView>
    ),
    [onCategoryPress]
  );

  return (
    <View style={styles.container}>
      <SectionHeader title="Categories" onSeeAll={onSeeAll} delay={250} />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  list: {
    paddingHorizontal: 20,
  },
});