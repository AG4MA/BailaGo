// Tipi di ballo disponibili
export type DanceType = 
  | 'salsa'
  | 'bachata'
  | 'kizomba'
  | 'reggaeton'
  | 'merengue'
  | 'tango'
  | 'swing'
  | 'hiphop'
  | 'house'
  | 'techno'
  | 'latin_mix'
  | 'other';

export interface DanceTypeInfo {
  id: DanceType;
  name: string;
  emoji: string;
  color: string;
}

export const DANCE_TYPES: DanceTypeInfo[] = [
  { id: 'salsa', name: 'Salsa', emoji: '💃', color: '#FF6B6B' },
  { id: 'bachata', name: 'Bachata', emoji: '🌹', color: '#E84393' },
  { id: 'kizomba', name: 'Kizomba', emoji: '🌙', color: '#6C5CE7' },
  { id: 'reggaeton', name: 'Reggaeton', emoji: '🔥', color: '#FD9644' },
  { id: 'merengue', name: 'Merengue', emoji: '🎺', color: '#20BF6B' },
  { id: 'tango', name: 'Tango', emoji: '🎩', color: '#2D3436' },
  { id: 'swing', name: 'Swing', emoji: '🎷', color: '#F9CA24' },
  { id: 'hiphop', name: 'Hip Hop', emoji: '🎤', color: '#636E72' },
  { id: 'house', name: 'House', emoji: '🎧', color: '#00CEC9' },
  { id: 'techno', name: 'Techno', emoji: '🔊', color: '#0984E3' },
  { id: 'latin_mix', name: 'Latin Mix', emoji: '🎉', color: '#E17055' },
  { id: 'other', name: 'Altro', emoji: '🎵', color: '#A29BFE' },
];

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  favoriteDances: DanceType[];
  createdAt: Date;
}

export interface Participant {
  userId: string;
  user: User;
  joinedAt: Date;
}

export interface DanceEvent {
  id: string;
  title: string;
  description: string;
  danceType: DanceType;
  location: Location;
  date: Date;
  startTime: string; // formato HH:mm
  endTime?: string;
  creatorId: string;
  creator: User;
  djName?: string; // DJ della serata
  djContact?: string;
  participants: Participant[];
  maxParticipants?: number;
  showParticipantNames: boolean; // se mostrare i nomi o solo il numero
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventData {
  title: string;
  description: string;
  danceType: DanceType;
  location: Location;
  date: Date;
  startTime: string;
  endTime?: string;
  djName?: string;
  djContact?: string;
  maxParticipants?: number;
  showParticipantNames: boolean;
  imageUrl?: string;
}

// Navigation types
export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
  ResetPassword: { token: string };
  
  // Main app screens
  Main: undefined;
  MainTabs: undefined;
  DanceTypeSelection: undefined;
  EventCalendar: { danceType: DanceType };
  CreateEvent: { danceType: DanceType; selectedDate?: string };
  EventDetail: { eventId: string };
  LocationPicker: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MyEvents: undefined;
  Profile: undefined;
};

// Auth provider type
export type AuthProvider = 'local' | 'google' | 'instagram';

// Extended User type
export interface UserFull extends User {
  email: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  provider?: AuthProvider;
  pushEnabled?: boolean;
}

// Registration input
export interface RegisterInput {
  email: string;
  password: string;
  username: string;
  nickname: string;
  firstName: string;
  lastName: string;
}
