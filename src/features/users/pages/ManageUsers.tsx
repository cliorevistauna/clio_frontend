import React, { useState } from "react";
import styled from "styled-components";
import { HeaderWithToggle } from "../../../shared/components/HeaderWithToggle";
import { AppLayout } from "../../../shared/components/layout";
import { Button } from "../../../shared/components/ui";
import { useAuth } from "../../auth/hooks";
import { useUserManagement } from "../hooks";
import { User } from "../../auth/types";
import { getUserRoleName } from "../../../shared/utils";

const Container = styled.div`
  padding: 20px;
`;

const Alert = styled.div<{ variant?: 'error' | 'success' | 'warning' }>`
  color: var(--color-white);
  background: ${props => {
    switch (props.variant) {
      case 'success': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      default: return 'var(--color-error)';
    }
  }};
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: var(--color-white);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }

  th {
    background-color: var(--color-primary);
    color: var(--color-white);
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: var(--color-background-light);
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;

  ${props => {
    switch (props.status) {
      case 'habilitado':
        return 'background-color: #d4edda; color: #155724;';
      case 'deshabilitado':
        return 'background-color: #f8d7da; color: #721c24;';
      case 'pendiente':
        return 'background-color: #fff3cd; color: #856404;';
      default:
        return 'background-color: #f8f9fa; color: #495057;';
    }
  }}
`;

const ActionButton = styled(Button)<{ variant?: 'enable' | 'disable' | 'role' }>`
  padding: 6px 12px;
  font-size: 12px;
  margin-right: 8px;

  ${props => {
    switch (props.variant) {
      case 'enable':
        return 'background-color: #28a745; border-color: #28a745;';
      case 'disable':
        return 'background-color: #dc3545; border-color: #dc3545;';
      case 'role':
        return 'background-color: #ffc107; border-color: #ffc107; color: #000;';
      default:
        return '';
    }
  }}

  &:hover {
    ${props => {
      switch (props.variant) {
        case 'enable':
          return 'background-color: #218838; border-color: #218838;';
        case 'disable':
          return 'background-color: #c82333; border-color: #c82333;';
        case 'role':
          return 'background-color: #e0a800; border-color: #e0a800;';
        default:
          return '';
      }
    }}
  }
`;

const Select = styled.select`
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  margin-right: 8px;
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: var(--color-white);
  padding: 20px;
  border-radius: var(--border-radius-md);
  max-width: 400px;
  width: 90%;
  text-align: center;

  h3 {
    margin-bottom: 15px;
    color: var(--color-primary);
  }

  p {
    margin-bottom: 20px;
    color: var(--color-text-light);
  }
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const DialogButton = styled(Button)<{ variant?: 'primary' | 'secondary' | 'danger' | 'warning' }>`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;

  ${props => {
    switch (props.variant) {
      case 'danger':
        return 'background-color: #dc3545; border-color: #dc3545;';
      case 'warning':
        return 'background-color: #ffc107; border-color: #ffc107; color: #000;';
      case 'secondary':
        return 'background-color: #6c757d; border-color: #6c757d;';
      default:
        return '';
    }
  }}

  &:hover:not(:disabled) {
    ${props => {
      switch (props.variant) {
        case 'danger':
          return 'background-color: #c82333; border-color: #c82333;';
        case 'warning':
          return 'background-color: #e0a800; border-color: #e0a800;';
        case 'secondary':
          return 'background-color: #5a6268; border-color: #5a6268;';
        default:
          return '';
      }
    }}
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
`;

const FilterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  gap: 20px;
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: var(--color-text-light);
`;

const PageButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  background: ${props => props.active ? 'var(--color-primary)' : 'var(--color-white)'};
  color: ${props => props.active ? 'var(--color-white)' : 'var(--color-text)'};
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--color-primary)' : 'var(--color-background-light)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PerPageSelect = styled.select`
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  cursor: pointer;
`;

interface ConfirmationData {
  type: 'status' | 'role';
  userId: number;
  userName: string;
  newValue: string;
  newValueId?: number;
}

