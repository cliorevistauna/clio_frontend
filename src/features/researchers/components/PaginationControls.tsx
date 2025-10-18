import React from "react";

const styles = {
  disabledPaginationButton: {
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: '#e9ecef',
    borderRadius: '4px',
    cursor: 'not-allowed' as const,
    fontSize: '14px'
  },
  ellipsisText: {
    padding: '8px'
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontSize: '14px'
  },
  pageButtonActive: {
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: '#007bff',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontSize: '14px',
    fontWeight: 'bold' as const
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15px',
    gap: '8px'
  },
  paginationControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#6c757d'
  },
  paginationPerPageContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  selectField: {
    padding: '5px 8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer' as const
  }
};

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  onPageChange,
  onItemsPerPageChange
}) => {
  return (
    <>
      <div style={styles.paginationControls}>
        <div style={styles.paginationInfo}>
          Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} investigadores
        </div>
        <div style={styles.paginationPerPageContainer}>
          <span style={styles.paginationInfo}>Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={styles.selectField}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span style={styles.paginationInfo}>por página</span>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={styles.paginationContainer}>
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            style={currentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}
          >
            Primera
          </button>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={currentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}
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
                  {showEllipsis && <span style={styles.ellipsisText}>...</span>}
                  <button
                    onClick={() => onPageChange(page)}
                    style={currentPage === page ? styles.pageButtonActive : styles.pageButton}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={currentPage === totalPages ? styles.disabledPaginationButton : styles.pageButton}
          >
            Siguiente
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            style={currentPage === totalPages ? styles.disabledPaginationButton : styles.pageButton}
          >
            Última
          </button>
        </div>
      )}
    </>
  );
};
