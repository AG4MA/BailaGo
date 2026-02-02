import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Group, GroupInvite, CreateGroupData, GroupRole } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface GroupsContextType {
  groups: Group[];
  pendingInvites: GroupInvite[];
  isLoading: boolean;
  error: string | null;
  
  // CRUD Groups
  fetchGroups: () => Promise<void>;
  getGroup: (id: string) => Promise<Group | null>;
  createGroup: (data: CreateGroupData) => Promise<Group>;
  updateGroup: (id: string, data: Partial<CreateGroupData>) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
  
  // Members
  searchUsers: (query: string) => Promise<any[]>;
  inviteMember: (groupId: string, username: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  updateMemberRole: (groupId: string, userId: string, role: GroupRole) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  
  // Invites
  fetchPendingInvites: () => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  rejectInvite: (inviteId: string) => Promise<void>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export function GroupsProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingInvites, setPendingInvites] = useState<GroupInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch groups when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchGroups();
      fetchPendingInvites();
    } else {
      setGroups([]);
      setPendingInvites([]);
    }
  }, [isAuthenticated, token]);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  // ============ GROUPS CRUD ============

  const fetchGroups = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log('[GroupsContext] Fetching groups...');
      const res = await fetch(`${API_URL}/groups`, {
        headers: authHeaders(),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore nel recupero gruppi');
      }
      
      setGroups(data.data);
      console.log('[GroupsContext] Groups fetched:', data.data.length);
    } catch (err: any) {
      console.error('[GroupsContext] Error fetching groups:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getGroup = async (id: string): Promise<Group | null> => {
    if (!token) return null;
    
    try {
      const res = await fetch(`${API_URL}/groups/${id}`, {
        headers: authHeaders(),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gruppo non trovato');
      }
      
      return data.data;
    } catch (err: any) {
      console.error('[GroupsContext] Error getting group:', err);
      setError(err.message);
      return null;
    }
  };

  const createGroup = async (input: CreateGroupData): Promise<Group> => {
    if (!token) throw new Error('Non autenticato');
    
    console.log('[GroupsContext] Creating group:', input.name);
    const res = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nella creazione del gruppo');
    }
    
    // Add to local state
    setGroups(prev => [data.data, ...prev]);
    console.log('[GroupsContext] Group created:', data.data.name);
    
    return data.data;
  };

  const updateGroup = async (id: string, input: Partial<CreateGroupData>): Promise<Group> => {
    if (!token) throw new Error('Non autenticato');
    
    const res = await fetch(`${API_URL}/groups/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nell\'aggiornamento del gruppo');
    }
    
    // Update local state
    setGroups(prev => prev.map(g => g.id === id ? data.data : g));
    
    return data.data;
  };

  const deleteGroup = async (id: string): Promise<void> => {
    if (!token) throw new Error('Non autenticato');
    
    const res = await fetch(`${API_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nell\'eliminazione del gruppo');
    }
    
    // Remove from local state
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  // ============ MEMBERS ============

  const searchUsers = async (query: string): Promise<any[]> => {
    if (!token) throw new Error('Non autenticato');
    if (query.length < 2) return [];
    
    const res = await fetch(`${API_URL}/auth/search?q=${encodeURIComponent(query)}`, {
      headers: authHeaders(),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nella ricerca');
    }
    
    return data.data || [];
  };

  const inviteMember = async (groupId: string, username: string): Promise<void> => {
    if (!token) throw new Error('Non autenticato');
    
    console.log('[GroupsContext] Inviting member:', username);
    const res = await fetch(`${API_URL}/groups/${groupId}/invite`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nell\'invio dell\'invito');
    }
    
    console.log('[GroupsContext] Invite sent to:', username);
  };

  const removeMember = async (groupId: string, userId: string): Promise<void> => {
    if (!token) throw new Error('Non autenticato');
    
    const res = await fetch(`${API_URL}/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nella rimozione del membro');
    }
    
    // Update local state
    setGroups(prev => prev.map(g => g.id === groupId ? data.data : g));
  };

  const updateMemberRole = async (groupId: string, userId: string, role: GroupRole): Promise<void> => {
    if (!token) throw new Error('Non autenticato');
    
    const res = await fetch(`${API_URL}/groups/${groupId}/members/${userId}/role`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nella modifica del ruolo');
    }
    
    // Update local state
    setGroups(prev => prev.map(g => g.id === groupId ? data.data : g));
  };

  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!token) throw new Error('Non autenticato');
    
    const res = await fetch(`${API_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: authHeaders(),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nell\'uscita dal gruppo');
    }
    
    // Remove from local state
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  // ============ INVITES ============

  const fetchPendingInvites = async (): Promise<void> => {
    if (!token) return;
    
    try {
      console.log('[GroupsContext] Fetching pending invites...');
      const res = await fetch(`${API_URL}/groups/invites/pending`, {
        headers: authHeaders(),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore nel recupero inviti');
      }
      
      setPendingInvites(data.data);
      console.log('[GroupsContext] Pending invites:', data.data.length);
    } catch (err: any) {
      console.error('[GroupsContext] Error fetching invites:', err);
    }
  };

  const acceptInvite = async (inviteId: string): Promise<void> => {
    if (!token) throw new Error('Non autenticato');
    
    console.log('[GroupsContext] Accepting invite:', inviteId);
    const res = await fetch(`${API_URL}/groups/invites/${inviteId}/accept`, {
      method: 'POST',
      headers: authHeaders(),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nell\'accettazione dell\'invito');
    }
    
    // Remove from pending and refresh groups
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
    await fetchGroups();
    
    console.log('[GroupsContext] Invite accepted');
  };

  const rejectInvite = async (inviteId: string): Promise<void> => {
    if (!token) throw new Error('Non autenticato');
    
    const res = await fetch(`${API_URL}/groups/invites/${inviteId}/reject`, {
      method: 'POST',
      headers: authHeaders(),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore nel rifiuto dell\'invito');
    }
    
    // Remove from pending
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
  };

  return (
    <GroupsContext.Provider
      value={{
        groups,
        pendingInvites,
        isLoading,
        error,
        fetchGroups,
        getGroup,
        createGroup,
        updateGroup,
        deleteGroup,
        searchUsers,
        inviteMember,
        removeMember,
        updateMemberRole,
        leaveGroup,
        fetchPendingInvites,
        acceptInvite,
        rejectInvite,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
}
