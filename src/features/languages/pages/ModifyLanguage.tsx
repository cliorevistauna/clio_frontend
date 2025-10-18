import React, { useState, useEffect } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import { languagesService } from "../services/languagesService";
import { Language } from "../types";
import "./Languages.css";

const ModifyLanguage: React.FC = () => {

  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState<'search' | 'table'>('search');

  // Estados para la búsqueda específica
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Language[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para la tabla
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  // Estados para paginación de la tabla
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para paginación de búsqueda
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchItemsPerPage, setSearchItemsPerPage] = useState(10);

  // Estados para la edición
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar todos los idiomas para la tabla (solo activos)
  const loadAllLanguages = async () => {
    setIsLoadingTable(true);
    try {
      const langs = await languagesService.getLanguages(false); // Solo activos
      setAllLanguages(langs);
      setFilteredLanguages(langs);
    } catch (error) {
      console.error("Error al cargar idiomas:", error);
      alert("Error al cargar idiomas");
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Filtrar idiomas en la tabla
  useEffect(() => {
    let filtered = allLanguages;

    // Filtro por nombre
    if (tableFilter) {
      filtered = filtered.filter(lang =>
        lang.nombre.toLowerCase().includes(tableFilter.toLowerCase())
      );
    }

    setFilteredLanguages(filtered);
    setCurrentPage(1); // Resetear a página 1 al filtrar
  }, [allLanguages, tableFilter]);

  // Lógica de paginación para la tabla
  const totalPages = Math.ceil(filteredLanguages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLanguages = filteredLanguages.slice(startIndex, endIndex);

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

  // Buscar idiomas
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      alert("Ingrese el nombre o código ISO del idioma a buscar.");
      return;
    }

    setIsSearching(true);
    try {
      const langs = await languagesService.getLanguages(false); // Solo activos
      const results = langs.filter(lang =>
        lang.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setSearchCurrentPage(1); // Resetear a página 1 al hacer nueva búsqueda

      if (results.length === 0) {
        alert("No se encuentra idioma con ese nombre.");
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert("Error al buscar idiomas");
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar idioma para editar
  const selectLanguageForEdit = (lang: Language) => {
    setSelectedLanguage(lang);
    setEditName(lang.nombre);
  };

  // Actualizar idioma
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLanguage) return;

    if (!editName.trim()) {
      alert("Ingrese el nombre del idioma.");
      return;
    }

    if (editName.trim() === selectedLanguage.nombre) {
      alert("El nombre no ha cambiado.");
      return;
    }

    setIsUpdating(true);
    try {
      await languagesService.updateLanguage(selectedLanguage.id, {
        nombre: editName.trim()
      });

      alert("Idioma actualizado exitosamente");

      // Recargar desde backend para garantizar consistencia de datos
      if (activeTab === 'table' && allLanguages.length > 0) {
        await loadAllLanguages(); // Refrescar toda la tabla
      } else if (activeTab === 'search' && searchResults.length > 0) {
        // Rehacer la búsqueda para actualizar resultados
        const langs = await languagesService.getLanguages(false);
        const results = langs.filter(lang =>
          lang.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
      }

      // Limpiar selección
      setSelectedLanguage(null);
      setEditName("");

    } catch (error: any) {
      console.error("Error al actualizar:", error);
      const errorMessage = error.message || "Error al actualizar idioma";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTabChange = (tab: 'search' | 'table') => {
    setActiveTab(tab);
    setSearchTerm("");
    setSearchResults([]);
    setSelectedLanguage(null);
    setEditName("");
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
            Buscar Uno Específico
          </button>
          <button
            className={`tab ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => handleTabChange('table')}
          >
            Ver Todos en Tabla
          </button>
        </div>

        {/* Pestaña de Búsqueda */}
        {activeTab === 'search' && (
          <div className="tab-content">
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                  <label htmlFor="search">Nombre del idioma:</label>
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

                  <div className="languages-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSearchResults.map(lang => (
                          <tr key={lang.id}>
                            <td>{lang.nombre}</td>
                            <td>
                              <button
                                onClick={() => selectLanguageForEdit(lang)}
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
              <h3>Todos los Idiomas</h3>

              {/* Advertencia antes de cargar */}
              {allLanguages.length === 0 && !isLoadingTable && (
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
                    onClick={loadAllLanguages}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginBottom: '10px'
                    }}
                  >
                    Cargar Todos los Idiomas
                  </button>
                </>
              )}

              {isLoadingTable && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '1.2rem', color: '#007bff' }}>Cargando...</div>
                  <small style={{ color: '#6c757d' }}>Por favor espere mientras se cargan los datos</small>
                </div>
              )}

              {!isLoadingTable && allLanguages.length > 0 && (
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
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredLanguages.length)} de {filteredLanguages.length} idiomas
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

                  <div className="languages-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentLanguages.length === 0 ? (
                          <tr>
                            <td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>
                              No se encontraron resultados
                            </td>
                          </tr>
                        ) : (
                          currentLanguages.map(lang => (
                            <tr key={lang.id}>
                              <td>{lang.nombre}</td>
                              <td>
                                <button
                                  onClick={() => selectLanguageForEdit(lang)}
                                  className="btn-secondary btn-small"
                                >
                                  Editar
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

        {/* Formulario de Edición */}
        {selectedLanguage && (
          <div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Nombre del Idioma *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ingrese el nombre del idioma"
                  required
                  maxLength={100}
                  disabled={isUpdating}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="submit-btn" disabled={isUpdating}>
                  {isUpdating ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => {
                    setSelectedLanguage(null);
                    setEditName("");
                  }}
                  disabled={isUpdating}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ModifyLanguage;
