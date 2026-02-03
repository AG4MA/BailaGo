import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  TextInput,
  Modal,
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
  const { getEventById, joinEvent, leaveEvent, isParticipant, deleteEvent, applyAsDj, approveDj, rejectDj, isLoading } = useEvents();
  const { user } = useAuth();
  const [djModalVisible, setDjModalVisible] = useState(false);
  const [djMessage, setDjMessage] = useState('');
  
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

  const handleApplyDj = () => {
    setDjModalVisible(true);
  };

  const submitDjApplication = async () => {
    try {
      await applyAsDj(eventId, djMessage || undefined);
      setDjModalVisible(false);
      setDjMessage('');
      Alert.alert('Candidatura inviata! 🎧', 'Il creatore dell\'evento valuterà la tua richiesta');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile inviare la candidatura. Riprova.');
    }
  };

  const handleApproveDj = async (userId: string) => {
    try {
      await approveDj(eventId, userId);
      Alert.alert('DJ approvato! 🎉', 'Il DJ è stato assegnato all\'evento');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile approvare il DJ. Riprova.');
    }
  };

  const handleRejectDj = async (userId: string) => {
    Alert.alert(
      'Rifiuta candidatura',
      'Sei sicuro di voler rifiutare questa candidatura?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rifiuta',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectDj(eventId, userId);
            } catch (error) {
              Alert.alert('Errore', 'Impossibile rifiutare il DJ. Riprova.');
            }
          }
        }
      ]
    );
  };

  // Check if user already applied
  const hasApplied = event.djRequests?.some(r => r.userId === user?.id) || false;

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

            {/* DJ Section - always show if djMode is not 'none' */}
            {event.djMode !== 'none' && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="musical-notes" size={24} color={danceInfo?.color} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>DJ della serata</Text>
                    {event.djName ? (
                      <Text style={styles.infoValue}>{event.djName}</Text>
                    ) : (
                      <Text style={[styles.infoSubvalue, { fontStyle: 'italic' }]}>
                        {event.djMode === 'open' ? 'Aperto a candidature' : 'Da assegnare'}
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* DJ Candidature Section */}
          {event.djMode === 'open' && !isCreator && !event.djUserId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎧 Vuoi fare il DJ?</Text>
              {hasApplied ? (
                <View style={styles.djAppliedCard}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  <Text style={styles.djAppliedText}>Candidatura inviata</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.djApplyButton, { backgroundColor: danceInfo?.color }]}
                    onPress={handleApplyDj}
                  >
                    <Ionicons name="hand-right" size={20} color="#fff" />
                    <Text style={styles.djApplyButtonText}>Candidati come DJ</Text>
                  </TouchableOpacity>
                  <Text style={styles.djApplyHint}>
                    Il creatore dell'evento valuterà la tua candidatura
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Show DJ requests to creator */}
          {isCreator && event.djRequests && event.djRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Candidature DJ</Text>
              {event.djRequests.filter(r => r.status === 'pending').map(request => (
                <View key={request.userId} style={styles.djRequestCard}>
                  <View style={styles.djRequestInfo}>
                    <Text style={styles.djRequestName}>{request.user.displayName}</Text>
                    {request.message && (
                      <Text style={styles.djRequestMessage}>{request.message}</Text>
                    )}
                  </View>
                  <View style={styles.djRequestActions}>
                    <TouchableOpacity 
                      style={styles.djApproveBtn}
                      onPress={() => handleApproveDj(request.userId)}
                    >
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.djRejectBtn}
                      onPress={() => handleRejectDj(request.userId)}
                    >
                      <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

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

      {/* DJ Application Modal */}
      <Modal
        visible={djModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDjModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎧 Candidatura DJ</Text>
            <Text style={styles.modalSubtitle}>
              Aggiungi un messaggio per presentarti (opzionale)
            </Text>
            <TextInput
              style={styles.djMessageInput}
              placeholder="Es: Sono DJ da 5 anni, specializzato in salsa cubana..."
              value={djMessage}
              onChangeText={setDjMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => setDjModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { backgroundColor: danceInfo?.color }]}
                onPress={submitDjApplication}
              >
                <Text style={styles.modalSubmitText}>Invia candidatura</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // DJ Styles
  djApplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },

  djApplyButtonText: {
    ...typography.body,
    color: colors.textWhite,
    fontWeight: '600',
  },

  djApplyHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  djAppliedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },

  djAppliedText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },

  djRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },

  djRequestInfo: {
    flex: 1,
  },

  djRequestName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },

  djRequestMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  djRequestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  djApproveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  djRejectBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  djMessageInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 100,
    marginBottom: spacing.lg,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  modalCancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },

  modalCancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  modalSubmitBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },

  modalSubmitText: {
    ...typography.body,
    color: colors.textWhite,
    fontWeight: '600',
  },
});
