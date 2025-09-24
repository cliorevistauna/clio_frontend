import { apiClient } from '../../../shared/services/api';
import { User, LoginCredentials, LoginResponse } from '../types';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login/', {
        email: credentials.email,
        password: credentials.password
      });
      return response;
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Credenciales incorrectas. Intente nuevamente.');
      }
      if (error.status === 403) {
        throw new Error('Su cuenta ha sido deshabilitada. Contacte al administrador.');
      }
      if (error.details?.non_field_errors) {
        throw new Error(error.details.non_field_errors[0]);
      }
      throw new Error('Error al iniciar sesión');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/user/');
      return response;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout/', {
          refresh_token: refreshToken
        });
      } catch (error) {
        console.warn('Error al cerrar sesión en el servidor:', error);
      }
    }
    return Promise.resolve();
  }

  async register(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.post<User>('/auth/register/', {
        nombre: userData.nombre,
        correo: userData.correo,
        password: userData.password,
        password_confirm: userData.password_confirm
      });
      return response;
    } catch (error: any) {
      if (error.details?.correo) {
        throw new Error('Este correo ya está registrado.');
      }
      if (error.details?.password) {
        throw new Error('La contraseña no cumple con los requisitos de seguridad.');
      }
      if (error.details?.nombre) {
        throw new Error('El nombre es obligatorio.');
      }
      if (error.details?.non_field_errors) {
        throw new Error(error.details.non_field_errors[0]);
      }
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password/', { email });
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('No se encontró un usuario con ese correo electrónico.');
      }
      throw new Error('Error al enviar el correo de recuperación');
    }
  }

  async confirmPasswordReset(data: {
    uidb64: string;
    token: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    try {
      await apiClient.post(`/auth/reset-password/${data.uidb64}/${data.token}/`, {
        new_password: data.new_password,
        confirm_password: data.confirm_password
      });
    } catch (error: any) {
      if (error.status === 400) {
        if (error.details?.error && error.details.error.includes('Token')) {
          throw new Error('Token de recuperación inválido o expirado.');
        }
        if (error.details?.new_password) {
          throw new Error('La contraseña no cumple con los requisitos de seguridad.');
        }
        if (error.details?.non_field_errors) {
          throw new Error(error.details.non_field_errors[0]);
        }
        // Si hay un error general del backend
        if (error.details?.error) {
          throw new Error(error.details.error);
        }
      }
      throw new Error('Error al restablecer la contraseña');
    }
  }

  async changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<void> {
    try {
      await apiClient.put('/auth/change-password/', {
        old_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.new_password
      });
    } catch (error: any) {
      // Re-lanzar el error completo para que el componente pueda manejar los detalles
      throw error;
    }
  }
}

export const authService = new AuthService();