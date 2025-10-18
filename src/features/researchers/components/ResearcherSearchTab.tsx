import React from "react";
import { Researcher } from "../types";
import { ThematicLine } from "../../thematic-lines/services/thematicLinesService";
import { Language } from "../../languages/services";
import { SearchFilter } from "../hooks/useResearcherSearch";
import { useSearchFilterValidation } from "../../../shared/hooks";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";

const styles = {
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  filterLabel: {
    width: '100%',
    color: '#6c757d',
    marginBottom: '5px'
  },
  formGroupMargin: {
    marginBottom: '15px'
  },
  fullWidthInput: {
    width: '100%',
    padding: '8px'
  },
  helpText: {
    display: 'block',
    marginTop: '5px',
    color: '#6c757d',
    fontSize: '13px'
  },
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
  },
  selectedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '15px',
    fontSize: '14px',
    gap: '8px'
  },
  tagRemoveButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer' as const,
    fontSize: '16px',
    padding: '0',
    lineHeight: '1'
  }
};

interface ResearcherSearchTabProps {
  keywordSearch: string;
  filterTerm: string;
  searchFilters: SearchFilter[];
  searchResults: Researcher[];
  isSearching: boolean;
  thematicLines: ThematicLine[];
  languages: Language[];
  onKeywordChange: (value: string) => void;
  onFilterTermChange: (value: string) => void;
  onAddFilter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveFilter: (id: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onSelectAuthor: (author: Researcher) => void;
}

export const ResearcherSearchTab: React.FC<ResearcherSearchTabProps> = ({
  keywordSearch,
  filterTerm,
  searchFilters,
  searchResults,
  isSearching,
  onKeywordChange,
  onFilterTermChange,
  onAddFilter,
  onRemoveFilter,
  onSearch,
  onSelectAuthor
}) => {
  const filterInputRef = React.useRef<HTMLInputElement>(null);
  const { dialogState, validateAndSearch, handleConfirm, handleCancel } = useSearchFilterValidation();

  const handleSearchWithValidation = (e: React.FormEvent) => {
    e.preventDefault();

    validateAndSearch(
      filterTerm,
      () => {
        // Simular Enter para agregar el filtro
        if (filterInputRef.current) {
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true
          }) as any;
          onAddFilter(enterEvent);
        }
      },
      () => onSearch(e)
    );
  };

  const confirmDialogMessage = `Tiene filtros sin guardar: "${dialogState.filterTerm}"\n\n¿Desea guardarlos antes de buscar?`;

  return (
    <div>
      <form onSubmit={handleSearchWithValidation}>
        <div className="form-group" style={styles.formGroupMargin}>
          <label style={{ fontWeight: 'bold' }}>Búsqueda por palabra clave (ORCID, Nombre, Apellidos, Afiliación, Correo y Lugar de Trabajo)</label>
          <input
            type="text"
            value={keywordSearch}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Ej: Juan Pérez, 0000-0000-0000-0000, Universidad Central..."
            disabled={isSearching}
            style={styles.fullWidthInput}
          />
          <small style={styles.helpText}>
            💡 Puede ingresar múltiples términos de búsqueda separados por comas
          </small>
        </div>

        <div className="form-group" style={styles.formGroupMargin}>
          <label style={{ fontWeight: 'bold' }}>Filtros (Idioma, Línea Temática, País)</label>
          <input
            ref={filterInputRef}
            type="text"
            value={filterTerm}
            onChange={(e) => onFilterTermChange(e.target.value)}
            onKeyDown={onAddFilter}
            placeholder="Escriba filtro y presione Enter: Francés, Historia, México..."
            disabled={isSearching}
            style={styles.fullWidthInput}
          />
          <small style={styles.helpText}>
            💡 Presione Enter para agregar filtros. Se detectan automáticamente idiomas, líneas temáticas o países.
          </small>
        </div>

        {searchFilters.length > 0 && (
          <div style={styles.filterContainer}>
            <small style={styles.filterLabel}>
              Filtros de búsqueda:
            </small>
            {searchFilters.map((filter) => (
              <span key={filter.id} style={styles.selectedBadge}>
                {filter.label}
                <button
                  type="button"
                  onClick={() => onRemoveFilter(filter.id)}
                  style={styles.tagRemoveButton}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isSearching}>
          {isSearching ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {searchResults.length > 1 && (
        <div style={styles.resultsContainer}>
          <h4>Resultados encontrados:</h4>
          <div style={styles.resultsList}>
            {searchResults.map(author => (
              <div
                key={author.id}
                style={styles.resultsItem}
                onClick={() => onSelectAuthor(author)}
              >
                <strong>{author.name}</strong><br />
                <small>
                  ORCID: {author.orcid} | Correo: {author.email}<br />
                  {author.affiliation && `Afiliación: ${author.affiliation} | `}
                  Estado: {author.status}
                </small>
              </div>
            ))}
          </div>
          <p><small>Haz clic en un resultado para editarlo.</small></p>
        </div>
      )}

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        message={confirmDialogMessage}
        confirmText="Sí"
        cancelText="No"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};
