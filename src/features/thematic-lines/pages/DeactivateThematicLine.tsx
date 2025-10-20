import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import PageHeader from "../../../shared/components/PageHeader";
import { thematicLinesService, ThematicLine } from "../services/thematicLinesService";
import { Button } from "../../../shared/components/ui";
import "./ThematicLines.css";

// Styled components para el diálogo de confirmación
const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: var(--color-white);
  padding: 20px;
  border-radius: var(--border-radius-md);
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  h3 {
    margin-bottom: 15px;
    color: var(--color-primary);
  }

  p {
    margin-bottom: 15px;
    color: var(--color-text-light);
    line-height: 1.5;
  }
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
`;

const LineInfoBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: var(--border-radius-sm);
  padding: 15px;
  margin: 15px 0;
  text-align: left;

  strong {
    color: var(--color-text);
    display: block;
    margin-bottom: 5px;
  }

  span {
    color: var(--color-text-light);
    font-size: 14px;
  }
`;

const WarningText = styled.p`
  color: #856404;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: var(--border-radius-sm);
  padding: 10px;
  font-size: 14px;
  text-align: left;
  margin: 15px 0;

  em {
    font-style: normal;
  }
`;

const ActionButton = styled(Button)<{ variant?: 'danger' | 'secondary' }>`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;

  ${props => {
    switch (props.variant) {
      case 'danger':
        return 'background-color: #dc3545; border-color: #dc3545;';
      case 'secondary':
        return 'background-color: #6c757d; border-color: #6c757d;';
      default:
        return '';
    }
  }}

  &:hover:not(:disabled) {
    ${props => {
      switch (props.variant) {
        case 'danger':
          return 'background-color: #c82333; border-color: #c82333;';
        case 'secondary':
          return 'background-color: #5a6268; border-color: #5a6268;';
        default:
          return '';
      }
    }}
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

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

      // Limpiar selección
      setSelectedLine(null);
      setShowConfirmation(false);

      // Recargar desde backend para garantizar consistencia de datos
      if (activeTab === 'table' && allThematicLines.length > 0) {
        await loadAllThematicLines(); // Refrescar toda la tabla desde backend
      } else if (activeTab === 'search' && searchResults.length > 0) {
        // Rehacer la búsqueda para actualizar resultados desde backend
        const lines = await thematicLinesService.getThematicLines(false);
        const results = lines.filter(line =>
          line.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setSearchCurrentPage(1); // Resetear a página 1
      }

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

  const handleTabChange = (tab: 'search' | 'table') => {
    setActiveTab(tab);
    setSearchTerm("");
    setSearchResults([]);
    setSelectedLine(null);
    setShowConfirmation(false);
  };

  return (
    <div className="app-layout">
      <PageHeader />
      <div className="main-content">
        <div className="form-container">
          {/* Pestañas */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => handleTabChange('search')}
            >
              Buscar Una Específica
            </button>
            <button
              className={`tab ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => handleTabChange('table')}
            >
              Ver Todas en Tabla
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
                              <th>Nombre</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSearchResults.map(line => (
                              <tr key={line.id}>
                                <td>{line.nombre}</td>
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
                        backgroundColor: '#e7f3ff',
                        border: '1px solid #b3d9ff',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        color: '#004085',
                        fontSize: '13px'
                      }}>
                        ℹ️ <strong>Nota:</strong> Esta opción carga todos los registros. Puede tomar unos segundos.
                      </div>

                      <button
                        type="button"
                        onClick={loadAllThematicLines}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
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
                              <th>Nombre</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentLines.length === 0 ? (
                              <tr>
                                <td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>
                                  No se encontraron resultados
                                </td>
                              </tr>
                            ) : (
                              currentLines.map(line => (
                                <tr key={line.id}>
                                  <td>{line.nombre}</td>
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
        </div>
      </div>

      {/* Diálogo de Confirmación Modal */}
      {showConfirmation && selectedLine && (
        <ConfirmDialog>
          <DialogContent>
            <h3>Confirmar Eliminación</h3>
            <p>
              ¿Está seguro de que desea eliminar la siguiente línea temática?
            </p>

            <LineInfoBox>
              <strong>Nombre de la línea temática:</strong>
              <span>{selectedLine.nombre}</span>
            </LineInfoBox>

            <WarningText>
              <em>
                <strong>Nota:</strong> La línea temática será desactivada y no estará disponible para nuevos artículos,
                pero se mantendrá en el sistema para preservar el historial.
              </em>
            </WarningText>

            <DialogButtons>
              <ActionButton
                variant="secondary"
                onClick={cancelDeactivation}
                disabled={isDeactivating}
              >
                Cancelar
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={confirmDeactivation}
                disabled={isDeactivating}
              >
                {isDeactivating ? "Eliminando..." : "Sí, Eliminar"}
              </ActionButton>
            </DialogButtons>
          </DialogContent>
        </ConfirmDialog>
      )}
    </div>
  );
};

export default DeactivateThematicLine;