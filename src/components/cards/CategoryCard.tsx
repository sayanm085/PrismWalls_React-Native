// src/components/CategoryCard.tsx
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  id?: string | number;
  title: string;
  subtitle?: string;
  color?: string;
  onPress?: (id?: string | number) => void;
  compact?: boolean; // smaller pill style
};

const CategoryCard: React.FC<Props> = ({ id, title, subtitle, color = "#5D5FEF", onPress, compact = false }) => {
  const handlePress = useCallback(() => {
    onPress?.(id);
  }, [id, onPress]);

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.container, compact ? styles.compact : null, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }]}>
      <View>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
};

export default React.memo(CategoryCard);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginRight: 10,
    minWidth: 110,
    justifyContent: "center",
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    minWidth: 72,
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 2,
  },
});
