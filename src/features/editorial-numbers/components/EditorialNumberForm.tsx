import React from "react";
import styled from "styled-components";
import { EditorialNumber } from "../types";
import { DateInput } from "../../../shared/components/ui";
import { Button } from "../../../shared/components/ui";

const styles = {
  cancelButton: {
    backgroundColor: '#6c757d'
  },
  checkboxLabelInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    margin: 0,
    whiteSpace: 'nowrap' as const
  },
  flexButtonContainer: {
    display: 'flex',
    gap: '10px'
  },
  flexDateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  flexDateInputWrapper: {
    flex: 1
  }
};

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

const DialogButton = styled(Button)<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;

  ${props => {
    switch (props.variant) {
      case 'danger':
        return 'background-color: #dc3545; border-color: #dc3545;';
      case 'success':
        return 'background-color: #28a745; border-color: #28a745;';
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
        case 'success':
          return 'background-color: #218838; border-color: #218838;';
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

interface EditorialNumberFormProps {
  selectedEditorial: EditorialNumber | null;
  numero: string;
  anio: string;
  fechaInicio: string;
  fechaFin: string;
  comentarios: string;
  usarHoyInicio: boolean;
  usarHoyFin: boolean;
  isUpdating: boolean;
  isChangingStatus: boolean;
  confirmation: {
    editorialId: number;
    editorialName: string;
    newStatus: 'activo' | 'inactivo';
  } | null;
  onNumeroChange: (value: string) => void;
  onAnioChange: (value: string) => void;
  onFechaInicioChange: (value: string) => void;
  onFechaFinChange: (value: string) => void;
  onComentariosChange: (value: string) => void;
  onUsarHoyInicioChange: (checked: boolean) => void;
  onUsarHoyFinChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onStatusChange: (newStatus: 'activo' | 'inactivo') => void;
  onConfirmationCancel: () => void;
  onConfirmationAccept: () => void;
}

export const EditorialNumberForm: React.FC<EditorialNumberFormProps> = ({
  selectedEditorial,
  numero,
  anio,
  fechaInicio,
  fechaFin,
  comentarios,
  usarHoyInicio,
  usarHoyFin,
  isUpdating,
  isChangingStatus,
  confirmation,
  onNumeroChange,
  onAnioChange,
  onFechaInicioChange,
  onFechaFinChange,
  onComentariosChange,
  onUsarHoyInicioChange,
  onUsarHoyFinChange,
  onSubmit,
  onCancel,
  onStatusChange,
  onConfirmationCancel,
  onConfirmationAccept
}) => {
  return (
    <>
      <div>
        {selectedEditorial && (
          <div className="form-group">
            <label>Estado</label>
            <select
              value={selectedEditorial.estado}
              onChange={(e) => onStatusChange(e.target.value as 'activo' | 'inactivo')}
              disabled={isUpdating || isChangingStatus}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Periodo *</label>
            <input
              type="number"
              value={numero}
              onChange={(e) => onNumeroChange(e.target.value)}
              min="1"
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Año *</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => onAnioChange(e.target.value)}
              min="1990"
              max={new Date().getFullYear() + 10}
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Fecha de Inicio *</label>
            <div style={styles.flexDateContainer}>
              <div style={styles.flexDateInputWrapper}>
                <DateInput
                  value={fechaInicio}
                  onChange={onFechaInicioChange}
                  disabled={isUpdating || usarHoyInicio}
                  required
                />
              </div>
              <label style={styles.checkboxLabelInline}>
                <input
                  type="checkbox"
                  checked={usarHoyInicio}
                  onChange={(e) => onUsarHoyInicioChange(e.target.checked)}
                  disabled={isUpdating}
                />
                Hoy
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Fecha de Finalización *</label>
            <div style={styles.flexDateContainer}>
              <div style={styles.flexDateInputWrapper}>
                <DateInput
                  value={fechaFin}
                  onChange={onFechaFinChange}
                  disabled={isUpdating || usarHoyFin}
                  required
                />
              </div>
              <label style={styles.checkboxLabelInline}>
                <input
                  type="checkbox"
                  checked={usarHoyFin}
                  onChange={(e) => onUsarHoyFinChange(e.target.checked)}
                  disabled={isUpdating}
                />
                Hoy
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Comentarios</label>
            <textarea
              value={comentarios}
              onChange={(e) => onComentariosChange(e.target.value)}
              rows={3}
              disabled={isUpdating}
            />
          </div>

          <div style={styles.flexButtonContainer}>
            <button type="submit" className="submit-btn" disabled={isUpdating}>
              {isUpdating ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              className="submit-btn"
              onClick={onCancel}
              disabled={isUpdating}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {confirmation && (
        <ConfirmDialog>
          <DialogContent>
            <h3>Confirmar Cambio de Estado</h3>
            <p>
              ¿Está seguro de cambiar el estado del número editorial "{confirmation.editorialName}" a "{confirmation.newStatus}"?
            </p>
            <DialogButtons>
              <DialogButton
                variant="secondary"
                onClick={onConfirmationCancel}
                disabled={isChangingStatus}
              >
                Cancelar
              </DialogButton>
              <DialogButton
                variant={confirmation.newStatus === 'activo' ? 'success' : 'danger'}
                onClick={onConfirmationAccept}
                disabled={isChangingStatus}
              >
                {isChangingStatus ? 'Procesando...' : confirmation.newStatus === 'activo' ? 'Activar' : 'Inactivar'}
              </DialogButton>
            </DialogButtons>
          </DialogContent>
        </ConfirmDialog>
      )}
    </>
  );
};
