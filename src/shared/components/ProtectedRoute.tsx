import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';
import { ROUTES } from '../constants';
import { getUserRoleName } from '../utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuthentication?: boolean;
}

/**
 * Componente para proteger rutas según RF-002
 * Verifica autenticación y permisos de rol
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuthentication = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // RF-002: Verificar autenticación
  if (requireAuthentication && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // RF-002: Verificar permisos de rol si se especifican
  if (allowedRoles && user && allowedRoles.length > 0) {
    const roleName = getUserRoleName(user);
    const hasPermission = roleName && allowedRoles.includes(roleName.toUpperCase());

    if (!hasPermission) {
      // RF-002: Mostrar mensaje "No tiene acceso a esta sección"
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#dc3545',
          fontSize: '18px'
        }}>
          No tiene acceso a esta sección.
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;