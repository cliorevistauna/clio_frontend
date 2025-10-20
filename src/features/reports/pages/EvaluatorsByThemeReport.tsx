import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../shared/components/PageHeader';
import ThematicLineSingleSelector from '../../../shared/components/ThematicLineSingleSelector';
import { useAuth } from '../../auth/hooks';
import { ROUTES } from '../../../shared/constants';
import { reportService } from '../services/reportService';
import { EvaluatorsByThemeResponse } from '../types';

const styles = {
  subtitle: { color: '#6c757d', marginBottom: '20px' },
  helperText: { display: 'block', marginTop: '4px', color: '#666' },
  reportActionsContainer: { display: 'flex', gap: '10px', marginTop: '20px' },
  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  primaryButtonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '16px'
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  secondaryButtonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '16px'
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
  tableContainer: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  tableHeaderRow: { backgroundColor: '#f8f9fa' },
  tableHeader: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 600,
    color: '#495057'
  },
  tableRowEven: {
    backgroundColor: 'white'
  },
  tableRowOdd: {
    backgroundColor: '#f8f9fa'
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
  },
  evaluatorDetailText: { display: 'block', marginTop: '4px' },
  evaluatorDetailTextTop: { display: 'block', marginTop: '2px' },
  listContainer: { margin: 0, paddingLeft: '20px' },
  listItem: { marginBottom: '12px' }
} as const;

const EvaluatorsByThemeReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [selectedLineaId, setSelectedLineaId] = useState<number | null>(null);
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
        linea_tematica_id: selectedLineaId,
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
        linea_tematica_id: selectedLineaId,
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
          <p style={styles.subtitle}>
            Visualice estadísticas de evaluadores agrupados por línea temática.
          </p>

          <ThematicLineSingleSelector
            selectedId={selectedLineaId}
            onChange={setSelectedLineaId}
            label="Seleccionar línea temática"
            includeAllOption={true}
            allOptionLabel="Todas las líneas temáticas"
          />

          {reportData && (
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeDetail}
                  onChange={(e) => setIncludeDetail(e.target.checked)}
                />
                <span style={{ marginLeft: '8px' }}>Incluir detalle de evaluadores</span>
              </label>
              <small style={styles.helperText}>
                Mostrar lista completa de evaluadores por cada línea temática
              </small>
            </div>
          )}

          <div style={styles.reportActionsContainer}>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              style={isLoading ? styles.primaryButtonDisabled : styles.primaryButton}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              style={isLoading ? styles.secondaryButtonDisabled : styles.secondaryButton}
            >
              {isLoading ? 'Descargando...' : 'Descargar PDF'}
            </button>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          {reportData && (
            <div style={styles.resultsContainer}>
              <h3>Resultados del Reporte</h3>
              <p><strong>Total de Líneas Temáticas:</strong> {reportData.total_lineas_tematicas}</p>

              <table style={styles.tableContainer}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>
                      Línea Temática
                    </th>
                    <th style={styles.tableHeader}>
                      Total Evaluadores
                    </th>
                    {includeDetail && (
                      <th style={styles.tableHeader}>
                        Detalles
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.estadisticas.map((item, index) => (
                    <tr
                      key={item.linea_tematica_id}
                      style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}
                    >
                      <td style={styles.tableCell}>
                        {item.linea_tematica_nombre}
                      </td>
                      <td style={styles.tableCell}>
                        {item.total_evaluadores}
                      </td>
                      {includeDetail && (
                        <td style={styles.tableCell}>
                          {item.evaluadores && item.evaluadores.length > 0 ? (
                            <ul style={styles.listContainer}>
                              {item.evaluadores.map((evaluador) => (
                                <li key={evaluador.id} style={styles.listItem}>
                                  <strong>{evaluador.nombre_completo}</strong>
                                  <br />
                                  <small style={styles.evaluatorDetailText}>
                                    <strong>Universidad:</strong> {evaluador.afiliacion || 'N/A'}
                                  </small>
                                  <small style={styles.evaluatorDetailTextTop}>
                                    <strong>Idiomas:</strong> {evaluador.idiomas || 'N/A'}
                                  </small>
                                  <small style={styles.evaluatorDetailTextTop}>
                                    <strong>Teléfono:</strong> {evaluador.telefono || 'N/A'}
                                  </small>
                                  <small style={styles.evaluatorDetailTextTop}>
                                    <strong>Correo:</strong> {evaluador.correo || 'N/A'}
                                  </small>
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
