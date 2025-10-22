import React from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from './PageHeader';
import { ViewToggle } from './ViewToggle';
import { ROUTES } from '../constants';

interface HeaderWithToggleProps {
  onLogout?: () => void;
}

// Rutas que NO deben mostrar el toggle de vista
const EXCLUDED_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.RECOVER_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.REGISTER,
  ROUTES.MANAGE_USERS,
  ROUTES.PROFILE,
];

export const HeaderWithToggle: React.FC<HeaderWithToggleProps> = ({ onLogout }) => {
  const location = useLocation();

  // Verificar si la ruta actual está en las exclusiones
  // Nota: RESET_PASSWORD contiene parámetros (:uidb64/:token), así que verificamos si comienza con el patrón base
  const shouldShowToggle = !EXCLUDED_ROUTES.some(route => {
    if (route.includes(':')) {
      // Para rutas con parámetros, verificamos el inicio de la ruta
      const baseRoute = route.split(':')[0];
      return location.pathname.startsWith(baseRoute);
    }
    return location.pathname === route;
  });

  return (
    <>
      <PageHeader onLogout={onLogout} />
      {shouldShowToggle && <ViewToggle />}
    </>
  );
};
