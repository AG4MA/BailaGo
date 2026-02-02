import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGroups } from '../contexts';
import theme from '../theme';
import { RootStackParamList, Group, GroupInvite } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function GroupsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { groups, pendingInvites, isLoading, fetchGroups, fetchPendingInvites, acceptInvite, rejectInvite } = useGroups();

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
      fetchPendingInvites();
    }, [])
  );

  const handleAcceptInvite = async (invite: GroupInvite) => {
    try {
      await acceptInvite(invite.id);
      Alert.alert('Successo', `Sei entrato nel gruppo "${invite.groupName}"`);
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
  };

  const handleRejectInvite = async (invite: GroupInvite) => {
    try {
      await rejectInvite(invite.id);
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
  };

  const renderInviteItem = ({ item }: { item: GroupInvite }) => (
    <View style={styles.inviteCard}>
      <View style={styles.inviteInfo}>
        <Text style={styles.inviteTitle}>📩 Invito a "{item.groupName}"</Text>
        <Text style={styles.inviteSubtitle}>
          Da: {item.invitedByUser?.displayName || 'Sconosciuto'}
        </Text>
      </View>
      <View style={styles.inviteActions}>
        <TouchableOpacity
          style={[styles.inviteButton, styles.acceptButton]}
          onPress={() => handleAcceptInvite(item)}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.inviteButton, styles.rejectButton]}
          onPress={() => handleRejectInvite(item)}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
    >
      <View style={styles.groupIcon}>
        <Text style={styles.groupEmoji}>👥</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupMeta}>
          {item.memberCount} membr{item.memberCount === 1 ? 'o' : 'i'}
          {item.isAdmin && ' • Admin'}
        </Text>
        {item.description && (
          <Text style={styles.groupDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.textLight} />
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Inviti in sospeso ({pendingInvites.length})
          </Text>
          {pendingInvites.map(invite => (
            <View key={invite.id}>
              {renderInviteItem({ item: invite })}
            </View>
          ))}
        </View>
      )}

      {/* My Groups Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>I miei gruppi</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>👥</Text>
      <Text style={styles.emptyTitle}>Nessun gruppo</Text>
      <Text style={styles.emptySubtitle}>
        Crea un gruppo per organizzare eventi privati con i tuoi amici!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <Text style={styles.emptyButtonText}>Crea gruppo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gruppi</Text>
      </View>

      <FlatList
        data={groups}
        keyExtractor={item => item.id}
        renderItem={renderGroupItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={!isLoading ? ListEmpty : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              fetchGroups();
              fetchPendingInvites();
            }}
            colors={[theme.colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  createButton: {
    padding: 8,
  },
  // Invite Card
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  inviteSubtitle: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inviteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
  },
  // Group Card
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupEmoji: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  groupMeta: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  groupDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
