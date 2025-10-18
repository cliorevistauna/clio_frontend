import React, { useCallback } from "react";
import AuthorResultsTable from "./AuthorResultsTable";
import { ResearcherSearchResult } from "../types";
import { useSearchFilterValidation } from "../../../shared/hooks";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";

interface AuthorSearchTabProps {
  keywordSearch: string;
  setKeywordSearch: (value: string) => void;
  filterTerm: string;
  setFilterTerm: (value: string) => void;
  searchFilters: Array<{ id: string; type: string; value: string; label: string }>;
  onAddFilter: (term: string) => void;
  onRemoveFilter: (id: string) => void;
  searchResults: ResearcherSearchResult[];
  isSearching: boolean;
  onSearch: () => void;
  onSelectAuthor: (author: ResearcherSearchResult) => void;
}

const styles = {
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    fontWeight: 'bold' as const,
    marginBottom: '5px',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  helperText: {
    display: 'block',
    marginTop: '5px',
    color: '#6c757d',
    fontSize: '13px'
  },
  searchBar: {
    // Referencia a clase CSS existente
  },
  filtersContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  filtersLabel: {
    width: '100%',
    color: '#6c757d',
    marginBottom: '5px'
  },
  filterTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '15px',
    fontSize: '14px',
    gap: '8px'
  },
  filterRemoveButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0',
    lineHeight: '1'
  }
};

const AuthorSearchTab: React.FC<AuthorSearchTabProps> = ({
  keywordSearch,
  setKeywordSearch,
  filterTerm,
  setFilterTerm,
  searchFilters,
  onAddFilter,
  onRemoveFilter,
  searchResults,
  isSearching,
  onSearch,
  onSelectAuthor
}) => {
  const { dialogState, validateAndSearch, handleConfirm, handleCancel } = useSearchFilterValidation();

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filterTerm.trim()) {
      e.preventDefault();
      onAddFilter(filterTerm.trim());
      setFilterTerm("");
    }
  }, [filterTerm, onAddFilter, setFilterTerm]);

  const handleSearchWithValidation = useCallback(() => {
    validateAndSearch(
      filterTerm,
      () => {
        onAddFilter(filterTerm.trim());
        setFilterTerm("");
      },
      onSearch
    );
  }, [filterTerm, onAddFilter, setFilterTerm, onSearch, validateAndSearch]);

  const confirmDialogMessage = `Tiene filtros sin guardar: "${dialogState.filterTerm}"\n\n¿Desea guardarlos antes de buscar?`;

  return (
    <div className="search-section">
      {/* Campo de palabra clave */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Búsqueda por palabra clave (Nombre, Apellidos, Afiliación)
        </label>
        <input
          type="text"
          placeholder="Ej: Juan Pérez, Universidad Nacional, TEC..."
          value={keywordSearch}
          onChange={(e) => setKeywordSearch(e.target.value)}
          style={styles.input}
        />
        <small style={styles.helperText}>
          💡 Busca en nombre, apellidos, afiliación, ORCID y correo
        </small>
      </div>

      {/* Campo de filtros */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Filtros (Idioma, Línea Temática, País)
        </label>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Escriba filtro y presione Enter: Francés, Historia, México..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearchWithValidation} disabled={isSearching}>
            {isSearching ? "Buscando..." : "Buscar"}
          </button>
        </div>
        <small style={styles.helperText}>
          💡 Presione Enter para agregar filtros. Se detectan automáticamente idiomas, líneas temáticas o países.
        </small>
      </div>

      {/* Filtros activos */}
      {searchFilters.length > 0 && (
        <div style={styles.filtersContainer}>
          <small style={styles.filtersLabel}>
            Filtros de búsqueda:
          </small>
          {searchFilters.map((filter) => (
            <span key={filter.id} style={styles.filterTag}>
              {filter.label}
              <button
                onClick={() => onRemoveFilter(filter.id)}
                style={styles.filterRemoveButton}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <AuthorResultsTable
        results={searchResults}
        onSelectAuthor={onSelectAuthor}
      />

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

export default AuthorSearchTab;
