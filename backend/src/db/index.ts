import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { 
  User, UserCreateInput, DanceEvent, CreateEventInput, Participant, 
  AuthProvider, OAuthLoginInput, Group, CreateGroupInput, GroupMember,
  GroupInvite, DjRequest
} from '../types/index.js';

// Tipo interno per utente con password
export type UserWithPassword = User & { password?: string };

// In-memory storage (sostituire con database reale in produzione)
const users: Map<string, UserWithPassword> = new Map();
const events: Map<string, DanceEvent> = new Map();
const groups: Map<string, Group> = new Map();
const groupInvites: Map<string, GroupInvite> = new Map();

// Helper per generare token sicuri
const generateToken = (): string => crypto.randomBytes(32).toString('hex');

// Seed data
const seedUser: UserWithPassword = {
  id: '1',
  username: 'demo',
  nickname: 'demo',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@bailago.app',
  emailVerified: true,
  displayName: 'Demo User',
  bio: 'Amante della salsa e bachata 💃',
  favoriteDances: ['salsa', 'bachata', 'kizomba'],
  password: bcrypt.hashSync('demo123', 10),
  provider: 'local',
  pushEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test user - credentials: test@test.com / test
const testUser: UserWithPassword = {
  id: '2',
  username: 'test',
  nickname: 'test',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@test.com',
  emailVerified: true,
  displayName: 'Test User',
  bio: 'Account di test',
  favoriteDances: ['salsa'],
  password: bcrypt.hashSync('test', 10),
  provider: 'local',
  pushEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

users.set(seedUser.id, seedUser);
users.set(testUser.id, testUser);

// User functions
export const db = {
  // Users
  users: {
    findById: (id: string): UserWithPassword | undefined => {
      return users.get(id);
    },

    findByEmail: (email: string): UserWithPassword | undefined => {
      return Array.from(users.values()).find(u => u.email === email);
    },

    findByUsername: (username: string): UserWithPassword | undefined => {
      return Array.from(users.values()).find(u => u.username === username);
    },

    findByNickname: (nickname: string): UserWithPassword | undefined => {
      return Array.from(users.values()).find(u => u.nickname === nickname);
    },

    findByProviderId: (provider: AuthProvider, providerId: string): UserWithPassword | undefined => {
      return Array.from(users.values()).find(u => u.provider === provider && u.providerId === providerId);
    },

    findByVerificationToken: (token: string): UserWithPassword | undefined => {
      return Array.from(users.values()).find(u => u.emailVerificationToken === token);
    },

    findByPasswordResetToken: (token: string): UserWithPassword | undefined => {
      return Array.from(users.values()).find(u => 
        u.passwordResetToken === token && 
        u.passwordResetExpires && 
        u.passwordResetExpires > new Date()
      );
    },

    findAll: (): User[] => {
      return Array.from(users.values()).map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
    },

    create: async (input: UserCreateInput): Promise<User> => {
      const hashedPassword = input.password ? await bcrypt.hash(input.password, 10) : undefined;
      const emailVerificationToken = generateToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore

      const user: UserWithPassword = {
        id: uuidv4(),
        email: input.email,
        username: input.username,
        nickname: input.nickname || input.username,
        firstName: input.firstName || '',
        lastName: input.lastName || '',
        displayName: input.displayName || `${input.firstName || ''} ${input.lastName || ''}`.trim() || input.username,
        password: hashedPassword,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
        provider: 'local',
        favoriteDances: [],
        pushEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(user.id, user);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    createFromOAuth: async (input: OAuthLoginInput): Promise<User> => {
      const user: UserWithPassword = {
        id: uuidv4(),
        email: input.email,
        username: input.email.split('@')[0] + '_' + uuidv4().substring(0, 6),
        nickname: input.firstName || input.email.split('@')[0],
        firstName: input.firstName || '',
        lastName: input.lastName || '',
        displayName: input.firstName && input.lastName 
          ? `${input.firstName} ${input.lastName}` 
          : input.email.split('@')[0],
        avatarUrl: input.avatarUrl,
        emailVerified: true, // OAuth emails sono già verificate
        provider: input.provider,
        providerId: input.providerId,
        favoriteDances: [],
        pushEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(user.id, user);
      return user;
    },

    update: (id: string, updates: Partial<User>): User | undefined => {
      const user = users.get(id);
      if (!user) return undefined;
      
      const updated = { ...user, ...updates, updatedAt: new Date() };
      users.set(id, updated);
      const { password, ...userWithoutPassword } = updated;
      return userWithoutPassword;
    },

    verifyEmail: (token: string): User | undefined => {
      const user = Array.from(users.values()).find(u => 
        u.emailVerificationToken === token &&
        u.emailVerificationExpires &&
        u.emailVerificationExpires > new Date()
      );

      if (!user) return undefined;

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      user.updatedAt = new Date();
      users.set(user.id, user);

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    createPasswordResetToken: (email: string): { user: User; token: string } | undefined => {
      const user = Array.from(users.values()).find(u => u.email === email);
      if (!user) return undefined;

      const token = generateToken();
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 ora
      user.updatedAt = new Date();
      users.set(user.id, user);

      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    },

    resetPassword: async (token: string, newPassword: string): Promise<User | undefined> => {
      const user = Array.from(users.values()).find(u => 
        u.passwordResetToken === token &&
        u.passwordResetExpires &&
        u.passwordResetExpires > new Date()
      );

      if (!user) return undefined;

      user.password = await bcrypt.hash(newPassword, 10);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.updatedAt = new Date();
      users.set(user.id, user);

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    updatePushToken: (userId: string, pushToken: string): User | undefined => {
      const user = users.get(userId);
      if (!user) return undefined;

      user.pushToken = pushToken;
      user.updatedAt = new Date();
      users.set(user.id, user);

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    validatePassword: async (user: UserWithPassword, password: string): Promise<boolean> => {
      if (!user.password) return false;
      return bcrypt.compare(password, user.password);
    },

    getAllWithPushToken: (): User[] => {
      return Array.from(users.values())
        .filter(u => u.pushToken && u.pushEnabled)
        .map(({ password, ...user }) => user);
    },
  },

  // Events
  events: {
    findAll: (filters?: { danceType?: string; city?: string; visibility?: string; groupIds?: string[]; userId?: string }): DanceEvent[] => {
      let result = Array.from(events.values());
      
      // Filtro per visibilità (solo eventi pubblici, o privati se l'utente è il creatore, o di gruppo se membro)
      if (filters?.userId) {
        result = result.filter(e => {
          if (e.visibility === 'public') return true;
          if (e.visibility === 'private' && e.creatorId === filters.userId) return true;
          if (e.visibility === 'group' && e.groupId && filters.groupIds?.includes(e.groupId)) return true;
          if (e.creatorId === filters.userId) return true; // creatore vede sempre i suoi
          return false;
        });
      } else {
        // Utente non autenticato vede solo pubblici
        result = result.filter(e => e.visibility === 'public');
      }
      
      if (filters?.danceType) {
        result = result.filter(e => e.danceType === filters.danceType);
      }
      if (filters?.city) {
        result = result.filter(e => e.location.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }
      
      return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    findById: (id: string): DanceEvent | undefined => {
      return events.get(id);
    },

    findByCreator: (creatorId: string): DanceEvent[] => {
      return Array.from(events.values()).filter(e => e.creatorId === creatorId);
    },

    findByParticipant: (userId: string): DanceEvent[] => {
      return Array.from(events.values()).filter(e => 
        e.participants.some(p => p.userId === userId)
      );
    },

    create: (input: CreateEventInput, creator: User): DanceEvent => {
      const event: DanceEvent = {
        id: uuidv4(),
        title: input.title,
        description: input.description,
        danceType: input.danceType,
        date: new Date(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        location: { ...input.location, id: uuidv4() },
        creatorId: creator.id,
        creator: {
          id: creator.id,
          username: creator.username,
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl,
        },
        // Visibility
        visibility: input.visibility || 'public',
        groupId: input.groupId,
        // DJ
        djMode: input.djMode || 'open',
        djName: input.djName,
        djContact: input.djContact,
        djUserId: input.djUserId,
        djRequests: [],
        // Participants
        participants: [],
        participantCount: 0,
        maxParticipants: input.maxParticipants,
        showParticipantNames: input.showParticipantNames,
        imageUrl: input.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      events.set(event.id, event);
      return event;
    },

    update: (id: string, updates: Partial<CreateEventInput>): DanceEvent | undefined => {
      const event = events.get(id);
      if (!event) return undefined;
      
      const updated: DanceEvent = {
        ...event,
        ...updates,
        location: updates.location 
          ? { ...updates.location, id: event.location.id } 
          : event.location,
        date: updates.date ? new Date(updates.date) : event.date,
        updatedAt: new Date(),
      };
      events.set(id, updated);
      return updated;
    },

    delete: (id: string): boolean => {
      return events.delete(id);
    },

    addParticipant: (eventId: string, user: User): DanceEvent | undefined => {
      const event = events.get(eventId);
      if (!event) return undefined;
      
      // Check if already participant
      if (event.participants.some(p => p.userId === user.id)) {
        return event;
      }
      
      // Check max participants
      if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
        return undefined;
      }

      const participant: Participant = {
        userId: user.id,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        joinedAt: new Date(),
      };

      event.participants.push(participant);
      event.participantCount = event.participants.length;
      event.updatedAt = new Date();
      events.set(eventId, event);
      return event;
    },

    removeParticipant: (eventId: string, userId: string): DanceEvent | undefined => {
      const event = events.get(eventId);
      if (!event) return undefined;

      event.participants = event.participants.filter(p => p.userId !== userId);
      event.participantCount = event.participants.length;
      event.updatedAt = new Date();
      events.set(eventId, event);
      return event;
    },

    // DJ Requests
    addDjRequest: (eventId: string, user: User, message?: string): DanceEvent | undefined => {
      const event = events.get(eventId);
      if (!event) return undefined;
      if (event.djMode === 'none') return undefined;
      
      // Check if already requested
      if (event.djRequests.some(r => r.userId === user.id)) {
        return event;
      }

      const request: DjRequest = {
        userId: user.id,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        message,
        requestedAt: new Date(),
        status: 'pending',
      };

      event.djRequests.push(request);
      event.updatedAt = new Date();
      events.set(eventId, event);
      return event;
    },

    approveDjRequest: (eventId: string, userId: string): DanceEvent | undefined => {
      const event = events.get(eventId);
      if (!event) return undefined;

      const request = event.djRequests.find(r => r.userId === userId);
      if (!request) return undefined;

      // Approve this request, reject others
      event.djRequests = event.djRequests.map(r => ({
        ...r,
        status: r.userId === userId ? 'approved' : 'rejected',
      }));

      // Set as DJ
      event.djUserId = userId;
      event.djName = request.user.displayName;
      event.updatedAt = new Date();
      events.set(eventId, event);
      return event;
    },

    rejectDjRequest: (eventId: string, userId: string): DanceEvent | undefined => {
      const event = events.get(eventId);
      if (!event) return undefined;

      event.djRequests = event.djRequests.map(r => 
        r.userId === userId ? { ...r, status: 'rejected' as const } : r
      );
      event.updatedAt = new Date();
      events.set(eventId, event);
      return event;
    },
  },

  // Groups
  groups: {
    findAll: (userId?: string): Group[] => {
      let result = Array.from(groups.values());
      if (userId) {
        result = result.filter(g => g.members.some(m => m.userId === userId));
      }
      return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    findById: (id: string): Group | undefined => {
      return groups.get(id);
    },

    findByMember: (userId: string): Group[] => {
      return Array.from(groups.values()).filter(g => 
        g.members.some(m => m.userId === userId)
      );
    },

    create: (input: CreateGroupInput, creator: User): Group => {
      const group: Group = {
        id: uuidv4(),
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        creatorId: creator.id, // Aggiungo creator ID
        members: [{
          userId: creator.id,
          user: {
            id: creator.id,
            username: creator.username,
            displayName: creator.displayName,
            avatarUrl: creator.avatarUrl,
          },
          role: 'admin',
          joinedAt: new Date(),
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      groups.set(group.id, group);
      return group;
    },

    update: (id: string, updates: Partial<CreateGroupInput>): Group | undefined => {
      const group = groups.get(id);
      if (!group) return undefined;
      
      const updated: Group = {
        ...group,
        ...updates,
        updatedAt: new Date(),
      };
      groups.set(id, updated);
      return updated;
    },

    delete: (id: string): boolean => {
      // Also delete all events of this group
      Array.from(events.values())
        .filter(e => e.groupId === id)
        .forEach(e => events.delete(e.id));
      
      // Delete pending invites
      Array.from(groupInvites.values())
        .filter(i => i.groupId === id)
        .forEach(i => groupInvites.delete(i.id));
      
      return groups.delete(id);
    },

    addMember: (groupId: string, user: User, role: 'admin' | 'member' | 'dj' = 'member'): Group | undefined => {
      const group = groups.get(groupId);
      if (!group) return undefined;
      
      // Check if already member
      if (group.members.some(m => m.userId === user.id)) {
        return group;
      }

      const member: GroupMember = {
        userId: user.id,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        role,
        joinedAt: new Date(),
      };

      group.members.push(member);
      group.updatedAt = new Date();
      groups.set(groupId, group);
      return group;
    },

    removeMember: (groupId: string, userId: string): Group | undefined => {
      const group = groups.get(groupId);
      if (!group) return undefined;

      // Can't remove last admin
      const admins = group.members.filter(m => m.role === 'admin');
      const isAdmin = admins.some(a => a.userId === userId);
      if (isAdmin && admins.length === 1) {
        return undefined; // Can't remove last admin
      }

      group.members = group.members.filter(m => m.userId !== userId);
      group.updatedAt = new Date();
      groups.set(groupId, group);
      return group;
    },

    updateMemberRole: (groupId: string, userId: string, role: 'admin' | 'member' | 'dj'): Group | undefined => {
      const group = groups.get(groupId);
      if (!group) return undefined;

      // Can't demote last admin
      if (role !== 'admin') {
        const admins = group.members.filter(m => m.role === 'admin');
        const isCurrentlyAdmin = admins.some(a => a.userId === userId);
        if (isCurrentlyAdmin && admins.length === 1) {
          return undefined;
        }
      }

      group.members = group.members.map(m => 
        m.userId === userId ? { ...m, role } : m
      );
      group.updatedAt = new Date();
      groups.set(groupId, group);
      return group;
    },

    isAdmin: (groupId: string, userId: string): boolean => {
      const group = groups.get(groupId);
      if (!group) return false;
      return group.members.some(m => m.userId === userId && m.role === 'admin');
    },

    isMember: (groupId: string, userId: string): boolean => {
      const group = groups.get(groupId);
      if (!group) return false;
      return group.members.some(m => m.userId === userId);
    },
  },

  // Group Invites
  invites: {
    findByUser: (userId: string): GroupInvite[] => {
      return Array.from(groupInvites.values())
        .filter(i => i.invitedUserId === userId && i.status === 'pending');
    },

    findByGroup: (groupId: string): GroupInvite[] => {
      return Array.from(groupInvites.values())
        .filter(i => i.groupId === groupId);
    },

    findById: (id: string): GroupInvite | undefined => {
      return groupInvites.get(id);
    },

    create: (groupId: string, invitedUserId: string, invitedByUserId: string): GroupInvite => {
      // Check if invite already exists
      const existing = Array.from(groupInvites.values()).find(
        i => i.groupId === groupId && i.invitedUserId === invitedUserId && i.status === 'pending'
      );
      if (existing) return existing;

      const invite: GroupInvite = {
        id: uuidv4(),
        groupId,
        invitedUserId,
        invitedByUserId,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };
      groupInvites.set(invite.id, invite);
      return invite;
    },

    accept: (inviteId: string): GroupInvite | undefined => {
      const invite = groupInvites.get(inviteId);
      if (!invite) return undefined;
      if (invite.status !== 'pending') return undefined;
      if (invite.expiresAt < new Date()) return undefined;

      invite.status = 'accepted';
      groupInvites.set(inviteId, invite);
      return invite;
    },

    reject: (inviteId: string): GroupInvite | undefined => {
      const invite = groupInvites.get(inviteId);
      if (!invite) return undefined;

      invite.status = 'rejected';
      groupInvites.set(inviteId, invite);
      return invite;
    },

    delete: (id: string): boolean => {
      return groupInvites.delete(id);
    },
  },
};
