import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DANCE_TYPES } from '../../types';
import { DanceTypeCard } from '../../components';
import { colors, spacing, typography } from '../../theme';

type DanceTypeSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DanceTypeSelection'
>;

interface DanceTypeSelectionScreenProps {
  navigation: DanceTypeSelectionNavigationProp;
}

export function DanceTypeSelectionScreen({ navigation }: DanceTypeSelectionScreenProps) {
  const handleDanceTypeSelect = (danceTypeId: string) => {
    navigation.navigate('EventCalendar', { danceType: danceTypeId as any });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>💃🕺</Text>
          <Text style={styles.title}>Che tipo di ballo?</Text>
          <Text style={styles.subtitle}>
            Scegli lo stile per il tuo evento
          </Text>
        </View>

        <View style={styles.grid}>
          {DANCE_TYPES.map((danceType) => (
            <DanceTypeCard
              key={danceType.id}
              danceType={danceType}
              onPress={() => handleDanceTypeSelect(danceType.id)}
              size="large"
            />
          ))}
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
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
