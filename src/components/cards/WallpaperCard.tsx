// src/components/WallpaperCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

export type WallpaperItem = {
  id: string;
  src: { 
    tiny?: string; 
    small?: string; 
    medium?: string; 
    large?: string; 
    original?: string; 
    large2x?: string; 
  };
  photographer?: string;
  width?: number;
  height?: number;
};

type Props = {
  item: WallpaperItem;
  onPress?: (item: WallpaperItem) => void;
  onToggleFavorite?: (item: WallpaperItem) => void;
  showPhotographer?: boolean;
  cardWidth?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DEFAULT_MARGIN = 12;
const DEFAULT_CARD_WIDTH = Math.floor((SCREEN_WIDTH - DEFAULT_MARGIN * 3) / 2);

/**
 * Placeholder image URL (fallback if local asset not available)
 */
const PLACEHOLDER_URL = 'https://via.placeholder.com/300x400/E2E8F0/94A3B8?text=Loading...';

const WallpaperCard: React.FC<Props> = ({ 
  item, 
  onPress, 
  onToggleFavorite, 
  showPhotographer = false, 
  cardWidth = DEFAULT_CARD_WIDTH 
}) => {
  // Get best available image source
  const imageUri = item?.src?.medium ?? item?.src?.small ?? item?.src?.tiny ?? item?.src?.original;
  
  // Calculate aspect ratio for dynamic height
  const aspectRatio = (item?.width && item?.height) ? item.width / item.height : 0.75;
  const cardHeight = Math.min(Math.round(cardWidth / aspectRatio), 350); // Cap max height

  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  const handleFav = useCallback(() => {
    onToggleFavorite?.(item);
  }, [item, onToggleFavorite]);

  return (
    <Pressable 
      onPress={handlePress} 
      style={({ pressed }) => [
        styles.container, 
        { 
          width: cardWidth, 
          height: cardHeight,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        }
      ]}
    >
      {/* Wallpaper Image with expo-image for better performance */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        contentFit="cover"
        placeholder={{ uri: PLACEHOLDER_URL }}
        transition={300}
        cachePolicy="memory-disk"
      />
      
      {/* Favorite Button */}
      <Pressable 
        onPress={handleFav} 
        style={({ pressed }) => [
          styles.favButton,
          { opacity: pressed ? 0.7 : 1 }
        ]} 
        hitSlop={8}
      >
        <Ionicons name="heart-outline" size={18} color="#fff" />
      </Pressable>

      {/* Photographer Credit (optional) */}
      {showPhotographer && item.photographer ? (
        <View style={styles.photographer}>
          <Text numberOfLines={1} style={styles.photographerText}>
            📷 {item.photographer}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export default React.memo(WallpaperCard);

const styles = StyleSheet.create({
  container: {
    marginBottom: DEFAULT_MARGIN,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    
    // Shadow for iOS
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    
    // Shadow for Android
    elevation: 6,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  photographer: {
    position: "absolute",
    left: 10,
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  photographerText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
});