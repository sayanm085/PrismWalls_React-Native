import { MotiView } from 'moti';
import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS } from '../../constants';
import { IconButton } from '../common';

type Props = {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  animatedStyle?: any;
};

export const HomeHeader = React.memo(function HomeHeader({
  onMenuPress,
  onSearchPress,
  animatedStyle,
}: Props) {
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* <IconButton icon="menu" size={26} onPress={onMenuPress} delay={100} /> */}

      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', delay: 150 }}
        style={styles.logoContainer}
      >
        <Text style={styles.logoWall}>Prism</Text>
        <Text style={styles.logoPers}>Walls</Text>
      </MotiView>

      <IconButton icon="search" onPress={onSearchPress} delay={100} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWall: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  logoPers: {
    fontSize: 26,
    fontWeight: '400',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
});