import React, { useState } from "react";
import styled from "styled-components";
import PageHeader from "../../../shared/components/PageHeader";
import { AppLayout } from "../../../shared/components/layout";
import { Button } from "../../../shared/components/ui";
import { useAuth } from "../../auth/hooks";
import { useUserManagement } from "../hooks";
import { User, Role } from "../../auth/types";
import { getUserRoleName } from "../../../shared/utils";

const Container = styled.div`
  padding: 20px;
`;

const Alert = styled.div<{ variant?: 'error' | 'success' | 'warning' }>`
  color: #fff;
  background: ${props => {
    switch (props.variant) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      default: return '#dc3545';
    }
  }};
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #034991;
    color: white;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f5f5f5;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
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
  border: 1px solid #ddd;
  border-radius: 4px;
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
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;

  h3 {
    margin-bottom: 15px;
    color: #034991;
  }

  p {
    margin-bottom: 20px;
    color: #666;
  }
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

interface ConfirmationData {
  type: 'status' | 'role';
  userId: number;
  userName: string;
  newValue: string;
  newValueId?: number;
}

const ManageUsers: React.FC = () => {
  const { user: currentUser, logout } = useAuth();
  const { users, roles, isLoading, isUpdating, error, updateUserStatus, updateUserRole, clearError } = useUserManagement();

  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");

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

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader onLogout={handleLogout} />
        <Container>
          <h1>Gestionar Usuarios</h1>
          <p>Cargando usuarios...</p>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader onLogout={handleLogout} />
      <Container>
        <h1>Gestionar Usuarios</h1>
        <p>RF-005 y RF-006: Habilitación/Deshabilitación y Gestión de Roles de Usuarios</p>

        {/* Mostrar mensajes */}
        {error && <Alert variant="error">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {/* Debug info - temporal */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ background: '#f8f9fa', padding: '10px', marginBottom: '10px', fontSize: '12px' }}>
            <strong>Debug Info:</strong> Usuarios: {users.length}, Roles: {Array.isArray(roles) ? roles.length : 'No es array'}
            {!Array.isArray(roles) && <span> - Tipo: {typeof roles}</span>}
          </div>
        )}

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
            {users.map(user => (
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

        {users.length === 0 && (
          <Alert variant="warning">No se encontraron usuarios en el sistema.</Alert>
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
              <Button onClick={() => setConfirmation(null)}>
                Cancelar
              </Button>
              <ActionButton
                variant={confirmation.type === 'status' ? 'disable' : 'role'}
                onClick={executeConfirmation}
                loading={isUpdating}
              >
                Confirmar
              </ActionButton>
            </DialogButtons>
          </DialogContent>
        </ConfirmDialog>
      )}
    </AppLayout>
  );
};

export default ManageUsers;