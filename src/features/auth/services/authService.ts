import { apiClient } from '../../../shared/services/api';
import { User, LoginCredentials, LoginResponse } from '../types';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Credenciales incorrectas');
      }
      throw new Error('Error al iniciar sesión');
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.user;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await apiClient.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        console.warn('Error al cerrar sesión en el servidor:', error);
      }
    }
    return Promise.resolve();
  }

  async register(userData: Partial<User>): Promise<User> {
    return apiClient.post<User>('/users', userData);
  }

  async resetPassword(email: string): Promise<void> {
    return Promise.resolve();
  }
}

export const authService = new AuthService();