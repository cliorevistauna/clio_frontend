import React from "react";
import { useEditorialNumbers } from "../hooks";

interface CurrentEditorialNumberDisplayProps {
  showLabel?: boolean;
  className?: string;
}

/**
 * RF-010: Componente para mostrar el número editorial vigente
 * Se actualiza automáticamente y muestra mensaje de advertencia si no hay número vigente
 */
const CurrentEditorialNumberDisplay: React.FC<CurrentEditorialNumberDisplayProps> = ({
  showLabel = true,
  className = ""
}) => {
  const { currentEditorialNumber } = useEditorialNumbers();

  if (!currentEditorialNumber) {
    return (
      <div className={`current-editorial-number warning ${className}`}>
        {showLabel && "Periodo: "}
        <span style={{ color: '#dc3545' }}>
          No hay un número editorial vigente en este momento.
        </span>
      </div>
    );
  }

  return (
    <div className={`current-editorial-number active ${className}`}>
      {showLabel && "Periodo: "}
      <strong>
        {currentEditorialNumber.numero}-{currentEditorialNumber.anio}
      </strong>
      {currentEditorialNumber.comentarios && (
        <small style={{ marginLeft: '10px', fontStyle: 'italic' }}>
          ({currentEditorialNumber.comentarios})
        </small>
      )}
    </div>
  );
};

export default CurrentEditorialNumberDisplay;