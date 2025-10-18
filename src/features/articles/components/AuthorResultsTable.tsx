import React, { useState, useMemo, useCallback } from "react";
import { ResearcherSearchResult } from "../types";

interface AuthorResultsTableProps {
  results: ResearcherSearchResult[];
  onSelectAuthor: (author: ResearcherSearchResult) => void;
}

const styles = {
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  infoText: {
    fontSize: '14px',
    color: '#6c757d'
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  paginationSelect: {
    padding: '5px 8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  paginationNav: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15px',
    gap: '8px'
  },
  paginationButton: (disabled: boolean, isActive: boolean = false) => ({
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: disabled ? '#e9ecef' : isActive ? '#007bff' : 'white',
    color: isActive ? 'white' : '#495057',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 'bold' : 'normal'
  }),
  ellipsis: {
    padding: '8px'
  }
};

const AuthorResultsTable: React.FC<AuthorResultsTableProps> = ({ results, onSelectAuthor }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentResults = results.slice(startIndex, endIndex);

    return { totalPages, startIndex, endIndex, currentResults };
  }, [results, currentPage, itemsPerPage]);

  const { totalPages, startIndex, endIndex, currentResults } = paginationData;

  if (results.length === 0) return null;

  return (
    <>
      {/* Controles de paginación superior */}
      <div style={styles.paginationContainer}>
        <div style={styles.infoText}>
          Mostrando {startIndex + 1} a {Math.min(endIndex, results.length)} de {results.length} autores
        </div>
        <div style={styles.paginationControls}>
          <span style={{ fontSize: '14px' }}>Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            style={styles.paginationSelect}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span style={{ fontSize: '14px' }}>por página</span>
        </div>
      </div>

      <div className="results-table">
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Afiliación</th>
              <th>País</th>
              <th>Correo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.map((author) => (
              <tr key={author.id}>
                <td>{`${author.nombre} ${author.apellido1} ${author.apellido2}`}</td>
                <td>{author.afiliacion}</td>
                <td>{author.pais}</td>
                <td>{author.correo}</td>
                <td>
                  <button
                    className="select-btn"
                    onClick={() => onSelectAuthor(author)}
                  >
                    Seleccionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación inferior */}
      {totalPages > 1 && (
        <div style={styles.paginationNav}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={styles.paginationButton(currentPage === 1)}
          >
            Primera
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={styles.paginationButton(currentPage === 1)}
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              if (page === 1 || page === totalPages) return true;
              return Math.abs(page - currentPage) <= 2;
            })
            .map((page, index, array) => {
              const showEllipsis = index > 0 && page - array[index - 1] > 1;
              return (
                <React.Fragment key={page}>
                  {showEllipsis && <span style={styles.ellipsis}>...</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    style={styles.paginationButton(false, currentPage === page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={styles.paginationButton(currentPage === totalPages)}
          >
            Siguiente
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={styles.paginationButton(currentPage === totalPages)}
          >
            Última
          </button>
        </div>
      )}
    </>
  );
};

export default AuthorResultsTable;
