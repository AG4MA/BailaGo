import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { RootStackParamList, DANCE_TYPES, CreateEventData, Location, EventVisibility, DjMode } from '../types';
import { useEvents, useGroups } from '../contexts';
import { Button, Input } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

type CreateEventNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateEvent'>;
type CreateEventRouteProp = RouteProp<RootStackParamList, 'CreateEvent'>;

interface CreateEventScreenProps {
  navigation: CreateEventNavigationProp;
  route: CreateEventRouteProp;
}

export function CreateEventScreen({ navigation, route }: CreateEventScreenProps) {
  const { danceType, selectedDate } = route.params;
  const { createEvent, isLoading } = useEvents();
  const { groups } = useGroups();
  
  const danceInfo = DANCE_TYPES.find(d => d.id === danceType);
  
  // Gruppi dove l'utente è admin
  const adminGroups = groups.filter(g => g.isAdmin);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [city, setCity] = useState('');
  const [startTime, setStartTime] = useState('21:00');
  const [endTime, setEndTime] = useState('');
  const [djName, setDjName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [showParticipantNames, setShowParticipantNames] = useState(true);
  
  // Nuovi stati per visibilità e DJ
  const [visibility, setVisibility] = useState<EventVisibility>('public');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
  const [djMode, setDjMode] = useState<DjMode>('open');

  const eventDate = selectedDate 
    ? parse(selectedDate, 'yyyy-MM-dd', new Date())
    : new Date();

  const handleCreate = async () => {
    // Validazione
    if (!title.trim()) {
      Alert.alert('Errore', 'Inserisci un titolo per l\'evento');
      return;
    }
    if (!locationName.trim()) {
      Alert.alert('Errore', 'Inserisci il nome del luogo');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Errore', 'Inserisci la città');
      return;
    }
    if (visibility === 'group' && !selectedGroupId) {
      Alert.alert('Errore', 'Seleziona un gruppo per l\'evento');
      return;
    }

    const location: Location = {
      id: Date.now().toString(),
      name: locationName,
      address: locationAddress,
      city,
    };

    const eventData: CreateEventData = {
      title,
      description,
      danceType,
      location,
      date: eventDate,
      startTime,
      endTime: endTime || undefined,
      visibility,
      groupId: visibility === 'group' ? selectedGroupId : undefined,
      djMode,
      djName: djMode !== 'none' ? djName || undefined : undefined,
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
      showParticipantNames,
    };

    try {
      console.log('[CreateEventScreen] Creating event:', eventData);
      const newEvent = await createEvent(eventData);
      console.log('[CreateEventScreen] Event created:', newEvent.id);
      Alert.alert(
        'Evento creato! 🎉',
        'Il tuo evento è stato creato con successo. Vuoi condividerlo?',
        [
          { text: 'Dopo', onPress: () => navigation.goBack() },
          { 
            text: 'Condividi', 
            onPress: () => navigation.replace('EventDetail', { eventId: newEvent.id })
          },
        ]
      );
    } catch (error) {
      console.error('[CreateEventScreen] Error creating event:', error);
      Alert.alert('Errore', `Impossibile creare l'evento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: danceInfo?.color }]}>
            <Text style={styles.headerEmoji}>{danceInfo?.emoji}</Text>
            <Text style={styles.headerTitle}>Nuovo evento {danceInfo?.name}</Text>
            <Text style={styles.headerDate}>
              {format(eventDate, 'EEEE d MMMM yyyy', { locale: it })}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Titolo */}
            <Input
              label="Titolo evento *"
              placeholder="Es: Salsa al tramonto"
              value={title}
              onChangeText={setTitle}
              leftIcon={<Ionicons name="text" size={20} color={colors.textSecondary} />}
            />

            {/* Descrizione */}
            <Input
              label="Descrizione"
              placeholder="Descrivi il tuo evento..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            {/* Visibilità */}
            <Text style={styles.sectionTitle}>👁️ Visibilità evento</Text>
            
            <View style={styles.optionGroup}>
              <TouchableOpacity
                style={[styles.optionButton, visibility === 'public' && styles.optionButtonSelected]}
                onPress={() => setVisibility('public')}
              >
                <Ionicons 
                  name="globe-outline" 
                  size={22} 
                  color={visibility === 'public' ? '#fff' : colors.text} 
                />
                <Text style={[styles.optionText, visibility === 'public' && styles.optionTextSelected]}>
                  Pubblico
                </Text>
                <Text style={[styles.optionHint, visibility === 'public' && styles.optionHintSelected]}>
                  Visibile a tutti
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, visibility === 'private' && styles.optionButtonSelected]}
                onPress={() => setVisibility('private')}
              >
                <Ionicons 
                  name="lock-closed-outline" 
                  size={22} 
                  color={visibility === 'private' ? '#fff' : colors.text} 
                />
                <Text style={[styles.optionText, visibility === 'private' && styles.optionTextSelected]}>
                  Privato
                </Text>
                <Text style={[styles.optionHint, visibility === 'private' && styles.optionHintSelected]}>
                  Solo tu lo vedi
                </Text>
              </TouchableOpacity>
              
              {adminGroups.length > 0 && (
                <TouchableOpacity
                  style={[styles.optionButton, visibility === 'group' && styles.optionButtonSelected]}
                  onPress={() => setVisibility('group')}
                >
                  <Ionicons 
                    name="people-outline" 
                    size={22} 
                    color={visibility === 'group' ? '#fff' : colors.text} 
                  />
                  <Text style={[styles.optionText, visibility === 'group' && styles.optionTextSelected]}>
                    Gruppo
                  </Text>
                  <Text style={[styles.optionHint, visibility === 'group' && styles.optionHintSelected]}>
                    Solo membri gruppo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {visibility === 'group' && adminGroups.length > 0 && (
              <View style={styles.groupSelector}>
                <Text style={styles.subLabel}>Seleziona gruppo:</Text>
                {adminGroups.map(group => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.groupOption,
                      selectedGroupId === group.id && styles.groupOptionSelected
                    ]}
                    onPress={() => setSelectedGroupId(group.id)}
                  >
                    <Ionicons 
                      name={selectedGroupId === group.id ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={22} 
                      color={selectedGroupId === group.id ? danceInfo?.color : colors.textLight} 
                    />
                    <Text style={styles.groupOptionText}>{group.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Luogo */}
            <Text style={styles.sectionTitle}>📍 Luogo</Text>
            
            <Input
              label="Nome del posto *"
              placeholder="Es: Piazza Duomo"
              value={locationName}
              onChangeText={setLocationName}
              leftIcon={<Ionicons name="location" size={20} color={colors.textSecondary} />}
            />

            <Input
              label="Indirizzo"
              placeholder="Via/Piazza..."
              value={locationAddress}
              onChangeText={setLocationAddress}
            />

            <Input
              label="Città *"
              placeholder="Es: Milano"
              value={city}
              onChangeText={setCity}
            />

            {/* Orari */}
            <Text style={styles.sectionTitle}>⏰ Orari</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Ora inizio *"
                  placeholder="21:00"
                  value={startTime}
                  onChangeText={setStartTime}
                  leftIcon={<Ionicons name="time" size={20} color={colors.textSecondary} />}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Ora fine"
                  placeholder="00:00"
                  value={endTime}
                  onChangeText={setEndTime}
                  leftIcon={<Ionicons name="time-outline" size={20} color={colors.textSecondary} />}
                />
              </View>
            </View>

            {/* DJ */}
            <Text style={styles.sectionTitle}>🎧 DJ della serata</Text>
            
            <View style={styles.optionGroup}>
              <TouchableOpacity
                style={[styles.optionButton, djMode === 'open' && styles.optionButtonSelected]}
                onPress={() => setDjMode('open')}
              >
                <Ionicons 
                  name="hand-right-outline" 
                  size={22} 
                  color={djMode === 'open' ? '#fff' : colors.text} 
                />
                <Text style={[styles.optionText, djMode === 'open' && styles.optionTextSelected]}>
                  Aperto
                </Text>
                <Text style={[styles.optionHint, djMode === 'open' && styles.optionHintSelected]}>
                  Chiunque può candidarsi
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, djMode === 'assigned' && styles.optionButtonSelected]}
                onPress={() => setDjMode('assigned')}
              >
                <Ionicons 
                  name="person-outline" 
                  size={22} 
                  color={djMode === 'assigned' ? '#fff' : colors.text} 
                />
                <Text style={[styles.optionText, djMode === 'assigned' && styles.optionTextSelected]}>
                  Assegnato
                </Text>
                <Text style={[styles.optionHint, djMode === 'assigned' && styles.optionHintSelected]}>
                  DJ già scelto
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, djMode === 'none' && styles.optionButtonSelected]}
                onPress={() => setDjMode('none')}
              >
                <Ionicons 
                  name="close-circle-outline" 
                  size={22} 
                  color={djMode === 'none' ? '#fff' : colors.text} 
                />
                <Text style={[styles.optionText, djMode === 'none' && styles.optionTextSelected]}>
                  Nessuno
                </Text>
                <Text style={[styles.optionHint, djMode === 'none' && styles.optionHintSelected]}>
                  Niente DJ
                </Text>
              </TouchableOpacity>
            </View>
            
            {djMode !== 'none' && (
              <Input
                label={djMode === 'assigned' ? "Nome DJ *" : "Nome DJ (opzionale)"}
                placeholder={djMode === 'open' ? "Lascia vuoto se ancora da definire" : "Chi si occupa della musica?"}
                value={djName}
                onChangeText={setDjName}
                leftIcon={<Ionicons name="musical-notes" size={20} color={colors.textSecondary} />}
              />
            )}

            {/* Impostazioni */}
            <Text style={styles.sectionTitle}>⚙️ Impostazioni</Text>

            <Input
              label="Numero massimo partecipanti (opzionale)"
              placeholder="Lascia vuoto per illimitato"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
              leftIcon={<Ionicons name="people" size={20} color={colors.textSecondary} />}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Ionicons name="eye" size={20} color={colors.textSecondary} />
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Mostra nomi partecipanti</Text>
                  <Text style={styles.switchSubtitle}>
                    Se disattivato, verrà mostrato solo il numero
                  </Text>
                </View>
              </View>
              <Switch
                value={showParticipantNames}
                onValueChange={setShowParticipantNames}
                trackColor={{ false: colors.border, true: `${danceInfo?.color}80` }}
                thumbColor={showParticipantNames ? danceInfo?.color : colors.textLight}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer con bottone crea */}
        <View style={styles.footer}>
          <Button
            title="Crea evento"
            onPress={handleCreate}
            loading={isLoading}
            style={{ backgroundColor: danceInfo?.color }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  keyboardView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  
  headerTitle: {
    ...typography.h3,
    color: colors.textWhite,
  },
  
  headerDate: {
    ...typography.body,
    color: colors.textWhite,
    opacity: 0.9,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  
  form: {
    padding: spacing.lg,
  },
  
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  halfInput: {
    flex: 1,
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  
  switchTextContainer: {
    flex: 1,
  },
  
  switchTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  
  switchSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  
  // Option buttons for visibility and DJ mode
  optionGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  
  optionButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  optionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  
  optionTextSelected: {
    color: '#fff',
  },
  
  optionHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  
  optionHintSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Group selector
  groupSelector: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  
  subLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  
  groupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  
  groupOptionSelected: {},
  
  groupOptionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});
