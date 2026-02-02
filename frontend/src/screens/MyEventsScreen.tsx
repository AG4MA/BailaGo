import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useEvents } from '../contexts';
import { EventCard } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DANCE_TYPES } from '../types';

type MyEventsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

interface MyEventsScreenProps {
  navigation: MyEventsNavigationProp;
}

export function MyEventsScreen({ navigation }: MyEventsScreenProps) {
  const { user } = useAuth();
  const { getMyEvents, getMyCreatedEvents } = useEvents();

  const myEvents = getMyEvents();
  const createdEvents = getMyCreatedEvents();
  const participatingEvents = myEvents.filter(e => e.creatorId !== user?.id);

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleCreatePress = () => {
    navigation.navigate('DanceTypeSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>I miei eventi</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleCreatePress}
          >
            <Ionicons name="add" size={24} color={colors.textWhite} />
          </TouchableOpacity>
        </View>

        {/* Eventi creati */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Eventi che ho creato</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{createdEvents.length}</Text>
            </View>
          </View>

          {createdEvents.length > 0 ? (
            <View style={styles.eventsList}>
              {createdEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event.id)}
                  compact
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Non hai ancora creato eventi</Text>
              <TouchableOpacity 
                style={styles.createLink}
                onPress={handleCreatePress}
              >
                <Text style={styles.createLinkText}>Crea il tuo primo evento</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Eventi a cui partecipo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Eventi a cui partecipo</Text>
            <View style={[styles.countBadge, { backgroundColor: `${colors.secondary}20` }]}>
              <Text style={[styles.countText, { color: colors.secondary }]}>
                {participatingEvents.length}
              </Text>
            </View>
          </View>

          {participatingEvents.length > 0 ? (
            <View style={styles.eventsList}>
              {participatingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event.id)}
                  compact
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Non partecipi a nessun evento</Text>
              <Text style={styles.emptySubtext}>
                Esplora gli eventi disponibili e unisciti alla festa!
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
  
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  
  title: {
    ...typography.h1,
    color: colors.text,
  },
  
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  
  countBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  
  countText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  
  eventsList: {
    gap: spacing.sm,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  createLink: {
    marginTop: spacing.md,
  },
  
  createLinkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
