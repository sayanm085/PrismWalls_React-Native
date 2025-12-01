import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';
import { IconName, TabName } from '../../types';

type Props = {
  name: TabName;
  icon: IconName;
  iconOutline: IconName;
  isActive: boolean;
  onPress: (name: TabName) => void;
};

export const NavItem = React.memo(function NavItem({
  name,
  icon,
  iconOutline,
  isActive,
  onPress,
}: Props) {
  const handlePress = useCallback(() => {
    onPress(name);
  }, [name, onPress]);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <MotiView
        animate={{
          scale: isActive ? 1 : 0.85,
          backgroundColor: isActive ? COLORS.primary : 'transparent',
        }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 200,
        }}
        style={styles.inner}
      >
        <MotiView
          animate={{ scale: isActive ? 1.1 : 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <Ionicons
            name={isActive ? icon : iconOutline}
            size={24}
            color={isActive ? '#fff' : COLORS.textSecondary}
          />
        </MotiView>
      </MotiView>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  inner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});