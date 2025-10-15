import React, { useState, useEffect } from "react";
import { ResearcherSearchResult } from "../types";
import LanguageSelector from "../../../shared/components/LanguageSelector";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import { researcherService } from "../../researchers/services";
import { thematicLinesService, ThematicLine } from "../../thematic-lines/services/thematicLinesService";
import { languagesService, Language } from "../../../shared/services";
import "./SearchAuthorModal.css";

interface SearchAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAuthor: (author: ResearcherSearchResult) => void;
  articleThematicLines?: number[]; // IDs de líneas temáticas del artículo para pre-cargar filtros
  excludedIds?: number[]; // IDs de investigadores a excluir (ej: evaluadores ya seleccionados)
}

/**
 * RF-019: Creación de Autor desde Subformulario Embebido
 * RF-020: Búsqueda y Selección de Autores en la Creación de Artículos
 */
const SearchAuthorModal: React.FC<SearchAuthorModalProps> = ({ isOpen, onClose, onSelectAuthor, articleThematicLines = [], excludedIds = [] }) => {
  const [mode, setMode] = useState<'search' | 'create'>('search');

  // Estados para búsqueda con filtros múltiples
  const [keywordSearch, setKeywordSearch] = useState(""); // Búsqueda por palabra clave
  const [filterTerm, setFilterTerm] = useState(""); // Término para agregar filtros
  const [searchFilters, setSearchFilters] = useState<Array<{ type: string, value: string, label: string }>>([]);
  const [searchResults, setSearchResults] = useState<ResearcherSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Datos para búsqueda inteligente de tags
  const [thematicLines, setThematicLines] = useState<ThematicLine[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // Estados para crear nuevo autor
  const [orcid, setOrcid] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [afiliacion, setAfiliacion] = useState("");
  const [gradoAcademico, setGradoAcademico] = useState("");
  const [pais, setPais] = useState("");
  const [lugarTrabajo, setLugarTrabajo] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [idiomas, setIdiomas] = useState<number[]>([]);
  const [lineasTematicas, setLineasTematicas] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Cargar líneas temáticas e idiomas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const loadFilters = async () => {
        try {
          const [lines, langs] = await Promise.all([
            thematicLinesService.getThematicLines(false),
            languagesService.getLanguages()
          ]);
          setThematicLines(lines);
          setLanguages(langs);

          // Pre-cargar filtros de líneas temáticas del artículo si existen
          if (articleThematicLines.length > 0) {
            const preloadedFilters = articleThematicLines
              .map(lineId => {
                const line = lines.find(l => l.id === lineId);
                if (line) {
                  return {
                    type: 'línea_temática',
                    value: line.id.toString(),
                    label: `Línea: ${line.nombre}`
                  };
                }
                return null;
              })
              .filter(f => f !== null) as Array<{ type: string, value: string, label: string }>;

            setSearchFilters(preloadedFilters);
          }
        } catch (error) {
          console.error("Error al cargar filtros:", error);
        }
      };
      loadFilters();
    }
  }, [isOpen, articleThematicLines]);

  if (!isOpen) return null;

  const handleAddFilter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filterTerm.trim()) {
      e.preventDefault();
      const term = filterTerm.trim();

      // Intentar identificar automáticamente el tipo de filtro
      let filterType = 'país'; // Por defecto es país si no coincide con otros
      let filterValue = term; // Valor que se enviará al backend
      let filterLabel = `País: ${term}`;

      // 1. Buscar si coincide con algún idioma
      const idiomaMatch = languages.find(l =>
        l.nombre.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(l.nombre.toLowerCase())
      );

      if (idiomaMatch) {
        filterType = 'idioma';
        filterValue = idiomaMatch.id.toString(); // Guardar el ID para el backend
        filterLabel = `Idioma: ${idiomaMatch.nombre}`;
      } else {
        // 2. Buscar si coincide con alguna línea temática
        const lineaMatch = thematicLines.find(l =>
          l.nombre.toLowerCase().includes(term.toLowerCase()) ||
          term.toLowerCase().includes(l.nombre.toLowerCase())
        );

        if (lineaMatch) {
          filterType = 'línea_temática';
          filterValue = lineaMatch.id.toString(); // Guardar el ID para el backend
          filterLabel = `Línea: ${lineaMatch.nombre}`;
        }
        // Si no coincide con idioma ni línea, se queda como país
      }

      setSearchFilters([...searchFilters, {
        type: filterType,
        value: filterValue,
        label: filterLabel
      }]);

      setFilterTerm("");
    }
  };

  const handleRemoveFilter = (index: number) => {
    setSearchFilters(searchFilters.filter((_, i) => i !== index));
  };

  const handleSearch = async () => {
    if (searchFilters.length === 0 && !keywordSearch.trim()) {
      alert("Por favor, agregue al menos un criterio de búsqueda o palabra clave.");
      return;
    }

    setIsSearching(true);
    try {
      const advancedFilters: any = {};

      // Procesar cada filtro según su tipo
      for (const filter of searchFilters) {
        if (filter.type === 'idioma') {
          // El valor ya contiene el ID del idioma
          advancedFilters.idiomas = parseInt(filter.value);
          console.log(`Filtro idioma con ID: ${filter.value}`);
        } else if (filter.type === 'línea_temática') {
          // El valor ya contiene el ID de la línea temática
          advancedFilters.lineas_tematicas = parseInt(filter.value);
          console.log(`Filtro línea temática con ID: ${filter.value}`);
        } else if (filter.type === 'país') {
          // País se envía directamente como texto
          advancedFilters.pais = filter.value;
          console.log(`Filtro país: ${filter.value}`);
        }
      }

      // Usar keywordSearch para búsqueda general (nombre, apellido, afiliación)
      const searchKeyword = keywordSearch.trim() || undefined;

      console.log('Búsqueda por palabra clave:', searchKeyword);
      console.log('Filtros aplicados:', advancedFilters);

      // Usar researcherService.search() que accede al endpoint correcto /researchers/
      const researchers = await researcherService.search(
        searchKeyword,
        advancedFilters
      );

      // Mapear de Researcher a ResearcherSearchResult
      const results: ResearcherSearchResult[] = researchers.map(r => {
        // Extraer nombre y apellidos del campo concatenado name
        const nameParts = r.name.trim().split(' ');
        const apellido2 = nameParts.length > 2 ? nameParts.pop() || '' : '';
        const apellido1 = nameParts.length > 1 ? nameParts.pop() || '' : nameParts[0] || '';
        const nombre = nameParts.join(' ') || '';

        return {
          id: parseInt(r.id),
          orcid: r.orcid,
          nombre: nombre,
          apellido1: apellido1,
          apellido2: apellido2,
          afiliacion: r.affiliation,
          grado_academico: r.academicDegree,
          pais: r.country,
          lugar_trabajo: '',
          correo: r.email,
          telefono: r.phones.mobile || r.phones.home || r.phones.university || '',
          lineas_tematicas: r.thematicLines,
          idiomas: Array.isArray(r.languages) ? r.languages : [],
          estado: r.status === 'active' ? 'activo' : 'inactivo'
        };
      });

      // Filtrar resultados excluyendo IDs no permitidos (evaluadores ya seleccionados)
      const filteredResults = results.filter(r => !excludedIds.includes(r.id));

      console.log(`Resultados encontrados: ${results.length}, después de filtrar: ${filteredResults.length}`);
      setSearchResults(filteredResults);
      setCurrentPage(1); // Resetear a la primera página al hacer una nueva búsqueda

      if (filteredResults.length === 0) {
        if (results.length > 0 && excludedIds.length > 0) {
          alert("No se encontraron autores disponibles. Los investigadores encontrados ya están seleccionados como evaluadores.");
        } else {
          alert("No se encontraron autores con los criterios ingresados.");
        }
      }
    } catch (error) {
      console.error("Error al buscar autores:", error);
      alert("Error al buscar autores. Por favor, intente nuevamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAuthor = (author: ResearcherSearchResult) => {
    onSelectAuthor(author);
    handleCloseModal();
  };

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!orcid || !nombre || !apellido1 || !apellido2 || !correo) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alert("Formato de correo inválido.");
      return;
    }

    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
    if (!orcidRegex.test(orcid)) {
      alert("El ORCID debe tener el formato: 0000-0000-0000-0000");
      return;
    }

    setIsCreating(true);
    try {
      // Usar researcherService.create() que accede al endpoint correcto /researchers/
      const newResearcher = await researcherService.create({
        orcid,
        nombre,
        apellido1,
        apellido2,
        affiliation: afiliacion,
        academicDegree: gradoAcademico,
        country: pais,
        workPlace: lugarTrabajo,
        email: correo,
        phones: {
          mobile: telefono,
          home: '',
          university: ''
        },
        thematicLines: lineasTematicas,
        languages: idiomas,
        status: 'active'
      });

      alert("Autor creado exitosamente.");

      // Mapear el resultado a ResearcherSearchResult para seleccionarlo
      const newAuthor: ResearcherSearchResult = {
        id: parseInt(newResearcher.id),
        orcid: newResearcher.orcid,
        nombre: nombre,
        apellido1: apellido1,
        apellido2: apellido2,
        afiliacion: afiliacion,
        grado_academico: gradoAcademico,
        pais: pais,
        lugar_trabajo: lugarTrabajo,
        correo: correo,
        telefono: telefono,
        lineas_tematicas: lineasTematicas,
        idiomas: idiomas,
        estado: 'activo'
      };

      // Seleccionar el autor recién creado
      onSelectAuthor(newAuthor);
      handleCloseModal();
    } catch (error: any) {
      console.error("Error al crear autor:", error);

      let errorMessage = "Error al crear el autor.";
      if (error?.details && typeof error.details === 'object') {
        const details = error.details;
        if (details.orcid && Array.isArray(details.orcid)) {
          errorMessage = details.orcid[0];
        } else if (details.correo && Array.isArray(details.correo)) {
          errorMessage = details.correo[0];
        } else if (details.message) {
          errorMessage = details.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    // Resetear estado
    setMode('search');
    setKeywordSearch("");
    setFilterTerm("");
    setSearchFilters([]);
    setSearchResults([]);
    setCurrentPage(1);
    setItemsPerPage(10);
    setOrcid("");
    setNombre("");
    setApellido1("");
    setApellido2("");
    setAfiliacion("");
    setGradoAcademico("");
    setPais("");
    setLugarTrabajo("");
    setCorreo("");
    setTelefono("");
    setIdiomas([]);
    setLineasTematicas([]);
    onClose();
  };

  // Lógica de paginación
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = searchResults.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Seleccionar Autor</h3>
          <button className="close-btn" onClick={handleCloseModal}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${mode === 'search' ? 'active' : ''}`}
            onClick={() => setMode('search')}
          >
            Buscar Autor Existente
          </button>
          <button
            className={`tab-btn ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            Crear Nuevo Autor
          </button>
        </div>

        <div className="modal-body">
          {mode === 'search' ? (
            <div className="search-section">
              {/* Campo de palabra clave */}
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
                  Búsqueda por palabra clave (Nombre, Apellidos, Afiliación)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez, Universidad Nacional, TEC..."
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#6c757d', fontSize: '12px' }}>
                  💡 Busca en nombre, apellidos, afiliación, ORCID y correo
                </small>
              </div>

              {/* Campo de filtros */}
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
                  Filtros (Idioma, Línea Temática, País)
                </label>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Escriba filtro y presione Enter: Francés, Historia, México..."
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    onKeyDown={handleAddFilter}
                  />
                  <button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? "Buscando..." : "Buscar"}
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '5px', color: '#6c757d', fontSize: '12px' }}>
                  💡 Presione Enter para agregar filtros. Se detectan automáticamente idiomas, líneas temáticas o países.
                </small>
              </div>

              {/* Filtros activos */}
              {searchFilters.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '10px',
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <small style={{ width: '100%', color: '#6c757d', marginBottom: '5px' }}>
                    Filtros de búsqueda:
                  </small>
                  {searchFilters.map((filter, index) => (
                    <span key={index} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      borderRadius: '15px',
                      fontSize: '14px',
                      gap: '8px'
                    }}>
                      {filter.label}
                      <button
                        onClick={() => handleRemoveFilter(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '0',
                          lineHeight: '1'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {searchResults.length > 0 && (
                <>
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
                      Mostrando {startIndex + 1} a {Math.min(endIndex, searchResults.length)} de {searchResults.length} autores
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

                  <div className="results-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre Completo</th>
                          <th>Afiliación</th>
                          <th>País</th>
                          <th>Correo</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentResults.map((author) => (
                          <tr key={author.id}>
                            <td>{`${author.nombre} ${author.apellido1} ${author.apellido2}`}</td>
                            <td>{author.afiliacion}</td>
                            <td>{author.pais}</td>
                            <td>{author.correo}</td>
                            <td>
                              <button
                                className="select-btn"
                                onClick={() => handleSelectAuthor(author)}
                              >
                                Seleccionar
                              </button>
                            </td>
                          </tr>
                        ))}
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
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          background: currentPage === 1 ? '#e9ecef' : 'white',
                          borderRadius: '4px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Primera
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          background: currentPage === 1 ? '#e9ecef' : 'white',
                          borderRadius: '4px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Anterior
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (page === 1 || page === totalPages) return true;
                          return Math.abs(page - currentPage) <= 2;
                        })
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span style={{ padding: '8px' }}>...</span>}
                              <button
                                onClick={() => setCurrentPage(page)}
                                style={{
                                  padding: '8px 12px',
                                  border: '1px solid #ced4da',
                                  background: currentPage === page ? '#007bff' : 'white',
                                  color: currentPage === page ? 'white' : '#495057',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: currentPage === page ? 'bold' : 'normal'
                                }}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          background: currentPage === totalPages ? '#e9ecef' : 'white',
                          borderRadius: '4px',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Siguiente
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          background: currentPage === totalPages ? '#e9ecef' : 'white',
                          borderRadius: '4px',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Última
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="create-section">
              <form onSubmit={handleCreateAuthor}>
                <div className="form-row">
                  <div className="form-group">
                    <label>ORCID *</label>
                    <input
                      type="text"
                      value={orcid}
                      onChange={(e) => setOrcid(e.target.value)}
                      placeholder="0000-0000-0000-0000"
                      required
                      disabled={isCreating}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Primer Apellido *</label>
                    <input
                      type="text"
                      value={apellido1}
                      onChange={(e) => setApellido1(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>

                  <div className="form-group">
                    <label>Segundo Apellido *</label>
                    <input
                      type="text"
                      value={apellido2}
                      onChange={(e) => setApellido2(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Afiliación Institucional</label>
                    <input
                      type="text"
                      value={afiliacion}
                      onChange={(e) => setAfiliacion(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="form-group">
                    <label>Grado Académico</label>
                    <input
                      type="text"
                      value={gradoAcademico}
                      onChange={(e) => setGradoAcademico(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>País</label>
                    <input
                      type="text"
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="form-group">
                    <label>Lugar de Trabajo</label>
                    <input
                      type="text"
                      value={lugarTrabajo}
                      onChange={(e) => setLugarTrabajo(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Correo Electrónico *</label>
                    <input
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <ThematicLineSelector
                    selected={lineasTematicas}
                    onChange={setLineasTematicas}
                  />
                </div>

                <div className="form-group">
                  <LanguageSelector
                    selected={idiomas}
                    onChange={setIdiomas}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={handleCloseModal} className="cancel-btn">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-btn" disabled={isCreating}>
                    {isCreating ? "Creando..." : "Crear y Seleccionar"}
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

export default SearchAuthorModal;
