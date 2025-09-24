import React, { useState } from "react";
import logo from "../../images/pageHeaderLogoImage_en_US.png";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import { useEditorialNumbers } from "../../features/editorial-numbers/hooks";
import { ROUTES } from "../constants";
import { getUserRoleName } from "../utils";
import "./PageHeader.css";

interface PageHeaderProps {
  onLogout?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { currentEditorialNumber } = useEditorialNumbers();
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [showAdminSubmenu, setShowAdminSubmenu] = useState(false);

  // RF-002: Menú dinámico basado en el rol del usuario
  const getMenuByRole = (roleName: string): string[] => {
    switch (roleName.toUpperCase()) {
      case "ADMINISTRADOR":
        return [
          "Gestión Administrativa",
          "Autores y Evaluadores",
          "Líneas Temáticas",
          "Artículos",
          "Reportes",
        ];
      case "EDITOR":
        return ["Autores y Evaluadores", "Artículos", "Reportes"];
      case "ASISTENTE":
        return ["Reportes"];
      default:
        return [];
    }
  };

  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
  };

  if (!user) return null;

  const roleName = getUserRoleName(user);

  return (
    <header className="page-header">
      <div className="user-section">
        {/* RF-002: Mostrar nombre y rol del usuario */}
        <span>{user.nombre} ({roleName || 'Sin rol'})</span> |{" "}
        <Link to={ROUTES.PROFILE}>Ver mi perfil</Link>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar sesión
        </button>
      </div>

      <div className="main-row">
        <img src={logo} alt="Logo" />
        <nav>
          {/* RF-002: Menú dinámico según permisos del rol */}
          {roleName && getMenuByRole(roleName).map((item, index) =>
            item === "Artículos" ? (
              <div
                key={index}
                className="nav-link submenu-container"
                onMouseEnter={() => setShowSubmenu(true)}
                onMouseLeave={() => setShowSubmenu(false)}
                tabIndex={0}
              >
                Artículos
                {showSubmenu && (
                  <div className="submenu">
                    <Link to={ROUTES.CREATE_ARTICLE} className="submenu-link">
                      Crear Artículo
                    </Link>
                    <Link to={ROUTES.ARTICLES} className="submenu-link">
                      Lista de Artículos
                    </Link>
                  </div>
                )}
              </div>
            ) : item === "Gestión Administrativa" ? (
              <div
                key={index}
                className="nav-link submenu-container"
                onMouseEnter={() => setShowAdminSubmenu(true)}
                onMouseLeave={() => setShowAdminSubmenu(false)}
                tabIndex={0}
              >
                Gestión Administrativa
                {showAdminSubmenu && (
                  <div className="submenu">
                    <Link to={ROUTES.MANAGE_USERS} className="submenu-link">
                      Gestionar Usuarios
                    </Link>
                    <Link to={ROUTES.CREATE_EDITORIAL_NUMBER} className="submenu-link">
                      Registrar Número de Publicación
                    </Link>
                  </div>
                )}
              </div>
            ) : item === "Autores y Evaluadores" ? (
              <Link key={index} to={ROUTES.CREATE_RESEARCHER} className="nav-link">
                {item}
              </Link>
            ) : (
              <Link key={index} to={ROUTES.BUILD} className="nav-link">
                {item}
              </Link>
            )
          )}
          {/* RF-002: Mensaje cuando no hay acceso */}
          {(!roleName || getMenuByRole(roleName).length === 0) && (
            <span style={{color: '#dc3545', fontSize: '14px'}}>
              No tiene acceso a esta sección.
            </span>
          )}
        </nav>
        <div className="editorial-number">
          Número de Publicación: {currentEditorialNumber?.number || 'N/A'}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
