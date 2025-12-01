import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';
import { IconName } from '../../types';

type Props = {
  icon: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  delay?: number;
};

export const IconButton = React.memo(function IconButton({
  icon,
  size = 24,
  color = COLORS.textPrimary,
  onPress,
  delay = 0,
}: Props) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay }}
    >
      <Pressable onPress={onPress} style={styles.button}>
        <Ionicons name={icon} size={size} color={color} />
      </Pressable>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});