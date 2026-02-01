import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, displayName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user per development
const MOCK_USER: User = {
  id: '1',
  username: 'bailador',
  displayName: 'Marco Bailador',
  bio: 'Amante della salsa e bachata 💃',
  favoriteDances: ['salsa', 'bachata', 'kizomba'],
  createdAt: new Date(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula il check dell'autenticazione
    const checkAuth = async () => {
      try {
        // In produzione: verificare il token salvato
        await new Promise(resolve => setTimeout(resolve, 500));
        // Per ora usiamo il mock user
        setUser(MOCK_USER);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // In produzione: chiamata API
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(MOCK_USER);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, displayName: string, password: string) => {
    setIsLoading(true);
    try {
      // In produzione: chiamata API
      await new Promise(resolve => setTimeout(resolve, 500));
      const newUser: User = {
        id: Date.now().toString(),
        username,
        displayName,
        favoriteDances: [],
        createdAt: new Date(),
      };
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // In produzione: rimuovere token
      await new Promise(resolve => setTimeout(resolve, 300));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    // In produzione: chiamata API
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
