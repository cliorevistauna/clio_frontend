import { apiClient } from '../../../shared/services/api';
import { User, Role } from '../../auth/types';

export interface UserUpdateStatusPayload {
  estado: 'habilitado' | 'deshabilitado' | 'pendiente';
}

export interface UserUpdateRolePayload {
  rol: number; // Role ID
}

export class UserManagementService {
  async getAllUsers(includeDisabled: boolean = true): Promise<User[]> {
    try {
      // CONFIGURACIÓN: Cambiar aquí el parámetro que use el backend
      // Opciones comunes:
      // 1. ?all=true
      // 2. ?include_disabled=true
      // 3. ?estado=all
      // 4. ?is_active=all
      // 5. Sin parámetros (el backend devuelve todos por defecto)

      // Por ahora usar el endpoint sin parámetros
      // El backend deberá devolver TODOS los usuarios por defecto
      let endpoint = '/users/';

      console.log('🔍 Solicitando usuarios con endpoint:', endpoint);
      const response = await apiClient.get<{ results: User[] }>(endpoint);
      console.log('✅ Usuarios recibidos del backend:', response.results?.length || (Array.isArray(response) ? response.length : 0));
      console.log('📦 Estructura de respuesta:', response);

      // Verificar si hay usuarios deshabilitados en la respuesta
      const allUsers = response.results || response;
      if (Array.isArray(allUsers)) {
        const habilitados = allUsers.filter(u => u.estado === 'habilitado').length;
        const deshabilitados = allUsers.filter(u => u.estado === 'deshabilitado').length;
        const pendientes = allUsers.filter(u => u.estado === 'pendiente').length;
        console.log(`📊 Estados: ${habilitados} habilitados, ${deshabilitados} deshabilitados, ${pendientes} pendientes`);
      }
      return response.results || response;
    } catch (error: any) {
      console.error('❌ Error al obtener usuarios:', error);
      throw new Error('Error al obtener la lista de usuarios');
    }
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      const response = await apiClient.get<Role[]>('/roles/');
      // Asegurar que la respuesta sea un array
      if (Array.isArray(response)) {
        return response;
      }
      // Si la respuesta tiene resultados (paginada)
      if (response && typeof response === 'object' && 'results' in response) {
        return (response as any).results || [];
      }
      // Si la respuesta no es un array, devolver array vacío
      return [];
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      throw new Error('Error al obtener la lista de roles');
    }
  }

  async updateUserStatus(userId: number, newStatus: UserUpdateStatusPayload): Promise<User> {
    try {
      const response = await apiClient.put<any>(`/users/${userId}/status/`, newStatus);
      // El backend devuelve { message, user }, extraemos el user
      return response.user || response;
    } catch (error: any) {
      if (error.status === 403) {
        throw new Error('No tiene permisos para realizar esta acción.');
      }
      if (error.status === 404) {
        throw new Error('Usuario no encontrado.');
      }
      if (error.details?.estado) {
        throw new Error('Estado inválido.');
      }
      if (error.details?.error) {
        throw new Error(error.details.error);
      }
      throw new Error('Error al actualizar el estado del usuario');
    }
  }

  async updateUserRole(userId: number, newRole: UserUpdateRolePayload): Promise<User> {
    try {
      const response = await apiClient.put<any>(`/users/${userId}/role/`, newRole);
      // El backend devuelve { message, user }, extraemos el user
      return response.user || response;
    } catch (error: any) {
      if (error.status === 403) {
        throw new Error('No tiene permisos para realizar esta acción.');
      }
      if (error.status === 404) {
        throw new Error('Usuario no encontrado.');
      }
      if (error.details?.rol) {
        throw new Error('Rol inválido.');
      }
      if (error.details?.error) {
        throw new Error(error.details.error);
      }
      throw new Error('Error al actualizar el rol del usuario');
    }
  }
}

export const userManagementService = new UserManagementService();