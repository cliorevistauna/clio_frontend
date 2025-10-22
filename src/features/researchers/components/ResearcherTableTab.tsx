import React, { useMemo } from "react";
import { Researcher } from "../types";
import { PaginationControls } from "./PaginationControls";

const styles = {
  checkboxInput: {
    marginRight: '10px',
    cursor: 'pointer' as const,
    width: '18px',
    height: '18px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer' as const
  },
  checkboxLabelSmall: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer' as const,
    fontSize: '14px'
  },
  fullWidthSelect: {
    width: '100%'
  },
  infoBox: {
    padding: '10px',
    backgroundColor: '#e7f3ff',
    border: '1px solid #b3d9ff',
    borderRadius: '4px',
    marginBottom: '10px',
    color: '#004085',
    fontSize: '13px'
  },
  loadButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontWeight: 'bold' as const,
    marginBottom: '10px'
  },
  loadingContainer: {
    textAlign: 'center' as const,
    padding: '20px'
  },
  loadingSubtext: {
    color: '#6c757d'
  },
  loadingText: {
    fontSize: '1.2rem',
    color: '#007bff'
  },
  marginBottom15: {
    marginBottom: '15px'
  },
  marginBottom20: {
    marginBottom: '20px'
  },
  primaryButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontSize: '12px'
  },
  selectContainer: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  statusBadgeActive: {
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: '#d4edda',
    color: '#155724',
    fontSize: '12px'
  },
  statusBadgeInactive: {
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    fontSize: '12px'
  },
  statusBadgePending: {
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    fontSize: '12px'
  },
  tableCell: {
    padding: '10px'
  },
  tableCellCenter: {
    padding: '10px',
    textAlign: 'center' as const
  },
  tableCellNoResults: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#666'
  },
  tableContainer: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    overflowX: 'auto' as const
  },
  tableHeader: {
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '2px solid #ddd'
  },
  tableHeaderCenter: {
    padding: '12px',
    textAlign: 'center' as const,
    borderBottom: '2px solid #ddd'
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa'
  },
  tableInstance: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  tableRow: {
    borderBottom: '1px solid #eee'
  }
};

interface ResearcherTableTabProps {
  allAuthors: Researcher[];
  filteredAuthors: Researcher[];
  tableFilter: string;
  showInactive: boolean;
  isLoadingTable: boolean;
  currentPage: number;
  itemsPerPage: number;
  onTableFilterChange: (value: string) => void;
  onShowInactiveChange: (value: boolean) => void;
  onLoadAuthors: () => void;
  onSelectAuthor: (author: Researcher) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const ResearcherTableTab: React.FC<ResearcherTableTabProps> = ({
  allAuthors,
  filteredAuthors,
  tableFilter,
  showInactive,
  isLoadingTable,
  currentPage,
  itemsPerPage,
  onTableFilterChange,
  onShowInactiveChange,
  onLoadAuthors,
  onSelectAuthor,
  onPageChange,
  onItemsPerPageChange
}) => {
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAuthors = filteredAuthors.slice(startIndex, endIndex);

    return { totalPages, startIndex, endIndex, currentAuthors };
  }, [filteredAuthors, currentPage, itemsPerPage]);

  const { totalPages, startIndex, endIndex, currentAuthors } = paginationData;

  return (
    <div>
      <h3>Todos los Autores y Evaluadores</h3>

      {allAuthors.length === 0 && !isLoadingTable && (
        <>
          <div style={styles.infoBox}>
            ℹ️ <strong>Nota:</strong> Esta opción carga todos los registros. Puede tomar unos segundos.
          </div>

          <div style={styles.selectContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => onShowInactiveChange(e.target.checked)}
                style={styles.checkboxInput}
              />
              <span>Mostrar Inactivos</span>
            </label>
          </div>

          <button
            type="button"
            onClick={onLoadAuthors}
            style={styles.loadButton}
          >
            Cargar Todos los Autores y Evaluadores
          </button>
        </>
      )}

      {isLoadingTable && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Cargando...</div>
          <small style={styles.loadingSubtext}>Por favor espere mientras se cargan los datos</small>
        </div>
      )}

      {!isLoadingTable && allAuthors.length > 0 && (
        <div>
          <div className="form-group" style={styles.marginBottom20}>
            <label>Filtrar en la tabla:</label>
            <input
              type="text"
              value={tableFilter}
              onChange={(e) => {
                onTableFilterChange(e.target.value);
                onPageChange(1);
              }}
              placeholder="Filtrar por nombre, ORCID, correo, afiliación..."
              style={styles.fullWidthSelect}
            />
          </div>

          <div style={styles.marginBottom15}>
            <label style={styles.checkboxLabelSmall}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => {
                  onShowInactiveChange(e.target.checked);
                  onPageChange(1);
                }}
                style={styles.checkboxInput}
              />
              <span>Mostrar Inactivos</span>
            </label>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAuthors.length}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />

          <div style={styles.tableContainer}>
            <table style={styles.tableInstance}>
              <thead style={styles.tableHeaderRow}>
                <tr>
                  <th style={styles.tableHeader}>ORCID</th>
                  <th style={styles.tableHeader}>Nombre</th>
                  <th style={styles.tableHeader}>Correo</th>
                  <th style={styles.tableHeader}>País</th>
                  <th style={styles.tableHeader}>Estado</th>
                  <th style={styles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentAuthors.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.tableCellNoResults}>
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  currentAuthors.map((author) => (
                    <tr key={author.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{author.orcid}</td>
                      <td style={styles.tableCell}>{author.name}</td>
                      <td style={styles.tableCell}>{author.email}</td>
                      <td style={styles.tableCell}>{author.country || '-'}</td>
                      <td style={styles.tableCell}>
                        <span style={
                          author.status === 'active' ? styles.statusBadgeActive :
                          author.status === 'inactive' ? styles.statusBadgeInactive :
                          styles.statusBadgePending
                        }>
                          {author.status === 'active' ? 'Activo' : author.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                        </span>
                      </td>
                      <td style={styles.tableCellCenter}>
                        <button
                          onClick={() => onSelectAuthor(author)}
                          style={styles.primaryButton}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                        >
                          Actualizar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAuthors.length}
              itemsPerPage={itemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};
