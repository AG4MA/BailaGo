import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { RootStackParamList, DANCE_TYPES } from '../types';
import { useEvents, useAuth } from '../contexts';
import { Button } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

type EventDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetail'>;
type EventDetailRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

interface EventDetailScreenProps {
  navigation: EventDetailNavigationProp;
  route: EventDetailRouteProp;
}

export function EventDetailScreen({ navigation, route }: EventDetailScreenProps) {
  const { eventId } = route.params;
  const { getEventById, joinEvent, leaveEvent, isParticipant, deleteEvent, isLoading } = useEvents();
  const { user } = useAuth();
  
  const event = getEventById(eventId);
  
  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundText}>Evento non trovato</Text>
          <Button title="Torna indietro" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const danceInfo = DANCE_TYPES.find(d => d.id === event.danceType);
  const isCreator = user?.id === event.creatorId;
  const isJoined = isParticipant(eventId);
  const participantCount = event.participants.length;
  const isFull = event.maxParticipants ? participantCount >= event.maxParticipants : false;

  const handleJoinLeave = async () => {
    try {
      if (isJoined) {
        await leaveEvent(eventId);
        Alert.alert('Fatto!', 'Hai lasciato l\'evento');
      } else {
        if (isFull) {
          Alert.alert('Evento al completo', 'Questo evento ha raggiunto il numero massimo di partecipanti');
          return;
        }
        await joinEvent(eventId);
        Alert.alert('Fantastico! 🎉', 'Parteciperai a questo evento');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile completare l\'azione. Riprova.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Elimina evento',
      'Sei sicuro di voler eliminare questo evento? L\'azione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(eventId);
            navigation.goBack();
          }
        },
      ]
    );
  };

  const generateShareMessage = () => {
    const dateFormatted = format(new Date(event.date), 'EEEE d MMMM', { locale: it });
    return `🎉 Ti invito a "${event.title}"!\n\n` +
      `${danceInfo?.emoji} ${danceInfo?.name}\n` +
      `📅 ${dateFormatted}\n` +
      `⏰ ${event.startTime}\n` +
      `📍 ${event.location.name}, ${event.location.city}\n` +
      `${event.djName ? `🎧 DJ: ${event.djName}\n` : ''}` +
      `\nScarica BailaGo per partecipare! 💃🕺`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: generateShareMessage(),
        title: event.title,
      });
    } catch (error) {
      Alert.alert('Errore', 'Impossibile condividere l\'evento');
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(generateShareMessage());
    Linking.openURL(`whatsapp://send?text=${message}`);
  };

  const handleShareTelegram = () => {
    const message = encodeURIComponent(generateShareMessage());
    Linking.openURL(`tg://msg?text=${message}`);
  };

  const handleShareInstagram = () => {
    // Instagram non supporta la condivisione diretta di testo
    // Si può aprire l'app per condividere una storia
    Alert.alert(
      'Condividi su Instagram',
      'Copia il messaggio e condividilo nelle tue storie o in un messaggio diretto!',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Copia messaggio', 
          onPress: handleShare
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con colore del ballo */}
        <View style={[styles.header, { backgroundColor: danceInfo?.color }]}>
          <Text style={styles.headerEmoji}>{danceInfo?.emoji}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{danceInfo?.name}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Titolo e info base */}
          <Text style={styles.title}>{event.title}</Text>
          
          {/* Data e ora */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar" size={24} color={danceInfo?.color} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Data</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: it })}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="time" size={24} color={danceInfo?.color} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Orario</Text>
                <Text style={styles.infoValue}>
                  {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location" size={24} color={danceInfo?.color} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Luogo</Text>
                <Text style={styles.infoValue}>{event.location.name}</Text>
                <Text style={styles.infoSubvalue}>
                  {event.location.address ? `${event.location.address}, ` : ''}{event.location.city}
                </Text>
              </View>
            </View>

            {event.djName && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="musical-notes" size={24} color={danceInfo?.color} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>DJ della serata</Text>
                    <Text style={styles.infoValue}>{event.djName}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Descrizione */}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descrizione</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Organizzatore */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizzato da</Text>
            <View style={styles.creatorCard}>
              <View style={[styles.avatar, { backgroundColor: danceInfo?.color }]}>
                <Text style={styles.avatarText}>
                  {event.creator.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>{event.creator.displayName}</Text>
                <Text style={styles.creatorUsername}>@{event.creator.username}</Text>
              </View>
            </View>
          </View>

          {/* Partecipanti */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partecipanti</Text>
            <View style={styles.participantsCard}>
              <Ionicons name="people" size={24} color={danceInfo?.color} />
              <Text style={styles.participantCount}>
                {participantCount}
                {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} partecipanti
              </Text>
              {isFull && (
                <View style={styles.fullBadge}>
                  <Text style={styles.fullBadgeText}>Completo</Text>
                </View>
              )}
            </View>

            {event.showParticipantNames && event.participants.length > 0 && (
              <View style={styles.participantsList}>
                {event.participants.map(p => (
                  <View key={p.userId} style={styles.participantItem}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantAvatarText}>
                        {p.user.displayName.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.participantName}>{p.user.displayName}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Condivisione */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condividi evento</Text>
            <View style={styles.shareButtons}>
              <TouchableOpacity 
                style={[styles.shareBtn, { backgroundColor: '#25D366' }]}
                onPress={handleShareWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.shareBtn, { backgroundColor: '#0088cc' }]}
                onPress={handleShareTelegram}
              >
                <Ionicons name="paper-plane" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.shareBtn, { backgroundColor: '#E4405F' }]}
                onPress={handleShareInstagram}
              >
                <Ionicons name="logo-instagram" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.shareBtn, { backgroundColor: colors.primary }]}
                onPress={handleShare}
              >
                <Ionicons name="share-social" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Azioni del creatore */}
          {isCreator && (
            <View style={styles.creatorActions}>
              <Button
                title="Elimina evento"
                onPress={handleDelete}
                variant="outline"
                style={styles.deleteBtn}
                textStyle={{ color: colors.error }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer con bottone partecipa */}
      {!isCreator && (
        <View style={styles.footer}>
          <Button
            title={isJoined ? 'Non partecipo più' : 'Partecipa'}
            onPress={handleJoinLeave}
            loading={isLoading}
            variant={isJoined ? 'outline' : 'primary'}
            style={isJoined ? {} : { backgroundColor: danceInfo?.color }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  
  notFoundEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  
  notFoundText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  
  headerEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  
  badgeText: {
    ...typography.body,
    color: colors.textWhite,
    fontWeight: '600',
  },
  
  content: {
    padding: spacing.lg,
  },
  
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  infoContent: {
    flex: 1,
  },
  
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  infoSubvalue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  
  section: {
    marginTop: spacing.xl,
  },
  
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textWhite,
  },
  
  creatorInfo: {
    flex: 1,
  },
  
  creatorName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  
  creatorUsername: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  participantsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
    gap: spacing.sm,
  },
  
  participantCount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  
  fullBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  
  fullBadgeText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  
  participantsList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  participantAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textWhite,
  },
  
  participantName: {
    ...typography.body,
    color: colors.text,
  },
  
  shareButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  shareBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  
  creatorActions: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  deleteBtn: {
    borderColor: colors.error,
  },
  
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
