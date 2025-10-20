import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks';
import { authService } from '../services';
import { getUserRoleName } from '../../../shared/utils';
import { HeaderWithToggle } from '../../../shared/components/HeaderWithToggle';
import { AppLayout } from '../../../shared/components/layout';
import { Button } from '../../../shared/components/ui';

const Container = styled.div`
  padding: 20px;
`;

const InfoCard = styled.div`
  background: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: 30px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 15px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: bold;
  width: 200px;
  color: var(--color-primary);
  font-family: "Frutiger", Arial, sans-serif;
`;

const InfoValue = styled.span`
  color: var(--color-text);
  flex: 1;
`;

const PasswordForm = styled.form`
  background: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: 30px;
  box-shadow: var(--shadow-sm);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--color-primary);
  font-family: "Frutiger", Arial, sans-serif;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.hasError ? 'var(--color-error)' : 'var(--color-border)'};
  border-radius: var(--border-radius-md);
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(3, 73, 145, 0.1);
  }
`;

const ErrorMessage = styled.span`
  display: block;
  color: var(--color-error);
  font-size: 14px;
  margin-top: 8px;
`;

const FormText = styled.small`
  display: block;
  margin-top: 5px;
  font-size: 14px;
  color: #6c757d;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 25px;
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
  padding: 30px;
  border-radius: var(--border-radius-md);
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-lg);

  h3 {
    margin-bottom: 20px;
    color: var(--color-primary);
    font-family: "Frutiger", Arial, sans-serif;
  }

  p {
    margin-bottom: 25px;
    color: var(--color-text-light);
    line-height: 1.5;
  }
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const Alert = styled.div<{ variant?: 'error' | 'success' }>`
  color: var(--color-white);
  background: ${props => props.variant === 'success' ? 'var(--color-success)' : 'var(--color-error)'};
  border-radius: var(--border-radius-md);
  padding: 15px;
  margin: 20px 0;
  text-align: center;
  position: relative;
`;

const AlertClose = styled.button`
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: inherit;
  padding: 0;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // RF-007: Validaciones del formulario según el documento
    if (!passwordData.current_password) {
      newErrors.current_password = 'La contraseña actual es obligatoria.';
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'La nueva contraseña es obligatoria.';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'La nueva contraseña no cumple con los requisitos de seguridad.';
    }

    if (!passwordData.confirm_password) {
      newErrors.confirm_password = 'La confirmación de contraseña es obligatoria.';
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden.';
    }

    if (passwordData.current_password === passwordData.new_password) {
      newErrors.new_password = 'La nueva contraseña no puede ser igual a la anterior.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmChange = async () => {
    setLoading(true);
    setShowConfirmModal(false);

    try {
      await authService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setMessage({
        type: 'success',
        text: 'Contraseña actualizada exitosamente.'
      });

      // Limpiar formulario
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setShowPasswordForm(false);

    } catch (error: any) {
      // Manejar errores del servidor
      if (error.response?.data?.old_password) {
        setMessage({
          type: 'error',
          text: 'La contraseña actual no es correcta.'
        });
      } else if (error.response?.data?.new_password) {
        setMessage({
          type: 'error',
          text: 'La nueva contraseña no cumple con los requisitos de seguridad.'
        });
      } else if (error.response?.data?.non_field_errors) {
        setMessage({
          type: 'error',
          text: error.response.data.non_field_errors[0]
        });
      } else if (error.response?.data?.confirm_password) {
        setMessage({
          type: 'error',
          text: 'Las contraseñas no coinciden.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Error del servidor. Por favor, inténtelo más tarde.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha no disponible';
    }
  };

  if (!user) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <AppLayout>
      <HeaderWithToggle />
      <Container>
        <h1>Mi Perfil</h1>

        {/* Datos básicos del usuario */}
        <InfoCard>
          <h2>Información Personal</h2>
          <InfoRow>
            <InfoLabel>Nombre Completo:</InfoLabel>
            <InfoValue>{user.nombre}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Rol:</InfoLabel>
            <InfoValue>{getUserRoleName(user) || 'Sin rol asignado'}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Fecha de Registro:</InfoLabel>
            <InfoValue>{formatDate(user.date_joined)}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Correo Electrónico:</InfoLabel>
            <InfoValue>{user.email || user.correo}</InfoValue>
          </InfoRow>
        </InfoCard>

        {/* Sección de cambio de contraseña */}
        {!showPasswordForm ? (
          <InfoCard>
            <h2>Cambiar Contraseña</h2>
            <Button onClick={() => setShowPasswordForm(true)}>
              Cambiar Contraseña
            </Button>
          </InfoCard>
        ) : (
          <PasswordForm onSubmit={handleSubmit}>
            <h2>Cambiar Contraseña</h2>

            <FormGroup>
              <Label htmlFor="current_password">Contraseña Actual:</Label>
              <Input
                type="password"
                id="current_password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handleInputChange}
                hasError={!!errors.current_password}
              />
              {errors.current_password && (
                <ErrorMessage>{errors.current_password}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="new_password">Nueva Contraseña:</Label>
              <Input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handleInputChange}
                hasError={!!errors.new_password}
              />
              <FormText>
                Mínimo 8 caracteres, incluir letras y números
              </FormText>
              {errors.new_password && (
                <ErrorMessage>{errors.new_password}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirm_password">Confirmación de Contraseña:</Label>
              <Input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handleInputChange}
                hasError={!!errors.confirm_password}
              />
              {errors.confirm_password && (
                <ErrorMessage>{errors.confirm_password}</ErrorMessage>
              )}
            </FormGroup>

            <ButtonGroup>
              <Button type="submit" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                  });
                  setErrors({});
                }}
              >
                Cancelar
              </Button>
            </ButtonGroup>
          </PasswordForm>
        )}

        {/* Mensajes de estado */}
        {message && (
          <Alert variant={message.type}>
            {message.text}
            <AlertClose onClick={() => setMessage(null)}>
              ×
            </AlertClose>
          </Alert>
        )}
      </Container>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <ConfirmDialog>
          <DialogContent>
            <h3>Confirmar Cambio de Contraseña</h3>
            <p>¿Está seguro de que desea cambiar su contraseña?</p>
            <DialogButtons>
              <Button
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmChange}
                disabled={loading}
              >
                {loading ? 'Cambiando...' : 'Sí, cambiar'}
              </Button>
            </DialogButtons>
          </DialogContent>
        </ConfirmDialog>
      )}
    </AppLayout>
  );
};

export default Profile;