const ManageUsers: React.FC = () => {
  const { logout } = useAuth();
  const { users, roles, isLoading, isUpdating, error, updateUserStatus, updateUserRole } = useUserManagement();

  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showDisabled, setShowDisabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleLogout = async () => {
    await logout();
  };

  const handleStatusChange = (userId: number, userName: string, newStatus: string) => {
    setConfirmation({
      type: 'status',
      userId,
      userName,
      newValue: newStatus
    });
  };

  const handleRoleChange = (userId: number, userName: string, newRoleId: number) => {
    const role = roles.find(r => r.id === newRoleId);
    if (role) {
      setConfirmation({
        type: 'role',
        userId,
        userName,
        newValue: role.nombre,
        newValueId: newRoleId
      });
    }
  };

  const executeConfirmation = async () => {
    if (!confirmation) return;

    try {
      if (confirmation.type === 'status') {
        await updateUserStatus(confirmation.userId, { estado: confirmation.newValue as any });
        setSuccessMessage('Estado del usuario actualizado exitosamente.');
      } else {
        await updateUserRole(confirmation.userId, { rol: confirmation.newValueId! });
        setSuccessMessage('Rol del usuario actualizado exitosamente.');
      }
    } catch (error) {
      // Error ya manejado por el hook
    }

    setConfirmation(null);

    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getRoleDisplayName = (user: User): string => {
    return user.rol_info?.nombre || getUserRoleName(user) || 'Sin rol';
  };

  const getStatusDisplayText = (status: string): string => {
    switch (status) {
      case 'habilitado': return 'Habilitado';
      case 'deshabilitado': return 'Deshabilitado';
      case 'pendiente': return 'Pendiente';
      default: return status;
    }
  };

  // Filtrar usuarios según el checkbox de "Mostrar deshabilitados"
  const filteredUsers = showDisabled
    ? users
    : users.filter(user => user.estado !== 'deshabilitado');

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia el filtro o items por página
  const handleShowDisabledChange = (checked: boolean) => {
    setShowDisabled(checked);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <HeaderWithToggle onLogout={handleLogout} />
        <Container>
          <h1>Gestionar Usuarios</h1>
          <p>Cargando usuarios...</p>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <HeaderWithToggle onLogout={handleLogout} />
      <Container>
        <h1>Usuarios del Sistema</h1>

        {/* Mostrar mensajes */}
        {error && <Alert variant="error">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {/* Filtros y controles */}
        <FilterSection>
          <FilterLeft>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={showDisabled}
                onChange={(e) => handleShowDisabledChange(e.target.checked)}
              />
              Mostrar usuarios deshabilitados
            </CheckboxLabel>
          </FilterLeft>
          <FilterLeft>
            <span style={{ fontSize: '14px' }}>Mostrar:</span>
            <PerPageSelect
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </PerPageSelect>
            <span style={{ fontSize: '14px' }}>por página</span>
          </FilterLeft>
        </FilterSection>

        {/* Tabla de usuarios */}
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Rol Actual</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.nombre}</td>
                <td>{user.correo}</td>
                <td>
                  <StatusBadge status={user.estado}>
                    {getStatusDisplayText(user.estado)}
                  </StatusBadge>
                </td>
                <td>{getRoleDisplayName(user)}</td>
                <td>{new Date(user.date_joined).toLocaleDateString('es-CR')}</td>
                <td>
                  {/* RF-005: Botones de Habilitar/Deshabilitar */}
                  {user.estado === 'habilitado' ? (
                    <ActionButton
                      variant="disable"
                      onClick={() => handleStatusChange(user.id, user.nombre, 'deshabilitado')}
                      disabled={isUpdating}
                    >
                      Deshabilitar
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="enable"
                      onClick={() => handleStatusChange(user.id, user.nombre, 'habilitado')}
                      disabled={isUpdating}
                    >
                      Habilitar
                    </ActionButton>
                  )}

                  {/* RF-006: Cambio de Rol */}
                  <Select
                    value={typeof user.rol === 'object' ? user.rol.id : user.rol}
                    onChange={(e) => handleRoleChange(user.id, user.nombre, parseInt(e.target.value))}
                    disabled={isUpdating}
                  >
                    {Array.isArray(roles) && roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.nombre}
                      </option>
                    ))}
                    {(!Array.isArray(roles) || roles.length === 0) && (
                      <option value="">Sin roles disponibles</option>
                    )}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {filteredUsers.length === 0 && (
          <Alert variant="warning">
            {showDisabled
              ? "No se encontraron usuarios en el sistema."
              : "No se encontraron usuarios habilitados o pendientes."}
          </Alert>
        )}

        {/* Controles de paginación */}
        {filteredUsers.length > 0 && (
          <PaginationControls>
            <PageInfo>
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
            </PageInfo>
            <PageButtons>
              <PageButton
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                Primera
              </PageButton>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </PageButton>

              {/* Mostrar números de página */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Mostrar siempre primera y última página
                  if (page === 1 || page === totalPages) return true;
                  // Mostrar páginas cerca de la actual
                  return Math.abs(page - currentPage) <= 2;
                })
                .map((page, index, array) => {
                  // Agregar "..." si hay saltos
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span style={{ padding: '8px' }}>...</span>}
                      <PageButton
                        active={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PageButton>
                    </React.Fragment>
                  );
                })}

              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </PageButton>
              <PageButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Última
              </PageButton>
            </PageButtons>
          </PaginationControls>
        )}
      </Container>

      {/* Diálogo de Confirmación */}
      {confirmation && (
        <ConfirmDialog>
          <DialogContent>
            <h3>Confirmar Acción</h3>
            <p>
              {confirmation.type === 'status'
                ? `¿Está seguro de cambiar el estado de "${confirmation.userName}" a "${confirmation.newValue}"?`
                : `¿Está seguro de cambiar el rol de "${confirmation.userName}" a "${confirmation.newValue}"?`
              }
            </p>
            <DialogButtons>
              <DialogButton
                variant="secondary"
                onClick={() => setConfirmation(null)}
                disabled={isUpdating}
              >
                Cancelar
              </DialogButton>
              <DialogButton
                variant={confirmation.type === 'status' ? 'danger' : 'warning'}
                onClick={executeConfirmation}
                disabled={isUpdating}
              >
                {isUpdating ? 'Procesando...' : 'Confirmar'}
              </DialogButton>
            </DialogButtons>
          </DialogContent>
        </ConfirmDialog>
      )}
    </AppLayout>
  );
};

export default ManageUsers;