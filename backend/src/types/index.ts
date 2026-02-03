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

// ============ VISIBILITY & DJ MODE ============

// Visibilità evento
export type EventVisibility = 'public' | 'private' | 'group';

// Modalità DJ
export type DjMode = 
  | 'open'      // Chiunque può candidarsi come DJ
  | 'assigned'  // DJ pre-assegnato, altri possono richiedere
  | 'none';     // Nessun DJ previsto (campo nascosto)

// Richiesta per diventare DJ
export interface DjRequest {
  userId: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  message?: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

// ============ GROUPS ============

// Ruolo nel gruppo
export type GroupRole = 'admin' | 'member' | 'dj';

// Membro del gruppo
export interface GroupMember {
  userId: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  role: GroupRole;
  joinedAt: Date;
}

// Invito al gruppo
export interface GroupInvite {
  id: string;
  groupId: string;
  invitedUserId: string;
  invitedByUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

// Gruppo
export interface Group {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  creatorId: string; // ID del creator del gruppo
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateGroupInput extends Partial<CreateGroupInput> {}

export interface InviteToGroupInput {
  userId: string;
}

// ============ LOCATION ============

// ============ LOCATION ============

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
  
  // Account Status & Inactivity
  status: 'active' | 'inactive' | 'deactivated' | 'deleted';
  lastActiveAt: Date;
  deactivatedAt?: Date;
  scheduledDeletionAt?: Date;
  
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
  
  // Visibilità
  visibility: EventVisibility;
  groupId?: string; // Solo se visibility === 'group'
  
  // DJ
  djMode: DjMode;
  djName?: string;
  djContact?: string;
  djUserId?: string; // Se DJ è un utente registrato
  djRequests: DjRequest[]; // Richieste per diventare DJ
  
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
  
  // Visibilità
  visibility?: EventVisibility; // default: 'public'
  groupId?: string;
  
  // DJ
  djMode?: DjMode; // default: 'open'
  djName?: string;
  djContact?: string;
  djUserId?: string;
  
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
