"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Defines the structure of our authenticated User
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Exposes user data and login/logout methods
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

// Custom hook for easier consumption in any Next.js component
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from localStorage on application mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Securely store the JWT token natively and save user state
  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Natively clear the user session and token, and optionally tell the backend
  const logout = async () => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('token')) {
        // We must import api at the top, wait, we don't have api here yet.
        await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }
    } catch {
      // Best-effort logout trigger
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
