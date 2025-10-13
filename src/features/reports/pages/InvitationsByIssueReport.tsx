import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../shared/components/PageHeader';
import { useAuth } from '../../auth/hooks';
import { ROUTES } from '../../../shared/constants';
import { reportService } from '../services/reportService';
import { InvitationsByIssueResponse } from '../types';
import { editorialNumberService } from '../../editorial-numbers/services/editorialNumberService';
import { articleService } from '../../articles/services/articleService';

/**
 * RF-025: Reporte de invitaciones por número editorial
 */
const InvitationsByIssueReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
    <div className="app-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">
          <h2>Invitaciones por Número de Publicación</h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            Genere un reporte de invitaciones por número de publicación.
          </p>

          {/* Número Editorial (Requerido) */}
          <div className="form-group">
            <label>Número de Publicación (Requerido)</label>

            {selectedNumero ? (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  <strong>Número seleccionado:</strong> {selectedNumero.numero}-{selectedNumero.anio}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNumero(null);
                    setNumeroEditorialId('');
                    setSelectedArticulo(null);
                    setArticuloId('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#721c24',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0 10px'
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="number"
                    placeholder="Número"
                    value={numeroSearchQuery}
                    onChange={(e) => setNumeroSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '8px', fontSize: '16px' }}
                  />
                  <input
                    type="number"
                    placeholder="Año"
                    value={anioSearchQuery}
                    onChange={(e) => setAnioSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '8px', fontSize: '16px' }}
                  />
                  <button
                    onClick={handleSearchNumero}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Buscar
                  </button>
                </div>

                {numeroSearchResults.length > 0 && (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px',
                      marginBottom: '10px',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Mostrando {numeroStartIndex + 1} a {Math.min(numeroEndIndex, numeroSearchResults.length)} de {numeroSearchResults.length} números
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px' }}>Mostrar:</span>
                        <select
                          value={numeroItemsPerPage}
                          onChange={(e) => handleNumeroItemsPerPageChange(Number(e.target.value))}
                          style={{
                            padding: '5px 8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        <span style={{ fontSize: '14px' }}>por página</span>
                      </div>
                    </div>

                    <div style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}>
                      {currentNumeroResults.map((numero) => (
                        <div
                          key={numero.id}
                          onClick={() => handleSelectNumero(numero)}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #dee2e6',
                            backgroundColor: 'white'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <strong>{numero.numero}-{numero.anio}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Controles de paginación inferior */}
                    {numeroTotalPages > 1 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10px',
                        gap: '8px'
                      }}>
                        <button onClick={() => setNumeroCurrentPage(1)} disabled={numeroCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: numeroCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: numeroCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Primera</button>
                        <button onClick={() => setNumeroCurrentPage(prev => Math.max(1, prev - 1))} disabled={numeroCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: numeroCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: numeroCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Anterior</button>
                        {Array.from({ length: numeroTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === numeroTotalPages || Math.abs(page - numeroCurrentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={{ padding: '8px' }}>...</span>}<button onClick={() => setNumeroCurrentPage(page)} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: numeroCurrentPage === page ? '#007bff' : 'white', color: numeroCurrentPage === page ? 'white' : '#495057', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: numeroCurrentPage === page ? 'bold' : 'normal' }}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setNumeroCurrentPage(prev => Math.min(numeroTotalPages, prev + 1))} disabled={numeroCurrentPage === numeroTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: numeroCurrentPage === numeroTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: numeroCurrentPage === numeroTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Siguiente</button>
                        <button onClick={() => setNumeroCurrentPage(numeroTotalPages)} disabled={numeroCurrentPage === numeroTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: numeroCurrentPage === numeroTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: numeroCurrentPage === numeroTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Última</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Artículo (Opcional) */}
          <div className="form-group">
            <label>Artículo (Opcional)</label>
            <small style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
              Dejar vacío para ver todos los artículos del número editorial
            </small>

            {selectedArticulo ? (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  <strong>Artículo seleccionado:</strong> {selectedArticulo.titulo}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArticulo(null);
                    setArticuloId('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#721c24',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0 10px'
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Buscar por título"
                    value={articuloSearchQuery}
                    onChange={(e) => setArticuloSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchArticulo()}
                    disabled={!numeroEditorialId}
                    style={{ flex: 1, padding: '10px', fontSize: '16px' }}
                  />
                  <button
                    onClick={handleSearchArticulo}
                    disabled={!numeroEditorialId}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: !numeroEditorialId ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      opacity: !numeroEditorialId ? 0.6 : 1
                    }}
                  >
                    Buscar
                  </button>
                </div>

                {articuloSearchResults.length > 0 && (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px',
                      marginBottom: '10px',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Mostrando {articuloStartIndex + 1} a {Math.min(articuloEndIndex, articuloSearchResults.length)} de {articuloSearchResults.length} artículos
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px' }}>Mostrar:</span>
                        <select
                          value={articuloItemsPerPage}
                          onChange={(e) => handleArticuloItemsPerPageChange(Number(e.target.value))}
                          style={{
                            padding: '5px 8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        <span style={{ fontSize: '14px' }}>por página</span>
                      </div>
                    </div>

                    <div style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}>
                      {currentArticuloResults.map((articulo) => (
                        <div
                          key={articulo.id}
                          onClick={() => handleSelectArticulo(articulo)}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #dee2e6',
                            backgroundColor: 'white'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <strong>{articulo.titulo}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Controles de paginación inferior */}
                    {articuloTotalPages > 1 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10px',
                        gap: '8px'
                      }}>
                        <button onClick={() => setArticuloCurrentPage(1)} disabled={articuloCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: articuloCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: articuloCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Primera</button>
                        <button onClick={() => setArticuloCurrentPage(prev => Math.max(1, prev - 1))} disabled={articuloCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: articuloCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: articuloCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Anterior</button>
                        {Array.from({ length: articuloTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === articuloTotalPages || Math.abs(page - articuloCurrentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={{ padding: '8px' }}>...</span>}<button onClick={() => setArticuloCurrentPage(page)} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: articuloCurrentPage === page ? '#007bff' : 'white', color: articuloCurrentPage === page ? 'white' : '#495057', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: articuloCurrentPage === page ? 'bold' : 'normal' }}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setArticuloCurrentPage(prev => Math.min(articuloTotalPages, prev + 1))} disabled={articuloCurrentPage === articuloTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: articuloCurrentPage === articuloTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: articuloCurrentPage === articuloTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Siguiente</button>
                        <button onClick={() => setArticuloCurrentPage(articuloTotalPages)} disabled={articuloCurrentPage === articuloTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: articuloCurrentPage === articuloTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: articuloCurrentPage === articuloTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Última</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading || !numeroEditorialId}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isLoading || !numeroEditorialId) ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: (isLoading || !numeroEditorialId) ? 0.6 : 1
              }}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading || !numeroEditorialId}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isLoading || !numeroEditorialId) ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: (isLoading || !numeroEditorialId) ? 0.6 : 1
              }}
            >
              {isLoading ? 'Descargando...' : 'Descargar PDF'}
            </button>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: '#f8d7da',
              color: '#842029',
              border: '1px solid #f5c2c7',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          {/* Resultados del reporte */}
          {reportData && (
            <div style={{ marginTop: '30px' }}>
              <h3>Resultados del Reporte</h3>
              <div style={{
                padding: '15px',
                backgroundColor: '#e7f3ff',
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                <p><strong>Número de Publicación:</strong> {reportData.numero_editorial_nombre}</p>
                <p><strong>Total de Invitaciones:</strong> {reportData.total_invitaciones}</p>

                {reportData.articulo_titulo && (
                  <p><strong>Artículo:</strong> {reportData.articulo_titulo}</p>
                )}
              </div>

              {reportData.desglose_por_articulo && reportData.desglose_por_articulo.length > 0 && (
                <div className="table-responsive">
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '10px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Artículo</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Total Invitaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.desglose_por_articulo.map((item, index) => (
                        <tr key={item.articulo_id} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px' }}>{item.articulo_titulo}</td>
                          <td style={{ padding: '12px' }}>{item.total_invitaciones}</td>
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
