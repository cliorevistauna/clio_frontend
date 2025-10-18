import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Componente de diálogo de confirmación personalizado
 *
 * Reemplaza window.confirm() con un modal personalizado y estilizado
 * que permite controlar completamente el texto de los botones
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = '⚠️ Confirmación',
  message,
  confirmText = 'Sí',
  cancelText = 'No',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#034991'
        }}>
          {title}
        </h3>

        <p style={{
          margin: '0 0 24px 0',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          color: '#495057',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: '#6c757d',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#5a6268';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d';
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: '#034991',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#023366';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#034991';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
