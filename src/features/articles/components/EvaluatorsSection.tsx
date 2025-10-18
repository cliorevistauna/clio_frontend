import React from "react";
import EvaluatorCard from "./EvaluatorCard";
import { EvaluatorWithState } from "../hooks/useEvaluatorsManager";

interface EvaluatorsSectionProps {
  evaluators: EvaluatorWithState[];
  isSubmitting: boolean;
  onAddEvaluators: () => void;
  onRemoveEvaluator: (id: number) => void;
  onUpdateState: (
    id: number,
    field: 'estado_comunicacion' | 'estado_dictamen' | 'fecha_envio_dictamen' | 'fecha_limite_dictamen' | 'fecha_entrega_dictamen',
    value: any
  ) => void;
  onUpdateDateCheckbox: (id: number, field: 'usarHoyEnvio' | 'usarHoyLimite' | 'usarHoyEntrega', checked: boolean) => void;
}

const styles = {
  evaluatorsContainer: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px'
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px'
  }
};

const EvaluatorsSection: React.FC<EvaluatorsSectionProps> = ({
  evaluators,
  isSubmitting,
  onAddEvaluators,
  onRemoveEvaluator,
  onUpdateState,
  onUpdateDateCheckbox
}) => {
  return (
    <div className="form-group">
      <label>Evaluadores</label>

      {evaluators.length > 0 && (
        <div style={styles.evaluatorsContainer}>
          <strong>Asignados:</strong>
          {evaluators.map(ev => (
            <EvaluatorCard
              key={ev.researcher.id}
              evaluator={ev}
              onRemove={onRemoveEvaluator}
              onUpdateState={onUpdateState}
              onUpdateDateCheckbox={onUpdateDateCheckbox}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onAddEvaluators}
        disabled={isSubmitting}
        style={styles.secondaryButton}
      >
        Agregar Evaluadores ({evaluators.length})
      </button>
    </div>
  );
};

export default EvaluatorsSection;
