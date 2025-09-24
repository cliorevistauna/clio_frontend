import { useState, useEffect, useCallback } from 'react';
import { User, Role } from '../../auth/types';
import { userManagementService, UserUpdateStatusPayload, UserUpdateRolePayload } from '../services';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const usersData = await userManagementService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      setError(null);
      const rolesData = await userManagementService.getAllRoles();
      // Asegurar que rolesData sea un array
      if (Array.isArray(rolesData)) {
        setRoles(rolesData);
      } else {
        console.error('Roles data is not an array:', rolesData);
        setRoles([]);
        setError('Formato de roles inválido recibido del servidor');
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]); // Asegurar que roles sea siempre un array
      setError(error instanceof Error ? error.message : 'Error al cargar roles');
    }
  }, []);

  const updateUserStatus = useCallback(async (userId: number, newStatus: UserUpdateStatusPayload) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedUser = await userManagementService.updateUserStatus(userId, newStatus);

      // Actualizar el usuario en la lista local
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, estado: updatedUser.estado } : user
        )
      );

      return updatedUser;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar estado');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateUserRole = useCallback(async (userId: number, newRole: UserUpdateRolePayload) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedUser = await userManagementService.updateUserRole(userId, newRole);

      // Actualizar el usuario en la lista local
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, rol: updatedUser.rol, rol_info: updatedUser.rol_info } : user
        )
      );

      return updatedUser;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar rol');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadUsers, loadRoles]);

  return {
    users,
    roles,
    isLoading,
    isUpdating,
    error,
    loadUsers,
    loadRoles,
    updateUserStatus,
    updateUserRole,
    clearError: () => setError(null)
  };
};