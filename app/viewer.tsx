/**
 * =============================================================================
 * PRISMWALLS - Wallpaper Viewer Screen (Reliable Set Wallpaper)
 * =============================================================================
 *
 * Features:
 * - High Quality setting integration
 * - Save to Gallery setting integration
 * - Working Favorites (Zustand)
 * - Download & Share
 * - SET WALLPAPER - Opens Android Picker
 * - Pinch to zoom
 *
 * Author: Shotlin Team
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import React, { useCallback, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import { COLORS } from '@/src/constants';
import { usePhoto } from '@/src/hooks';

// Stores
import { useFavoritesStore } from '@/src/store/useFavoritesStore';
import {
  useSettingsStore,
  selectHighQuality,
  selectSaveToGallery,
} from '@/src/store/useSettingsStore';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// TYPES
// =============================================================================

type ActionButtonProps = {
  icon: keyof typeof Ionicons. glyphMap;
  label: string;
  onPress: () => void;
  loading?: boolean;
};

// =============================================================================
// HELPER: Check if running in Expo Go
// =============================================================================

const isExpoGo = Constants.appOwnership === 'expo';

// =============================================================================
// HELPER: Download file
// =============================================================================

async function downloadFile(url: string, filename: string): Promise<string | null> {
  try {
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    const downloadResult = await FileSystem. downloadAsync(url, fileUri);

    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }

    throw new Error(`Download failed with status: ${downloadResult.status}`);
  } catch (error) {
    console.error('Download error:', error);
    return null;
  }
}

// =============================================================================
// ACTION BUTTON COMPONENT
// =============================================================================

const ActionButton = ({ icon, label, onPress, loading }: ActionButtonProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionButton,
      { opacity: pressed ? 0.7 : 1 },
    ]}
    disabled={loading}
  >
    <View style={styles.actionIconContainer}>
      {loading ?  (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons name={icon} size={24} color="#fff" />
      )}
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </Pressable>
);

// =============================================================================
// VIEWER SCREEN
// =============================================================================

export default function ViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const photoId = params. id ?  parseInt(params.id, 10) : 0;

  // State
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSettingWallpaper, setIsSettingWallpaper] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Favorites Store
  const favorites = useFavoritesStore((state) => state. favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Settings Store
  const highQuality = useSettingsStore(selectHighQuality);
  const saveToGallery = useSettingsStore(selectSaveToGallery);

  // Fetch photo data
  const { data: photo, isLoading, isError } = usePhoto(photoId);

  // Check if current photo is favorited
  const isFavorite = useMemo(() => {
    return favorites. some((f) => f.id === String(photoId));
  }, [favorites, photoId]);

  // Animated values for pinch zoom
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Get image URLs based on settings
  const previewUrl =
    photo?. src?. large2x || photo?.src?.large || photo?.src?. original || '';

  const downloadUrl = highQuality
    ?  photo?.src?.original || photo?.src?.large2x || ''
    : photo?.src?.large || photo?.src?.medium || '';

  const placeholderColor = photo?.avg_color || '#1a1a2e';

  // ==========================================================================
  // GESTURES
  // ==========================================================================

  const pinchGesture = Gesture. Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY. value = 0;
      } else if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX. value + event.translationX;
        translateY.value = savedTranslateY.value + event. translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture. Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const singleTapGesture = Gesture. Tap(). onEnd(() => {
    runOnJS(setShowControls)(! showControls);
  });

  const composedGestures = Gesture. Simultaneous(
    pinchGesture,
    panGesture,
    Gesture. Exclusive(doubleTapGesture, singleTapGesture)
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY. value },
    ],
  }));

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleClose = useCallback(() => {
    router. back();
  }, [router]);

  // Download
  const handleDownload = useCallback(async () => {
    if (!downloadUrl) return;

    if (isExpoGo) {
      Alert.alert(
        'Development Build Required',
        'Download feature requires a development build.\n\nRun: npx expo run:android',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsDownloading(true);

      if (saveToGallery) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please grant permission to save images.'
          );
          return;
        }
      }

      const qualityLabel = highQuality ?  'hq' : 'std';
      const filename = `wallpaper_${photoId}_${qualityLabel}_${Date.now()}.jpg`;
      const fileUri = await downloadFile(downloadUrl, filename);

      if (fileUri) {
        if (saveToGallery) {
          await MediaLibrary.saveToLibraryAsync(fileUri);
          Alert.alert(
            'Success!  ✓',
            `Wallpaper saved to gallery!\n\nQuality: ${
              highQuality ?  'Original (HD)' : 'Standard'
            }`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Downloaded!  ✓',
            'Wallpaper downloaded to app cache.',
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download wallpaper.');
    } finally {
      setIsDownloading(false);
    }
  }, [downloadUrl, photoId, highQuality, saveToGallery]);

  // Share
  const handleShare = useCallback(async () => {
    if (!downloadUrl) return;

    if (isExpoGo) {
      Alert.alert(
        'Development Build Required',
        'Share feature requires a development build.\n\nRun: npx expo run:android',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsSharing(true);

      const filename = `wallpaper_${photoId}. jpg`;
      const fileUri = await downloadFile(downloadUrl, filename);

      if (fileUri) {
        await Sharing.shareAsync(fileUri);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share wallpaper.');
    } finally {
      setIsSharing(false);
    }
  }, [downloadUrl, photoId]);

  // ✅ SET WALLPAPER - Reliable Method
  const handleSetWallpaper = useCallback(async () => {
    if (!downloadUrl) return;

    // iOS doesn't support setting wallpaper programmatically
    if (Platform.OS === 'ios') {
      Alert.alert(
        'iOS Limitation',
        "iOS doesn't allow apps to set wallpaper directly.\n\nPlease download the image and set it manually from Photos.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download', onPress: handleDownload },
        ]
      );
      return;
    }

    if (isExpoGo) {
      Alert.alert(
        'Development Build Required',
        'Set Wallpaper feature requires a development build.\n\nRun: npx expo run:android',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsSettingWallpaper(true);

      // Step 1: Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to save images.'
        );
        return;
      }

      // Step 2: Download the image
      const filename = `PrismWalls_${photoId}_${Date.now()}. jpg`;
      const fileUri = await downloadFile(downloadUrl, filename);

      if (! fileUri) {
        throw new Error('Failed to download image');
      }

      // Step 3: Save to gallery
      await MediaLibrary.saveToLibraryAsync(fileUri);

      // Step 4: Open Android Wallpaper Settings
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.WALLPAPER_SETTINGS
      );

      // Step 5: Show instructions
      Alert.alert(
        'Set Wallpaper 🖼️',
        'Image saved to gallery!\n\nNow:\n1.  Tap "My photos" or "Gallery"\n2. Select the latest image\n3. Choose Home/Lock/Both\n4. Done! ',
        [{ text: 'Got it!' }]
      );
    } catch (error) {
      console.error('Set wallpaper error:', error);
      Alert.alert(
        'Image Saved! ',
        'Wallpaper saved to gallery.\n\nTo set manually:\n1. Open Gallery\n2. Find the image\n3. Tap ⋮ → "Set as wallpaper"',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSettingWallpaper(false);
    }
  }, [downloadUrl, photoId, handleDownload]);

  // Favorite Handler
  const handleFavorite = useCallback(() => {
    if (!photo) return;

    toggleFavorite({
      id: String(photo.id),
      imageUri: photo.src?. medium || photo.src?.small || '',
      fullImageUri:
        photo.src?.large2x || photo.src?.large || photo. src?.original || '',
      photographer: photo.photographer || 'Unknown',
      avgColor: photo.avg_color || '#E2E8F0',
      width: photo.width || 1080,
      height: photo.height || 1920,
    });
  }, [photo, toggleFavorite]);

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading wallpaper...</Text>
      </View>
    );
  }

  // ==========================================================================
  // ERROR STATE
  // ==========================================================================

  if (isError || !photo) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Ionicons name="image-outline" size={64} color="#666" />
        <Text style={styles. errorText}>Failed to load wallpaper</Text>
        <Pressable onPress={handleClose} style={styles.errorButton}>
          <Text style={styles. errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <GestureHandlerRootView style={styles. container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      {/* Background Color */}
      <View style={[styles.background, { backgroundColor: placeholderColor }]} />

      {/* Zoomable Image */}
      <GestureDetector gesture={composedGestures}>
        <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
          <Image
            source={{ uri: previewUrl }}
            style={styles.image}
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
          />
        </Animated.View>
      </GestureDetector>

      {/* Top Controls */}
      {showControls && (
        <View style={styles.topControls}>
          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>

            <Pressable
              onPress={handleFavorite}
              style={({ pressed }) => [
                styles.favoriteButton,
                isFavorite && styles.favoriteButtonActive,
                { opacity: pressed ?  0.7 : 1 },
              ]}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={26}
                color={isFavorite ?  '#EF4444' : '#fff'}
              />
            </Pressable>
          </BlurView>
        </View>
      )}

      {/* Bottom Controls */}
      {showControls && (
        <View style={styles.bottomControls}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            {/* Photographer Info */}
            {photo. photographer && (
              <View style={styles.photographerInfo}>
                <Ionicons name="camera-outline" size={16} color="#fff" />
                <Text style={styles.photographerName}>{photo.photographer}</Text>
              </View>
            )}

            {/* Quality Badge */}
            <View style={styles. qualityBadge}>
              <Ionicons
                name={highQuality ? 'sparkles' : 'image'}
                size={12}
                color="#fff"
              />
              <Text style={styles.qualityText}>
                {highQuality ? 'Original Quality' : 'Standard Quality'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <ActionButton
                icon="download-outline"
                label="Download"
                onPress={handleDownload}
                loading={isDownloading}
              />
              <ActionButton
                icon="share-outline"
                label="Share"
                onPress={handleShare}
                loading={isSharing}
              />
              <ActionButton
                icon="phone-portrait-outline"
                label="Set Wallpaper"
                onPress={handleSetWallpaper}
                loading={isSettingWallpaper}
              />
            </View>
          </LinearGradient>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ... StyleSheet.absoluteFillObject,
  },

  // Image
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // Top Controls
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  blurContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Bottom Controls
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  gradient: {
    paddingTop: 60,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
  },

  // Photographer
  photographerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  photographerName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },

  // Quality Badge
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  qualityText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },

  // Loading & Error
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#888',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  errorButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});