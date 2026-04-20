import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getAuthToken, isTokenExpired, setOnAuthExpired } from '../lib/api';
import type { LoginResponse, RegisterRequest, RegisterResponse, UserType, UserRole } from '../lib/api';

interface User {
  userId: string;
  email: string;
  userType: UserType;
  role: UserRole;
  fullName?: string;
  companyName?: string;
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

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  useEffect(() => {
    // Register callback for API 401 responses
    setOnAuthExpired(logout);
  }, [logout]);

  useEffect(() => {
    // Check if user is already logged in on mount
    const token = getAuthToken();
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;

    if (token) {
      if (isTokenExpired(token)) {
        apiLogout();
      } else {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            userId: payload.sub,
            email: payload.email,
            userType: payload.userType,
            role: payload.role,
            fullName: payload.fullName,
            companyName: payload.companyName,
          });

          // Schedule automatic logout at exact token expiry time
          if (payload.exp) {
            const msUntilExpiry = payload.exp * 1000 - Date.now();
            if (msUntilExpiry > 0) {
              expiryTimer = setTimeout(() => logout(), msUntilExpiry);
            }
          }
        } catch (error) {
          console.error('Failed to parse token:', error);
          apiLogout();
        }
      }
    }

    setLoading(false);
    return () => { if (expiryTimer) clearTimeout(expiryTimer); };
  }, [logout]);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiLogin(email, password);
    // Decode JWT to get all user info including fullName and companyName
    try {
      const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
      setUser({
        userId: response.userId,
        email: response.email,
        userType: response.userType,
        role: response.role,
        fullName: payload.fullName,
        companyName: payload.companyName,
      });

      // Schedule automatic logout when this token expires
      if (payload.exp) {
        const msUntilExpiry = payload.exp * 1000 - Date.now();
        if (msUntilExpiry > 0) {
          setTimeout(() => logout(), msUntilExpiry);
        }
      }
    } catch (error) {
      // Fallback if JWT decode fails
      setUser({
        userId: response.userId,
        email: response.email,
        userType: response.userType,
        role: response.role,
      });
    }
    return response;
  };

  const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiRegister(data);
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