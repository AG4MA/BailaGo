import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, DANCE_FAMILIES, DanceFamilyId, DanceType, getDancesByFamily } from '../types';
import { useAuth, useEvents } from '../contexts';
import { EventCard, Button } from '../components';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const { events } = useEvents();
  
  // Filtri per famiglia e sotto-balli
  const [selectedFamily, setSelectedFamily] = useState<DanceFamilyId | null>(null);
  const [selectedDanceTypes, setSelectedDanceTypes] = useState<DanceType[]>([]);

  // Balli della famiglia selezionata
  const familyDances = useMemo(() => {
    if (!selectedFamily) return [];
    return getDancesByFamily(selectedFamily);
  }, [selectedFamily]);

  // Prossimi eventi (solo futuri, ordinati cronologicamente)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    let result = events.filter(e => new Date(e.date) >= now);
    
    // Filtro per sotto-balli selezionati o tutta la famiglia
    if (selectedDanceTypes.length > 0) {
      result = result.filter(e => selectedDanceTypes.includes(e.danceType));
    } else if (selectedFamily) {
      const familyDanceIds = getDancesByFamily(selectedFamily).map(d => d.id);
      result = result.filter(e => familyDanceIds.includes(e.danceType));
    }
    
    return result
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Mostra solo i primi 5 nella Home
  }, [events, selectedFamily, selectedDanceTypes]);

  // Verifica se l'utente partecipa a un evento
  const isUserParticipating = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || !user) return false;
    return event.participants.some(p => p.userId === user.id) || event.creatorId === user.id;
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleCreatePress = () => {
    navigation.navigate('DanceTypeSelection');
  };

  const handleSeeAllPress = () => {
    navigation.navigate('AllEvents', {});
  };

  const handleFamilyPress = (familyId: DanceFamilyId) => {
    if (selectedFamily === familyId) {
      // Deseleziona
      setSelectedFamily(null);
      setSelectedDanceTypes([]);
    } else {
      // Seleziona nuova famiglia
      setSelectedFamily(familyId);
      setSelectedDanceTypes([]);
    }
  };

  const handleSubDancePress = (danceType: DanceType) => {
    if (selectedDanceTypes.includes(danceType)) {
      setSelectedDanceTypes(selectedDanceTypes.filter(d => d !== danceType));
    } else {
      setSelectedDanceTypes([...selectedDanceTypes, danceType]);
    }
  };

  const handleSelectAllSubDances = () => {
    if (!selectedFamily) return;
    const allDances = getDancesByFamily(selectedFamily).map(d => d.id);
    if (selectedDanceTypes.length === allDances.length) {
      // Deseleziona tutti
      setSelectedDanceTypes([]);
    } else {
      // Seleziona tutti
      setSelectedDanceTypes(allDances);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Saluto minimale */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Ciao, {user?.displayName?.split(' ')[0] || 'Bailador'} 👋
          </Text>
        </View>

        {/* CTA primaria - Organizza un ballo */}
        <TouchableOpacity style={styles.ctaCard} onPress={handleCreatePress}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaEmoji}>💃</Text>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>Organizza un ballo</Text>
              <Text style={styles.ctaSubtitle}>Crea il tuo evento</Text>
            </View>
          </View>
          <Ionicons name="add-circle" size={28} color={colors.textWhite} />
        </TouchableOpacity>

        {/* Sezione Prossimi eventi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prossimi eventi</Text>
            <TouchableOpacity onPress={handleSeeAllPress} style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>Vedi tutti</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Filtri per famiglia di ballo */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            <TouchableOpacity
              style={[styles.filterChip, !selectedFamily && styles.filterChipActive]}
              onPress={() => handleFamilyPress(null as any)}
            >
              <Text style={[styles.filterChipText, !selectedFamily && styles.filterChipTextActive]}>
                Tutti
              </Text>
            </TouchableOpacity>
            {DANCE_FAMILIES.filter(f => f.id !== 'other').slice(0, 6).map((family) => (
              <TouchableOpacity
                key={family.id}
                style={[
                  styles.filterChip, 
                  selectedFamily === family.id && { backgroundColor: family.color }
                ]}
                onPress={() => handleFamilyPress(family.id)}
              >
                <Text style={styles.filterChipEmoji}>{family.emoji}</Text>
                <Text style={[
                  styles.filterChipText,
                  selectedFamily === family.id && styles.filterChipTextActive
                ]}>
                  {family.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Sotto-barra: filtri sotto-balli quando famiglia selezionata */}
          {selectedFamily && familyDances.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subFiltersContainer}
            >
              <TouchableOpacity
                style={[
                  styles.subFilterChip, 
                  selectedDanceTypes.length === 0 && styles.subFilterChipActive
                ]}
                onPress={() => setSelectedDanceTypes([])}
              >
                <Text style={[
                  styles.subFilterChipText,
                  selectedDanceTypes.length === 0 && styles.subFilterChipTextActive
                ]}>
                  Tutti
                </Text>
              </TouchableOpacity>
              {familyDances.map((dance) => (
                <TouchableOpacity
                  key={dance.id}
                  style={[
                    styles.subFilterChip, 
                    selectedDanceTypes.includes(dance.id) && { 
                      backgroundColor: dance.color,
                      borderColor: dance.color
                    }
                  ]}
                  onPress={() => handleSubDancePress(dance.id)}
                >
                  <Text style={styles.subFilterChipEmoji}>{dance.emoji}</Text>
                  <Text style={[
                    styles.subFilterChipText,
                    selectedDanceTypes.includes(dance.id) && styles.subFilterChipTextActive
                  ]}>
                    {dance.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          {/* Lista eventi */}
          {upcomingEvents.length > 0 ? (
            <View style={styles.eventsContainer}>
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event.id)}
                  isParticipating={isUserParticipating(event.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎵</Text>
              <Text style={styles.emptyTitle}>Nessun evento in programma</Text>
              <Text style={styles.emptySubtitle}>
                Sii il primo a creare un evento!
              </Text>
              <Button
                title="Crea evento"
                onPress={handleCreatePress}
                variant="primary"
                size="medium"
              />
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
  
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  
  // Header minimale
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  
  // CTA primaria
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },
  
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  ctaEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  
  ctaText: {
    flex: 1,
  },
  
  ctaTitle: {
    ...typography.h3,
    color: colors.textWhite,
  },
  
  ctaSubtitle: {
    ...typography.bodySmall,
    color: colors.textWhite,
    opacity: 0.85,
    marginTop: 2,
  },
  
  // Sezione
  section: {
    marginTop: spacing.sm,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  
  seeAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Filtri compatti
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  
  filterChipEmoji: {
    fontSize: 14,
  },
  
  filterChipText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  
  filterChipTextActive: {
    color: colors.textWhite,
  },
  
  // Sotto-filtri per sotto-balli
  subFiltersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  
  subFilterChip: {
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
  
  subFilterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  subFilterChipEmoji: {
    fontSize: 12,
  },
  
  subFilterChipText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  
  subFilterChipTextActive: {
    color: colors.textWhite,
  },
  
  // Lista eventi
  eventsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  
  // Stato vuoto
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
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
    marginBottom: spacing.lg,
  },
});
