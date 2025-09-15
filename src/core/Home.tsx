import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../shared/components/PageHeader";
import { AppLayout } from "../shared/components/layout";
import { useAuth } from "../features/auth/hooks";
import { ROUTES } from "../shared/constants";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = () => {
    navigate(ROUTES.LOGIN);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Cargando...</div>;
  }

  return (
    <AppLayout>
      <PageHeader onLogout={handleLogout} />

      <main style={{ padding: '20px' }}>
        <h1>Bienvenido al sistema, {user.profile?.firstName || user.username}</h1>
        <p>Aquí podrás gestionar los módulos según tu rol de {user.role}.</p>

        <div style={{ marginTop: '20px' }}>
          <h3>Acciones disponibles:</h3>
          <ul>
            {user.role === 'Administrador' && (
              <>
                <li>Gestión de usuarios</li>
                <li>Configuración del sistema</li>
              </>
            )}
            {(user.role === 'Administrador' || user.role === 'Editor') && (
              <>
                <li>Gestión de autores y evaluadores</li>
                <li>Gestión de artículos</li>
                <li>Generación de reportes</li>
              </>
            )}
          </ul>
        </div>
      </main>
    </AppLayout>
  );
};

export default Home;