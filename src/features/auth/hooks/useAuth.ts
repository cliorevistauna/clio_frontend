import { useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, AuthState } from '../types';
import { authService } from '../services';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (token) {
          try {
            const user = await authService.getCurrentUser(token);
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.login(credentials);

      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      return response;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();

      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  const register = useCallback(async (userData: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const user = await authService.register(userData);

      setAuthState(prev => ({ ...prev, isLoading: false }));

      return user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    register,
    resetPassword,
  };
};