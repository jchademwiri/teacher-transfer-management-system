import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  login: async () => { throw new Error('Not implemented'); },
  logout: async () => {},
  isAuthenticated: false,
  role: null,
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        // Only fetch profile if there is a valid user
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            ecNumber: userData.ec_number,
            schoolId: userData.school_id,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
            isActive: userData.is_active,
            setupComplete: userData.setup_complete,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) throw error || new Error('No session');
      // Fetch user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (userError || !userData) throw userError || new Error('User profile not found');
      const userProfile: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        ecNumber: userData.ec_number,
        schoolId: userData.school_id,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        isActive: userData.is_active,
        setupComplete: userData.setup_complete,
      };
      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));
      return userProfile;
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    role: user?.role || null,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
