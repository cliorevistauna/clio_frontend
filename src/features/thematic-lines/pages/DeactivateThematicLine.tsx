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

  // Cargar datos cuando cambia a la pestaña de tabla
  useEffect(() => {
    if (activeTab === 'table') {
      loadAllThematicLines();
    }
  }, [activeTab]);

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
  }, [allThematicLines, tableFilter]);

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

      if (results.length === 0) {
        alert("No se encontraron líneas temáticas activas con ese nombre.");
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
        <h2>Eliminación de Líneas Temáticas</h2>

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
                  <h3>Buscar Línea Temática</h3>
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
                      className="btn-primary"
                      disabled={isSearching}
                    >
                      {isSearching ? "Buscando..." : "Buscar"}
                    </button>
                  </form>

                  {/* Resultados de búsqueda */}
                  {searchResults.length > 0 && (
                    <div className="results-section">
                      <h4>Resultados de la búsqueda:</h4>
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
                            {searchResults.map(line => (
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

                  {isLoadingTable ? (
                    <div>Cargando líneas temáticas...</div>
                  ) : (
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
                          {filteredLines.map(line => (
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
                      {filteredLines.length === 0 && (
                        <p>No se encontraron líneas temáticas activas.</p>
                      )}
                    </div>
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

        {/* Botón para volver */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Volver
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateThematicLine;