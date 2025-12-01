import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ANIM } from '../constants';

/**
 * Custom hook for press animation
 * Returns scale animation handlers and style
 */
export function useAnimatedPress(scaleValue = 0.97) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, ANIM.PRESS_SPRING);
  }, [scale, scaleValue]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIM.PRESS_SPRING);
  }, [scale]);

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
}