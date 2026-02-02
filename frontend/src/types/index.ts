// Tipi di ballo disponibili - organizzati per famiglia
export type DanceType = 
  // Danze Caraibiche / Latine
  | 'salsa_cubana'
  | 'salsa_portoricana'
  | 'salsa_la'
  | 'salsa_ny'
  | 'bachata_sensual'
  | 'bachata_dominicana'
  | 'bachata_moderna'
  | 'merengue'
  | 'cha_cha_cha'
  | 'mambo'
  | 'son_cubano'
  | 'rumba_cubana'
  | 'reggaeton'
  | 'cumbia'
  | 'pachanga'
  // Danze Africane / Afro
  | 'kizomba'
  | 'semba'
  | 'tarraxinha'
  | 'afrohouse'
  | 'kuduro'
  | 'afrobeats'
  | 'coupe_decale'
  | 'ndombolo'
  | 'azonto'
  // Danze Brasiliane
  | 'forro'
  | 'samba_de_gafieira'
  | 'samba_no_pe'
  | 'zouk_brasileiro'
  | 'lambada'
  | 'axe'
  | 'pagode'
  // Tango
  | 'tango_argentino'
  | 'tango_nuevo'
  | 'milonga'
  | 'vals_tango'
  // Swing & Vintage
  | 'lindy_hop'
  | 'charleston'
  | 'balboa'
  | 'shag'
  | 'boogie_woogie'
  | 'rock_n_roll'
  | 'jive'
  | 'east_coast_swing'
  | 'west_coast_swing'
  // Balli da Sala / Standard
  | 'valzer_viennese'
  | 'valzer_lento'
  | 'quickstep'
  | 'foxtrot'
  | 'slow_fox'
  // Balli Latini Sportivi
  | 'cha_cha_sportivo'
  | 'rumba_sportiva'
  | 'paso_doble'
  | 'samba_sportivo'
  | 'jive_sportivo'
  // Country & Folk
  | 'country_line_dance'
  | 'two_step'
  | 'polka'
  | 'mazurka'
  | 'tarantella'
  | 'pizzica'
  | 'folk_irlandese'
  // Urban / Street
  | 'hiphop'
  | 'breaking'
  | 'popping'
  | 'locking'
  | 'house'
  | 'krump'
  | 'waacking'
  | 'voguing'
  | 'dancehall'
  | 'afrodance'
  // Elettroniche / Club
  | 'techno'
  | 'shuffle'
  | 'electro'
  | 'trance'
  // Contatto / Fusion
  | 'contact_improv'
  | 'ecstatic_dance'
  | 'biodanza'
  | 'fusion'
  | '5rhythms'
  // Altro
  | 'altro';

// ============ FAMIGLIE DI BALLO ============

export type DanceFamilyId = 
  | 'caribbean'
  | 'african'
  | 'brazilian'
  | 'tango'
  | 'swing'
  | 'ballroom'
  | 'latin_sport'
  | 'country_folk'
  | 'urban'
  | 'electronic'
  | 'contact'
  | 'other';

export interface DanceFamily {
  id: DanceFamilyId;
  name: string;
  emoji: string;
  color: string;
  dances: DanceType[];
}

export interface DanceTypeInfo {
  id: DanceType;
  name: string;
  emoji: string;
  color: string;
  familyId: DanceFamilyId;
}

