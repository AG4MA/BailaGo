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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGroups, useAuth } from '../contexts';
import theme from '../theme';
import { RootStackParamList, Group, GroupMember, GroupRole } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GroupDetailRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

export function GroupDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupDetailRouteProp>();
  const { groupId } = route.params;
  const { user } = useAuth();
  
  const { getGroup, inviteMember, searchUsers, removeMember, updateMemberRole, leaveGroup, deleteGroup } = useGroups();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [selectedNewAdmin, setSelectedNewAdmin] = useState<string | null>(null);

  // Compute if current user is creator
  const isCreator = user?.id === group?.creatorId;
  const isOnlyMember = group?.members?.length === 1;

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

  // Handle search for users to invite
  const handleSearch = async (query: string) => {
    setInviteQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      // Filter out users who are already members
      const memberIds = group?.members.map(m => m.userId) || [];
      const filteredResults = results.filter(u => !memberIds.includes(u.id));
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvite = async (username: string) => {
    setIsInviting(true);
    try {
      await inviteMember(groupId, username);
      Alert.alert('Successo', 'Invito inviato!');
      setShowInviteModal(false);
      setInviteQuery('');
      setSearchResults([]);
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
    // If creator and only member, can't leave - must delete
    if (isCreator && isOnlyMember) {
      Alert.alert(
        'Non puoi lasciare',
        'Sei l\'unico membro del gruppo. Puoi solo eliminarlo.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // If creator but there are other members, must designate new admin
    if (isCreator && !isOnlyMember) {
      setShowAdminModal(true);
      return;
    }
    
    // Regular member can leave
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

  const handleLeaveWithNewAdmin = async () => {
    if (!selectedNewAdmin) {
      Alert.alert('Errore', 'Seleziona un nuovo admin');
      return;
    }
    
    try {
      // First promote the new admin
      await updateMemberRole(groupId, selectedNewAdmin, 'admin');
      // Then leave the group
      await leaveGroup(groupId);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
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
        {/* Show "Lascia gruppo" only if leaving is allowed */}
        {!(isCreator && isOnlyMember) && (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
            <Ionicons name="exit-outline" size={20} color={theme.colors.error} />
            <Text style={styles.leaveButtonText}>
              {isCreator ? 'Lascia e designa admin' : 'Lascia gruppo'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Only creator can delete */}
        {isCreator && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteGroup}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Elimina</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Invite Modal - with nickname search */}
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
              Cerca per nickname o nome
            </Text>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={theme.colors.textLight} />
              <TextInput
                style={styles.searchInput}
                value={inviteQuery}
                onChangeText={handleSearch}
                placeholder="Cerca utente..."
                placeholderTextColor={theme.colors.textLight}
                autoCapitalize="none"
                autoFocus
              />
              {isSearching && <ActivityIndicator size="small" color={theme.colors.primary} />}
            </View>
            
            <ScrollView style={styles.searchResults}>
              {searchResults.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.searchResultItem}
                  onPress={() => handleInvite(user.username)}
                  disabled={isInviting}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user.displayName?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.displayName}</Text>
                    <Text style={styles.userNickname}>@{user.nickname || user.username}</Text>
                  </View>
                  <Ionicons name="person-add" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
              {inviteQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <Text style={styles.noResults}>Nessun utente trovato</Text>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowInviteModal(false);
                setInviteQuery('');
                setSearchResults([]);
              }}
            >
              <Text style={styles.modalCancelText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Select New Admin Modal */}
      <Modal
        visible={showAdminModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAdminModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scegli nuovo admin</Text>
            <Text style={styles.modalSubtitle}>
              Prima di lasciare il gruppo, devi designare un nuovo amministratore
            </Text>
            
            <ScrollView style={styles.adminList}>
              {group?.members
                .filter(m => m.userId !== user?.id)
                .map(member => (
                  <TouchableOpacity
                    key={member.userId}
                    style={[
                      styles.adminOption,
                      selectedNewAdmin === member.userId && styles.adminOptionSelected
                    ]}
                    onPress={() => setSelectedNewAdmin(member.userId)}
                  >
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {member.user.displayName?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{member.user.displayName}</Text>
                      <Text style={styles.userNickname}>@{member.user.username}</Text>
                    </View>
                    <Ionicons 
                      name={selectedNewAdmin === member.userId ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={selectedNewAdmin === member.userId ? theme.colors.primary : theme.colors.textLight} 
                    />
                  </TouchableOpacity>
                ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAdminModal(false);
                  setSelectedNewAdmin(null);
                }}
              >
                <Text style={styles.modalCancelText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalSendButton, !selectedNewAdmin && styles.modalButtonDisabled]}
                onPress={handleLeaveWithNewAdmin}
                disabled={!selectedNewAdmin}
              >
                <Text style={styles.modalSendText}>Conferma ed esci</Text>
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
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  searchResults: {
    maxHeight: 250,
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  userNickname: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  noResults: {
    textAlign: 'center',
    color: theme.colors.textLight,
    paddingVertical: 20,
  },
  adminList: {
    maxHeight: 300,
    marginBottom: 12,
  },
  adminOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  adminOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
});
