/**
 * =============================================================================
 * PRISMWALLS - Animated Splash Screen
 * =============================================================================
 *
 * Features:
 * - Logo scale & fade animation
 * - Text reveal animation
 * - Loading dots animation
 * - Smooth exit transition
 *
 * Author: Shotlin Team
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@/src/constants';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions. get('window');

// =============================================================================
// TYPES
// =============================================================================

type AnimatedSplashScreenProps = {
  onAnimationComplete: () => void;
};

// =============================================================================
// LOADING DOTS COMPONENT
// =============================================================================

const LoadingDots = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (dotValue: Animated.SharedValue<number>, delay: number) => {
      dotValue.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.ease }),
            withTiming(0, { duration: 400, easing: Easing.ease })
          ),
          -1,
          false
        )
      );
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  const dotStyle1 = useAnimatedStyle(() => ({
    opacity: interpolate(dot1. value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1. value, [0, 1], [0.8, 1.2]) }],
  }));

  const dotStyle2 = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dotStyle3 = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles. dotsContainer}>
      <Animated.View style={[styles. dot, dotStyle1]} />
      <Animated.View style={[styles.dot, dotStyle2]} />
      <Animated. View style={[styles.dot, dotStyle3]} />
    </View>
  );
};

// =============================================================================
// ANIMATED SPLASH SCREEN COMPONENT
// =============================================================================

export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const loadingOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  useEffect(() => {
    // Logo animation
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
    logoRotate.value = withSequence(
      withTiming(10, { duration: 200 }),
      withSpring(0, { damping: 8 })
    );

    // Text animation (delayed)
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 15, stiffness: 100 })
    );

    // Subtitle animation
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    // Loading animation
    loadingOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));

    // Exit animation after 2. 5 seconds
    const exitTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400 });
      containerScale.value = withTiming(1.1, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      });
    }, 2500);

    return () => clearTimeout(exitTimer);
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity. value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate. value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity. value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity. value,
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <LinearGradient
        colors={[COLORS.primary, '#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background Pattern */}
        <View style={styles.patternContainer}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternCircle,
                {
                  left: Math.random() * SCREEN_WIDTH,
                  top: Math.random() * SCREEN_HEIGHT,
                  width: 20 + Math.random() * 60,
                  height: 20 + Math.random() * 60,
                  opacity: 0.03 + Math.random() * 0.05,
                },
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles. content}>
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoBackground}>
              <Ionicons name="images" size={50} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* App Name */}
          <Animated.View style={textAnimatedStyle}>
            <Text style={styles.appName}>PRISMWALLS</Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated. View style={subtitleAnimatedStyle}>
            <Text style={styles.subtitle}>Beautiful Wallpapers</Text>
          </Animated.View>

          {/* Loading Dots */}
          <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
            <LoadingDots />
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles. footer}>
          <Text style={styles. footerText}>by Shotlin Team</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    ... StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternContainer: {
    ... StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ... Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: { elevation: 15 },
    }),
  },

  // Text
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    letterSpacing: 1,
  },

  // Loading
  loadingContainer: {
    marginTop: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
});

export default AnimatedSplashScreen;