// Famiglie di ballo
export const DANCE_FAMILIES: DanceFamily[] = [
  {
    id: 'caribbean',
    name: 'Caraibiche',
    emoji: '🌴',
    color: '#FF6B6B',
    dances: ['salsa_cubana', 'salsa_portoricana', 'salsa_la', 'salsa_ny', 'bachata_sensual', 'bachata_dominicana', 'bachata_moderna', 'merengue', 'cha_cha_cha', 'mambo', 'son_cubano', 'rumba_cubana', 'reggaeton', 'cumbia', 'pachanga'],
  },
  {
    id: 'african',
    name: 'Afro',
    emoji: '🌍',
    color: '#6C5CE7',
    dances: ['kizomba', 'semba', 'tarraxinha', 'afrohouse', 'kuduro', 'afrobeats', 'coupe_decale', 'ndombolo', 'azonto'],
  },
  {
    id: 'brazilian',
    name: 'Brasiliane',
    emoji: '🇧🇷',
    color: '#20BF6B',
    dances: ['forro', 'samba_de_gafieira', 'samba_no_pe', 'zouk_brasileiro', 'lambada', 'axe', 'pagode'],
  },
  {
    id: 'tango',
    name: 'Tango',
    emoji: '🎩',
    color: '#2D3436',
    dances: ['tango_argentino', 'tango_nuevo', 'milonga', 'vals_tango'],
  },
  {
    id: 'swing',
    name: 'Swing',
    emoji: '🎷',
    color: '#F9CA24',
    dances: ['lindy_hop', 'charleston', 'balboa', 'shag', 'boogie_woogie', 'rock_n_roll', 'jive', 'east_coast_swing', 'west_coast_swing'],
  },
  {
    id: 'ballroom',
    name: 'Sala',
    emoji: '👗',
    color: '#9B59B6',
    dances: ['valzer_viennese', 'valzer_lento', 'quickstep', 'foxtrot', 'slow_fox'],
  },
  {
    id: 'latin_sport',
    name: 'Latini Sportivi',
    emoji: '🏆',
    color: '#E84393',
    dances: ['cha_cha_sportivo', 'rumba_sportiva', 'paso_doble', 'samba_sportivo', 'jive_sportivo'],
  },
  {
    id: 'country_folk',
    name: 'Country & Folk',
    emoji: '🤠',
    color: '#D35400',
    dances: ['country_line_dance', 'two_step', 'polka', 'mazurka', 'tarantella', 'pizzica', 'folk_irlandese'],
  },
  {
    id: 'urban',
    name: 'Urban',
    emoji: '🎤',
    color: '#636E72',
    dances: ['hiphop', 'breaking', 'popping', 'locking', 'house', 'krump', 'waacking', 'voguing', 'dancehall', 'afrodance'],
  },
  {
    id: 'electronic',
    name: 'Elettroniche',
    emoji: '🎧',
    color: '#00CEC9',
    dances: ['techno', 'shuffle', 'electro', 'trance'],
  },
  {
    id: 'contact',
    name: 'Contatto',
    emoji: '🧘',
    color: '#74B9FF',
    dances: ['contact_improv', 'ecstatic_dance', 'biodanza', 'fusion', '5rhythms'],
  },
  {
    id: 'other',
    name: 'Altro',
    emoji: '🎵',
    color: '#A29BFE',
    dances: ['altro'],
  },
];

