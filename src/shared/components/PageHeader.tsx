import React, { useState } from "react";
import logo from "../../images/pageHeaderLogoImage_en_US.png";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import { useEditorialNumbers } from "../../features/editorial-numbers/hooks";
import { UserRole } from "../../features/auth/types";
import { ROUTES } from "../constants";
import "./PageHeader.css";

interface PageHeaderProps {
  onLogout?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { currentEditorialNumber } = useEditorialNumbers();
  const [showSubmenu, setShowSubmenu] = useState(false);

  const menuByRole: Record<UserRole, string[]> = {
    Administrador: [
      "Gestión Administrativa",
      "Autores y Evaluadores",
      "Artículos",
      "Reportes",
    ],
    Editor: ["Autores y Evaluadores", "Artículos", "Reportes"],
    Asistente: [],
  };

  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
  };

  if (!user) return null;

  return (
    <header className="page-header">
      <div className="user-section">
        <span>{user.username}</span> |{" "}
        <Link to={ROUTES.PROFILE}>Ver mi perfil</Link>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar sesión
        </button>
      </div>

      <div className="main-row">
        <img src={logo} alt="Logo" />
        <nav>
          {menuByRole[user.role].map((item, index) =>
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
        </nav>
        <div className="editorial-number">
          Número Editorial: {currentEditorialNumber?.number || 'N/A'}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
