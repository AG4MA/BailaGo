import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { 
  RootStackParamList, 
  DANCE_FAMILIES, 
  DanceFamilyId, 
  DanceType,
  getDancesByFamily 
} from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

type DanceTypeSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DanceTypeSelection'
>;

interface DanceTypeSelectionScreenProps {
  navigation: DanceTypeSelectionNavigationProp;
}

export function DanceTypeSelectionScreen({ navigation }: DanceTypeSelectionScreenProps) {
  const [selectedFamily, setSelectedFamily] = useState<DanceFamilyId | null>(null);
  
  const handleFamilySelect = (familyId: DanceFamilyId) => {
    setSelectedFamily(familyId);
  };
  
  const handleDanceTypeSelect = (danceTypeId: DanceType) => {
    navigation.navigate('EventCalendar', { danceType: danceTypeId });
  };
  
  const handleBackToFamilies = () => {
    setSelectedFamily(null);
  };

  const familyDances = selectedFamily ? getDancesByFamily(selectedFamily) : [];
  const selectedFamilyInfo = selectedFamily 
    ? DANCE_FAMILIES.find(f => f.id === selectedFamily) 
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>💃🕺</Text>
          <Text style={styles.title}>
            {selectedFamily ? 'Scegli lo stile' : 'Che tipo di ballo?'}
          </Text>
          <Text style={styles.subtitle}>
            {selectedFamily 
              ? `Balli ${selectedFamilyInfo?.name}` 
              : 'Prima scegli la famiglia di balli'}
          </Text>
        </View>

        {/* Bottone indietro se siamo nei sotto-balli */}
        {selectedFamily && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToFamilies}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Tutte le famiglie</Text>
          </TouchableOpacity>
        )}

        {/* Griglia famiglie o sotto-balli */}
        <View style={styles.grid}>
          {!selectedFamily ? (
            // Mostra le famiglie
            DANCE_FAMILIES.map((family) => (
              <TouchableOpacity
                key={family.id}
                style={[styles.familyCard, { borderColor: family.color }]}
                onPress={() => handleFamilySelect(family.id)}
              >
                <Text style={styles.familyEmoji}>{family.emoji}</Text>
                <Text style={styles.familyName}>{family.name}</Text>
                <Text style={styles.familyCount}>
                  {family.dances.length} stili
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            // Mostra i sotto-balli della famiglia selezionata
            familyDances.map((dance) => (
              <TouchableOpacity
                key={dance.id}
                style={[styles.danceCard, { borderColor: dance.color }]}
                onPress={() => handleDanceTypeSelect(dance.id)}
              >
                <Text style={styles.danceEmoji}>{dance.emoji}</Text>
                <Text style={styles.danceName}>{dance.name}</Text>
              </TouchableOpacity>
            ))
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
  
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  
  // Stile carte famiglia
  familyCard: {
    width: '47%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  
  familyEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  
  familyName: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  
  familyCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  // Stile carte ballo singolo
  danceCard: {
    width: '47%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  
  danceEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  
  danceName: {
    ...typography.bodySmall,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});
