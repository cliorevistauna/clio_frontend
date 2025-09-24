import React, { useState } from 'react';
import { useAuth } from '../hooks';
import { authService } from '../services';
import { getUserRoleName } from '../../../shared/utils';
import PageHeader from '../../../shared/components/PageHeader';
import './Profile.css';

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
    <div className="profile-container">
      <PageHeader />
      <div className="profile-content">
        <h1>Mi Perfil</h1>

        {/* Datos básicos del usuario */}
        <div className="profile-info">
          <div className="info-row">
            <label>Nombre Completo:</label>
            <span>{user.nombre}</span>
          </div>

          <div className="info-row">
            <label>Rol:</label>
            <span>{getUserRoleName(user) || 'Sin rol asignado'}</span>
          </div>

          <div className="info-row">
            <label>Fecha de Registro:</label>
            <span>{formatDate(user.date_joined)}</span>
          </div>

          <div className="info-row">
            <label>Correo Electrónico:</label>
            <span>{user.email || user.correo}</span>
          </div>
        </div>

        {/* Sección de cambio de contraseña */}
        <div className="password-section">
          <h2>Cambiar Contraseña</h2>

          {!showPasswordForm ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowPasswordForm(true)}
            >
              Cambiar Contraseña
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="current_password">Contraseña Actual:</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handleInputChange}
                  className={errors.current_password ? 'error' : ''}
                />
                {errors.current_password && (
                  <span className="error-message">{errors.current_password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="new_password">Nueva Contraseña:</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handleInputChange}
                  className={errors.new_password ? 'error' : ''}
                />
                <small className="form-text">
                  Mínimo 8 caracteres, incluir letras y números
                </small>
                {errors.new_password && (
                  <span className="error-message">{errors.new_password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirmación de Contraseña:</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handleInputChange}
                  className={errors.confirm_password ? 'error' : ''}
                />
                {errors.confirm_password && (
                  <span className="error-message">{errors.confirm_password}</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
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
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal de confirmación */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmar Cambio de Contraseña</h3>
              <p>¿Está seguro de que desea cambiar su contraseña?</p>
              <div className="modal-actions">
                <button
                  className="btn btn-success"
                  onClick={handleConfirmChange}
                  disabled={loading}
                >
                  Sí, cambiar
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
            <button
              className="alert-close"
              onClick={() => setMessage(null)}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;