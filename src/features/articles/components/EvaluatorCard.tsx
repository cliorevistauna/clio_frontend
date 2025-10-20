import React from "react";
import { DateInput } from "../../../shared/components/ui";
import { EvaluatorWithState } from "../hooks/useEvaluatorsManager";

interface EvaluatorCardProps {
  evaluator: EvaluatorWithState;
  onRemove: (id: number) => void;
  onUpdateState: (
    id: number,
    field: 'estado_comunicacion' | 'estado_dictamen' | 'fecha_envio_dictamen' | 'fecha_limite_dictamen' | 'fecha_entrega_dictamen',
    value: any
  ) => void;
  onUpdateDateCheckbox: (id: number, field: 'usarHoyEnvio' | 'usarHoyLimite' | 'usarHoyEntrega', checked: boolean) => void;
}

const styles = {
  evaluatorCard: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '4px'
  },
  evaluatorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '1.2rem'
  },
  evaluatorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  evaluatorFieldLabel: {
    fontSize: '0.9rem',
    marginBottom: '5px',
    display: 'block'
  },
  evaluatorSelect: {
    width: '100%',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ced4da'
  },
  evaluatorDateField: {
    marginTop: '10px'
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
  }
};

const EvaluatorCard: React.FC<EvaluatorCardProps> = ({
  evaluator,
  onRemove,
  onUpdateState,
  onUpdateDateCheckbox
}) => {
  const ev = evaluator;

  return (
    <div style={styles.evaluatorCard}>
      <div style={styles.evaluatorHeader}>
        <strong>
          {ev.researcher.nombre} {ev.researcher.apellido1} {ev.researcher.apellido2}
        </strong>
        <button
          type="button"
          onClick={() => onRemove(ev.researcher.id)}
          style={styles.removeButton}
        >
          ×
        </button>
      </div>

      <div style={styles.evaluatorGrid}>
        <div>
          <label style={styles.evaluatorFieldLabel}>
            Estado de Invitación:
          </label>
          <select
            value={ev.estado_comunicacion}
            onChange={(e) => onUpdateState(
              ev.researcher.id,
              'estado_comunicacion',
              e.target.value
            )}
            style={styles.evaluatorSelect}
          >
            <option value="invitado">Invitado</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
            <option value="sin_respuesta">Sin Respuesta</option>
          </select>
        </div>

        {ev.estado_comunicacion === 'aceptado' && (
          <>
            <div>
              <label style={styles.evaluatorFieldLabel}>
                Dictamen:
              </label>
              <select
                value={ev.estado_dictamen || ''}
                onChange={(e) => onUpdateState(
                  ev.researcher.id,
                  'estado_dictamen',
                  e.target.value || null
                )}
                style={styles.evaluatorSelect}
              >
                <option value="">Sin dictamen</option>
                <option value="aceptado">Aceptado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div style={styles.evaluatorDateField}>
              <label style={styles.evaluatorFieldLabel}>
                Fecha de Envío de Dictamen:
              </label>
              <div style={styles.dateInputContainer}>
                <div style={styles.dateInputWrapper}>
                  <DateInput
                    value={ev.fecha_envio_dictamen || ''}
                    onChange={(value) => onUpdateState(
                      ev.researcher.id,
                      'fecha_envio_dictamen',
                      value || null
                    )}
                    disabled={ev.usarHoyEnvio}
                  />
                </div>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={ev.usarHoyEnvio || false}
                    onChange={(e) => onUpdateDateCheckbox(ev.researcher.id, 'usarHoyEnvio', e.target.checked)}
                  />
                  Hoy
                </label>
              </div>
            </div>
            <div style={styles.evaluatorDateField}>
              <label style={styles.evaluatorFieldLabel}>
                Fecha Límite de Dictamen:
              </label>
              <div style={styles.dateInputContainer}>
                <div style={styles.dateInputWrapper}>
                  <DateInput
                    value={ev.fecha_limite_dictamen || ''}
                    onChange={(value) => onUpdateState(
                      ev.researcher.id,
                      'fecha_limite_dictamen',
                      value || null
                    )}
                    disabled={ev.usarHoyLimite}
                  />
                </div>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={ev.usarHoyLimite || false}
                    onChange={(e) => onUpdateDateCheckbox(ev.researcher.id, 'usarHoyLimite', e.target.checked)}
                  />
                  Hoy
                </label>
              </div>
            </div>
            <div style={styles.evaluatorDateField}>
              <label style={styles.evaluatorFieldLabel}>
                Fecha de Entrega de Dictamen:
              </label>
              <div style={styles.dateInputContainer}>
                <div style={styles.dateInputWrapper}>
                  <DateInput
                    value={ev.fecha_entrega_dictamen || ''}
                    onChange={(value) => onUpdateState(
                      ev.researcher.id,
                      'fecha_entrega_dictamen',
                      value || null
                    )}
                    disabled={ev.usarHoyEntrega}
                  />
                </div>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={ev.usarHoyEntrega || false}
                    onChange={(e) => onUpdateDateCheckbox(ev.researcher.id, 'usarHoyEntrega', e.target.checked)}
                  />
                  Hoy
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvaluatorCard;
