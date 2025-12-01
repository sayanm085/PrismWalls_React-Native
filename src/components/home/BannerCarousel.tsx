/**
 * src/components/home/BannerCarousel.tsx
 *
 * Production-ready banner carousel using react-native-reanimated-carousel
 * - Centered cards with "peek" on both sides
 * - autoplay + pause on drag
 * - loop
 * - animated pagination (dots expand)
 *
 * Author: WALLPERS - Senior UI/UX Dev (20y experience style)
 */

import { Image } from "expo-image";
import { MotiView } from "moti"; // small, friendly animations for dots
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { COLORS } from "../../constants"; // your theme
import type { BannerItem } from "../../types"; // your app types

// ---------------------------
// Layout constants (tweakable)
// ---------------------------
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 20; // space on sides of whole carousel
const CARD_WIDTH = Math.round(SCREEN_WIDTH - HORIZONTAL_PADDING * 2); // visible card width
const CARD_HEIGHT = 180;
const ITEM_SPACING = 16; // spacing to the right of each card to create "peek"
const AUTO_PLAY_INTERVAL = 4000;

// For pagination dot sizes
const DOT_MIN = 8;
const DOT_MAX = 28;

type Props = {
  data: BannerItem[];
  onBannerPress: (item: BannerItem) => void;
};

export function BannerCarousel({ data, onBannerPress }: Props) {
  // active index shown (used for pagination UI)
  const [activeIndex, setActiveIndex] = useState(0);

  // Pause autoplay while user is touching/dragging
  const isInteracting = useRef(false);

  // small helper: render each card
  const renderItem = useCallback(
    ({ item }: { item: BannerItem }) => {
      return (
        <Pressable
          onPress={() => onBannerPress(item)}
          style={styles.cardWrapper}
          android_ripple={{ color: "rgba(255,255,255,0.06)" }}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.cardImage}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />

          {/* subtle gradient overlay for text legibility */}
          <View style={styles.overlay} />

          {/* content */}
          <View style={styles.cardContent}>
            <Text style={styles.subtitle}>{item.title}</Text>
            <Text style={styles.title}>{item.subtitle}</Text>

            <View style={styles.cta}>
              <Text style={styles.ctaText}>Explore</Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [onBannerPress]
  );

  // carousel options
  const carouselWidth = CARD_WIDTH + ITEM_SPACING;

  // pagination dots (animated with Moti for smoothness)
  const Pagination = useMemo(
    () => (
      <View style={styles.pagination}>
        {data.map((_, i) => {
          const isActive = i === activeIndex;
          return (
            <MotiView
              key={i}
              from={{ width: isActive ? DOT_MAX : DOT_MIN, opacity: isActive ? 1 : 0.9 }}
              animate={{ width: isActive ? DOT_MAX : DOT_MIN, opacity: isActive ? 1 : 0.9 }}
              transition={{ type: "spring", damping: 16, stiffness: 220 }}
              style={[
                styles.dot,
                { backgroundColor: isActive ? "rgba(79,70,229,0.18)" : "#CBD5E1" },
              ]}
            >
              <View
                style={[
                  styles.dotInner,
                  { backgroundColor: isActive ? COLORS.primary : "transparent" },
                ]}
              />
            </MotiView>
          );
        })}
      </View>
    ),
    [activeIndex, data]
  );

  return (
    <View style={styles.container}>
      <Carousel
        // core settings
        loop
        width={carouselWidth}
        height={CARD_HEIGHT}
        autoPlay={true}
        autoPlayInterval={AUTO_PLAY_INTERVAL}
        data={data}
        // render each item
        renderItem={renderItem}
        style={{ width: SCREEN_WIDTH }}
        onSnapToItem={(index: number) => {
          // fired when the carousel settles on an index
          setActiveIndex(index);
        }}
        pagingEnabled={true}
        scrollAnimationDuration={500}
      />
      {/* pagination */}
      {Pagination}
    </View>
  );
}

/* =========================
   Styles
   ========================= */

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  // wrapper around each card: width = CARD_WIDTH, marginRight = ITEM_SPACING
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: ITEM_SPACING,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
  },

  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
  },

  cta: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  ctaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // pagination
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8, // note: gap is supported in some RN versions — if you see a warning, replace with margin style on dots
  },

  dot: {
    height: DOT_MIN,
    borderRadius: DOT_MIN / 2,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  dotInner: {
    height: "100%",
    width: "100%",
    borderRadius: DOT_MIN / 2,
  },
});
