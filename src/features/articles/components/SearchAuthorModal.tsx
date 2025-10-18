import React, { useState, useCallback } from "react";
import { ResearcherSearchResult } from "../types";
import { useAuthorSearch } from "../hooks/useAuthorSearch";
import AuthorSearchTab from "./AuthorSearchTab";
import AuthorCreateTab from "./AuthorCreateTab";
import "./SearchAuthorModal.css";

interface SearchAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAuthor: (author: ResearcherSearchResult) => void;
  articleThematicLines?: number[];
  excludedIds?: number[];
}

/**
 * RF-019: Creación de Autor desde Subformulario Embebido
 * RF-020: Búsqueda y Selección de Autores en la Creación de Artículos
 */
const SearchAuthorModal: React.FC<SearchAuthorModalProps> = ({
  isOpen,
  onClose,
  onSelectAuthor,
  articleThematicLines = [],
  excludedIds = []
}) => {
  const [mode, setMode] = useState<'search' | 'create'>('search');

  const {
    keywordSearch,
    setKeywordSearch,
    filterTerm,
    setFilterTerm,
    searchFilters,
    addFilter,
    removeFilter,
    searchResults,
    isSearching,
    search,
    reset
  } = useAuthorSearch({ articleThematicLines, excludedIds });

  const handleCloseModal = useCallback(() => {
    setMode('search');
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSelectAuthor = useCallback((author: ResearcherSearchResult) => {
    onSelectAuthor(author);
    handleCloseModal();
  }, [onSelectAuthor, handleCloseModal]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Seleccionar Autor</h3>
          <button className="close-btn" onClick={handleCloseModal}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${mode === 'search' ? 'active' : ''}`}
            onClick={() => setMode('search')}
          >
            Buscar Autor Existente
          </button>
          <button
            className={`tab-btn ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            Crear Nuevo Autor
          </button>
        </div>

        <div className="modal-body">
          {mode === 'search' ? (
            <AuthorSearchTab
              keywordSearch={keywordSearch}
              setKeywordSearch={setKeywordSearch}
              filterTerm={filterTerm}
              setFilterTerm={setFilterTerm}
              searchFilters={searchFilters}
              onAddFilter={addFilter}
              onRemoveFilter={removeFilter}
              searchResults={searchResults}
              isSearching={isSearching}
              onSearch={search}
              onSelectAuthor={handleSelectAuthor}
            />
          ) : (
            <AuthorCreateTab
              onAuthorCreated={handleSelectAuthor}
              onCancel={handleCloseModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAuthorModal;
