import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import { thematicLinesService, ThematicLine } from "../services/thematicLinesService";
import "./ThematicLines.css";

/**
 * RF-015: Modificación de Líneas Temáticas
 * Vista con pestañas: Búsqueda específica y tabla con todas las líneas
 */
const ModifyThematicLine: React.FC = () => {
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
  const [showInactive, setShowInactive] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  // Estados para la edición
  const [selectedLine, setSelectedLine] = useState<ThematicLine | null>(null);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar todas las líneas temáticas para la tabla
  const loadAllThematicLines = async () => {
    setIsLoadingTable(true);
    try {
      const lines = await thematicLinesService.getThematicLines(true); // Include inactive
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

    // Filtro por estado
    if (!showInactive) {
      filtered = filtered.filter(line => line.estado);
    }

    setFilteredLines(filtered);
  }, [allThematicLines, tableFilter, showInactive]);

  // Buscar líneas temáticas
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      alert("Ingrese el nombre de la línea temática a buscar.");
      return;
    }

    setIsSearching(true);
    try {
      const lines = await thematicLinesService.getThematicLines(true);
      const results = lines.filter(line =>
        line.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);

      if (results.length === 0) {
        alert("No se encontraron líneas temáticas con ese nombre.");
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert("Error al buscar líneas temáticas");
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar línea para editar
  const selectLineForEdit = (line: ThematicLine) => {
    setSelectedLine(line);
    setEditName(line.nombre);
  };

  // Actualizar línea temática
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLine) return;

    if (!editName.trim()) {
      alert("Ingrese el nombre de la línea temática.");
      return;
    }

    if (editName.trim() === selectedLine.nombre) {
      alert("El nombre no ha cambiado.");
      return;
    }

    setIsUpdating(true);
    try {
      await thematicLinesService.updateThematicLine(selectedLine.id, {
        nombre: editName.trim()
      });

      alert("Línea temática actualizada exitosamente");

      // Actualizar listas locales
      if (activeTab === 'search') {
        setSearchResults(prev =>
          prev.map(line =>
            line.id === selectedLine.id
              ? { ...line, nombre: editName.trim() }
              : line
          )
        );
      } else {
        setAllThematicLines(prev =>
          prev.map(line =>
            line.id === selectedLine.id
              ? { ...line, nombre: editName.trim() }
              : line
          )
        );
      }

      // Limpiar selección
      setSelectedLine(null);
      setEditName("");

    } catch (error: any) {
      console.error("Error al actualizar:", error);
      const errorMessage = error.message || "Error al actualizar línea temática";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <PageHeader />
      <div className="modify-form-container">
        <h2>RF-015: Modificar Línea Temática</h2>

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
                          <tr key={line.id} className={!line.estado ? 'inactive-row' : ''}>
                            <td>{line.id}</td>
                            <td>{line.nombre}</td>
                            <td>
                              <span className={`status-badge ${line.estado ? 'active' : 'inactive'}`}>
                                {line.estado ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => selectLineForEdit(line)}
                                className="btn-secondary btn-small"
                              >
                                Editar
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
              <h3>Todas las Líneas Temáticas</h3>

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
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                    />
                    Mostrar inactivas
                  </label>
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
                        <tr key={line.id} className={!line.estado ? 'inactive-row' : ''}>
                          <td>{line.id}</td>
                          <td>{line.nombre}</td>
                          <td>
                            <span className={`status-badge ${line.estado ? 'active' : 'inactive'}`}>
                              {line.estado ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => selectLineForEdit(line)}
                              className="btn-secondary btn-small"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLines.length === 0 && (
                    <p>No se encontraron líneas temáticas.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario de Edición */}
        {selectedLine && (
          <div className="edit-section">
            <h3>Editando: {selectedLine.nombre}</h3>
            <form onSubmit={handleUpdate} className="modify-form">
              <div className="form-group">
                <label htmlFor="editName">
                  Nombre de la Línea Temática *
                </label>
                <input
                  type="text"
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ingrese el nuevo nombre"
                  required
                  maxLength={150}
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Guardando..." : "Guardar Cambios"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLine(null);
                    setEditName("");
                  }}
                  className="btn-secondary"
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
              </div>
            </form>
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
  );
};

export default ModifyThematicLine;