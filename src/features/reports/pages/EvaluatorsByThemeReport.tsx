import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../shared/components/PageHeader';
import { useAuth } from '../../auth/hooks';
import { ROUTES } from '../../../shared/constants';
import { reportService } from '../services/reportService';
import { EvaluatorsByThemeResponse } from '../types';

const EvaluatorsByThemeReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [includeDetail, setIncludeDetail] = useState(false);
  const [reportData, setReportData] = useState<EvaluatorsByThemeResponse | null>(null);
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

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await reportService.getEvaluatorsByTheme({
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
    setIsLoading(true);
    setError(null);

    try {
      const blob = await reportService.downloadEvaluatorsByThemePDF({
        include_detail: includeDetail,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `evaluadores_por_linea_tematica_${new Date().toISOString().split('T')[0]}.pdf`;
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
          <h2>Estadísticas de Evaluadores por Línea Temática</h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            RF-023: Visualice estadísticas de evaluadores agrupados por línea temática.
          </p>

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
              Mostrar lista completa de evaluadores por cada línea temática
            </small>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
              }}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
              }}
            >
              {isLoading ? 'Descargando...' : 'Descargar PDF'}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: '#f8d7da',
              color: '#842029',
              border: '1px solid #f5c2c7',
              borderRadius: '4px',
            }}>
              {error}
            </div>
          )}

          {reportData && (
            <div style={{ marginTop: '30px' }}>
              <h3>Resultados del Reporte</h3>
              <p><strong>Total de Líneas Temáticas:</strong> {reportData.total_lineas_tematicas}</p>

              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 600,
                      color: '#495057',
                    }}>
                      Línea Temática
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 600,
                      color: '#495057',
                    }}>
                      Total Evaluadores
                    </th>
                    {includeDetail && (
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #dee2e6',
                        fontWeight: 600,
                        color: '#495057',
                      }}>
                        Detalles
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.estadisticas.map((item, index) => (
                    <tr
                      key={item.linea_tematica_id}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      }}
                    >
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #dee2e6',
                      }}>
                        {item.linea_tematica_nombre}
                      </td>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #dee2e6',
                      }}>
                        {item.total_evaluadores}
                      </td>
                      {includeDetail && (
                        <td style={{
                          padding: '12px',
                          borderBottom: '1px solid #dee2e6',
                        }}>
                          {item.evaluadores && item.evaluadores.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                              {item.evaluadores.map((evaluador) => (
                                <li key={evaluador.id} style={{ marginBottom: '8px' }}>
                                  {evaluador.nombre_completo} - {evaluador.orcid}
                                  <br />
                                  <small>{evaluador.afiliacion} ({evaluador.grado_academico})</small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <em>Sin evaluadores</em>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EvaluatorsByThemeReport;
