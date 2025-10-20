import React from "react";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import LanguageSelector from "../../../shared/components/LanguageSelector";
import { Researcher } from "../types";
import { ResearcherFormState } from "../hooks/useResearcherForm";

const styles = {
  cancelButton: {
    backgroundColor: '#6c757d'
  },
  flexButtonContainer: {
    display: 'flex',
    gap: '10px'
  },
  titleCenter: {
    textAlign: 'center' as const
  }
};

interface ResearcherEditFormProps {
  selectedAuthor: Researcher | null;
  formState: ResearcherFormState;
  isUpdating: boolean;
  onFieldChange: (field: keyof ResearcherFormState, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ResearcherEditForm: React.FC<ResearcherEditFormProps> = ({
  selectedAuthor,
  formState,
  isUpdating,
  onFieldChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div>
      <h4 style={styles.titleCenter}>Datos de {selectedAuthor?.name}</h4>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>ORCID</label>
          <input
            type="text"
            value={formState.orcid}
            onChange={(e) => onFieldChange('orcid', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>Nombre *</label>
          <input
            type="text"
            value={formState.nombre}
            onChange={(e) => onFieldChange('nombre', e.target.value)}
            required
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>Primer Apellido *</label>
          <input
            type="text"
            value={formState.apellido1}
            onChange={(e) => onFieldChange('apellido1', e.target.value)}
            required
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>Segundo Apellido *</label>
          <input
            type="text"
            value={formState.apellido2}
            onChange={(e) => onFieldChange('apellido2', e.target.value)}
            required
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>Afiliación Institucional</label>
          <input
            type="text"
            value={formState.afiliacion}
            onChange={(e) => onFieldChange('afiliacion', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>Grado Académico</label>
          <input
            type="text"
            value={formState.gradoAcademico}
            onChange={(e) => onFieldChange('gradoAcademico', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>País</label>
          <input
            type="text"
            value={formState.pais}
            onChange={(e) => onFieldChange('pais', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>Lugar de Trabajo</label>
          <input
            type="text"
            value={formState.lugarTrabajo}
            onChange={(e) => onFieldChange('lugarTrabajo', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>Correo Electrónico *</label>
          <input
            type="email"
            value={formState.correo}
            onChange={(e) => onFieldChange('correo', e.target.value)}
            required
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <ThematicLineSelector
            selected={formState.lineas}
            onChange={(value) => onFieldChange('lineas', value)}
          />
        </div>

        <div className="form-group">
          <LanguageSelector
            selected={formState.idiomas}
            onChange={(value) => onFieldChange('idiomas', value)}
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="text"
            value={formState.telefono}
            onChange={(e) => onFieldChange('telefono', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="form-group">
          <label>Estado</label>
          <select
            value={formState.estado}
            onChange={(e) => onFieldChange('estado', e.target.value)}
            disabled={isUpdating}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
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
  );
};
