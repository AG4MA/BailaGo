import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, DANCE_TYPES } from '../../types';
import { useAuth, useEvents } from '../../contexts';
import { EventCard, DanceTypeCard, Button } from '../../components';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const { events } = useEvents();

  // Prossimi eventi (ordina per data)
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const handleDanceTypePress = (danceTypeId: string) => {
    navigation.navigate('EventCalendar', { danceType: danceTypeId as any });
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleCreatePress = () => {
    navigation.navigate('DanceTypeSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Ciao, {user?.displayName?.split(' ')[0] || 'Bailador'} 👋
            </Text>
            <Text style={styles.subtitle}>Pronto a ballare?</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Create Event CTA */}
        <TouchableOpacity style={styles.ctaCard} onPress={handleCreatePress}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaEmoji}>💃🕺</Text>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>Organizza un ballo!</Text>
              <Text style={styles.ctaSubtitle}>
                Crea un evento e invita i tuoi amici
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={32} color={colors.textWhite} />
        </TouchableOpacity>

        {/* Dance Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scegli il tuo ballo</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.danceTypesContainer}
          >
            {DANCE_TYPES.map((danceType) => (
              <DanceTypeCard
                key={danceType.id}
                danceType={danceType}
                onPress={() => handleDanceTypePress(danceType.id)}
                size="medium"
              />
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prossimi eventi</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Vedi tutti</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingEvents.length > 0 ? (
            <View style={styles.eventsContainer}>
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎵</Text>
              <Text style={styles.emptyTitle}>Nessun evento in programma</Text>
              <Text style={styles.emptySubtitle}>
                Sii il primo a creare un evento nella tua zona!
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
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
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
    fontSize: 32,
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
    opacity: 0.9,
    marginTop: 2,
  },
  
  section: {
    marginTop: spacing.lg,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  
  seeAll: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  
  danceTypesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  
  eventsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  
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
