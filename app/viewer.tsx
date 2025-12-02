/**
 * =============================================================================
 * Wallpaper Viewer Screen - Full Preview (Expo SDK 54)
 * =============================================================================
 *
 * Full screen wallpaper preview with:
 * - High resolution image
 * - Pinch to zoom
 * - Download button (new File API)
 * - Share button
 * - Photographer credit
 *
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { File, Paths } from 'expo-file-system/next';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from 'react';
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

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// TYPES
// =============================================================================

type ActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  loading?: boolean;
};

// =============================================================================
// HELPER: Check if running in Expo Go
// =============================================================================

const isExpoGo = Constants.appOwnership === 'expo';

// =============================================================================
// HELPER: Download file using new File API
// =============================================================================

async function downloadFile(url: string, filename: string): Promise<File | null> {
  try {
    const destinationFile = new File(Paths.cache, filename);
    
    // Fetch the image
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    // Get blob and convert to base64
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    
    // Write to file
    await destinationFile.write(base64, { encoding: 'base64' });
    
    return destinationFile;
  } catch (error) {
    console.error('Download error:', error);
    return null;
  }
}

// Helper: Convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
      {loading ? (
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
  const photoId = params.id ? parseInt(params.id, 10) : 0;

  // State
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Fetch photo data
  const { data: photo, isLoading, isError } = usePhoto(photoId);

  // Animated values for pinch zoom
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Get image URLs
  const previewUrl = photo?.src?.large2x || photo?.src?.large || photo?.src?.original || '';
  const downloadUrl = photo?.src?.original || photo?.src?.large2x || '';
  const placeholderColor = photo?.avg_color || '#1a1a2e';

  // ==========================================================================
  // GESTURES
  // ==========================================================================

  const pinchGesture = Gesture.Pinch()
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
        savedTranslateY.value = 0;
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
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
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

  const singleTapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(setShowControls)(!showControls);
    });

  const composedGestures = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    Gesture.Exclusive(doubleTapGesture, singleTapGesture)
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleDownload = useCallback(async () => {
    if (!downloadUrl) return;

    // Check if running in Expo Go
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

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images.');
        return;
      }

      // Download file
      const filename = `wallpaper_${photoId}_${Date.now()}.jpg`;
      const file = await downloadFile(downloadUrl, filename);

      if (file) {
        // Save to gallery
        await MediaLibrary.saveToLibraryAsync(file.uri);
        Alert.alert('Success', 'Wallpaper saved to gallery!');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download wallpaper.');
    } finally {
      setIsDownloading(false);
    }
  }, [downloadUrl, photoId]);

  const handleShare = useCallback(async () => {
    if (!downloadUrl) return;

    // Check if running in Expo Go
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

      const filename = `wallpaper_${photoId}.jpg`;
      const file = await downloadFile(downloadUrl, filename);

      if (file) {
        await Sharing.shareAsync(file.uri);
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

  const handleFavorite = useCallback(() => {
    Alert.alert('Added to Favorites', 'Wallpaper added to your favorites!');
  }, []);

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
        <Text style={styles.errorText}>Failed to load wallpaper</Text>
        <Pressable onPress={handleClose} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <GestureHandlerRootView style={styles.container}>
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
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="heart-outline" size={26} color="#fff" />
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
            {photo.photographer && (
              <View style={styles.photographerInfo}>
                <Ionicons name="camera-outline" size={16} color="#fff" />
                <Text style={styles.photographerName}>{photo.photographer}</Text>
              </View>
            )}

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
                onPress={() =>
                  Alert.alert('Info', 'Download first, then set from gallery.')
                }
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
    ...StyleSheet.absoluteFillObject,
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
    marginBottom: 20,
    gap: 8,
  },
  photographerName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
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