// Tutti i tipi di ballo con dettagli
export const DANCE_TYPES: DanceTypeInfo[] = [
  // Caraibiche
  { id: 'salsa_cubana', name: 'Salsa Cubana', emoji: '💃', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'salsa_portoricana', name: 'Salsa Portoricana', emoji: '💃', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'salsa_la', name: 'Salsa LA Style', emoji: '💃', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'salsa_ny', name: 'Salsa NY Style', emoji: '💃', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'bachata_sensual', name: 'Bachata Sensual', emoji: '🌹', color: '#E84393', familyId: 'caribbean' },
  { id: 'bachata_dominicana', name: 'Bachata Dominicana', emoji: '🌹', color: '#E84393', familyId: 'caribbean' },
  { id: 'bachata_moderna', name: 'Bachata Moderna', emoji: '🌹', color: '#E84393', familyId: 'caribbean' },
  { id: 'merengue', name: 'Merengue', emoji: '🎺', color: '#20BF6B', familyId: 'caribbean' },
  { id: 'cha_cha_cha', name: 'Cha Cha Cha', emoji: '✨', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'mambo', name: 'Mambo', emoji: '🎹', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'son_cubano', name: 'Son Cubano', emoji: '🎸', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'rumba_cubana', name: 'Rumba Cubana', emoji: '🥁', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'reggaeton', name: 'Reggaeton', emoji: '🔥', color: '#FD9644', familyId: 'caribbean' },
  { id: 'cumbia', name: 'Cumbia', emoji: '🎊', color: '#FF6B6B', familyId: 'caribbean' },
  { id: 'pachanga', name: 'Pachanga', emoji: '🎉', color: '#FF6B6B', familyId: 'caribbean' },
  
  // Afro
  { id: 'kizomba', name: 'Kizomba', emoji: '🌙', color: '#6C5CE7', familyId: 'african' },
  { id: 'semba', name: 'Semba', emoji: '🌍', color: '#6C5CE7', familyId: 'african' },
  { id: 'tarraxinha', name: 'Tarraxinha', emoji: '💜', color: '#6C5CE7', familyId: 'african' },
  { id: 'afrohouse', name: 'Afro House', emoji: '🏠', color: '#6C5CE7', familyId: 'african' },
  { id: 'kuduro', name: 'Kuduro', emoji: '⚡', color: '#6C5CE7', familyId: 'african' },
  { id: 'afrobeats', name: 'Afrobeats', emoji: '🥁', color: '#6C5CE7', familyId: 'african' },
  { id: 'coupe_decale', name: 'Coupé Décalé', emoji: '🌟', color: '#6C5CE7', familyId: 'african' },
  { id: 'ndombolo', name: 'Ndombolo', emoji: '🌍', color: '#6C5CE7', familyId: 'african' },
  { id: 'azonto', name: 'Azonto', emoji: '🇬🇭', color: '#6C5CE7', familyId: 'african' },
  
  // Brasiliane
  { id: 'forro', name: 'Forró', emoji: '🎶', color: '#20BF6B', familyId: 'brazilian' },
  { id: 'samba_de_gafieira', name: 'Samba de Gafieira', emoji: '🇧🇷', color: '#20BF6B', familyId: 'brazilian' },
  { id: 'samba_no_pe', name: 'Samba no Pé', emoji: '🪶', color: '#20BF6B', familyId: 'brazilian' },
  { id: 'zouk_brasileiro', name: 'Zouk Brasileiro', emoji: '🌊', color: '#20BF6B', familyId: 'brazilian' },
  { id: 'lambada', name: 'Lambada', emoji: '☀️', color: '#20BF6B', familyId: 'brazilian' },
  { id: 'axe', name: 'Axé', emoji: '🎪', color: '#20BF6B', familyId: 'brazilian' },
  { id: 'pagode', name: 'Pagode', emoji: '🎤', color: '#20BF6B', familyId: 'brazilian' },
  
  // Tango
  { id: 'tango_argentino', name: 'Tango Argentino', emoji: '🎩', color: '#2D3436', familyId: 'tango' },
  { id: 'tango_nuevo', name: 'Tango Nuevo', emoji: '🎭', color: '#2D3436', familyId: 'tango' },
  { id: 'milonga', name: 'Milonga', emoji: '🌃', color: '#2D3436', familyId: 'tango' },
  { id: 'vals_tango', name: 'Vals Tango', emoji: '🎻', color: '#2D3436', familyId: 'tango' },
  
  // Swing
  { id: 'lindy_hop', name: 'Lindy Hop', emoji: '🎷', color: '#F9CA24', familyId: 'swing' },
  { id: 'charleston', name: 'Charleston', emoji: '👠', color: '#F9CA24', familyId: 'swing' },
  { id: 'balboa', name: 'Balboa', emoji: '🎺', color: '#F9CA24', familyId: 'swing' },
  { id: 'shag', name: 'Shag', emoji: '👞', color: '#F9CA24', familyId: 'swing' },
  { id: 'boogie_woogie', name: 'Boogie Woogie', emoji: '🎹', color: '#F9CA24', familyId: 'swing' },
  { id: 'rock_n_roll', name: "Rock'n'Roll", emoji: '🎸', color: '#F9CA24', familyId: 'swing' },
  { id: 'jive', name: 'Jive', emoji: '⚡', color: '#F9CA24', familyId: 'swing' },
  { id: 'east_coast_swing', name: 'East Coast Swing', emoji: '🌅', color: '#F9CA24', familyId: 'swing' },
  { id: 'west_coast_swing', name: 'West Coast Swing', emoji: '🌇', color: '#F9CA24', familyId: 'swing' },
  
  // Sala
  { id: 'valzer_viennese', name: 'Valzer Viennese', emoji: '👗', color: '#9B59B6', familyId: 'ballroom' },
  { id: 'valzer_lento', name: 'Valzer Lento', emoji: '💐', color: '#9B59B6', familyId: 'ballroom' },
  { id: 'quickstep', name: 'Quickstep', emoji: '💨', color: '#9B59B6', familyId: 'ballroom' },
  { id: 'foxtrot', name: 'Foxtrot', emoji: '🦊', color: '#9B59B6', familyId: 'ballroom' },
  { id: 'slow_fox', name: 'Slow Fox', emoji: '🌹', color: '#9B59B6', familyId: 'ballroom' },
  
  // Latini Sportivi
  { id: 'cha_cha_sportivo', name: 'Cha Cha Sportivo', emoji: '🏆', color: '#E84393', familyId: 'latin_sport' },
  { id: 'rumba_sportiva', name: 'Rumba Sportiva', emoji: '🏅', color: '#E84393', familyId: 'latin_sport' },
  { id: 'paso_doble', name: 'Paso Doble', emoji: '🐂', color: '#E84393', familyId: 'latin_sport' },
  { id: 'samba_sportivo', name: 'Samba Sportivo', emoji: '🏆', color: '#E84393', familyId: 'latin_sport' },
  { id: 'jive_sportivo', name: 'Jive Sportivo', emoji: '⚡', color: '#E84393', familyId: 'latin_sport' },
  
  // Country & Folk
  { id: 'country_line_dance', name: 'Country Line Dance', emoji: '🤠', color: '#D35400', familyId: 'country_folk' },
  { id: 'two_step', name: 'Two Step', emoji: '🤠', color: '#D35400', familyId: 'country_folk' },
  { id: 'polka', name: 'Polka', emoji: '🎺', color: '#D35400', familyId: 'country_folk' },
  { id: 'mazurka', name: 'Mazurka', emoji: '🎵', color: '#D35400', familyId: 'country_folk' },
  { id: 'tarantella', name: 'Tarantella', emoji: '🇮🇹', color: '#D35400', familyId: 'country_folk' },
  { id: 'pizzica', name: 'Pizzica', emoji: '🌾', color: '#D35400', familyId: 'country_folk' },
  { id: 'folk_irlandese', name: 'Folk Irlandese', emoji: '☘️', color: '#D35400', familyId: 'country_folk' },
  
  // Urban
  { id: 'hiphop', name: 'Hip Hop', emoji: '🎤', color: '#636E72', familyId: 'urban' },
  { id: 'breaking', name: 'Breaking', emoji: '🔄', color: '#636E72', familyId: 'urban' },
  { id: 'popping', name: 'Popping', emoji: '⚡', color: '#636E72', familyId: 'urban' },
  { id: 'locking', name: 'Locking', emoji: '🔒', color: '#636E72', familyId: 'urban' },
  { id: 'house', name: 'House', emoji: '🏠', color: '#636E72', familyId: 'urban' },
  { id: 'krump', name: 'Krump', emoji: '💪', color: '#636E72', familyId: 'urban' },
  { id: 'waacking', name: 'Waacking', emoji: '✋', color: '#636E72', familyId: 'urban' },
  { id: 'voguing', name: 'Voguing', emoji: '💅', color: '#636E72', familyId: 'urban' },
  { id: 'dancehall', name: 'Dancehall', emoji: '🇯🇲', color: '#636E72', familyId: 'urban' },
  { id: 'afrodance', name: 'Afrodance', emoji: '🌍', color: '#636E72', familyId: 'urban' },
  
  // Elettroniche
  { id: 'techno', name: 'Techno', emoji: '🎧', color: '#00CEC9', familyId: 'electronic' },
  { id: 'shuffle', name: 'Shuffle', emoji: '👟', color: '#00CEC9', familyId: 'electronic' },
  { id: 'electro', name: 'Electro', emoji: '⚡', color: '#00CEC9', familyId: 'electronic' },
  { id: 'trance', name: 'Trance', emoji: '🌀', color: '#00CEC9', familyId: 'electronic' },
  
  // Contatto
  { id: 'contact_improv', name: 'Contact Improvisation', emoji: '🧘', color: '#74B9FF', familyId: 'contact' },
  { id: 'ecstatic_dance', name: 'Ecstatic Dance', emoji: '🌊', color: '#74B9FF', familyId: 'contact' },
  { id: 'biodanza', name: 'Biodanza', emoji: '🌿', color: '#74B9FF', familyId: 'contact' },
  { id: 'fusion', name: 'Fusion', emoji: '🔮', color: '#74B9FF', familyId: 'contact' },
  { id: '5rhythms', name: '5 Rhythms', emoji: '💫', color: '#74B9FF', familyId: 'contact' },
  
  // Altro
  { id: 'altro', name: 'Altro', emoji: '🎵', color: '#A29BFE', familyId: 'other' },
];

