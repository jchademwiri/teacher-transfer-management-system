
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

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

// Mock user data for demonstration
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "teacher@example.com",
    ecNumber: "EC123456",
    name: "John Teacher",
    role: "teacher",
    schoolId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    setupComplete: true
  },
  {
    id: "2",
    email: "headmaster@example.com",
    ecNumber: "EC789012",
    name: "Sarah Headmaster",
    role: "headmaster",
    schoolId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    setupComplete: true
  },
  {
    id: "3",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    setupComplete: true
  }
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Restored user session:', parsedUser); // Debug log
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Session check failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call Supabase auth
      // For now, we'll mock it by finding a matching user
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      console.log('Logging in user:', foundUser); // Debug log
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      
      return foundUser;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call Supabase auth sign out
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
