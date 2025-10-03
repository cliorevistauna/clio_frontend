import React, { useState } from "react";
import logo from "../../images/pageHeaderLogoImage_en_US.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import { useEditorialNumbers } from "../../features/editorial-numbers/hooks";
import { ROUTES } from "../constants";
import { getUserRoleName } from "../utils";
import "./PageHeader.css";

interface PageHeaderProps {
  onLogout?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentEditorialNumber } = useEditorialNumbers();
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [showAdminSubmenu, setShowAdminSubmenu] = useState(false);
  const [showResearcherSubmenu, setShowResearcherSubmenu] = useState(false);
  const [showReportsSubmenu, setShowReportsSubmenu] = useState(false);

  // RF-002: Menú dinámico basado en el rol del usuario
  const getMenuByRole = (roleName: string): string[] => {
    switch (roleName.toUpperCase()) {
      case "ADMINISTRADOR":
        return [
          "Gestión Administrativa",
          "Autores y Evaluadores",
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
    // Redirigir al login y recargar la página
    navigate(ROUTES.LOGIN);
    window.location.reload();
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
                      Registrar
                    </Link>
                    <Link to={ROUTES.MODIFY_ARTICLE} className="submenu-link">
                      Actualizar
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
                    <div className="submenu-divider">Control de Usuarios</div>
                    <Link to={ROUTES.MANAGE_USERS} className="submenu-link">
                      Gestionar
                    </Link>
                    <div className="submenu-divider">Números de Publicación</div>
                    <Link to={ROUTES.CREATE_EDITORIAL_NUMBER} className="submenu-link">
                      Registrar
                    </Link>
                    <Link to={ROUTES.MODIFY_EDITORIAL_NUMBER} className="submenu-link">
                      Modificar
                    </Link>
                    <div className="submenu-divider">Líneas Temáticas</div>
                    <Link to={ROUTES.CREATE_THEMATIC_LINE} className="submenu-link">
                      Registrar
                    </Link>
                    <Link to={ROUTES.MODIFY_THEMATIC_LINE} className="submenu-link">
                      Modificar
                    </Link>
                    <Link to={ROUTES.DEACTIVATE_THEMATIC_LINE} className="submenu-link">
                      Eliminar
                    </Link>
                  </div>
                )}
              </div>
            ) : item === "Autores y Evaluadores" ? (
              <div
                key={index}
                className="nav-link submenu-container"
                onMouseEnter={() => setShowResearcherSubmenu(true)}
                onMouseLeave={() => setShowResearcherSubmenu(false)}
                tabIndex={0}
              >
                Autores y Evaluadores
                {showResearcherSubmenu && (
                  <div className="submenu">
                    <Link to={ROUTES.CREATE_RESEARCHER} className="submenu-link">
                      Registrar
                    </Link>
                    <Link to={ROUTES.MODIFY_RESEARCHER} className="submenu-link">
                      Actualizar
                    </Link>
                  </div>
                )}
              </div>
            ) : item === "Reportes" ? (
              <div
                key={index}
                className="nav-link submenu-container"
                onMouseEnter={() => setShowReportsSubmenu(true)}
                onMouseLeave={() => setShowReportsSubmenu(false)}
                tabIndex={0}
              >
                Reportes
                {showReportsSubmenu && (
                  <div className="submenu">
                    <Link to={ROUTES.EVALUATOR_HISTORY_REPORT} className="submenu-link">
                      Histórico de evaluaciones por evaluador
                    </Link>
                    <Link to={ROUTES.EVALUATORS_BY_THEME_REPORT} className="submenu-link">
                      Estadísticas por línea temática
                    </Link>
                    <Link to={ROUTES.EVALUATOR_WORKLOAD_REPORT} className="submenu-link">
                      Carga de trabajo de evaluadores
                    </Link>
                    <Link to={ROUTES.INVITATIONS_BY_ISSUE_REPORT} className="submenu-link">
                      Invitaciones por número editorial
                    </Link>
                    <Link to={ROUTES.PARTICIPATION_BY_ARTICLE_REPORT} className="submenu-link">
                      Participación por artículo
                    </Link>
                    <Link to={ROUTES.PREVIOUS_PARTICIPATION_REPORT} className="submenu-link">
                      Participación en números anteriores
                    </Link>
                  </div>
                )}
              </div>
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
          Número de Publicación: {currentEditorialNumber ? `${currentEditorialNumber.numero}-${currentEditorialNumber.anio}` : 'N/A'}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
