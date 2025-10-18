import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../shared/components/PageHeader';
import { useAuth } from '../../auth/hooks';
import { ROUTES } from '../../../shared/constants';
import { reportService } from '../services/reportService';
import { PreviousParticipationResponse } from '../types';
import { researcherService } from '../../researchers/services/researcherService';
import { Researcher } from '../../researchers/types';

const styles = {
  subtitle: { color: '#6c757d', marginBottom: '20px' },
  helperText: { display: 'block', marginBottom: '8px', color: '#666' },
  selectedBadge: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#721c24',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '0 10px'
  },
  searchContainer: { display: 'flex', gap: '10px', marginBottom: '10px' },
  evaluatorSearchInput: { flex: 1, padding: '10px', fontSize: '16px' },
  searchButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  paginationInfo: { fontSize: '14px', color: '#6c757d' },
  paginationInfoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  paginationLabel: { fontSize: '14px' },
  itemsPerPageSelect: {
    padding: '5px 8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  searchResultContainer: {
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  searchResultItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: 'white'
  },
  paginationControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px',
    gap: '8px'
  },
  pageButtonActive: {
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: '#007bff',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: 'white',
    color: '#495057',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'normal'
  },
  disabledPaginationButton: {
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: '#e9ecef',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '14px'
  },
  ellipsis: { padding: '8px' },
  reportActionsContainer: { display: 'flex', gap: '10px', marginTop: '20px' },
  generateButtonEnabled: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    opacity: 1
  },
  generateButtonDisabled: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontWeight: '500',
    opacity: 0.6
  },
  downloadButtonEnabled: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    opacity: 1
  },
  downloadButtonDisabled: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontWeight: '500',
    opacity: 0.6
  },
  errorMessage: {
    marginTop: '20px',
    padding: '12px 16px',
    backgroundColor: '#f8d7da',
    color: '#842029',
    border: '1px solid #f5c2c7',
    borderRadius: '4px'
  },
  resultsContainer: { marginTop: '30px' },
  reportSummary: {
    padding: '15px',
    backgroundColor: '#e7f3ff',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  tableContainer: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  },
  tableHeaderRow: { backgroundColor: '#f8f9fa' },
  tableHeader: { padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' },
  tableRow: { borderBottom: '1px solid #dee2e6' },
  tableCell: { padding: '12px' },
  infoNote: { fontStyle: 'italic', color: '#6c757d', marginTop: '10px' },
  listContainer: { margin: 0, paddingLeft: '20px' }
} as const;

/**
 * RF-027: Reporte de participación en números anteriores
 */
const PreviousParticipationReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [evaluadorId, setEvaluadorId] = useState<string>('');
  const [evaluadorSearchQuery, setEvaluadorSearchQuery] = useState('');
  const [evaluadorSearchResults, setEvaluadorSearchResults] = useState<Researcher[]>([]);
  const [selectedEvaluador, setSelectedEvaluador] = useState<Researcher | null>(null);

  // Estados para paginación de búsqueda de evaluadores
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [reportData, setReportData] = useState<PreviousParticipationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lógica de paginación
  const totalPages = Math.ceil(evaluadorSearchResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = evaluadorSearchResults.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error during logout:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSearchEvaluador = async () => {
    if (!evaluadorSearchQuery.trim()) {
      alert('Por favor ingrese un término de búsqueda');
      return;
    }

    try {
      // Incluir investigadores inactivos en la búsqueda para reportes
      const results = await researcherService.search(evaluadorSearchQuery, { includeInactive: true });
      setEvaluadorSearchResults(results);
      setCurrentPage(1); // Resetear a página 1 al hacer nueva búsqueda
      if (results.length === 0) {
        alert('No se encontraron evaluadores con ese criterio');
      }
    } catch (err) {
      console.error('Error buscando evaluador:', err);
      alert('Error al buscar evaluador');
    }
  };

  const handleSelectEvaluador = (evaluador: Researcher) => {
    setSelectedEvaluador(evaluador);
    setEvaluadorId(evaluador.id.toString());
    setEvaluadorSearchResults([]);
    setEvaluadorSearchQuery('');
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = evaluadorId ? { evaluador_id: parseInt(evaluadorId) } : {};
      const data = await reportService.getPreviousParticipation(params);
      setReportData(data);
    } catch (err) {
      setError('Error al generar el reporte. Por favor intente nuevamente.');
      console.error('Error generando reporte:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = evaluadorId ? { evaluador_id: parseInt(evaluadorId) } : {};
      const blob = await reportService.downloadPreviousParticipationPDF(params);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `participacion_numeros_anteriores_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al descargar el PDF. Por favor intente nuevamente.');
      console.error('Error descargando PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">
          <h2>Participación en Números Anteriores</h2>
          <p style={styles.subtitle}>
            Genere un reporte de participación en números anteriores.
          </p>

          <div className="form-group">
            <label>Evaluador (Opcional)</label>
            <small style={styles.helperText}>
              Dejar vacío para ver todos los evaluadores
            </small>

            {selectedEvaluador ? (
              <div style={styles.selectedBadge}>
                <span>
                  <strong>{selectedEvaluador.name}</strong>
                  <br />
                  <small>ORCID: {selectedEvaluador.orcid} - {selectedEvaluador.affiliation}</small>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvaluador(null);
                    setEvaluadorId('');
                  }}
                  style={styles.closeButton}
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, ORCID, correo..."
                    value={evaluadorSearchQuery}
                    onChange={(e) => setEvaluadorSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchEvaluador()}
                    style={styles.evaluatorSearchInput}
                  />
                  <button
                    onClick={handleSearchEvaluador}
                    style={styles.searchButton}
                  >
                    Buscar
                  </button>
                </div>

                {evaluadorSearchResults.length > 0 && (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={styles.paginationContainer}>
                      <div style={styles.paginationInfo}>
                        Mostrando {startIndex + 1} a {Math.min(endIndex, evaluadorSearchResults.length)} de {evaluadorSearchResults.length} evaluadores
                      </div>
                      <div style={styles.paginationInfoContainer}>
                        <span style={styles.paginationLabel}>Mostrar:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                          style={styles.itemsPerPageSelect}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        <span style={styles.paginationLabel}>por página</span>
                      </div>
                    </div>

                    <div style={styles.searchResultContainer}>
                      {currentResults.map((evaluador) => (
                        <div
                          key={evaluador.id}
                          onClick={() => handleSelectEvaluador(evaluador)}
                          style={styles.searchResultItem}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <strong>{evaluador.name}</strong>
                          <br />
                          <small>{evaluador.orcid} - {evaluador.affiliation}</small>
                        </div>
                      ))}
                    </div>

                    {/* Controles de paginación inferior */}
                    {totalPages > 1 && (
                      <div style={styles.paginationControls}>
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={currentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Primera</button>
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} style={currentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Anterior</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={styles.ellipsis}>...</span>}<button onClick={() => setCurrentPage(page)} style={currentPage === page ? styles.pageButtonActive : styles.pageButton}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} style={currentPage === totalPages ? styles.disabledPaginationButton : styles.pageButton}>Siguiente</button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={currentPage === totalPages ? styles.disabledPaginationButton : styles.pageButton}>Última</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div style={styles.reportActionsContainer}>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              style={isLoading ? styles.generateButtonDisabled : styles.generateButtonEnabled}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              style={isLoading ? styles.downloadButtonDisabled : styles.downloadButtonEnabled}
            >
              {isLoading ? 'Descargando...' : 'Descargar PDF'}
            </button>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Resultados del reporte */}
          {reportData && (
            <div style={styles.resultsContainer}>
              <h3>Resultados del Reporte</h3>

              {/* Consulta específica de un evaluador */}
              {reportData.evaluador_id && (
                <div style={styles.reportSummary}>
                  <p><strong>Evaluador:</strong> {reportData.evaluador_nombre}</p>
                  <p><strong>Número de Publicación Anterior:</strong> {reportData.numero_editorial_anterior}</p>
                  <p><strong>Participó:</strong> {reportData.participo ? 'Sí' : 'No'}</p>
                </div>
              )}

              {reportData.articulos_evaluados && reportData.articulos_evaluados.length > 0 && (
                <div className="table-responsive">
                  <table style={styles.tableContainer}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableHeader}>Artículo</th>
                        <th style={styles.tableHeader}>Estado Dictamen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.articulos_evaluados.map((articulo, index) => (
                        <tr key={articulo.articulo_id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{articulo.articulo_titulo}</td>
                          <td style={styles.tableCell}>{articulo.estado_dictamen || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Consulta general de todos los evaluadores */}
              {reportData.total_evaluadores !== undefined && (
                <div style={styles.reportSummary}>
                  <p><strong>Total de Evaluadores:</strong> {reportData.total_evaluadores}</p>
                </div>
              )}

              {reportData.participaciones && reportData.participaciones.length > 0 && (
                <div className="table-responsive">
                  <table style={styles.tableContainer}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableHeader}>Evaluador</th>
                        <th style={styles.tableHeader}>Nº Publicación Anterior</th>
                        <th style={styles.tableHeader}>Participó</th>
                        <th style={styles.tableHeader}>Artículos Evaluados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.participaciones.map((participacion, index) => (
                        <tr key={participacion.evaluador_id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{participacion.evaluador_nombre}</td>
                          <td style={styles.tableCell}>{participacion.numero_editorial_anterior}</td>
                          <td style={styles.tableCell}>{participacion.participo ? 'Sí' : 'No'}</td>
                          <td style={styles.tableCell}>
                            {participacion.articulos_evaluados.length > 0 ? (
                              <ul style={styles.listContainer}>
                                {participacion.articulos_evaluados.map((articulo) => (
                                  <li key={articulo.articulo_id}>
                                    {articulo.articulo_titulo}
                                    {articulo.estado_dictamen && (
                                      <> - {articulo.estado_dictamen}</>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <em>Ninguno</em>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportData.mensaje && (
                <p style={styles.infoNote}>{reportData.mensaje}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreviousParticipationReport;
