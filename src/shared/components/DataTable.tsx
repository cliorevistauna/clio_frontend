import React, { useMemo } from 'react';
import { usePagination } from '../hooks/usePagination';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

const styles = {
  tableContainer: {
    width: '100%',
    overflowX: 'auto' as const,
    marginTop: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6'
  },
  tableHeader: {
    padding: '12px',
    textAlign: 'left' as const,
    fontWeight: 'bold' as const,
    color: '#495057',
    fontSize: '14px',
    borderBottom: '2px solid #dee2e6'
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
    transition: 'background-color 0.2s ease'
  },
  tableRowClickable: {
    cursor: 'pointer' as const
  },
  tableCell: {
    padding: '12px',
    fontSize: '14px',
    color: '#212529'
  },
  paginationContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '15px'
  },
  paginationControls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#6c757d'
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    backgroundColor: 'white',
    color: '#007bff',
    cursor: 'pointer' as const,
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    minWidth: '38px'
  },
  pageButtonActive: {
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold' as const
  },
  disabledPaginationButton: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
    cursor: 'not-allowed' as const,
    border: '1px solid #dee2e6'
  },
  itemsPerPageContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  itemsPerPageSelect: {
    padding: '6px 10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer' as const
  },
  emptyMessage: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6c757d',
    fontSize: '16px'
  },
  loadingMessage: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#007bff',
    fontSize: '16px'
  }
};

export function DataTable<T>({
  data,
  columns,
  itemsPerPage = 10,
  onRowClick,
  isLoading = false,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles'
}: DataTableProps<T>) {
  const {
    currentItems,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    changeItemsPerPage,
    itemsPerPage: currentItemsPerPage
  } = usePagination(data, itemsPerPage);

  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages);
    }

    return (
      <div style={styles.paginationContainer}>
        <div style={styles.paginationInfo}>
          Mostrando {startIndex + 1} - {Math.min(endIndex, data.length)} de {data.length} registros
        </div>

        <div style={styles.paginationControls}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              ...styles.pageButton,
              ...(currentPage === 1 ? styles.disabledPaginationButton : {})
            }}
          >
            ← Anterior
          </button>

          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} style={{ padding: '0 5px' }}>
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === pageNum ? styles.pageButtonActive : {})
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              ...styles.pageButton,
              ...(currentPage === totalPages ? styles.disabledPaginationButton : {})
            }}
          >
            Siguiente →
          </button>
        </div>

        <div style={styles.itemsPerPageContainer}>
          <label htmlFor="itemsPerPage">Items por página:</label>
          <select
            id="itemsPerPage"
            value={currentItemsPerPage}
            onChange={(e) => changeItemsPerPage(Number(e.target.value))}
            style={styles.itemsPerPageSelect}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={styles.loadingMessage}>
        Cargando datos...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={styles.emptyMessage}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              {columns.map((column) => (
                <th key={column.key} style={styles.tableHeader}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr
                key={keyExtractor(item)}
                style={{
                  ...styles.tableRow,
                  ...(onRowClick ? styles.tableRowClickable : {})
                }}
                onClick={() => handleRowClick(item)}
                onMouseEnter={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {columns.map((column) => (
                  <td key={`${keyExtractor(item)}-${column.key}`} style={styles.tableCell}>
                    {column.render
                      ? column.render(item)
                      : String((item as any)[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </>
  );
}
