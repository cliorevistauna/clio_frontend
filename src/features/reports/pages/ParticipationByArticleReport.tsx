import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../shared/components/PageHeader';
import { useAuth } from '../../auth/hooks';
import { ROUTES } from '../../../shared/constants';
import { reportService } from '../services/reportService';
import { ParticipationByArticleResponse } from '../types';
import { articleService } from '../../articles/services/articleService';

/**
 * RF-026: Reporte de participación por artículo
 */
const ParticipationByArticleReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [articuloId, setArticuloId] = useState<string>('');
  const [articuloSearchQuery, setArticuloSearchQuery] = useState('');
  const [articuloSearchResults, setArticuloSearchResults] = useState<any[]>([]);
  const [selectedArticulo, setSelectedArticulo] = useState<any>(null);
  const [includeDetail, setIncludeDetail] = useState(false);

  const [reportData, setReportData] = useState<ParticipationByArticleResponse | null>(null);
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

  const handleSearchArticulo = async () => {
    if (!articuloSearchQuery.trim()) {
      alert('Por favor ingrese un título para buscar');
      return;
    }

    try {
      const results = await articleService.getAll({
        search: articuloSearchQuery
      });
      setArticuloSearchResults(results);
      if (results.length === 0) {
        alert('No se encontraron artículos con ese título');
      }
    } catch (err) {
      console.error('Error buscando artículo:', err);
      alert('Error al buscar artículo');
    }
  };

  const handleSelectArticulo = (articulo: any) => {
    setSelectedArticulo(articulo);
    setArticuloId(articulo.id.toString());
    setArticuloSearchResults([]);
    setArticuloSearchQuery('');
  };

  const handleGenerateReport = async () => {
    if (!articuloId) {
      alert('Debe seleccionar un artículo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await reportService.getParticipationByArticle({
        articulo_id: parseInt(articuloId),
        include_detail: includeDetail,
      });
      setReportData(data);
    } catch (err) {
      setError('Error al generar el reporte. Por favor intente nuevamente.');
      console.error('Error generando reporte:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!articuloId) {
      alert('Debe seleccionar un artículo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const blob = await reportService.downloadParticipationByArticlePDF({
        articulo_id: parseInt(articuloId),
        include_detail: includeDetail,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `participacion_articulo_${articuloId}_${new Date().toISOString().split('T')[0]}.pdf`;
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
          <h2>Participación por Artículo</h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            RF-026: Genere un reporte de participación por artículo.
          </p>

          {/* Artículo (Requerido) */}
          <div className="form-group">
            <label>Artículo (Requerido)</label>

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
                  <br />
                  <small>Número de Publicación: {selectedArticulo.numero_editorial}</small>
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
                    style={{ flex: 1, padding: '10px', fontSize: '16px' }}
                  />
                  <button
                    onClick={handleSearchArticulo}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
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

                {articuloSearchResults.length > 0 && (
                  <div style={{
                    marginTop: '10px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                  }}>
                    {articuloSearchResults.map((articulo) => (
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
                        <br />
                        <small>Número: {articulo.numero_editorial}</small>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Incluir Detalle */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={includeDetail}
                onChange={(e) => setIncludeDetail(e.target.checked)}
              />
              <span style={{ marginLeft: '8px' }}>Incluir detalle de evaluadores</span>
            </label>
            <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
              Mostrar información detallada de cada evaluador
            </small>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading || !articuloId}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isLoading || !articuloId) ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: (isLoading || !articuloId) ? 0.6 : 1
              }}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading || !articuloId}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isLoading || !articuloId) ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: (isLoading || !articuloId) ? 0.6 : 1
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
                <p><strong>Artículo:</strong> {reportData.articulo_titulo}</p>
                <p><strong>Número de Publicación:</strong> {reportData.numero_editorial}</p>
                <p><strong>Total Evaluadores con Dictamen:</strong> {reportData.total_evaluadores_dictamen}</p>
              </div>

              {includeDetail && reportData.evaluadores_detalle && reportData.evaluadores_detalle.length > 0 && (
                <div className="table-responsive">
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '10px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Evaluador</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>ORCID</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Estado Dictamen</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Fecha Entrega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.evaluadores_detalle.map((evaluador, index) => (
                        <tr key={evaluador.evaluador_id} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px' }}>{evaluador.evaluador_nombre}</td>
                          <td style={{ padding: '12px' }}>{evaluador.evaluador_orcid}</td>
                          <td style={{ padding: '12px' }}>{evaluador.estado_dictamen}</td>
                          <td style={{ padding: '12px' }}>
                            {evaluador.fecha_entrega_dictamen
                              ? new Date(evaluador.fecha_entrega_dictamen).toLocaleDateString('es-ES')
                              : 'N/A'}
                          </td>
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

export default ParticipationByArticleReport;
