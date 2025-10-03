import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../shared/components/PageHeader';
import { useAuth } from '../../auth/hooks';
import { ROUTES } from '../../../shared/constants';
import { reportService } from '../services/reportService';
import { EvaluatorWorkloadResponse } from '../types';
import { researcherService } from '../../researchers/services/researcherService';
import { Researcher } from '../../researchers/types';

/**
 * RF-024: Reporte de carga de trabajo de evaluadores
 */
const EvaluatorWorkloadReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [evaluadorId, setEvaluadorId] = useState<string>('');
  const [evaluadorSearchQuery, setEvaluadorSearchQuery] = useState('');
  const [evaluadorSearchResults, setEvaluadorSearchResults] = useState<Researcher[]>([]);
  const [selectedEvaluador, setSelectedEvaluador] = useState<Researcher | null>(null);

  const [reportData, setReportData] = useState<EvaluatorWorkloadResponse | null>(null);
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

  const handleSearchEvaluador = async () => {
    if (!evaluadorSearchQuery.trim()) {
      alert('Por favor ingrese un término de búsqueda');
      return;
    }

    try {
      const results = await researcherService.search(evaluadorSearchQuery);
      setEvaluadorSearchResults(results);
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
      const data = await reportService.getEvaluatorWorkload(params);
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
      const blob = await reportService.downloadEvaluatorWorkloadPDF(params);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carga_trabajo_evaluadores_${new Date().toISOString().split('T')[0]}.pdf`;
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
          <h2>Carga de Trabajo de Evaluadores</h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            RF-024: Visualice la carga de trabajo de los evaluadores en el sistema.
          </p>

          {/* Sección de búsqueda de evaluador */}
          <div className="form-group">
            <label>Evaluador (Opcional)</label>
            <small style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
              Dejar vacío para ver todos los evaluadores
            </small>

            {selectedEvaluador ? (
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
                    placeholder="Buscar por nombre, ORCID, correo..."
                    value={evaluadorSearchQuery}
                    onChange={(e) => setEvaluadorSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchEvaluador()}
                    style={{ flex: 1, padding: '10px', fontSize: '16px' }}
                  />
                  <button
                    onClick={handleSearchEvaluador}
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

                {evaluadorSearchResults.length > 0 && (
                  <div style={{
                    marginTop: '10px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                  }}>
                    {evaluadorSearchResults.map((evaluador) => (
                      <div
                        key={evaluador.id}
                        onClick={() => handleSelectEvaluador(evaluador)}
                        style={{
                          padding: '10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #dee2e6',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <strong>{evaluador.name}</strong>
                        <br />
                        <small>{evaluador.orcid} - {evaluador.affiliation}</small>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: isLoading ? 0.6 : 1
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
                <p><strong>Total de Evaluadores:</strong> {reportData.total_evaluadores}</p>
              </div>

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
                      <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Total Dictámenes</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Números de Publicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.carga_trabajo.map((item, index) => (
                      <tr key={item.evaluador_id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>{item.evaluador_nombre}</td>
                        <td style={{ padding: '12px' }}>{item.evaluador_orcid}</td>
                        <td style={{ padding: '12px' }}>{item.total_dictamenes}</td>
                        <td style={{ padding: '12px' }}>{item.numeros_editoriales.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EvaluatorWorkloadReport;
