import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthTokens, LoginCredentials, RegisterCredentials } from '@/types';
import { authService } from '@/services/api';
import { onTokenChange, clearTokens as clearTokensUtil } from '../lib/tokenManager';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('lms_user');
    const storedTokens = localStorage.getItem('lms_tokens');
    if (storedUser && storedTokens) {
      setUser(JSON.parse(storedUser));
      setTokens(JSON.parse(storedTokens));
    }
    setIsLoading(false);
  }, []);

  // Listen to token changes from anywhere (including refresh flow)
  useEffect(() => {
    const unsubscribe = onTokenChange((newTokens) => {
      setTokens(newTokens);
      if (!newTokens) {
        // Tokens were cleared, also clear user
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    setTokens(result.tokens);
    localStorage.setItem('lms_user', JSON.stringify(result.user));
    localStorage.setItem('lms_tokens', JSON.stringify(result.tokens));
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const result = await authService.register(credentials);
    setUser(result.user);
    setTokens(result.tokens);
    localStorage.setItem('lms_user', JSON.stringify(result.user));
    localStorage.setItem('lms_tokens', JSON.stringify(result.tokens));
  }, []);

  const logout = useCallback(() => {
    clearTokensUtil(); // This will trigger onTokenChange and update state
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      tokens,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
