import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { DanceTypeInfo } from '../../types';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

interface DanceTypeCardProps {
  danceType: DanceTypeInfo;
  onPress: () => void;
  selected?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function DanceTypeCard({
  danceType,
  onPress,
  selected = false,
  size = 'medium',
}: DanceTypeCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles[size],
        selected && styles.selected,
        { borderColor: danceType.color },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.emojiContainer, { backgroundColor: `${danceType.color}20` }]}>
        <Text style={styles[`${size}Emoji`]}>{danceType.emoji}</Text>
      </View>
      <Text style={[styles.name, styles[`${size}Text`]]} numberOfLines={1}>
        {danceType.name}
      </Text>
      {selected && (
        <View style={[styles.selectedIndicator, { backgroundColor: danceType.color }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...shadows.small,
  },
  
  // Sizes
  small: {
    width: 80,
    height: 80,
    padding: spacing.sm,
  },
  medium: {
    width: 100,
    height: 100,
    padding: spacing.md,
  },
  large: {
    width: 140,
    height: 140,
    padding: spacing.lg,
  },
  
  selected: {
    borderWidth: 3,
  },
  
  emojiContainer: {
    borderRadius: borderRadius.full,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  
  smallEmoji: {
    fontSize: 24,
  },
  mediumEmoji: {
    fontSize: 32,
  },
  largeEmoji: {
    fontSize: 48,
  },
  
  name: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 16,
  },
  
  selectedIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
