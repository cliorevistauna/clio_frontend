import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../shared/components/PageHeader";
import { AppLayout } from "../shared/components/layout";
import { useAuth } from "../features/auth/hooks";
import { ROUTES } from "../shared/constants";
import { getUserRoleName, userHasRole } from "../shared/utils";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error during logout:', error);
      // Navegamos al login de todas formas en caso de error
      navigate(ROUTES.LOGIN);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Cargando...</div>;
  }

  const roleName = getUserRoleName(user);

  return (
    <AppLayout>
      <PageHeader onLogout={handleLogout} />

      <main style={{ padding: '20px' }}>
        {/* RF-002: Visualización del nombre y rol del usuario */}
        <h1>Bienvenido al sistema, {user.nombre}</h1>
        <p>Rol: <strong>{roleName || 'No asignado'}</strong></p>
        <p>Estado de la cuenta: <strong>{user.estado}</strong></p>

        <div style={{ marginTop: '20px' }}>
          <h3>Acciones disponibles según su rol:</h3>
          <ul>
            {userHasRole(user, 'ADMINISTRADOR') && (
              <>
                <li>Gestión de usuarios y roles</li>
                <li>Gestión de números editoriales</li>
                <li>Gestión de autores y evaluadores</li>
                <li>Gestión de líneas temáticas</li>
                <li>Gestión de artículos</li>
                <li>Generación de reportes</li>
              </>
            )}
            {userHasRole(user, 'EDITOR') && (
              <>
                <li>Gestión de autores y evaluadores</li>
                <li>Gestión de artículos</li>
                <li>Generación de reportes</li>
              </>
            )}
            {userHasRole(user, 'ASISTENTE') && (
              <>
                <li>Generación de reportes</li>
              </>
            )}
            {!roleName && (
              <li style={{color: '#dc3545'}}>Rol no asignado. Contacte al administrador.</li>
            )}
            {roleName && !['ADMINISTRADOR', 'EDITOR', 'ASISTENTE'].includes(roleName.toUpperCase()) && (
              <li style={{color: '#dc3545'}}>No tiene acceso a esta sección.</li>
            )}
          </ul>
        </div>
      </main>
    </AppLayout>
  );
};

export default Home;