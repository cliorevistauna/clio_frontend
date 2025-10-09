import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import { thematicLinesService, ThematicLine } from "../services/thematicLinesService";
import "./ThematicLines.css";

const DeactivateThematicLine: React.FC = () => {
  const navigate = useNavigate();

  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState<'search' | 'table'>('search');

  // Estados para la búsqueda específica
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ThematicLine[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para la tabla
  const [allThematicLines, setAllThematicLines] = useState<ThematicLine[]>([]);
  const [filteredLines, setFilteredLines] = useState<ThematicLine[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [confirmLoadTable, setConfirmLoadTable] = useState(false);

  // Estados para paginación de la tabla
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para paginación de búsqueda
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchItemsPerPage, setSearchItemsPerPage] = useState(10);

  // Estados para la confirmación de eliminación
  const [selectedLine, setSelectedLine] = useState<ThematicLine | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Cargar todas las líneas temáticas activas para la tabla
  const loadAllThematicLines = async () => {
    setIsLoadingTable(true);
    try {
      const lines = await thematicLinesService.getThematicLines(false); // Only active
      setAllThematicLines(lines);
      setFilteredLines(lines);
    } catch (error) {
      console.error("Error al cargar líneas temáticas:", error);
      alert("Error al cargar líneas temáticas");
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Efecto removido - ahora se carga manualmente con confirmación del usuario

  // Filtrar líneas en la tabla
  useEffect(() => {
    let filtered = allThematicLines;

    // Filtro por nombre
    if (tableFilter) {
      filtered = filtered.filter(line =>
        line.nombre.toLowerCase().includes(tableFilter.toLowerCase())
      );
    }

    setFilteredLines(filtered);
    setCurrentPage(1); // Resetear a página 1 al filtrar
  }, [allThematicLines, tableFilter]);

  // Lógica de paginación para la tabla
  const totalPages = Math.ceil(filteredLines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLines = filteredLines.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Lógica de paginación para búsqueda
  const searchTotalPages = Math.ceil(searchResults.length / searchItemsPerPage);
  const searchStartIndex = (searchCurrentPage - 1) * searchItemsPerPage;
  const searchEndIndex = searchStartIndex + searchItemsPerPage;
  const currentSearchResults = searchResults.slice(searchStartIndex, searchEndIndex);

  const handleSearchItemsPerPageChange = (value: number) => {
    setSearchItemsPerPage(value);
    setSearchCurrentPage(1);
  };

  // Buscar líneas temáticas activas
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      alert("Ingrese el nombre de la línea temática a buscar.");
      return;
    }

    setIsSearching(true);
    try {
      const lines = await thematicLinesService.getThematicLines(false); // Only active
      const results = lines.filter(line =>
        line.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setSearchCurrentPage(1); // Resetear a página 1 al hacer nueva búsqueda

      if (results.length === 0) {
        alert("No se encuentra línea temática con ese nombre.");
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert("Error al buscar líneas temáticas");
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar línea para eliminar
  const selectLineForDeactivation = (line: ThematicLine) => {
    setSelectedLine(line);
    setShowConfirmation(true);
  };

  // Confirmar eliminación
  const confirmDeactivation = async () => {
    if (!selectedLine) return;

    setIsDeactivating(true);
    try {
      await thematicLinesService.deactivateThematicLine(selectedLine.id);

      alert("Línea temática eliminada exitosamente");

      // Remover de listas locales
      if (activeTab === 'search') {
        setSearchResults(prev => prev.filter(line => line.id !== selectedLine.id));
      } else {
        setAllThematicLines(prev => prev.filter(line => line.id !== selectedLine.id));
      }

      // Limpiar selección
      setSelectedLine(null);
      setShowConfirmation(false);

    } catch (error: any) {
      console.error("Error al eliminar:", error);
      const errorMessage = error.message || "Error al eliminar línea temática";
      alert(errorMessage);
    } finally {
      setIsDeactivating(false);
    }
  };

  // Cancelar eliminación
  const cancelDeactivation = () => {
    setSelectedLine(null);
    setShowConfirmation(false);
  };

  return (
    <div className="app-layout">
      <PageHeader />
      <div className="main-content">
        <div className="form-container">
 
        {!showConfirmation ? (
          <>
            {/* Pestañas */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                Buscar Específica
              </button>
              <button
                className={`tab ${activeTab === 'table' ? 'active' : ''}`}
                onClick={() => setActiveTab('table')}
              >
                Mostrar Todas
              </button>
            </div>

            {/* Pestaña de Búsqueda */}
            {activeTab === 'search' && (
              <div className="tab-content">
                <div className="search-section">
                  <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                      <label htmlFor="search">Nombre de la línea temática:</label>
                      <input
                        type="text"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ingrese el nombre a buscar..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSearching}
                    >
                      {isSearching ? "Buscando..." : "Buscar"}
                    </button>
                  </form>

                  {/* Resultados de búsqueda */}
                  {searchResults.length > 0 && (
                    <div className="results-section">
                      <h4>Resultados de la búsqueda:</h4>

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
                          Mostrando {searchStartIndex + 1} a {Math.min(searchEndIndex, searchResults.length)} de {searchResults.length} resultados
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

                      <div className="lines-table">
                        <table>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Nombre</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSearchResults.map(line => (
                              <tr key={line.id}>
                                <td>{line.id}</td>
                                <td>{line.nombre}</td>
                                <td>
                                  <span className="status-badge active">
                                    Activa
                                  </span>
                                </td>
                                <td>
                                  <button
                                    onClick={() => selectLineForDeactivation(line)}
                                    className="btn-danger btn-small"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Controles de paginación inferior */}
                      {searchTotalPages > 1 && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: '15px',
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
              </div>
            )}

            {/* Pestaña de Tabla */}
            {activeTab === 'table' && (
              <div className="tab-content">
                <div className="table-section">
                  <h3>Líneas Temáticas Activas</h3>

                  {/* Advertencia antes de cargar */}
                  {allThematicLines.length === 0 && !isLoadingTable && (
                    <>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        color: '#856404'
                      }}>
                        ⚠️ <strong>Advertencia:</strong> Cargar todas las líneas temáticas consume más recursos del sistema.
                      </div>

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
                          <span>Entiendo que cargar todas las líneas temáticas puede afectar el rendimiento del sistema</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={loadAllThematicLines}
                        disabled={!confirmLoadTable}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: confirmLoadTable ? '#28a745' : '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: confirmLoadTable ? 'pointer' : 'not-allowed',
                          fontSize: '1rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s',
                          marginBottom: '10px'
                        }}
                      >
                        Cargar Todas las Líneas Temáticas
                      </button>
                    </>
                  )}

                  {isLoadingTable && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <div style={{ fontSize: '1.2rem', color: '#007bff' }}>Cargando...</div>
                      <small style={{ color: '#6c757d' }}>Por favor espere mientras se cargan los datos</small>
                    </div>
                  )}

                  {!isLoadingTable && allThematicLines.length > 0 && (
                    <>
                      <div className="filters-section">
                        <div className="form-group">
                          <label htmlFor="tableFilter">Filtrar por nombre:</label>
                          <input
                            type="text"
                            id="tableFilter"
                            value={tableFilter}
                            onChange={(e) => setTableFilter(e.target.value)}
                            placeholder="Escriba para filtrar..."
                          />
                        </div>
                        <button
                          onClick={loadAllThematicLines}
                          className="btn-secondary"
                          disabled={isLoadingTable}
                        >
                          {isLoadingTable ? "Actualizando..." : "Actualizar"}
                        </button>
                      </div>

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
                          Mostrando {startIndex + 1} a {Math.min(endIndex, filteredLines.length)} de {filteredLines.length} líneas temáticas
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px' }}>Mostrar:</span>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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

                      <div className="lines-table">
                        <table>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Nombre</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentLines.length === 0 ? (
                              <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                                  No se encontraron resultados
                                </td>
                              </tr>
                            ) : (
                              currentLines.map(line => (
                                <tr key={line.id}>
                                  <td>{line.id}</td>
                                  <td>{line.nombre}</td>
                                  <td>
                                    <span className="status-badge active">
                                      Activa
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => selectLineForDeactivation(line)}
                                      className="btn-danger btn-small"
                                    >
                                      Eliminar
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Controles de paginación inferior */}
                      {totalPages > 1 && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: '15px',
                          gap: '8px'
                        }}>
                          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: currentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Primera</button>
                          <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: currentPage === 1 ? '#e9ecef' : 'white', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Anterior</button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2).map((page, index, array) => {
                            const showEllipsis = index > 0 && page - array[index - 1] > 1;
                            return (<React.Fragment key={page}>{showEllipsis && <span style={{ padding: '8px' }}>...</span>}<button onClick={() => setCurrentPage(page)} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: currentPage === page ? '#007bff' : 'white', color: currentPage === page ? 'white' : '#495057', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: currentPage === page ? 'bold' : 'normal' }}>{page}</button></React.Fragment>);
                          })}
                          <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: currentPage === totalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Siguiente</button>
                          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={{ padding: '8px 12px', border: '1px solid #ced4da', background: currentPage === totalPages ? '#e9ecef' : 'white', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Última</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Confirmación de eliminación */
          <div className="confirmation-section">
            <h3>Confirmar Eliminación</h3>
            <div className="confirmation-message">
              <p>
                <strong>¿Está seguro de que desea eliminar la siguiente línea temática?</strong>
              </p>
              <div className="line-to-delete">
                <strong>Nombre:</strong> {selectedLine?.nombre}
              </div>
              <p className="warning-text">
                <em>Nota: La línea temática será desactivada y no estará disponible para nuevos artículos, pero se mantendrá en el sistema para preservar el historial.</em>
              </p>
            </div>

            <div className="form-actions">
              <button
                onClick={confirmDeactivation}
                className="btn-danger"
                disabled={isDeactivating}
              >
                {isDeactivating ? "Eliminando..." : "Sí, Eliminar"}
              </button>

              <button
                onClick={cancelDeactivation}
                className="btn-secondary"
                disabled={isDeactivating}
              >
                No, Cancelar
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default DeactivateThematicLine;