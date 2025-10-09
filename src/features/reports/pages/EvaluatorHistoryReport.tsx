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
  const [confirmLoadTable, setConfirmLoadTable] = useState(false);

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
      const numbers = await editorialNumberService.getAll();
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
      const results = await researcherService.search(searchTerm);
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
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            RF-022: Genere un reporte histórico de las evaluaciones realizadas por un evaluador específico.
          </p>

          {/* Sección de búsqueda de evaluador */}
          <div className="form-group">
            <label>Buscar Evaluador *</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Buscar por nombre, ORCID, correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isSearching}
                style={{ flex: 1, padding: '10px', fontSize: '16px' }}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                }}
              >
                {isSearching ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {/* Evaluador seleccionado */}
            {selectedEvaluator && (
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
                  <strong>{selectedEvaluator.name}</strong>
                  {' '}- {selectedEvaluator.orcid} - {selectedEvaluator.affiliation}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEvaluator(null)}
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
            )}

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
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
                    Mostrando {evaluatorStartIndex + 1} a {Math.min(evaluatorEndIndex, searchResults.length)} de {searchResults.length} evaluadores
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px' }}>Mostrar:</span>
                    <select
                      value={evaluatorItemsPerPage}
                      onChange={(e) => handleEvaluatorItemsPerPageChange(Number(e.target.value))}
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
                  {currentEvaluatorResults.map((researcher) => (
                    <div
                      key={researcher.id}
                      onClick={() => handleSelectEvaluator(researcher)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: 'white'
                      }}
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
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '10px',
                    gap: '8px'
                  }}>
                    <button onClick={() => setEvaluatorCurrentPage(1)} disabled={evaluatorCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: evaluatorCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: evaluatorCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Primera</button>
                    <button onClick={() => setEvaluatorCurrentPage(prev => Math.max(1, prev - 1))} disabled={evaluatorCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: evaluatorCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: evaluatorCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Anterior</button>
                    {Array.from({ length: evaluatorTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === evaluatorTotalPages || Math.abs(page - evaluatorCurrentPage) <= 2).map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (<React.Fragment key={page}>{showEllipsis && <span style={{ padding: '8px' }}>...</span>}<button onClick={() => setEvaluatorCurrentPage(page)} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: evaluatorCurrentPage === page ? '#007bff' : 'white', color: evaluatorCurrentPage === page ? 'white' : '#495057', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: evaluatorCurrentPage === page ? 'bold' : 'normal' }}>{page}</button></React.Fragment>);
                    })}
                    <button onClick={() => setEvaluatorCurrentPage(prev => Math.min(evaluatorTotalPages, prev + 1))} disabled={evaluatorCurrentPage === evaluatorTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: evaluatorCurrentPage === evaluatorTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: evaluatorCurrentPage === evaluatorTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Siguiente</button>
                    <button onClick={() => setEvaluatorCurrentPage(evaluatorTotalPages)} disabled={evaluatorCurrentPage === evaluatorTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: evaluatorCurrentPage === evaluatorTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: evaluatorCurrentPage === evaluatorTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Última</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filtro de números editoriales */}
          <div className="form-group">
            <label>Filtrar por Números de Publicación (Opcional)</label>

            {/* Pestañas para método de selección */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setEditorialSearchMode('search')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: editorialSearchMode === 'search' ? '#007bff' : '#e9ecef',
                  color: editorialSearchMode === 'search' ? 'white' : '#495057',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: editorialSearchMode === 'search' ? 'bold' : 'normal'
                }}
              >
                Búsqueda Específica
              </button>
              <button
                type="button"
                onClick={() => setEditorialSearchMode('table')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: editorialSearchMode === 'table' ? '#007bff' : '#e9ecef',
                  color: editorialSearchMode === 'table' ? 'white' : '#495057',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: editorialSearchMode === 'table' ? 'bold' : 'normal'
                }}
              >
                Ver Todos (Tabla)
              </button>
            </div>

            {/* Búsqueda específica */}
            {editorialSearchMode === 'search' && (
              <div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="number"
                    placeholder="Número"
                    value={searchNumero}
                    onChange={(e) => setSearchNumero(e.target.value)}
                    disabled={isSearchingEditorial}
                    style={{ flex: 1, padding: '8px' }}
                  />
                  <input
                    type="number"
                    placeholder="Año (opcional)"
                    value={searchAnio}
                    onChange={(e) => setSearchAnio(e.target.value)}
                    disabled={isSearchingEditorial}
                    style={{ flex: 1, padding: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={handleSearchEditorial}
                    disabled={isSearchingEditorial}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isSearchingEditorial ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSearchingEditorial ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {/* Resultados de búsqueda */}
                {editorialSearchResults.length > 0 && (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Mostrando {searchStartIndex + 1} a {Math.min(searchEndIndex, editorialSearchResults.length)} de {editorialSearchResults.length} resultados
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px' }}>Mostrar:</span>
                        <select
                          value={searchItemsPerPage}
                          onChange={(e) => handleSearchItemsPerPageChange(Number(e.target.value))}
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
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}>
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
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10px',
                        gap: '8px'
                      }}>
                        <button onClick={() => setSearchCurrentPage(1)} disabled={searchCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: searchCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: searchCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Primera</button>
                        <button onClick={() => setSearchCurrentPage(prev => Math.max(1, prev - 1))} disabled={searchCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: searchCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: searchCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Anterior</button>
                        {Array.from({ length: searchTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === searchTotalPages || Math.abs(page - searchCurrentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={{ padding: '8px' }}>...</span>}<button onClick={() => setSearchCurrentPage(page)} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: searchCurrentPage === page ? '#007bff' : 'white', color: searchCurrentPage === page ? 'white' : '#495057', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: searchCurrentPage === page ? 'bold' : 'normal' }}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setSearchCurrentPage(prev => Math.min(searchTotalPages, prev + 1))} disabled={searchCurrentPage === searchTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: searchCurrentPage === searchTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: searchCurrentPage === searchTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Siguiente</button>
                        <button onClick={() => setSearchCurrentPage(searchTotalPages)} disabled={searchCurrentPage === searchTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: searchCurrentPage === searchTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: searchCurrentPage === searchTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Última</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tabla con todos los números */}
            {editorialSearchMode === 'table' && (
              <div>
                <div style={{
                  padding: '10px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  color: '#856404'
                }}>
                  ⚠️ <strong>Advertencia:</strong> Cargar todos los números editoriales consume más recursos del sistema.
                </div>

                {/* Checkbox de confirmación */}
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={confirmLoadTable}
                      onChange={(e) => setConfirmLoadTable(e.target.checked)}
                      style={{ marginRight: '10px', cursor: 'pointer' }}
                    />
                    <span>Entiendo que cargar todos los números editoriales puede afectar el rendimiento del sistema</span>
                  </label>
                </div>

                {/* Botón para cargar la tabla */}
                {!isLoadingTable && allEditorialNumbers.length === 0 && (
                  <button
                    type="button"
                    onClick={loadAllEditorialNumbers}
                    disabled={!confirmLoadTable}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: confirmLoadTable ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: confirmLoadTable ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                      opacity: confirmLoadTable ? 1 : 0.6
                    }}
                  >
                    Cargar Todos los Números Editoriales
                  </button>
                )}

                {/* Tabla con los números */}
                {isLoadingTable ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '1.2rem', color: '#007bff' }}>Cargando...</div>
                    <small style={{ color: '#6c757d' }}>Por favor espere mientras se cargan los datos</small>
                  </div>
                ) : allEditorialNumbers.length > 0 ? (
                  <div>
                    {/* Controles de paginación superior */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Mostrando {tableStartIndex + 1} a {Math.min(tableEndIndex, allEditorialNumbers.length)} de {allEditorialNumbers.length} números editoriales
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px' }}>Mostrar:</span>
                        <select
                          value={tableItemsPerPage}
                          onChange={(e) => handleTableItemsPerPageChange(Number(e.target.value))}
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
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10px',
                        gap: '8px'
                      }}>
                        <button onClick={() => setTableCurrentPage(1)} disabled={tableCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: tableCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: tableCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Primera</button>
                        <button onClick={() => setTableCurrentPage(prev => Math.max(1, prev - 1))} disabled={tableCurrentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: tableCurrentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: tableCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Anterior</button>
                        {Array.from({ length: tableTotalPages }, (_, i) => i + 1).filter(page => page === 1 || page === tableTotalPages || Math.abs(page - tableCurrentPage) <= 2).map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (<React.Fragment key={page}>{showEllipsis && <span style={{ padding: '8px' }}>...</span>}<button onClick={() => setTableCurrentPage(page)} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: tableCurrentPage === page ? '#007bff' : 'white', color: tableCurrentPage === page ? 'white' : '#495057', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: tableCurrentPage === page ? 'bold' : 'normal' }}>{page}</button></React.Fragment>);
                        })}
                        <button onClick={() => setTableCurrentPage(prev => Math.min(tableTotalPages, prev + 1))} disabled={tableCurrentPage === tableTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: tableCurrentPage === tableTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: tableCurrentPage === tableTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Siguiente</button>
                        <button onClick={() => setTableCurrentPage(tableTotalPages)} disabled={tableCurrentPage === tableTotalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: tableCurrentPage === tableTotalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: tableCurrentPage === tableTotalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Última</button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Números seleccionados */}
            {selectedEditorialNumbers.length > 0 && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px'
              }}>
                <strong>Números seleccionados:</strong> {selectedEditorialNumbers.length}
                <button
                  type="button"
                  onClick={() => setSelectedEditorialNumbers([])}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Limpiar selección
                </button>
              </div>
            )}

            <small style={{ color: '#6c757d', display: 'block', marginTop: '10px' }}>
              Seleccione uno o varios números editoriales para filtrar. Si no selecciona ninguno, se mostrarán todas las evaluaciones.
            </small>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleGenerateReport}
              disabled={!selectedEvaluator || isLoading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (!selectedEvaluator || isLoading) ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: (!selectedEvaluator || isLoading) ? 0.6 : 1
              }}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!selectedEvaluator}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !selectedEvaluator ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: !selectedEvaluator ? 0.6 : 1
              }}
            >
              Descargar PDF
            </button>
          </div>

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
                <p><strong>Evaluador:</strong> {reportData.evaluador.nombre}</p>
                <p><strong>ORCID:</strong> {reportData.evaluador.orcid}</p>
                <p><strong>Total de Evaluaciones:</strong> {reportData.total_evaluaciones}</p>
              </div>

              {reportData.evaluaciones.length > 0 ? (
                <div className="table-responsive">
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '10px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Artículo</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Nº Publicación</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Fecha Asignación</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Estado Invitación</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Dictamen</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Fecha Entrega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.evaluaciones.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px' }}>{item.articulo_titulo}</td>
                          <td style={{ padding: '12px' }}>{item.numero_editorial}</td>
                          <td style={{ padding: '12px' }}>{formatDate(item.fecha_asignacion)}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              backgroundColor: item.estado_comunicacion === 'aceptado' ? '#d4edda' :
                                item.estado_comunicacion === 'rechazado' ? '#f8d7da' :
                                  item.estado_comunicacion === 'invitado' ? '#d1ecf1' : '#e2e3e5',
                              color: item.estado_comunicacion === 'aceptado' ? '#155724' :
                                item.estado_comunicacion === 'rechazado' ? '#721c24' :
                                  item.estado_comunicacion === 'invitado' ? '#0c5460' : '#383d41'
                            }}>
                              {getEstadoComunicacionLabel(item.estado_comunicacion)}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              backgroundColor: item.estado_dictamen === 'aceptado' ? '#d4edda' :
                                item.estado_dictamen === 'rechazado' ? '#f8d7da' : '#e2e3e5',
                              color: item.estado_dictamen === 'aceptado' ? '#155724' :
                                item.estado_dictamen === 'rechazado' ? '#721c24' : '#383d41'
                            }}>
                              {getEstadoDictamenLabel(item.estado_dictamen)}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>{formatDate(item.fecha_entrega_dictamen)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
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
