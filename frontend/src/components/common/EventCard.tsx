import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DanceEvent, DANCE_TYPES } from '../../types';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

interface EventCardProps {
  event: DanceEvent;
  onPress: () => void;
  compact?: boolean;
  isParticipating?: boolean; // Indica se l'utente corrente partecipa
}

export function EventCard({ event, onPress, compact = false, isParticipating = false }: EventCardProps) {
  const danceInfo = DANCE_TYPES.find(d => d.id === event.danceType);
  const participantCount = event.participants.length;
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={[
          styles.compactContainer, 
          isParticipating && styles.participatingCompact
        ]} 
        onPress={onPress}
      >
        <View style={[styles.colorBar, { backgroundColor: danceInfo?.color }]} />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.compactInfo}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.compactText}>{event.startTime}</Text>
            <Text style={styles.compactDot}>•</Text>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.compactText} numberOfLines={1}>{event.location.name}</Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.emoji}>{danceInfo?.emoji}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isParticipating && styles.participatingCard
      ]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {/* Badge partecipazione */}
      {isParticipating && (
        <View style={styles.participatingBadge}>
          <Ionicons name="checkmark-circle" size={14} color={colors.textWhite} />
          <Text style={styles.participatingBadgeText}>Partecipo</Text>
        </View>
      )}
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: danceInfo?.color }]}>
          <Text style={styles.placeholderEmoji}>{danceInfo?.emoji}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: `${danceInfo?.color}20` }]}>
            <Text style={styles.badgeEmoji}>{danceInfo?.emoji}</Text>
            <Text style={[styles.badgeText, { color: danceInfo?.color }]}>
              {danceInfo?.name}
            </Text>
          </View>
          <Text style={styles.date}>
            {format(new Date(event.date), 'dd MMM', { locale: it })}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location.name}, {event.location.city}
          </Text>
        </View>

        {event.djName && (
          <View style={styles.infoRow}>
            <Ionicons name="musical-notes-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>DJ: {event.djName}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.creatorInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {event.creator.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.creatorName} numberOfLines={1}>
              {event.creator.displayName}
            </Text>
          </View>
          
          <View style={styles.participants}>
            <Ionicons name="people-outline" size={16} color={colors.primary} />
            <Text style={styles.participantCount}>
              {participantCount}
              {event.maxParticipants ? `/${event.maxParticipants}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  
  // Stile per eventi a cui partecipo
  participatingCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  participatingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  
  participatingBadgeText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  
  participatingCompact: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  
  image: {
    width: '100%',
    height: 150,
  },
  
  imagePlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  placeholderEmoji: {
    fontSize: 48,
  },
  
  content: {
    padding: spacing.md,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  
  badgeEmoji: {
    fontSize: 14,
  },
  
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  
  creatorName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  participantCount: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Compact styles
  compactContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    ...shadows.small,
  },
  
  colorBar: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  
  compactContent: {
    flex: 1,
  },
  
  compactTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  
  compactText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  compactDot: {
    color: colors.textLight,
    marginHorizontal: 2,
  },
  
  compactRight: {
    marginLeft: spacing.sm,
  },
  
  emoji: {
    fontSize: 24,
  },
});
