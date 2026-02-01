import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, UserCreateInput, DanceEvent, CreateEventInput, Participant, AuthProvider, OAuthLoginInput } from '../types/index.js';

// Tipo interno per utente con password
export type UserWithPassword = User & { password?: string };

// In-memory storage (sostituire con database reale in produzione)
const users: Map<string, UserWithPassword> = new Map();
const events: Map<string, DanceEvent> = new Map();

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

users.set(seedUser.id, seedUser);

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
    findAll: (filters?: { danceType?: string; city?: string }): DanceEvent[] => {
      let result = Array.from(events.values());
      
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
        ...input,
        date: new Date(input.date),
        location: { ...input.location, id: uuidv4() },
        creatorId: creator.id,
        creator: {
          id: creator.id,
          username: creator.username,
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl,
        },
        participants: [],
        participantCount: 0,
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
  },
};
