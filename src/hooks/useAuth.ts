import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserType = 'admin' | 'salao' | 'cliente';

export interface AuthUser extends User {
  user_metadata: {
    nome?: string;
    tipo?: UserType;
    telefone?: string;
    avatar_url?: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user as AuthUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao verificar sessão');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, userType: UserType) => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Verificar se o tipo de usuário corresponde
        const userTipo = data.user.user_metadata?.tipo;
        if (userTipo !== userType) {
          await supabase.auth.signOut();
          throw new Error('Tipo de usuário incorreto');
        }
        
        setUser(data.user as AuthUser);
        return { user: data.user, error: null };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, userType: UserType, additionalData?: Record<string, any>) => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            tipo: userType,
            ...additionalData
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user as AuthUser);
        return { user: data.user, error: null };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta';
      setError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sair';
      setError(message);
      return { error: message };
    }
  };

  const updateUser = async (updates: Record<string, any>) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user as AuthUser);
        return { user: data.user, error: null };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      setError(message);
      return { user: null, error: message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar email de recuperação';
      setError(message);
      return { error: message };
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUser,
    resetPassword,
    isAuthenticated: !!user,
    userType: user?.user_metadata?.tipo as UserType | undefined
  };
};