import { MotiView } from 'moti';
import React from 'react';
import { ANIM, LAYOUT } from '../../constants';
import { WallpaperItem } from '../../types';
import WallpaperCard from '../cards/WallpaperCard';

type Props = {
  item: WallpaperItem;
  index: number;
  onPress: (item: WallpaperItem) => void;
  onToggleFavorite: (item: WallpaperItem) => void;
};

export const AnimatedWallpaperCard = React.memo(function AnimatedWallpaperCard({
  item,
  index,
  onPress,
  onToggleFavorite,
}: Props) {
  const delay = index * ANIM.STAGGER;

  return (
    <MotiView
      from={{
        opacity: ANIM.ENTRANCE.opacity.from,
        translateY: ANIM.ENTRANCE.translateY.from,
        scale: ANIM.ENTRANCE.scale.from,
      }}
      animate={{
        opacity: ANIM.ENTRANCE.opacity.to,
        translateY: ANIM.ENTRANCE.translateY.to,
        scale: ANIM.ENTRANCE.scale.to,
      }}
      transition={{
        type: 'timing',
        duration: ANIM.DURATION,
        delay: delay,
      }}
      style={{ flex: 1 }}
    >
      <WallpaperCard
        item={item}
        cardWidth={LAYOUT.CARD_WIDTH}
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
        showPhotographer={false}
      />
    </MotiView>
  );
});