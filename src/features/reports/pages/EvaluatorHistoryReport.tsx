import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import { useAuth } from "../../auth/hooks";
import { ROUTES } from "../../../shared/constants";
import { reportService } from "../services";
import { EvaluatorHistoryResponse } from "../types";
import { researcherService } from "../../researchers/services";
import { Researcher } from "../../researchers/types";
import { editorialNumberService } from "../../editorial-numbers/services";
import { EditorialNumber } from "../../editorial-numbers/types";
import { backendToFrontendDate } from "../../../shared/utils/dateUtils";

const styles = {
  activeTabButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontWeight: 'bold' as const
  },
  articuloSearchButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontSize: '16px'
  },
  articuloSearchButtonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed' as const,
    fontSize: '16px',
    opacity: 0.6
  },
  clearButton: {
    marginLeft: '10px',
    padding: '4px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontSize: '0.85rem'
  },
  clearSelectionContainer: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#721c24',
    cursor: 'pointer' as const,
    fontSize: '1.2rem',
    padding: '0 10px'
  },
  disabledPaginationButton: {
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: '#e9ecef',
    borderRadius: '4px',
    cursor: 'not-allowed' as const,
    fontSize: '14px'
  },
  downloadButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontWeight: '500' as const,
    opacity: 1
  },
  downloadButtonDisabled: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed' as const,
    fontWeight: '500' as const,
    opacity: 0.6
  },
  editorialSearchButton: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const
  },
  editorialSearchButtonDisabled: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed' as const
  },
  ellipsis: {
    padding: '8px'
  },
  evaluatorSearchButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const
  },
  evaluatorSearchButtonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed' as const
  },
  evaluatorSearchInput: {
    flex: 1,
    padding: '10px',
    fontSize: '16px'
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  filterInput: {
    flex: 1,
    padding: '8px'
  },
  generateButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontWeight: '500' as const,
    opacity: 1
  },
  generateButtonDisabled: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed' as const,
    fontWeight: '500' as const,
    opacity: 0.6
  },
  helperText: {
    color: '#6c757d',
    display: 'block',
    marginTop: '10px'
  },
  inactiveTabButton: {
    padding: '8px 16px',
    backgroundColor: '#e9ecef',
    color: '#495057',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontWeight: 'normal' as const
  },
  infoNote: {
    padding: '10px',
    backgroundColor: '#e7f3ff',
    border: '1px solid #b3d9ff',
    borderRadius: '4px',
    marginBottom: '10px',
    color: '#004085',
    fontSize: '13px'
  },
  itemsPerPageSelect: {
    padding: '5px 8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer' as const
  },
  loadAllButton: {
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
  loadingText: {
    textAlign: 'center' as const,
    padding: '20px'
  },
  loadingTextLarge: {
    fontSize: '1.2rem',
    color: '#007bff'
  },
  loadingTextSmall: {
    color: '#6c757d'
  },
  noResultsText: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#6c757d'
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #ced4da',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    fontSize: '14px',
    fontWeight: 'normal' as const
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
    marginBottom: '10px',
    gap: '8px'
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#6c757d'
  },
  paginationInfoContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  paginationLabel: {
    fontSize: '14px'
  },
  reportActionsContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  reportSummary: {
    padding: '15px',
    backgroundColor: '#e7f3ff',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  resultsContainer: {
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  searchResultContainer: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  searchResultItem: {
    padding: '10px',
    cursor: 'pointer' as const,
    borderBottom: '1px solid #dee2e6',
    backgroundColor: 'white'
  },
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
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem'
  },
  statusBadgeAceptado: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  statusBadgeInvitado: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    backgroundColor: '#d1ecf1',
    color: '#0c5460'
  },
  statusBadgeOther: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    backgroundColor: '#e2e3e5',
    color: '#383d41'
  },
  statusBadgeRechazado: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    backgroundColor: '#f8d7da',
    color: '#721c24'
  },
  subtitle: {
    color: '#6c757d',
    marginBottom: '20px'
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  tableCell: {
    padding: '12px'
  },
  tableContainer: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '10px'
  },
  tableHeader: {
    padding: '12px',
    borderBottom: '2px solid #dee2e6',
    textAlign: 'left' as const
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa'
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6'
  }
};

/**
 * RF-022: Reporte histórico de evaluaciones por evaluador
 */
const EvaluatorHistoryReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Búsqueda de evaluador
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Researcher[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState<Researcher | null>(null);

  // Filtro de números editoriales
  const [selectedEditorialNumbers, setSelectedEditorialNumbers] = useState<number[]>([]);

  // Búsqueda de números editoriales
  const [editorialSearchMode, setEditorialSearchMode] = useState<'search' | 'table'>('search');
  const [searchNumero, setSearchNumero] = useState("");
  const [searchAnio, setSearchAnio] = useState("");
  const [editorialSearchResults, setEditorialSearchResults] = useState<EditorialNumber[]>([]);
  const [isSearchingEditorial, setIsSearchingEditorial] = useState(false);

  // Para la tabla de todos los números
  const [allEditorialNumbers, setAllEditorialNumbers] = useState<EditorialNumber[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  // Estados para paginación de búsqueda de evaluadores
  const [evaluatorCurrentPage, setEvaluatorCurrentPage] = useState(1);
  const [evaluatorItemsPerPage, setEvaluatorItemsPerPage] = useState(10);

  // Estados para paginación de búsqueda específica
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchItemsPerPage, setSearchItemsPerPage] = useState(10);

  // Estados para paginación de la tabla
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [tableItemsPerPage, setTableItemsPerPage] = useState(10);

  // Resultados del reporte
  const [reportData, setReportData] = useState<EvaluatorHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar tabla de números editoriales (solo cuando se selecciona la pestaña)
  const loadAllEditorialNumbers = async () => {
    setIsLoadingTable(true);
    try {
      const numbers = await editorialNumberService.getAll({ includeInactive: true });
      setAllEditorialNumbers(numbers);
    } catch (error) {
      console.error("Error al cargar números editoriales:", error);
      alert("Error al cargar la tabla de números editoriales.");
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Buscar número editorial específico
  const handleSearchEditorial = async () => {
    if (!searchNumero.trim()) {
      alert("Por favor, ingrese el número de publicación a buscar.");
      return;
    }

    const numeroInt = parseInt(searchNumero);
    if (isNaN(numeroInt) || numeroInt <= 0) {
      alert("Ingrese un número válido.");
      return;
    }

    setIsSearchingEditorial(true);
    try {
      const anioInt = searchAnio ? parseInt(searchAnio) : undefined;
      const results = await editorialNumberService.searchByNumber(numeroInt, anioInt);

      if (results.length === 0) {
        alert("No se encontraron números de publicación con esos criterios.");
        setEditorialSearchResults([]);
      } else {
        setEditorialSearchResults(results);
        setSearchCurrentPage(1); // Resetear a página 1 al hacer nueva búsqueda
        if (results.length === 1) {
          alert(`Se encontró el número de publicación ${results[0].numero}-${results[0].anio}`);
        } else {
          alert(`Se encontraron ${results.length} resultados. Seleccione los que desee filtrar.`);
        }
      }
    } catch (error) {
      console.error("Error en búsqueda de número editorial:", error);
      alert("Error al buscar el número de publicación.");
      setEditorialSearchResults([]);
    } finally {
      setIsSearchingEditorial(false);
    }
  };

  // Lógica de paginación para búsqueda de evaluadores
  const evaluatorTotalPages = Math.ceil(searchResults.length / evaluatorItemsPerPage);
  const evaluatorStartIndex = (evaluatorCurrentPage - 1) * evaluatorItemsPerPage;
  const evaluatorEndIndex = evaluatorStartIndex + evaluatorItemsPerPage;
  const currentEvaluatorResults = searchResults.slice(evaluatorStartIndex, evaluatorEndIndex);

  const handleEvaluatorItemsPerPageChange = (value: number) => {
    setEvaluatorItemsPerPage(value);
    setEvaluatorCurrentPage(1);
  };

  // Lógica de paginación para búsqueda específica
  const searchTotalPages = Math.ceil(editorialSearchResults.length / searchItemsPerPage);
  const searchStartIndex = (searchCurrentPage - 1) * searchItemsPerPage;
  const searchEndIndex = searchStartIndex + searchItemsPerPage;
  const currentSearchResults = editorialSearchResults.slice(searchStartIndex, searchEndIndex);

  const handleSearchItemsPerPageChange = (value: number) => {
    setSearchItemsPerPage(value);
    setSearchCurrentPage(1);
  };

  // Lógica de paginación para la tabla
  const tableTotalPages = Math.ceil(allEditorialNumbers.length / tableItemsPerPage);
  const tableStartIndex = (tableCurrentPage - 1) * tableItemsPerPage;
  const tableEndIndex = tableStartIndex + tableItemsPerPage;
  const currentTableNumbers = allEditorialNumbers.slice(tableStartIndex, tableEndIndex);

  const handleTableItemsPerPageChange = (value: number) => {
    setTableItemsPerPage(value);
    setTableCurrentPage(1);
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Por favor, ingrese un término de búsqueda");
      return;
    }

    setIsSearching(true);
    try {
      // Incluir investigadores inactivos en la búsqueda para reportes históricos
      const results = await researcherService.search(searchTerm, { includeInactive: true });
      console.log('Resultados de búsqueda de evaluadores:', results);
      setSearchResults(results);
      setEvaluatorCurrentPage(1); // Resetear a página 1 al hacer nueva búsqueda

      if (results.length === 0) {
        alert("No se encontraron evaluadores con ese criterio.");
      }
    } catch (error) {
      console.error("Error al buscar evaluadores:", error);
      alert("Error al buscar evaluadores. Por favor, intente nuevamente.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEvaluator = (evaluator: Researcher) => {
    console.log('Evaluador seleccionado:', evaluator);
    console.log('ID del evaluador:', evaluator.id);
    setSelectedEvaluator(evaluator);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleToggleEditorialNumber = (id: number) => {
    setSelectedEditorialNumbers(prev =>
      prev.includes(id)
        ? prev.filter(n => n !== id)
        : [...prev, id]
    );
  };

  const handleGenerateReport = async () => {
    console.log('handleGenerateReport - selectedEvaluator:', selectedEvaluator);

    if (!selectedEvaluator || !selectedEvaluator.id) {
      alert("Debe seleccionar un evaluador");
      return;
    }

    setIsLoading(true);
    try {
      const evaluadorId = parseInt(selectedEvaluator.id);
      console.log('Generando reporte con evaluador_id:', evaluadorId);
      const data = await reportService.getEvaluatorHistory({
        evaluador_id: evaluadorId,
        numero_editorial_id: selectedEditorialNumbers.length > 0 ? selectedEditorialNumbers : undefined,
      });
      setReportData(data);
    } catch (error) {
      console.error("Error al generar reporte:", error);
      alert("Error al generar el reporte. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedEvaluator || !selectedEvaluator.id) {
      alert("Debe seleccionar un evaluador");
      return;
    }

    try {
      const evaluadorId = parseInt(selectedEvaluator.id);
      const blob = await reportService.downloadEvaluatorHistoryPDF({
        evaluador_id: evaluadorId,
        numero_editorial_id: selectedEditorialNumbers.length > 0 ? selectedEditorialNumbers : undefined,
        formato: 'pdf',
      });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historico_evaluaciones_${selectedEvaluator.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Error al descargar el PDF. Por favor, intente nuevamente.");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return backendToFrontendDate(dateString);
  };

  const getEstadoComunicacionLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'invitado': 'Invitado',
      'aceptado': 'Aceptado',
      'rechazado': 'Rechazado',
      'sin_respuesta': 'Sin Respuesta',
    };
    return labels[estado] || estado;
  };

  const getEstadoDictamenLabel = (estado: string | null) => {
    if (!estado) return 'Sin dictamen';
    const labels: Record<string, string> = {
      'aceptado': 'Aceptado',
      'rechazado': 'Rechazado',
    };
    return labels[estado] || estado;
  };

  return (
    <div className="app-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">
          <h2>Histórico de Evaluaciones por Evaluador</h2>
          <p style={styles.subtitle}>
            Genere un reporte histórico de las evaluaciones realizadas por un evaluador específico.
          </p>

          {/* Sección de búsqueda de evaluador */}
          <div className="form-group">
            <label>Buscar Evaluador *</label>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar por nombre, ORCID, correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isSearching}
                style={styles.evaluatorSearchInput}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                style={isSearching ? styles.evaluatorSearchButtonDisabled : styles.evaluatorSearchButton}
              >
                {isSearching ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {/* Evaluador seleccionado */}
            {selectedEvaluator && (
              <div style={styles.selectedBadge}>
                <span>
                  <strong>{selectedEvaluator.name}</strong>
                  {' '}- {selectedEvaluator.orcid} - {selectedEvaluator.affiliation}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEvaluator(null)}
                  style={styles.closeButton}
                >
                  ×
                </button>
              </div>
            )}

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div>
                {/* Controles de paginación superior */}
                <div style={styles.paginationInfoContainer}>
                  <div style={styles.paginationInfo}>
                    Mostrando {evaluatorStartIndex + 1} a {Math.min(evaluatorEndIndex, searchResults.length)} de {searchResults.length} evaluadores
                  </div>
                  <div style={styles.paginationControls}>
                    <span style={styles.paginationLabel}>Mostrar:</span>
                    <select
                      value={evaluatorItemsPerPage}
                      onChange={(e) => handleEvaluatorItemsPerPageChange(Number(e.target.value))}
                      style={styles.itemsPerPageSelect}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span style={styles.paginationLabel}>por página</span>
                  </div>
                </div>

                <div style={styles.resultsContainer}>
                  {currentEvaluatorResults.map((researcher) => (
                    <div
                      key={researcher.id}
                      onClick={() => handleSelectEvaluator(researcher)}
                      style={styles.searchResultItem}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <strong>{researcher.name}</strong>
                      <br />
                      <small>{researcher.orcid} - {researcher.affiliation}</small>
                    </div>
                  ))}
                </div>

                {/* Controles de paginación inferior */}
                {evaluatorTotalPages > 1 && (
                  <div style={styles.paginationContainer}>
                    <button onClick={() => setEvaluatorCurrentPage(1)} disabled={evaluatorCurrentPage === 1} style={evaluatorCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Primera</button>
                    <button onClick={() => setEvaluatorCurrentPage(prev => Math.max(1, prev - 1))} disabled={evaluatorCurrentPage === 1} style={evaluatorCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Anterior</button>
                    {Array.from({ length: evaluatorTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === evaluatorTotalPages || Math.abs(page - evaluatorCurrentPage) <= 2).map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (<React.Fragment key={page}>{showEllipsis && <span style={styles.ellipsis}>...</span>}<button onClick={() => setEvaluatorCurrentPage(page)} style={evaluatorCurrentPage === page ? styles.pageButtonActive : styles.pageButton}>{page}</button></React.Fragment>);
                    })}
                    <button onClick={() => setEvaluatorCurrentPage(prev => Math.min(evaluatorTotalPages, prev + 1))} disabled={evaluatorCurrentPage === evaluatorTotalPages} style={evaluatorCurrentPage === evaluatorTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Siguiente</button>
                    <button onClick={() => setEvaluatorCurrentPage(evaluatorTotalPages)} disabled={evaluatorCurrentPage === evaluatorTotalPages} style={evaluatorCurrentPage === evaluatorTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Última</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filtro de números editoriales */}
          <div className="form-group">
            <label>Filtrar por Números de Publicación (Opcional)</label>

            {/* Pestañas para método de selección */}
            <div style={styles.tabContainer}>
              <button
                type="button"
                onClick={() => setEditorialSearchMode('search')}
                style={editorialSearchMode === 'search' ? styles.activeTabButton : styles.inactiveTabButton}
              >
                Búsqueda Específica
              </button>
              <button
                type="button"
                onClick={() => setEditorialSearchMode('table')}
                style={editorialSearchMode === 'table' ? styles.activeTabButton : styles.inactiveTabButton}
              >
                Ver Todos (Tabla)
              </button>
            </div>

            {/* Búsqueda específica */}
            {editorialSearchMode === 'search' && (
              <div>
                <div style={styles.filterContainer}>
                  <input
                    type="number"
                    placeholder="Número"
                    value={searchNumero}
                    onChange={(e) => setSearchNumero(e.target.value)}
                    disabled={isSearchingEditorial}
                    min="1"
                    style={styles.filterInput}
                  />
                  <input
                    type="number"
                    placeholder="Año (opcional)"
                    value={searchAnio}
                    onChange={(e) => setSearchAnio(e.target.value)}
                    disabled={isSearchingEditorial}
                    min="1900"
                    max={new Date().getFullYear()}
                    style={styles.filterInput}
                  />
                  <button
                    type="button"
                    onClick={handleSearchEditorial}
                    disabled={isSearchingEditorial}
                    style={isSearchingEditorial ? styles.editorialSearchButtonDisabled : styles.editorialSearchButton}
                  >
                    {isSearchingEditorial ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {/* Resultados de búsqueda */}
                {editorialSearchResults.length > 0 && (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={styles.paginationInfoContainer}>
                      <div style={styles.paginationInfo}>
                        Mostrando {searchStartIndex + 1} a {Math.min(searchEndIndex, editorialSearchResults.length)} de {editorialSearchResults.length} resultados
                      </div>
                      <div style={styles.paginationControls}>
                        <span style={styles.paginationLabel}>Mostrar:</span>
                        <select
                          value={searchItemsPerPage}
                          onChange={(e) => handleSearchItemsPerPageChange(Number(e.target.value))}
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
                      <strong>Resultados de búsqueda:</strong>
                      {currentSearchResults.map(en => (
                        <label key={en.id} style={{ display: 'block', marginTop: '8px' }}>
                          <input
                            type="checkbox"
                            checked={selectedEditorialNumbers.includes(en.id)}
                            onChange={() => handleToggleEditorialNumber(en.id)}
                            style={{ marginRight: '10px' }}
                          />
                          Número {en.numero} - Año {en.anio} ({en.estado})
                        </label>
                      ))}
                    </div>

                    {/* Controles de paginación inferior */}
                    {searchTotalPages > 1 && (
                      <div style={styles.paginationContainer}>
                        <button onClick={() => setSearchCurrentPage(1)} disabled={searchCurrentPage === 1} style={searchCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Primera</button>
                        <button onClick={() => setSearchCurrentPage(prev => Math.max(1, prev - 1))} disabled={searchCurrentPage === 1} style={searchCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Anterior</button>
                        {Array.from({ length: searchTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === searchTotalPages || Math.abs(page - searchCurrentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={styles.ellipsis}>...</span>}<button onClick={() => setSearchCurrentPage(page)} style={searchCurrentPage === page ? styles.pageButtonActive : styles.pageButton}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setSearchCurrentPage(prev => Math.min(searchTotalPages, prev + 1))} disabled={searchCurrentPage === searchTotalPages} style={searchCurrentPage === searchTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Siguiente</button>
                        <button onClick={() => setSearchCurrentPage(searchTotalPages)} disabled={searchCurrentPage === searchTotalPages} style={searchCurrentPage === searchTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Última</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tabla con todos los números */}
            {editorialSearchMode === 'table' && (
              <div>
                <div style={styles.infoNote}>
                  ℹ️ <strong>Nota:</strong> Esta opción carga todos los registros. Puede tomar unos segundos.
                </div>

                {/* Botón para cargar la tabla */}
                {!isLoadingTable && allEditorialNumbers.length === 0 && (
                  <button
                    type="button"
                    onClick={loadAllEditorialNumbers}
                    style={styles.loadAllButton}
                  >
                    Cargar Todos los Números de Publicación
                  </button>
                )}

                {/* Tabla con los números */}
                {isLoadingTable ? (
                  <div style={styles.loadingText}>
                    <div style={styles.loadingTextLarge}>Cargando...</div>
                    <small style={styles.loadingTextSmall}>Por favor espere mientras se cargan los datos</small>
                  </div>
                ) : allEditorialNumbers.length > 0 ? (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={styles.paginationInfoContainer}>
                      <div style={styles.paginationInfo}>
                        Mostrando {tableStartIndex + 1} a {Math.min(tableEndIndex, allEditorialNumbers.length)} de {allEditorialNumbers.length} números editoriales
                      </div>
                      <div style={styles.paginationControls}>
                        <span style={styles.paginationLabel}>Mostrar:</span>
                        <select
                          value={tableItemsPerPage}
                          onChange={(e) => handleTableItemsPerPageChange(Number(e.target.value))}
                          style={styles.itemsPerPageSelect}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        <span style={styles.paginationLabel}>por página</span>
                      </div>
                    </div>

                    <div style={{
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      marginBottom: '10px'
                    }}>
                      {currentTableNumbers.map(en => (
                        <label key={en.id} style={{ display: 'block', marginBottom: '5px' }}>
                          <input
                            type="checkbox"
                            checked={selectedEditorialNumbers.includes(en.id)}
                            onChange={() => handleToggleEditorialNumber(en.id)}
                            style={{ marginRight: '10px' }}
                          />
                          Número {en.numero} - Año {en.anio} ({en.estado})
                        </label>
                      ))}
                    </div>

                    {/* Controles de paginación inferior */}
                    {tableTotalPages > 1 && (
                      <div style={styles.paginationContainer}>
                        <button onClick={() => setTableCurrentPage(1)} disabled={tableCurrentPage === 1} style={tableCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Primera</button>
                        <button onClick={() => setTableCurrentPage(prev => Math.max(1, prev - 1))} disabled={tableCurrentPage === 1} style={tableCurrentPage === 1 ? styles.disabledPaginationButton : styles.pageButton}>Anterior</button>
                        {Array.from({ length: tableTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === tableTotalPages || Math.abs(page - tableCurrentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={styles.ellipsis}>...</span>}<button onClick={() => setTableCurrentPage(page)} style={tableCurrentPage === page ? styles.pageButtonActive : styles.pageButton}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setTableCurrentPage(prev => Math.min(tableTotalPages, prev + 1))} disabled={tableCurrentPage === tableTotalPages} style={tableCurrentPage === tableTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Siguiente</button>
                        <button onClick={() => setTableCurrentPage(tableTotalPages)} disabled={tableCurrentPage === tableTotalPages} style={tableCurrentPage === tableTotalPages ? styles.disabledPaginationButton : styles.pageButton}>Última</button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Números seleccionados */}
            {selectedEditorialNumbers.length > 0 && (
              <div style={styles.clearSelectionContainer}>
                <strong>Números seleccionados:</strong> {selectedEditorialNumbers.length}
                <button
                  type="button"
                  onClick={() => setSelectedEditorialNumbers([])}
                  style={styles.clearButton}
                >
                  Limpiar selección
                </button>
              </div>
            )}

            <small style={styles.helperText}>
              Seleccione uno o varios números editoriales para filtrar. Si no selecciona ninguno, se mostrarán todas las evaluaciones.
            </small>
          </div>

          {/* Botones de acción */}
          <div style={styles.reportActionsContainer}>
            <button
              onClick={handleGenerateReport}
              disabled={!selectedEvaluator || isLoading}
              style={(!selectedEvaluator || isLoading) ? styles.generateButtonDisabled : styles.generateButton}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!selectedEvaluator}
              style={!selectedEvaluator ? styles.downloadButtonDisabled : styles.downloadButton}
            >
              Descargar PDF
            </button>
          </div>

          {/* Resultados del reporte */}
          {reportData && (
            <div style={{ marginTop: '30px' }}>
              <h3>Resultados del Reporte</h3>
              <div style={styles.reportSummary}>
                <p><strong>Evaluador:</strong> {reportData.evaluador.nombre}</p>
                <p><strong>ORCID:</strong> {reportData.evaluador.orcid}</p>
                <p><strong>Total de Evaluaciones:</strong> {reportData.total_evaluaciones}</p>
              </div>

              {reportData.evaluaciones.length > 0 ? (
                <div className="table-responsive">
                  <table style={styles.tableContainer}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableHeader}>Artículo</th>
                        <th style={styles.tableHeader}>Nº Publicación</th>
                        <th style={styles.tableHeader}>Fecha Asignación</th>
                        <th style={styles.tableHeader}>Estado Invitación</th>
                        <th style={styles.tableHeader}>Dictamen</th>
                        <th style={styles.tableHeader}>Fecha Entrega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.evaluaciones.map((item, index) => (
                        <tr key={index} style={styles.tableRow}>
                          <td style={styles.tableCell}>{item.articulo_titulo}</td>
                          <td style={styles.tableCell}>{item.numero_editorial}</td>
                          <td style={styles.tableCell}>{formatDate(item.fecha_asignacion)}</td>
                          <td style={styles.tableCell}>
                            <span style={
                              item.estado_comunicacion === 'aceptado' ? styles.statusBadgeAceptado :
                              item.estado_comunicacion === 'rechazado' ? styles.statusBadgeRechazado :
                              item.estado_comunicacion === 'invitado' ? styles.statusBadgeInvitado :
                              styles.statusBadgeOther
                            }>
                              {getEstadoComunicacionLabel(item.estado_comunicacion)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={
                              item.estado_dictamen === 'aceptado' ? styles.statusBadgeAceptado :
                              item.estado_dictamen === 'rechazado' ? styles.statusBadgeRechazado :
                              styles.statusBadgeOther
                            }>
                              {getEstadoDictamenLabel(item.estado_dictamen)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>{formatDate(item.fecha_entrega_dictamen)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={styles.noResultsText}>
                  No se encontraron evaluaciones para este evaluador con los filtros seleccionados.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EvaluatorHistoryReport;
