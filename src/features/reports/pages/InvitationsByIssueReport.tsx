import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderWithToggle } from '../../../shared/components/HeaderWithToggle';
import { useAuth } from '../../auth/hooks';
import { ROUTES } from '../../../shared/constants';
import { reportService } from '../services/reportService';
import { InvitationsByIssueResponse } from '../types';
import { editorialNumberService } from '../../editorial-numbers/services/editorialNumberService';
import { articleService } from '../../articles/services/articleService';
import { useViewMode } from '../../../shared/contexts/ViewModeContext';

const styles = {
  subtitle: { color: '#6c757d', marginBottom: '20px' },
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
  fullWidthInput: { flex: 1, padding: '8px', fontSize: '16px' },
  editorialSearchButton: {
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
  helperText: { display: 'block', marginBottom: '8px', color: '#666' },
  searchInputDisabled: { flex: 1, padding: '10px', fontSize: '16px' },
  secondaryButtonEnabled: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    opacity: 1
  },
  secondaryButtonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '16px',
    opacity: 0.6
  },
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
  tableCell: { padding: '12px' }
} as const;

/**
 * RF-025: Reporte de invitaciones por número editorial
 */
const InvitationsByIssueReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { viewMode } = useViewMode();
  // Estado para Número Editorial
  const [numeroEditorialId, setNumeroEditorialId] = useState<string>('');
  const [numeroSearchQuery, setNumeroSearchQuery] = useState('');
  const [anioSearchQuery, setAnioSearchQuery] = useState('');
  const [numeroSearchResults, setNumeroSearchResults] = useState<any[]>([]);
  const [selectedNumero, setSelectedNumero] = useState<any>(null);

  // Estado para Artículo (opcional)
  const [articuloId, setArticuloId] = useState<string>('');
  const [articuloSearchQuery, setArticuloSearchQuery] = useState('');
  const [articuloSearchResults, setArticuloSearchResults] = useState<any[]>([]);
  const [selectedArticulo, setSelectedArticulo] = useState<any>(null);

  // Estados para paginación de números editoriales
  const [numeroCurrentPage, setNumeroCurrentPage] = useState(1);
  const [numeroItemsPerPage, setNumeroItemsPerPage] = useState(10);

  // Estados para paginación de artículos
  const [articuloCurrentPage, setArticuloCurrentPage] = useState(1);
  const [articuloItemsPerPage, setArticuloItemsPerPage] = useState(10);

  const [reportData, setReportData] = useState<InvitationsByIssueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error during logout:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSearchNumero = async () => {
    if (!numeroSearchQuery.trim() || !anioSearchQuery.trim()) {
      alert('Por favor ingrese número y año para buscar');
      return;
    }

    try {
      const results = await editorialNumberService.searchByNumber(
        parseInt(numeroSearchQuery),
        parseInt(anioSearchQuery)
      );
      setNumeroSearchResults(results);
      setNumeroCurrentPage(1); // Resetear a página 1 al hacer nueva búsqueda
      if (results.length === 0) {
        alert('No se encontraron números editoriales con esos criterios');
      }
    } catch (err) {
      console.error('Error buscando número editorial:', err);
      alert('Error al buscar número editorial');
    }
  };

  const handleSelectNumero = (numero: any) => {
    setSelectedNumero(numero);
    setNumeroEditorialId(numero.id.toString());
    setNumeroSearchResults([]);
    setNumeroSearchQuery('');
    setAnioSearchQuery('');
  };

  const handleSearchArticulo = async () => {
    if (!numeroEditorialId) {
      alert('Primero seleccione un número editorial');
      return;
    }

    if (!articuloSearchQuery.trim()) {
      alert('Por favor ingrese un título para buscar');
      return;
    }

    try {
      // Buscar artículos por título usando el parámetro search del servicio
      const results = await articleService.getAll({
        search: articuloSearchQuery,
        numero_editorial: parseInt(numeroEditorialId)
      });
      setArticuloSearchResults(results);
      setArticuloCurrentPage(1); // Resetear a página 1 al hacer nueva búsqueda
      if (results.length === 0) {
        alert('No se encontraron artículos en ese número editorial con ese título');
      }
    } catch (err) {
      console.error('Error buscando artículo:', err);
      alert('Error al buscar artículo');
    }
  };

  // Lógica de paginación para números editoriales
  const numeroTotalPages = Math.ceil(numeroSearchResults.length / numeroItemsPerPage);
  const numeroStartIndex = (numeroCurrentPage - 1) * numeroItemsPerPage;
  const numeroEndIndex = numeroStartIndex + numeroItemsPerPage;
  const currentNumeroResults = numeroSearchResults.slice(numeroStartIndex, numeroEndIndex);

  const handleNumeroItemsPerPageChange = (value: number) => {
    setNumeroItemsPerPage(value);
    setNumeroCurrentPage(1);
  };

  // Lógica de paginación para artículos
  const articuloTotalPages = Math.ceil(articuloSearchResults.length / articuloItemsPerPage);
  const articuloStartIndex = (articuloCurrentPage - 1) * articuloItemsPerPage;
  const articuloEndIndex = articuloStartIndex + articuloItemsPerPage;
  const currentArticuloResults = articuloSearchResults.slice(articuloStartIndex, articuloEndIndex);

  const handleArticuloItemsPerPageChange = (value: number) => {
    setArticuloItemsPerPage(value);
    setArticuloCurrentPage(1);
  };

  const handleSelectArticulo = (articulo: any) => {
    setSelectedArticulo(articulo);
    setArticuloId(articulo.id.toString());
    setArticuloSearchResults([]);
    setArticuloSearchQuery('');
  };

  const handleGenerateReport = async () => {
    if (!numeroEditorialId) {
      alert('Debe seleccionar un número editorial');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: any = { numero_editorial_id: parseInt(numeroEditorialId) };
      if (articuloId) {
        params.articulo_id = parseInt(articuloId);
      }

      const data = await reportService.getInvitationsByIssue(params);
      setReportData(data);
    } catch (err) {
      setError('Error al generar el reporte. Por favor intente nuevamente.');
      console.error('Error generando reporte:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!numeroEditorialId) {
      alert('Debe seleccionar un número editorial');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: any = { numero_editorial_id: parseInt(numeroEditorialId) };
      if (articuloId) {
        params.articulo_id = parseInt(articuloId);
      }

      const blob = await reportService.downloadInvitationsByIssuePDF(params);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invitaciones_numero_editorial_${numeroEditorialId}_${new Date().toISOString().split('T')[0]}.pdf`;
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
    <div className={`app-layout ${viewMode === 'wide' ? 'wide-layout' : ''}`}>
      <HeaderWithToggle onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">
          <h2>Invitaciones por Periodo</h2>
          <p style={styles.subtitle}>
            Genere un reporte de invitaciones por periodo.
          </p>

          {/* Número Editorial (Requerido) */}
          <div className="form-group">
            <label>Periodo (Requerido)</label>

            {selectedNumero ? (
              <div style={styles.selectedBadge}>
                <span>
                  <strong>Periodo seleccionado:</strong> {selectedNumero.numero}-{selectedNumero.anio}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNumero(null);
                    setNumeroEditorialId('');
                    setSelectedArticulo(null);
                    setArticuloId('');
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
                    type="number"
                    placeholder="Periodo"
                    value={numeroSearchQuery}
                    onChange={(e) => setNumeroSearchQuery(e.target.value)}
                    min="1"
                    style={styles.fullWidthInput}
                  />
                  <input
                    type="number"
                    placeholder="Año"
                    value={anioSearchQuery}
                    onChange={(e) => setAnioSearchQuery(e.target.value)}
                    min="1900"
                    max={new Date().getFullYear()}
                    style={styles.fullWidthInput}
                  />
                  <button
                    onClick={handleSearchNumero}
                    style={styles.editorialSearchButton}
                  >
                    Buscar
                  </button>
                </div>

                {numeroSearchResults.length > 0 && (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={styles.paginationContainer}>
                      <div style={styles.paginationInfo}>
                        Mostrando {numeroStartIndex + 1} a {Math.min(numeroEndIndex, numeroSearchResults.length)} de {numeroSearchResults.length} números
                      </div>
                      <div style={styles.paginationInfoContainer}>
                        <span style={styles.paginationLabel}>Mostrar:</span>
                        <select
                          value={numeroItemsPerPage}
                          onChange={(e) => handleNumeroItemsPerPageChange(Number(e.target.value))}
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
                      {currentNumeroResults.map((numero) => (
                        <div
                          key={numero.id}
                          onClick={() => handleSelectNumero(numero)}
                          style={styles.searchResultItem}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <strong>{numero.numero}-{numero.anio}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Controles de paginación inferior */}
                    {numeroTotalPages > 1 && (
                      <div style={styles.paginationControls}>
                        <button onClick={() => setNumeroCurrentPage(1)} disabled={numeroCurrentPage === 1} style={numeroCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Primera</button>
                        <button onClick={() => setNumeroCurrentPage(prev => Math.max(1, prev - 1))} disabled={numeroCurrentPage === 1} style={numeroCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Anterior</button>
                        {Array.from({ length: numeroTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === numeroTotalPages || Math.abs(page - numeroCurrentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={styles.ellipsis}>...</span>}<button onClick={() => setNumeroCurrentPage(page)} style={numeroCurrentPage === page ? styles.pageButtonActive : styles.pageButton}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setNumeroCurrentPage(prev => Math.min(numeroTotalPages, prev + 1))} disabled={numeroCurrentPage === numeroTotalPages} style={numeroCurrentPage === numeroTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Siguiente</button>
                        <button onClick={() => setNumeroCurrentPage(numeroTotalPages)} disabled={numeroCurrentPage === numeroTotalPages} style={numeroCurrentPage === numeroTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Última</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #dee2e6' }} />

          {/* Artículo (Opcional) */}
          <div className="form-group">
            <label>Artículo (Opcional)</label>
            <small style={styles.helperText}>
              Dejar vacío para ver todos los artículos del número editorial
            </small>

            {selectedArticulo ? (
              <div style={styles.selectedBadge}>
                <span>
                  <strong>Artículo seleccionado:</strong> {selectedArticulo.titulo}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArticulo(null);
                    setArticuloId('');
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
                    placeholder="Buscar por título"
                    value={articuloSearchQuery}
                    onChange={(e) => setArticuloSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchArticulo()}
                    disabled={!numeroEditorialId}
                    style={styles.searchInputDisabled}
                  />
                  <button
                    onClick={handleSearchArticulo}
                    disabled={!numeroEditorialId}
                    style={!numeroEditorialId ? styles.secondaryButtonDisabled : styles.secondaryButtonEnabled}
                  >
                    Buscar
                  </button>
                </div>

                {articuloSearchResults.length > 0 && (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={styles.paginationContainer}>
                      <div style={styles.paginationInfo}>
                        Mostrando {articuloStartIndex + 1} a {Math.min(articuloEndIndex, articuloSearchResults.length)} de {articuloSearchResults.length} artículos
                      </div>
                      <div style={styles.paginationInfoContainer}>
                        <span style={styles.paginationLabel}>Mostrar:</span>
                        <select
                          value={articuloItemsPerPage}
                          onChange={(e) => handleArticuloItemsPerPageChange(Number(e.target.value))}
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
                      {currentArticuloResults.map((articulo) => (
                        <div
                          key={articulo.id}
                          onClick={() => handleSelectArticulo(articulo)}
                          style={styles.searchResultItem}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <strong>{articulo.titulo}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Controles de paginación inferior */}
                    {articuloTotalPages > 1 && (
                      <div style={styles.paginationControls}>
                        <button onClick={() => setArticuloCurrentPage(1)} disabled={articuloCurrentPage === 1} style={articuloCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Primera</button>
                        <button onClick={() => setArticuloCurrentPage(prev => Math.max(1, prev - 1))} disabled={articuloCurrentPage === 1} style={articuloCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Anterior</button>
                        {Array.from({ length: articuloTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === articuloTotalPages || Math.abs(page - articuloCurrentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={styles.ellipsis}>...</span>}<button onClick={() => setArticuloCurrentPage(page)} style={articuloCurrentPage === page ? styles.pageButtonActive : styles.pageButton}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setArticuloCurrentPage(prev => Math.min(articuloTotalPages, prev + 1))} disabled={articuloCurrentPage === articuloTotalPages} style={articuloCurrentPage === articuloTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Siguiente</button>
                        <button onClick={() => setArticuloCurrentPage(articuloTotalPages)} disabled={articuloCurrentPage === articuloTotalPages} style={articuloCurrentPage === articuloTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Última</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #dee2e6' }} />

          {/* Botones de acción */}
          <div style={styles.reportActionsContainer}>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading || !numeroEditorialId}
              style={(isLoading || !numeroEditorialId) ? styles.generateButtonDisabled : styles.generateButtonEnabled}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading || !numeroEditorialId}
              style={(isLoading || !numeroEditorialId) ? styles.downloadButtonDisabled : styles.downloadButtonEnabled}
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
              <div style={styles.reportSummary}>
                <p><strong>Periodo:</strong> {reportData.numero_editorial_nombre}</p>
                <p><strong>Total de Invitaciones:</strong> {reportData.total_invitaciones}</p>

                {reportData.articulo_titulo && (
                  <p><strong>Artículo:</strong> {reportData.articulo_titulo}</p>
                )}
              </div>

              {reportData.desglose_por_articulo && reportData.desglose_por_articulo.length > 0 && (
                <div className="table-responsive">
                  <table style={styles.tableContainer}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableHeader}>Artículo</th>
                        <th style={styles.tableHeader}>Total Invitaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.desglose_por_articulo.map((item, index) => (
                        <tr key={item.articulo_id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{item.articulo_titulo}</td>
                          <td style={styles.tableCell}>{item.total_invitaciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InvitationsByIssueReport;
