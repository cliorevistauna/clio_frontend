import { User } from '../../features/auth/types';

/**
 * Safely extracts the role name from a User object
 * Handles both role structures: nested object or ID with separate rol_info
 */
export const getUserRoleName = (user: User | null): string | null => {
  if (!user) return null;

  // If rol is a Role object (from login endpoint)
  if (typeof user.rol === 'object' && user.rol !== null && 'nombre' in user.rol) {
    return user.rol.nombre;
  }

  // If rol is an ID and we have rol_info (from user info endpoint)
  if (typeof user.rol === 'number' && user.rol_info && user.rol_info.nombre) {
    return user.rol_info.nombre;
  }

  return null;
};

/**
 * Safely checks if user has a specific role
 */
export const userHasRole = (user: User | null, roleName: string): boolean => {
  const userRole = getUserRoleName(user);
  return userRole?.toUpperCase() === roleName.toUpperCase();
};

/**
 * Gets a list of valid role names for validation
 */
export const getValidRoles = (): string[] => {
  return ['ADMINISTRADOR', 'EDITOR', 'ASISTENTE'];
};