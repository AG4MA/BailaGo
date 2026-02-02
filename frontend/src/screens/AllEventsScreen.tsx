import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { 
  RootStackParamList, 
  DanceType, 
  DanceFamilyId,
  DANCE_TYPES, 
  DANCE_FAMILIES,
  getDancesByFamily 
} from '../types';
import { useAuth, useEvents } from '../contexts';
import { EventCard } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

type AllEventsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllEvents'>;
type AllEventsRouteProp = RouteProp<RootStackParamList, 'AllEvents'>;

interface AllEventsScreenProps {
  navigation: AllEventsNavigationProp;
  route: AllEventsRouteProp;
}

export function AllEventsScreen({ navigation, route }: AllEventsScreenProps) {
  const { user } = useAuth();
  const { events } = useEvents();
  
  // Filtri
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState(route.params?.city || '');
  const [selectedFamily, setSelectedFamily] = useState<DanceFamilyId | null>(null);
  const [selectedDanceTypes, setSelectedDanceTypes] = useState<DanceType[]>([]);
  const [showCalendar, setShowCalendar] = useState(true);

  // Balli della famiglia selezionata
  const familyDances = useMemo(() => {
    if (!selectedFamily) return [];
    return getDancesByFamily(selectedFamily);
  }, [selectedFamily]);

  // Filtra eventi
  const filteredEvents = useMemo(() => {
    const now = new Date();
    let result = events.filter(e => new Date(e.date) >= now);
    
    // Filtro città
    if (searchCity.trim()) {
      result = result.filter(e => 
        e.location.city.toLowerCase().includes(searchCity.toLowerCase())
      );
    }
    
    // Filtro tipi di ballo (specifici o tutti quelli della famiglia)
    if (selectedDanceTypes.length > 0) {
      result = result.filter(e => selectedDanceTypes.includes(e.danceType));
    } else if (selectedFamily) {
      const familyDanceIds = getDancesByFamily(selectedFamily).map(d => d.id);
      result = result.filter(e => familyDanceIds.includes(e.danceType));
    }
    
    // Filtro data selezionata
    if (selectedDate) {
      result = result.filter(e => 
        format(new Date(e.date), 'yyyy-MM-dd') === selectedDate
      );
    }
    
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchCity, selectedFamily, selectedDanceTypes, selectedDate]);

  // Verifica se l'utente partecipa a un evento
  const isUserParticipating = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || !user) return false;
    return event.participants.some(p => p.userId === user.id) || event.creatorId === user.id;
  };

  // Crea i marked dates per il calendario
  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};
    const now = new Date();
    const filterDances = selectedDanceTypes.length > 0 
      ? selectedDanceTypes 
      : selectedFamily 
        ? getDancesByFamily(selectedFamily).map(d => d.id)
        : [];
    
    events
      .filter(e => new Date(e.date) >= now)
      .filter(e => filterDances.length === 0 || filterDances.includes(e.danceType))
      .filter(e => !searchCity.trim() || e.location.city.toLowerCase().includes(searchCity.toLowerCase()))
      .forEach(event => {
        const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
        const danceInfo = DANCE_TYPES.find(d => d.id === event.danceType);
        
        if (!marked[dateStr]) {
          marked[dateStr] = {
            marked: true,
            dotColor: danceInfo?.color || colors.primary,
          };
        }
      });

    // Aggiungi la selezione
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marked;
  }, [events, selectedFamily, selectedDanceTypes, searchCity, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(selectedDate === day.dateString ? null : day.dateString);
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleFamilyPress = (familyId: DanceFamilyId) => {
    if (selectedFamily === familyId) {
      // Deseleziona la famiglia
      setSelectedFamily(null);
      setSelectedDanceTypes([]);
    } else {
      // Seleziona nuova famiglia
      setSelectedFamily(familyId);
      setSelectedDanceTypes([]);
    }
  };

  const handleDanceTypePress = (danceType: DanceType) => {
    if (selectedDanceTypes.includes(danceType)) {
      setSelectedDanceTypes(selectedDanceTypes.filter(d => d !== danceType));
    } else {
      setSelectedDanceTypes([...selectedDanceTypes, danceType]);
    }
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSearchCity('');
    setSelectedFamily(null);
    setSelectedDanceTypes([]);
  };

  const hasActiveFilters = selectedDate || searchCity.trim() || selectedFamily || selectedDanceTypes.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Barra di ricerca città */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cerca per città..."
              placeholderTextColor={colors.textSecondary}
              value={searchCity}
              onChangeText={setSearchCity}
            />
            {searchCity.length > 0 && (
              <TouchableOpacity onPress={() => setSearchCity('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtri famiglia di ballo */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Famiglia di ballo</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.danceFiltersContainer}
          >
            <TouchableOpacity
              style={[styles.familyChip, !selectedFamily && styles.familyChipActive]}
              onPress={() => handleFamilyPress(selectedFamily as DanceFamilyId)}
            >
              <Text style={styles.familyChipEmoji}>🌍</Text>
              <Text style={[styles.familyChipText, !selectedFamily && styles.familyChipTextActive]}>
                Tutti
              </Text>
            </TouchableOpacity>
            {DANCE_FAMILIES.filter(f => f.id !== 'other').map((family) => (
              <TouchableOpacity
                key={family.id}
                style={[
                  styles.familyChip, 
                  selectedFamily === family.id && { backgroundColor: family.color }
                ]}
                onPress={() => handleFamilyPress(family.id)}
              >
                <Text style={styles.familyChipEmoji}>{family.emoji}</Text>
                <Text style={[
                  styles.familyChipText,
                  selectedFamily === family.id && styles.familyChipTextActive
                ]}>
                  {family.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sotto-balli della famiglia selezionata */}
        {selectedFamily && familyDances.length > 0 && (
          <View style={styles.subDanceSection}>
            <Text style={styles.subDanceLabel}>
              Filtra per stile specifico
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subDanceContainer}
            >
              {familyDances.map((dance) => (
                <TouchableOpacity
                  key={dance.id}
                  style={[
                    styles.subDanceChip, 
                    selectedDanceTypes.includes(dance.id) && { 
                      backgroundColor: dance.color,
                      borderColor: dance.color 
                    }
                  ]}
                  onPress={() => handleDanceTypePress(dance.id)}
                >
                  <Text style={styles.subDanceEmoji}>{dance.emoji}</Text>
                  <Text style={[
                    styles.subDanceText,
                    selectedDanceTypes.includes(dance.id) && styles.subDanceTextActive
                  ]}>
                    {dance.name}
                  </Text>
                  {selectedDanceTypes.includes(dance.id) && (
                    <Ionicons name="checkmark" size={14} color={colors.textWhite} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Toggle calendario */}
        <TouchableOpacity 
          style={styles.calendarToggle}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <Ionicons 
            name={showCalendar ? "calendar" : "calendar-outline"} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.calendarToggleText}>
            {showCalendar ? 'Nascondi calendario' : 'Mostra calendario'}
          </Text>
          <Ionicons 
            name={showCalendar ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={colors.primary} 
          />
        </TouchableOpacity>

        {/* Calendario */}
        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={{
                backgroundColor: colors.background,
                calendarBackground: colors.background,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.textWhite,
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textLight,
                dotColor: colors.primary,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                textDayFontWeight: '400',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '500',
              }}
              minDate={format(new Date(), 'yyyy-MM-dd')}
            />
          </View>
        )}

        {/* Header risultati */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {filteredEvents.length} eventi trovati
            {selectedDate && ` per ${format(new Date(selectedDate), 'd MMMM', { locale: it })}`}
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Azzera filtri</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista eventi */}
        <View style={styles.eventsContainer}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
                isParticipating={isUserParticipating(event.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Nessun evento trovato</Text>
              <Text style={styles.emptySubtitle}>
                Prova a modificare i filtri di ricerca
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Ricerca città
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    ...typography.body,
    color: colors.text,
  },
  
  // Filtri tipo di ballo
  filterSection: {
    paddingBottom: spacing.sm,
  },
  
  filterLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  
  danceFiltersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  
  familyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  
  familyChipActive: {
    backgroundColor: colors.primary,
  },
  
  familyChipEmoji: {
    fontSize: 16,
  },
  
  familyChipText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  
  familyChipTextActive: {
    color: colors.textWhite,
  },
  
  // Sotto-balli espandibili
  subDanceSection: {
    paddingBottom: spacing.md,
  },
  
  subDanceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  
  subDanceContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  
  subDanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  
  subDanceEmoji: {
    fontSize: 12,
  },
  
  subDanceText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  
  subDanceTextActive: {
    color: colors.textWhite,
  },
  
  danceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  
  danceChipActive: {
    backgroundColor: colors.primary,
  },
  
  danceChipEmoji: {
    fontSize: 14,
  },
  
  danceChipText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  
  danceChipTextActive: {
    color: colors.textWhite,
  },
  
  // Toggle calendario
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  
  calendarToggleText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  
  // Calendario
  calendarContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  
  // Risultati
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  resultsTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  clearBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  
  clearBtnText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Lista eventi
  eventsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  
  // Stato vuoto
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
