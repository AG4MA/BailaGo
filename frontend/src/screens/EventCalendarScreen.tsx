import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, DanceType, DANCE_TYPES } from '../types';
import { useEvents } from '../contexts';
import { EventCard, Button } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

type EventCalendarNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventCalendar'>;
type EventCalendarRouteProp = RouteProp<RootStackParamList, 'EventCalendar'>;

interface EventCalendarScreenProps {
  navigation: EventCalendarNavigationProp;
  route: EventCalendarRouteProp;
}

export function EventCalendarScreen({ navigation, route }: EventCalendarScreenProps) {
  const { danceType } = route.params;
  const { events, getEventsByDanceType } = useEvents();
  
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  const danceInfo = DANCE_TYPES.find(d => d.id === danceType);
  const filteredEvents = getEventsByDanceType(danceType);

  // Crea i marked dates per il calendario
  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};
    
    filteredEvents.forEach(event => {
      const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
      marked[dateStr] = {
        marked: true,
        dotColor: danceInfo?.color || colors.primary,
      };
    });

    // Aggiungi la selezione
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: danceInfo?.color || colors.primary,
      };
    }

    return marked;
  }, [filteredEvents, selectedDate, danceInfo]);

  // Eventi del giorno selezionato
  const eventsForSelectedDate = useMemo(() => {
    return filteredEvents.filter(e => 
      format(new Date(e.date), 'yyyy-MM-dd') === selectedDate
    );
  }, [filteredEvents, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent', { 
      danceType, 
      selectedDate 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con info sul tipo di ballo */}
        <View style={[styles.header, { backgroundColor: danceInfo?.color }]}>
          <Text style={styles.headerEmoji}>{danceInfo?.emoji}</Text>
          <Text style={styles.headerTitle}>{danceInfo?.name}</Text>
          <Text style={styles.headerSubtitle}>
            {filteredEvents.length} eventi in programma
          </Text>
        </View>

        {/* Calendario */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.background,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: danceInfo?.color || colors.primary,
              selectedDayTextColor: colors.textWhite,
              todayTextColor: danceInfo?.color || colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.textLight,
              dotColor: danceInfo?.color || colors.primary,
              selectedDotColor: colors.textWhite,
              arrowColor: danceInfo?.color || colors.primary,
              monthTextColor: colors.text,
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
            }}
          />
        </View>

        {/* Data selezionata */}
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateLabel}>
            {format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: it })}
          </Text>
        </View>

        {/* Eventi del giorno */}
        <View style={styles.eventsSection}>
          {eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
                compact
              />
            ))
          ) : (
            <View style={styles.noEvents}>
              <Ionicons 
                name="calendar-outline" 
                size={48} 
                color={colors.textLight} 
              />
              <Text style={styles.noEventsText}>
                Nessun evento in questa data
              </Text>
              <Text style={styles.noEventsSubtext}>
                Vuoi essere il primo a crearne uno?
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB per creare evento */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: danceInfo?.color }]}
        onPress={handleCreateEvent}
      >
        <Ionicons name="add" size={28} color={colors.textWhite} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    ...typography.h2,
    color: colors.textWhite,
  },
  
  headerSubtitle: {
    ...typography.body,
    color: colors.textWhite,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  
  calendarContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    margin: spacing.lg,
    ...shadows.small,
  },
  
  selectedDateContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  
  selectedDateLabel: {
    ...typography.h3,
    color: colors.text,
    textTransform: 'capitalize',
  },
  
  eventsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  
  noEvents: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  
  noEventsText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  
  noEventsSubtext: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
});
