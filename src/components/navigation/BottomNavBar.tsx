import { MotiView } from 'moti';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { COLORS, LAYOUT } from '../../constants';
import { TabName } from '../../types';
import { NavItem } from './NavItem';

type Props = {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
};

export const BottomNavBar = React.memo(function BottomNavBar({
  activeTab,
  onTabPress,
}: Props) {
  return (
    <MotiView
      transition={{ type: 'timing', duration: 300 }}
      style={styles.container}
    >
      <NavItem
        name="home"
        icon="home"
        iconOutline="home-outline"
        isActive={activeTab === 'home'}
        onPress={onTabPress}
      /> 
      <NavItem
        name="favorites"
        icon="heart"
        iconOutline="heart-outline"
        isActive={activeTab === 'favorites'}
        onPress={onTabPress}
      />
      <NavItem
        name="category"
        icon="grid"
        iconOutline="grid-outline"
        isActive={activeTab === 'category'}
        onPress={onTabPress}
      />
      <NavItem
        name="trending"
        icon="flame"
        iconOutline="flame-outline"
        isActive={activeTab === 'trending'}
        onPress={onTabPress}
      />
      <NavItem
        name="settings"
        icon="settings"
        iconOutline="settings-outline"
        isActive={activeTab === 'settings'}
        onPress={onTabPress}
      />
    </MotiView>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 28,
    left: 24,
    right: 24,
    height: LAYOUT.NAV_HEIGHT,
    backgroundColor: COLORS.surface,
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.textPrimary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
    }),
  },
});