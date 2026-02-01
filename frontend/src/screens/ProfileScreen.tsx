import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts';
import { Button, DanceTypeCard } from '../components';
import { DANCE_TYPES, DanceType } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

export function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Esci', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleToggleFavoriteDance = (danceId: DanceType) => {
    if (!user) return;
    
    const currentFavorites = user.favoriteDances || [];
    const newFavorites = currentFavorites.includes(danceId)
      ? currentFavorites.filter(d => d !== danceId)
      : [...currentFavorites, danceId];
    
    updateProfile({ favoriteDances: newFavorites });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-circle-outline" size={80} color={colors.textLight} />
          <Text style={styles.notLoggedInTitle}>Non hai effettuato l'accesso</Text>
          <Text style={styles.notLoggedInText}>
            Accedi per salvare i tuoi eventi e partecipare alla community
          </Text>
          <Button title="Accedi" onPress={() => {}} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header profilo */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={16} color={colors.textWhite} />
            </TouchableOpacity>
          </View>

          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.username}>@{user.username}</Text>

          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

        {/* Statistiche */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Eventi creati</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Partecipazioni</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.favoriteDances?.length || 0}</Text>
            <Text style={styles.statLabel}>Balli preferiti</Text>
          </View>
        </View>

        {/* Balli preferiti */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>I miei balli preferiti</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editLink}>
                {isEditing ? 'Fatto' : 'Modifica'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.danceTypesContainer}
          >
            {DANCE_TYPES.map((danceType) => (
              <TouchableOpacity
                key={danceType.id}
                onPress={() => isEditing && handleToggleFavoriteDance(danceType.id)}
                disabled={!isEditing}
              >
                <DanceTypeCard
                  danceType={danceType}
                  onPress={() => isEditing && handleToggleFavoriteDance(danceType.id)}
                  selected={user.favoriteDances?.includes(danceType.id)}
                  size="small"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Impostazioni */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impostazioni</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="person-outline" size={24} color={colors.text} />
              <Text style={styles.settingText}>Modifica profilo</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <Text style={styles.settingText}>Notifiche</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="shield-outline" size={24} color={colors.text} />
              <Text style={styles.settingText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="help-circle-outline" size={24} color={colors.text} />
              <Text style={styles.settingText}>Aiuto e supporto</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title="Esci"
            onPress={handleLogout}
            variant="outline"
            icon={<Ionicons name="log-out-outline" size={20} color={colors.primary} />}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>BailaGo v1.0.0</Text>
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
  
  notLoggedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  
  notLoggedInTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  
  notLoggedInText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.textWhite,
  },
  
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  
  displayName: {
    ...typography.h2,
    color: colors.text,
  },
  
  username: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  
  editLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  
  danceTypesContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  
  settingText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  
  settingDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xxl + spacing.md,
  },
  
  logoutSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  version: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
