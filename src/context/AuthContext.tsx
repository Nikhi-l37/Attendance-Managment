
import React, { createContext, useState, useEffect } from 'react';
import { Role, type AppUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, role: Role) => Promise<void>;
  signup: (name: string, email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: Role) => {
    setLoading(true);
    try {
      const loggedInUser = await api.login(email, role);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
      } else {
          throw new Error("Invalid credentials or role.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const signup = async (name: string, email: string) => {
    setLoading(true);
    try {
      const newUser = await api.adminSignup(name, email);
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