// Helper per ottenere info ballo
export const getDanceTypeInfo = (id: DanceType): DanceTypeInfo | undefined => 
  DANCE_TYPES.find(d => d.id === id);

// Helper per ottenere info famiglia
export const getDanceFamilyInfo = (id: DanceFamilyId): DanceFamily | undefined => 
  DANCE_FAMILIES.find(f => f.id === id);

// Helper per ottenere balli di una famiglia
export const getDancesByFamily = (familyId: DanceFamilyId): DanceTypeInfo[] => 
  DANCE_TYPES.filter(d => d.familyId === familyId);

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

// ============ GROUPS ============

export type GroupRole = 'admin' | 'member' | 'dj';

export interface GroupMember {
  userId: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  role: GroupRole;
  joinedAt: Date;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  invitedUserId: string;
  invitedByUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  creatorId: string;
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ EVENTS ============

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
  
  // Visibilità e partecipazione
  visibility: EventVisibility;
  participationMode: ParticipationMode;
  groupId?: string; // Gruppo associato (opzionale)
  groupName?: string; // Nome del gruppo (computed)
  
  // DJ
  djMode: DjMode;
  djName?: string;
  djContact?: string;
  djUserId?: string;
  djUser?: User;
  djRequests: DjRequest[];
  
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
  
  // Visibilità e partecipazione
  visibility: EventVisibility;
  participationMode: ParticipationMode;
  groupId?: string;
  
  // DJ
  djMode: DjMode;
  djName?: string;
  djContact?: string;
  djUserId?: string;
  
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
  AllEvents: { city?: string; danceType?: DanceType }; // Vista calendario completa
  EventCalendar: { danceType: DanceType };
  CreateEvent: { danceType: DanceType; selectedDate?: string };
  EventDetail: { eventId: string };
  LocationPicker: undefined;
  
  // Groups screens
  Groups: undefined;
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  GroupMembers: { groupId: string };
  GroupInvites: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MyEvents: undefined;
  Groups: undefined;
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
