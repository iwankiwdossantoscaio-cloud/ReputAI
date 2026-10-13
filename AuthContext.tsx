import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupaUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  joined: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<true | string>;
  register: (name: string, email: string, password: string, cpf: string, birthDate: string) => Promise<true | string>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  promoteToAdmin: (userId: string) => Promise<void>;
  demoteFromAdmin: (userId: string) => Promise<void>;
  getAllUsers: () => Promise<any[]>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (data: { name?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  return data === true;
}

async function buildUser(su: SupaUser): Promise<User> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', su.id)
    .single();

  const admin = await checkIsAdmin(su.id);

  return {
    id: su.id,
    name: profile?.name || su.user_metadata?.name || '',
    email: su.email || '',
    avatar: profile?.avatar || (profile?.name || 'U').charAt(0).toUpperCase(),
    isAdmin: admin,
    joined: su.created_at || new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(async () => {
          const user = await buildUser(session.user);
          setCurrentUser(user);
          setLoading(false);
        }, 0);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const user = await buildUser(session.user);
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<true | string> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return true;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, cpf: string, birthDate: string): Promise<true | string> => {
    if (email.endsWith('@admin.com')) return 'Domínio não permitido';

    // Senha forte: mín 8 chars, uma maiúscula, um número
    if (password.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Senha deve conter pelo menos uma letra maiúscula';
    if (!/[0-9]/.test(password)) return 'Senha deve conter pelo menos um número';

    // Check CPF uniqueness
    const { data: existingCpf } = await supabase
      .from('profiles')
      .select('id')
      .eq('cpf', cpf)
      .maybeSingle();
    if (existingCpf) return 'CPF já cadastrado';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, cpf, birth_date: birthDate },
      },
    });
    if (error) {
      if (error.message.includes('already registered')) return 'Email já cadastrado';
      return error.message;
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return !error;
  }, []);

  const updateProfile = useCallback(async (data: { name?: string }): Promise<boolean> => {
    if (!currentUser) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ name: data.name, updated_at: new Date().toISOString() })
      .eq('user_id', currentUser.id);
    if (!error && data.name) {
      setCurrentUser(prev => prev ? { ...prev, name: data.name! } : null);
    }
    return !error;
  }, [currentUser]);

  const promoteToAdmin = useCallback(async (userId: string) => {
    if (!currentUser?.isAdmin) return;
    await supabase.from('user_roles').upsert({ user_id: userId, role: 'admin' as const });
  }, [currentUser]);

  const demoteFromAdmin = useCallback(async (userId: string) => {
    if (!currentUser?.isAdmin) return;
    if (userId === currentUser.id) return; // impede auto-demote
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
  }, [currentUser]);

  const getAllUsers = useCallback(async () => {
    // Não expõe CPF nem data de nascimento ao client
    const { data: profiles } = await supabase.from('profiles').select('user_id, name, email, avatar, created_at');
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    return (profiles || []).map(p => ({
      ...p,
      isAdmin: (roles || []).some((r: any) => r.user_id === p.user_id && r.role === 'admin'),
    }));
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser, loading, login, register, logout,
      isAdmin: currentUser?.isAdmin ?? false,
      promoteToAdmin, demoteFromAdmin, getAllUsers,
      resetPassword, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
