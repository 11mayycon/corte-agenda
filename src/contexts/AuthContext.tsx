import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthUser, UserType } from '@/hooks/useAuth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, userType: UserType) => Promise<{ user: AuthUser | null; error: string | null }>;
  signUp: (email: string, password: string, nome: string, userType: UserType, additionalData?: Record<string, any>) => Promise<{ user: AuthUser | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateUser: (updates: Record<string, any>) => Promise<{ user: AuthUser | null; error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  isAuthenticated: boolean;
  userType: UserType | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};