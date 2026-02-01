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

// Provider di autenticazione
export type AuthProvider = 'local' | 'google' | 'instagram';

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
  email: string;
  username: string;
  nickname: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  favoriteDances: DanceType[];
  
  // Auth
  provider: AuthProvider;
  providerId?: string; // ID da Google/Instagram
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Push Notifications
  pushToken?: string;
  pushEnabled: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  password?: string;
  username: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface OAuthLoginInput {
  provider: 'google' | 'instagram';
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface Participant {
  userId: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  joinedAt: Date;
}

export interface DanceEvent {
  id: string;
  title: string;
  description: string;
  danceType: DanceType;
  location: Location;
  date: Date;
  startTime: string;
  endTime?: string;
  creatorId: string;
  creator: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  djName?: string;
  djContact?: string;
  participants: Participant[];
  participantCount: number;
  maxParticipants?: number;
  showParticipantNames: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  title: string;
  description: string;
  danceType: DanceType;
  location: Omit<Location, 'id'>;
  date: string;
  startTime: string;
  endTime?: string;
  djName?: string;
  djContact?: string;
  maxParticipants?: number;
  showParticipantNames: boolean;
  imageUrl?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
