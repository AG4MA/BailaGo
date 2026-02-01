import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User, UserCreateInput, DanceEvent, CreateEventInput, Participant } from '../types/index.js';

// In-memory storage (sostituire con database reale in produzione)
const users: Map<string, User & { password: string }> = new Map();
const events: Map<string, DanceEvent> = new Map();

// Seed data
const seedUser: User & { password: string } = {
  id: '1',
  username: 'demo',
  email: 'demo@bailago.app',
  displayName: 'Demo User',
  bio: 'Amante della salsa e bachata 💃',
  favoriteDances: ['salsa', 'bachata', 'kizomba'],
  password: bcrypt.hashSync('demo123', 10),
  createdAt: new Date(),
  updatedAt: new Date(),
};

users.set(seedUser.id, seedUser);

// User functions
export const db = {
  // Users
  users: {
    findById: (id: string): (User & { password: string }) | undefined => {
      return users.get(id);
    },

    findByEmail: (email: string): (User & { password: string }) | undefined => {
      return Array.from(users.values()).find(u => u.email === email);
    },

    findByUsername: (username: string): (User & { password: string }) | undefined => {
      return Array.from(users.values()).find(u => u.username === username);
    },

    create: async (input: UserCreateInput): Promise<User> => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user: User & { password: string } = {
        id: uuidv4(),
        ...input,
        password: hashedPassword,
        favoriteDances: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(user.id, user);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    update: (id: string, updates: Partial<User>): User | undefined => {
      const user = users.get(id);
      if (!user) return undefined;
      
      const updated = { ...user, ...updates, updatedAt: new Date() };
      users.set(id, updated);
      const { password, ...userWithoutPassword } = updated;
      return userWithoutPassword;
    },

    validatePassword: async (user: User & { password: string }, password: string): Promise<boolean> => {
      return bcrypt.compare(password, user.password);
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
