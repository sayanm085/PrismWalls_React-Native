import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ANIM, LAYOUT } from '../../constants';
import { useAnimatedPress } from '../../hooks';
import { BannerItem } from '../../types';

type Props = {
  item: BannerItem;
  index: number;
  onPress: () => void;
};

export const BannerCard = React.memo(function BannerCard({
  item,
  index,
  onPress,
}: Props) {
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress(0.97);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: ANIM.SPRING.damping,
        stiffness: ANIM.SPRING.stiffness,
        delay: 100 + index * 80,
      }}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={styles.card}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.image}
            contentFit="cover"
            transition={400}
            cachePolicy="memory-disk"
          />

          <View style={[styles.gradient, { backgroundColor: `${item.gradient[0]}CC` }]} />

          <View style={styles.content}>
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 300 + index * 80, duration: 300 }}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 400 + index * 80, type: 'spring' }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Explore</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </MotiView>
          </View>
        </Pressable>
      </Animated.View>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  card: {
    width: LAYOUT.BANNER_WIDTH,
    height: LAYOUT.BANNER_HEIGHT,
    marginRight: 16,
    borderRadius: 28,
    overflow: 'hidden',
    ... Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ... StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 3,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});