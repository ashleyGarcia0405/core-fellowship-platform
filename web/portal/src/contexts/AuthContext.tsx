import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getAuthToken } from '../lib/api';
import type { LoginResponse, RegisterRequest, RegisterResponse, UserType, UserRole } from '../lib/api';

interface User {
  userId: string;
  email: string;
  userType: UserType;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const token = getAuthToken();
    if (token) {
      // Parse JWT to get user info (simple base64 decode of payload)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          userId: payload.sub,
          email: payload.email,
          userType: payload.userType,
          role: payload.role,
        });
      } catch (error) {
        console.error('Failed to parse token:', error);
        apiLogout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiLogin(email, password);
    setUser({
      userId: response.userId,
      email: response.email,
      userType: response.userType,
      role: response.role,
    });
    return response;
  };

  const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiRegister(data);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}