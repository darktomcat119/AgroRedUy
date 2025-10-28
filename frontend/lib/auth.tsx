/**
 * @fileoverview Authentication context and hooks for AgroRedUy
 * Provides authentication state management and user session handling
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  profileImageUrl?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  interests?: string[];
  newsletter?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  provider?: string;
  providerId?: string;
  providerData?: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<ApiResponse<AuthResponse>>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<ApiResponse<AuthResponse>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Verify token by making a request to get user info
          // For now, we'll just set the token and let the app handle auth
          apiClient.setToken(token);
          
          // In a real app, you might want to verify the token with the backend
          // For now, we'll assume the token is valid if it exists
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            console.log('Retrieved user data from localStorage:', parsedUserData);
            console.log('ProfileImageUrl in localStorage:', parsedUserData.profileImageUrl);
            console.log('User role in localStorage:', parsedUserData.role);
            setUser(parsedUserData);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        apiClient.setToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiClient.login({ email, password });

      if (response.success && response.data) {
        const { user: userData, accessToken } = response.data as AuthResponse;
        console.log('Login response user data:', userData);
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        return {
          success: true,
          data: { user: userData, accessToken }
        };
      } else {
        setError(response.error?.message || 'Login failed');
        return {
          success: false,
          error: response.error
        };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during login';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiClient.register(userData);

      if (response.success && response.data) {
        const { user: newUser, accessToken } = response.data as AuthResponse;
        setUser(newUser);
        localStorage.setItem('userData', JSON.stringify(newUser));
        return {
          success: true,
          data: { user: newUser, accessToken }
        };
      } else {
        setError(response.error?.message || 'Registration failed');
        return {
          success: false,
          error: response.error
        };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during registration';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiClient.setToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.refreshToken(refreshToken);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout the user
      await logout();
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-verdeprimario-100"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Requerido
            </h2>
            <p className="text-gray-600 mb-4">
              Necesitas iniciar sesión para acceder a esta página.
            </p>
            <a
              href="/auth/login"
              className="bg-verdeprimario-100 text-white px-6 py-2 rounded-lg hover:bg-verdeprimario-100/90 transition-colors"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for admin-only access
export function useAdminAuth(): { isAdmin: boolean; isSuperAdmin: boolean } {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPERADMIN',
    isSuperAdmin: user?.role === 'SUPERADMIN'
  };
}
