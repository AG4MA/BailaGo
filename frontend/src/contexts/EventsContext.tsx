import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DanceEvent, CreateEventData, DanceType, User, Participant } from '../types';
import { useAuth } from './AuthContext';

interface EventsContextType {
  events: DanceEvent[];
  isLoading: boolean;
  getEventsByDanceType: (danceType: DanceType) => DanceEvent[];
  getEventById: (id: string) => DanceEvent | undefined;
  getEventsByDate: (date: Date, danceType?: DanceType) => DanceEvent[];
  getMyEvents: () => DanceEvent[];
  getMyCreatedEvents: () => DanceEvent[];
  createEvent: (data: CreateEventData) => Promise<DanceEvent>;
  updateEvent: (id: string, data: Partial<CreateEventData>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  isParticipant: (eventId: string) => boolean;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Mock events per development
const createMockEvents = (creatorUser: User): DanceEvent[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: '1',
      title: 'Salsa in Piazza Duomo',
      description: 'Una serata di salsa all\'aperto nel cuore di Milano! Porta amici e buon umore 💃',
      danceType: 'salsa',
      location: {
        id: 'loc1',
        name: 'Piazza Duomo',
        address: 'Piazza del Duomo',
        city: 'Milano',
        latitude: 45.4642,
        longitude: 9.1900,
      },
      date: tomorrow,
      startTime: '21:00',
      endTime: '00:00',
      creatorId: creatorUser.id,
      creator: creatorUser,
      djName: 'DJ Carlos',
      participants: [],
      showParticipantNames: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '2',
      title: 'Bachata Night @ Navigli',
      description: 'Bachata sensuale lungo i navigli. DJ set e lezione gratuita alle 20:30!',
      danceType: 'bachata',
      location: {
        id: 'loc2',
        name: 'Darsena Navigli',
        address: 'Viale Gabriele D\'Annunzio',
        city: 'Milano',
        latitude: 45.4507,
        longitude: 9.1784,
      },
      date: nextWeek,
      startTime: '20:30',
      endTime: '23:30',
      creatorId: '2',
      creator: {
        id: '2',
        username: 'bachatero',
        displayName: 'Luca Bachata',
        favoriteDances: ['bachata'],
        createdAt: new Date(),
      },
      djName: 'DJ Romeo',
      participants: [],
      maxParticipants: 50,
      showParticipantNames: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
};

export function EventsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<DanceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Inizializza mock events quando l'utente è disponibile
  React.useEffect(() => {
    if (user && events.length === 0) {
      setEvents(createMockEvents(user));
    }
  }, [user]);

  const getEventsByDanceType = (danceType: DanceType): DanceEvent[] => {
    return events.filter(e => e.danceType === danceType);
  };

  const getEventById = (id: string): DanceEvent | undefined => {
    return events.find(e => e.id === id);
  };

  const getEventsByDate = (date: Date, danceType?: DanceType): DanceEvent[] => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      const sameDay = eventDate.toDateString() === date.toDateString();
      if (danceType) {
        return sameDay && e.danceType === danceType;
      }
      return sameDay;
    });
  };

  const getMyEvents = (): DanceEvent[] => {
    if (!user) return [];
    return events.filter(e => 
      e.creatorId === user.id || 
      e.participants.some(p => p.userId === user.id)
    );
  };

  const getMyCreatedEvents = (): DanceEvent[] => {
    if (!user) return [];
    return events.filter(e => e.creatorId === user.id);
  };

  const createEvent = async (data: CreateEventData): Promise<DanceEvent> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newEvent: DanceEvent = {
        id: uuidv4(),
        ...data,
        creatorId: user.id,
        creator: user,
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (id: string, data: Partial<CreateEventData>): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      setEvents(prev => prev.map(e => 
        e.id === id 
          ? { ...e, ...data, updatedAt: new Date() }
          : e
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setEvents(prev => prev.filter(e => e.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const joinEvent = async (eventId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const participant: Participant = {
        userId: user.id,
        user,
        joinedAt: new Date(),
      };

      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, participants: [...e.participants, participant], updatedAt: new Date() }
          : e
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const leaveEvent = async (eventId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              participants: e.participants.filter(p => p.userId !== user.id),
              updatedAt: new Date() 
            }
          : e
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const isParticipant = (eventId: string): boolean => {
    if (!user) return false;
    const event = events.find(e => e.id === eventId);
    return event?.participants.some(p => p.userId === user.id) || false;
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        isLoading,
        getEventsByDanceType,
        getEventById,
        getEventsByDate,
        getMyEvents,
        getMyCreatedEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        joinEvent,
        leaveEvent,
        isParticipant,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
