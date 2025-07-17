import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasRoles: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for the system
const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'Juan Carlos Admin',
    email: 'admin@bethelsas.com',
    role: 'admin',
    phone: '+57 300 123 4567',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: '2',
    name: 'María Supervisor',
    email: 'supervisor@bethelsas.com',
    role: 'supervisor',
    phone: '+57 300 234 5678',
    createdAt: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '3',
    name: 'Carlos Técnico',
    email: 'tecnico@bethelsas.com',
    role: 'tecnician',
    phone: '+57 300 345 6789',
    createdAt: new Date('2024-02-01'),
    isActive: true
  },
  {
    id: '4',
    name: 'Ana Técnica',
    email: 'ana.tecnica@bethelsas.com',
    role: 'tecnician',
    phone: '+57 300 456 7890',
    createdAt: new Date('2024-02-15'),
    isActive: true
  },
  {
    id: '5',
    name: 'Cliente Demo',
    email: 'cliente@empresa.com',
    role: 'client',
    phone: '+57 300 567 8901',
    createdAt: new Date('2024-03-01'),
    isActive: true
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('bethel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple demo authentication
    const foundUser = DEMO_USERS.find(u => u.email === email && u.isActive);
    
    if (foundUser && password === 'bethel2024') {
      setUser(foundUser);
      localStorage.setItem('bethel_user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bethel_user');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasRoles = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasRoles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { DEMO_USERS };