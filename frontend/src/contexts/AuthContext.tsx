import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { UserFull, RegisterInput } from '../types';

// Per OAuth
WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface AuthContextType {
  user: UserFull | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithInstagram: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateProfile: (updates: Partial<UserFull>) => Promise<void>;
  updatePushToken: (pushToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserFull | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google OAuth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // Gestisce risposta Google OAuth
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleCallback(id_token);
    }
  }, [response]);

  // Check auth all'avvio
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        await fetchCurrentUser(storedToken);
      }
    } catch (error) {
      console.error('Check auth error:', error);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async (authToken: string) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (!res.ok) {
      throw new Error('Session expired');
    }
    
    const data = await res.json();
    setUser(data.data.user);
  };

  const saveAuth = async (authToken: string, userData: UserFull) => {
    await AsyncStorage.setItem('auth_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante il login');
      }

      await saveAuth(data.data.token, data.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la registrazione');
      }

      await saveAuth(data.data.token, data.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!request) {
      throw new Error('Google login non disponibile');
    }
    await promptAsync();
  };

  const handleGoogleCallback = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/oauth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore con Google');
      }

      await saveAuth(data.data.token, data.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithInstagram = async () => {
    // Instagram OAuth richiede redirect a una pagina web
    // In produzione, implementare il flusso OAuth completo
    throw new Error('Instagram login disponibile prossimamente');
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la richiesta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetToken: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante il reset');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!token) throw new Error('Non autenticato');
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante l\'invio');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserFull>) => {
    if (!token || !user) throw new Error('Non autenticato');
    
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Errore durante l\'aggiornamento');
    }

    setUser(data.data.user);
  };

  const updatePushToken = async (pushToken: string) => {
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/auth/update-push-token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pushToken }),
      });
    } catch (error) {
      console.error('Update push token error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithInstagram,
        forgotPassword,
        resetPassword,
        resendVerification,
        updateProfile,
        updatePushToken,
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
