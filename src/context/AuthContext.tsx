import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, UserRole } from '../types/hrm';
import { api } from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => void;
  quickLoginAs: (role: UserRole) => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session
    try {
      const stored = localStorage.getItem('nusantara_hris_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed restoring session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    setUser(res.session);
    localStorage.setItem('nusantara_hris_session', JSON.stringify(res.session));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nusantara_hris_session');
  };

  const quickLoginAs = async (role: UserRole) => {
    let identifier = 'hr.admin@nusantara.co.id';
    if (role === 'manager') identifier = 'budi.santoso@nusantara.co.id';
    if (role === 'employee') identifier = 'siti.aminah@nusantara.co.id';

    await login(identifier, 'Password123!');
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        quickLoginAs,
        isAdmin,
        isManager,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
