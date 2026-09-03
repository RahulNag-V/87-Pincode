import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types.js';
import { api, setStoredToken, getStoredToken } from '../lib/api.js';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (name: string, email: string, pass: string, confirm?: string, phone?: string) => Promise<UserProfile>;
  oauthLogin: (provider: 'google' | 'apple', email: string, name?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  openAuthModal: (callback?: () => void) => void;
  authModalCallback: (() => void) | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalCallback, setAuthModalCallback] = useState<(() => void) | null>(null);

  const fetchUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.token);
      setUser(res.user);
      if (authModalCallback) {
        authModalCallback();
        setAuthModalCallback(null);
      }
      setAuthModalOpen(false);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, confirm?: string, phone?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({
        full_name: name,
        email,
        password: pass,
        confirm_password: confirm,
        phone
      });
      setStoredToken(res.token);
      setUser(res.user);
      if (authModalCallback) {
        authModalCallback();
        setAuthModalCallback(null);
      }
      setAuthModalOpen(false);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const oauthLogin = async (provider: 'google' | 'apple', email: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.oauthLogin({ provider, email, full_name: name });
      setStoredToken(res.token);
      setUser(res.user);
      if (authModalCallback) {
        authModalCallback();
        setAuthModalCallback(null);
      }
      setAuthModalOpen(false);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  const openAuthModal = (callback?: () => void) => {
    if (callback) {
      setAuthModalCallback(() => callback);
    }
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        oauthLogin,
        logout,
        refreshUser: fetchUser,
        authModalOpen,
        setAuthModalOpen,
        openAuthModal,
        authModalCallback
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
