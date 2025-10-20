import React from "react";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import { DateInput } from "../../../shared/components/ui";
import { EditorialNumber } from "../../editorial-numbers/types";

interface ArticleInfoSectionProps {
  titulo: string;
  procedencia: string;
  estado: 'recibido' | 'asignado' | 'aceptado' | 'rechazado' | 'publicado';
  fechaRecepcion: string;
  fechaAceptacion: string;
  fechaPublicacion: string;
  lineasTematicas: number[];
  usarHoyRecepcion: boolean;
  usarHoyAceptacion: boolean;
  usarHoyPublicacion: boolean;
  selectedEditorialNumber: number | null;
  editorialNumbers: EditorialNumber[];
  isSubmitting: boolean;
  onFieldChange: (field: 'titulo' | 'procedencia' | 'estado' | 'fechaRecepcion' | 'fechaAceptacion' | 'fechaPublicacion' | 'lineasTematicas', value: any) => void;
  onTodayChange: (field: 'fechaRecepcion' | 'fechaAceptacion' | 'fechaPublicacion', checked: boolean) => void;
  onEditorialNumberChange: (value: number | null) => void;
}

const styles = {
  helperText: {
    color: '#6c757d',
    fontSize: '0.9rem'
  },
  warningText: {
    color: '#dc3545',
    display: 'block',
    marginTop: '4px',
    fontSize: '13px'
  },
  fullWidthSelect: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ced4da'
  },
  dateInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  dateInputWrapper: {
    flex: 1
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    margin: 0,
    whiteSpace: 'nowrap' as const
  },
  stateDisplayContainer: {
    padding: '10px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    border: '1px solid #ced4da'
  },
  stateRecibidoColor: {
    color: '#0d6efd',
    fontWeight: 'bold' as const
  },
  stateAsignadoColor: {
    color: '#ffc107',
    fontWeight: 'bold' as const
  },
  stateSelectorContainer: {
    marginTop: '10px'
  },
  stateSelectorLabel: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '0.9rem',
    color: '#6c757d'
  }
};

const ArticleInfoSection: React.FC<ArticleInfoSectionProps> = ({
  titulo,
  procedencia,
  estado,
  fechaRecepcion,
  fechaAceptacion,
  fechaPublicacion,
  lineasTematicas,
  usarHoyRecepcion,
  usarHoyAceptacion,
  usarHoyPublicacion,
  selectedEditorialNumber,
  editorialNumbers,
  isSubmitting,
  onFieldChange,
  onTodayChange,
  onEditorialNumberChange
}) => {
  return (
    <>
      <h4 style={{ textAlign: "center" }}>Datos del Artículo</h4>

      {/* Periodo - Editable */}
      <div className="form-group">
        <label>Periodo</label>
        <select
          value={selectedEditorialNumber || ''}
          onChange={(e) => onEditorialNumberChange(e.target.value ? parseInt(e.target.value) : null)}
          disabled={isSubmitting}
          style={styles.fullWidthSelect}
        >
          <option value="">Sin asignar</option>
          {editorialNumbers.map(en => {
            const isSelected = selectedEditorialNumber === en.id;
            const shouldShow = en.estado === 'activo' || isSelected;

            if (!shouldShow) return null;

            return (
              <option key={en.id} value={en.id}>
                Periodo {en.numero} - Año {en.anio}
                {en.estado === 'inactivo' ? ' (Inactivo)' : ''}
              </option>
            );
          })}
        </select>
        <small style={styles.helperText}>
          Puede modificar el periodo asignado
          {selectedEditorialNumber && editorialNumbers.find(en => en.id === selectedEditorialNumber)?.estado === 'inactivo' && (
            <span style={styles.warningText}>
              ⚠️ El periodo asignado está inactivo
            </span>
          )}
        </small>
      </div>

      {/* Título del Artículo */}
      <div className="form-group">
        <label>Título del Artículo *</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => onFieldChange('titulo', e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Procedencia */}
      <div className="form-group">
        <label>Procedencia *</label>
        <input
          type="text"
          value={procedencia}
          onChange={(e) => onFieldChange('procedencia', e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Líneas Temáticas */}
      <div className="form-group">
        <ThematicLineSelector
          selected={lineasTematicas}
          onChange={(value) => onFieldChange('lineasTematicas', value)}
        />
      </div>

      {/* Fechas */}
      <div className="form-group">
        <label>Fecha de Recepción *</label>
        <div style={styles.dateInputContainer}>
          <div style={styles.dateInputWrapper}>
            <DateInput
              value={fechaRecepcion}
              onChange={(value) => onFieldChange('fechaRecepcion', value)}
              disabled={isSubmitting || usarHoyRecepcion}
              required
            />
          </div>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={usarHoyRecepcion}
              onChange={(e) => onTodayChange('fechaRecepcion', e.target.checked)}
              disabled={isSubmitting}
            />
            Hoy
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Fecha de Aceptación</label>
        <div style={styles.dateInputContainer}>
          <div style={styles.dateInputWrapper}>
            <DateInput
              value={fechaAceptacion}
              onChange={(value) => onFieldChange('fechaAceptacion', value)}
              disabled={isSubmitting || usarHoyAceptacion}
            />
          </div>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={usarHoyAceptacion}
              onChange={(e) => onTodayChange('fechaAceptacion', e.target.checked)}
              disabled={isSubmitting}
            />
            Hoy
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Fecha de Publicación</label>
        <div style={styles.dateInputContainer}>
          <div style={styles.dateInputWrapper}>
            <DateInput
              value={fechaPublicacion}
              onChange={(value) => onFieldChange('fechaPublicacion', value)}
              disabled={isSubmitting || usarHoyPublicacion}
            />
          </div>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={usarHoyPublicacion}
              onChange={(e) => onTodayChange('fechaPublicacion', e.target.checked)}
              disabled={isSubmitting}
            />
            Hoy
          </label>
        </div>
      </div>

      {/* Estado del Artículo */}
      <div className="form-group">
        <label>Estado del Artículo</label>

        {/* Mostrar estado actual si es recibido o asignado (solo lectura) */}
        {(estado === 'recibido' || estado === 'asignado') && (
          <div style={styles.stateDisplayContainer}>
            <strong>Estado actual: </strong>
            <span style={estado === 'recibido' ? styles.stateRecibidoColor : styles.stateAsignadoColor}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
            <br />
            <small style={styles.helperText}>
              {estado === 'recibido'
                ? 'Este estado es automático (sin evaluadores asignados)'
                : 'Este estado es automático (con evaluadores asignados)'}
            </small>
          </div>
        )}

        {/* Selector solo para estados finales */}
        {estado !== 'recibido' && estado !== 'asignado' && (
          <>
            <select
              value={estado}
              onChange={(e) => onFieldChange('estado', e.target.value)}
              disabled={isSubmitting}
              style={styles.fullWidthSelect}
            >
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
              <option value="publicado">Publicado</option>
            </select>
            <small style={styles.helperText}>
              Puede cambiar entre estados finales manualmente
            </small>
          </>
        )}

        {/* Opción para cambiar a estado final */}
        {(estado === 'recibido' || estado === 'asignado') && (
          <div style={styles.stateSelectorContainer}>
            <label style={styles.stateSelectorLabel}>
              Cambiar a estado final:
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onFieldChange('estado', e.target.value);
                }
              }}
              value=""
              style={styles.fullWidthSelect}
            >
              <option value="">Seleccione un estado final...</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
              <option value="publicado">Publicado</option>
            </select>
          </div>
        )}
      </div>
    </>
  );
};

export default ArticleInfoSection;
