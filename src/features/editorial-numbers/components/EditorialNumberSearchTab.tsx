import React from "react";
import { EditorialNumber } from "../types";
import { backendToFrontendDate } from "../../../shared/utils/dateUtils";

const styles = {
  resultsContainer: {
    marginTop: '20px'
  },
  resultsItem: {
    border: '1px solid #ddd',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '5px',
    cursor: 'pointer' as const,
    backgroundColor: '#f9f9f9'
  },
  resultsList: {
    maxHeight: '300px',
    overflowY: 'auto' as const
  }
};

interface EditorialNumberSearchTabProps {
  searchNumero: string;
  searchAnio: string;
  isSearching: boolean;
  searchResults: EditorialNumber[];
  onSearchNumeroChange: (value: string) => void;
  onSearchAnioChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onSelectEditorial: (editorial: EditorialNumber) => void;
}

export const EditorialNumberSearchTab: React.FC<EditorialNumberSearchTabProps> = ({
  searchNumero,
  searchAnio,
  isSearching,
  searchResults,
  onSearchNumeroChange,
  onSearchAnioChange,
  onSearch,
  onSelectEditorial
}) => {
  return (
    <div>
      <form onSubmit={onSearch}>
        <div className="form-group">
          <label>Periodo *</label>
          <input
            type="number"
            value={searchNumero}
            onChange={(e) => onSearchNumeroChange(e.target.value)}
            min="1"
            required
            disabled={isSearching}
          />
        </div>

        <div className="form-group">
          <label>Año (opcional)</label>
          <input
            type="number"
            value={searchAnio}
            onChange={(e) => onSearchAnioChange(e.target.value)}
            min="1990"
            max={new Date().getFullYear() + 10}
            disabled={isSearching}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isSearching}>
          {isSearching ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {searchResults.length > 1 && (
        <div style={styles.resultsContainer}>
          <h4>Resultados encontrados:</h4>
          <div style={styles.resultsList}>
            {searchResults.map(editorial => (
              <div
                key={editorial.id}
                style={styles.resultsItem}
                onClick={() => onSelectEditorial(editorial)}
              >
                <strong>Periodo {editorial.numero}-{editorial.anio}</strong><br />
                <small>
                  Estado: {editorial.estado} |
                  Fechas: {editorial.fecha_inicio ? backendToFrontendDate(editorial.fecha_inicio) : '-'} a {editorial.fecha_final ? backendToFrontendDate(editorial.fecha_final) : '-'}
                  {editorial.comentarios && ` | ${editorial.comentarios}`}
                </small>
              </div>
            ))}
          </div>
          <p><small>Haz clic en un resultado para editarlo.</small></p>
        </div>
      )}
    </div>
  );
};
