import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGroups } from '../contexts';
import theme from '../theme';
import { RootStackParamList, Group, GroupMember, GroupRole } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GroupDetailRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

export function GroupDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupDetailRouteProp>();
  const { groupId } = route.params;
  
  const { getGroup, inviteMember, removeMember, updateMemberRole, leaveGroup, deleteGroup } = useGroups();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchGroup = async () => {
    setIsLoading(true);
    const data = await getGroup(groupId);
    setGroup(data);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroup();
    }, [groupId])
  );

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Errore', 'Inserisci un\'email');
      return;
    }
    
    setIsInviting(true);
    try {
      await inviteMember(groupId, inviteEmail.trim());
      Alert.alert('Successo', 'Invito inviato!');
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    Alert.alert(
      'Rimuovi membro',
      `Vuoi rimuovere ${member.user.displayName} dal gruppo?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(groupId, member.userId);
              fetchGroup();
            } catch (error: any) {
              Alert.alert('Errore', error.message);
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = (member: GroupMember) => {
    const options: { text: string; role: GroupRole }[] = [
      { text: 'Admin', role: 'admin' as const },
      { text: 'DJ', role: 'dj' as const },
      { text: 'Membro', role: 'member' as const },
    ].filter(o => o.role !== member.role);

    Alert.alert(
      'Cambia ruolo',
      `Ruolo attuale: ${member.role}`,
      [
        { text: 'Annulla', style: 'cancel' },
        ...options.map(o => ({
          text: o.text,
          onPress: async () => {
            try {
              await updateMemberRole(groupId, member.userId, o.role);
              fetchGroup();
            } catch (error: any) {
              Alert.alert('Errore', error.message);
            }
          },
        })),
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Lascia gruppo',
      'Vuoi davvero uscire da questo gruppo?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(groupId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Errore', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Elimina gruppo',
      'Questa azione è irreversibile. Tutti gli eventi del gruppo saranno eliminati.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Errore', error.message);
            }
          },
        },
      ]
    );
  };

  const getRoleBadge = (role: GroupRole) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', color: theme.colors.primary };
      case 'dj':
        return { text: 'DJ', color: '#8B5CF6' };
      default:
        return null;
    }
  };

  const renderMember = ({ item }: { item: GroupMember }) => {
    const badge = getRoleBadge(item.role);
    
    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => group?.isAdmin ? handleChangeRole(item) : null}
        onLongPress={() => group?.isAdmin ? handleRemoveMember(item) : null}
        disabled={!group?.isAdmin}
      >
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitial}>
            {item.user.displayName?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.user.displayName}</Text>
          <Text style={styles.memberUsername}>@{item.user.username}</Text>
        </View>
        {badge && (
          <View style={[styles.roleBadge, { backgroundColor: badge.color }]}>
            <Text style={styles.roleBadgeText}>{badge.text}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Gruppo non trovato</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{group.name}</Text>
        {group.isAdmin && (
          <TouchableOpacity onPress={() => setShowInviteModal(true)}>
            <Ionicons name="person-add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Group Info */}
      <View style={styles.groupInfo}>
        <View style={styles.groupIcon}>
          <Text style={styles.groupEmoji}>👥</Text>
        </View>
        {group.description && (
          <Text style={styles.groupDescription}>{group.description}</Text>
        )}
        <Text style={styles.memberCount}>
          {group.memberCount} membr{group.memberCount === 1 ? 'o' : 'i'}
        </Text>
      </View>

      {/* Members List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Membri</Text>
        {group.isAdmin && (
          <Text style={styles.sectionHint}>
            Tocca per cambiare ruolo, tieni premuto per rimuovere
          </Text>
        )}
      </View>

      <FlatList
        data={group.members}
        keyExtractor={item => item.userId}
        renderItem={renderMember}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchGroup}
            colors={[theme.colors.primary]}
          />
        }
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
          <Ionicons name="exit-outline" size={20} color={theme.colors.error} />
          <Text style={styles.leaveButtonText}>Lascia gruppo</Text>
        </TouchableOpacity>
        
        {group.isAdmin && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteGroup}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Elimina</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invita membro</Text>
            <Text style={styles.modalSubtitle}>
              Inserisci l'email dell'utente da invitare
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="email@esempio.com"
              placeholderTextColor={theme.colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                }}
              >
                <Text style={styles.modalCancelText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalSendButton, (!inviteEmail.trim() || isInviting) && styles.modalButtonDisabled]}
                onPress={handleInvite}
                disabled={!inviteEmail.trim() || isInviting}
              >
                {isInviting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSendText}>Invia invito</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  groupInfo: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  groupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupEmoji: {
    fontSize: 40,
  },
  groupDescription: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sectionHint: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  memberUsername: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  leaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  leaveButtonText: {
    color: theme.colors.error,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: theme.colors.error,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  modalSendButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalSendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
