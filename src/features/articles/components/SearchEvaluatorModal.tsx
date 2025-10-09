import React, { useState, useEffect } from "react";
import { ResearcherSearchResult } from "../types";
import { researcherService } from "../../researchers/services";
import { thematicLinesService, ThematicLine } from "../../thematic-lines/services/thematicLinesService";
import { Language } from "../../../shared/components/LanguageSelector";
import "./SearchAuthorModal.css"; // Reutilizamos los estilos

interface SearchEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvaluators: (evaluators: ResearcherSearchResult[]) => void;
  alreadySelected: number[]; // IDs de evaluadores ya seleccionados
}

/**
 * RF-021: Búsqueda y Selección de Evaluadores en Creación y Modificación de Artículos
 *
 * Requisitos:
 * - Solo evaluadores activos pueden ser seleccionados
 * - Mínimo 2 evaluadores antes de guardar
 * - Búsqueda por palabra clave + filtros (línea temática, país, idioma)
 */
const SearchEvaluatorModal: React.FC<SearchEvaluatorModalProps> = ({
  isOpen,
  onClose,
  onSelectEvaluators,
  alreadySelected
}) => {
  const [keywordSearch, setKeywordSearch] = useState(""); // Búsqueda por palabra clave
  const [filterTerm, setFilterTerm] = useState(""); // Término para agregar filtros
  const [searchFilters, setSearchFilters] = useState<Array<{ type: string, value: string, label: string }>>([]);
  const [searchResults, setSearchResults] = useState<ResearcherSearchResult[]>([]);
  const [selectedEvaluators, setSelectedEvaluators] = useState<ResearcherSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Datos para búsqueda inteligente de tags
  const [thematicLines, setThematicLines] = useState<ThematicLine[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // Cargar líneas temáticas e idiomas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const loadFilters = async () => {
        try {
          const [lines, langs] = await Promise.all([
            thematicLinesService.getThematicLines(false),
            researcherService.getLanguages()
          ]);
          setThematicLines(lines);
          setLanguages(langs);
        } catch (error) {
          console.error("Error al cargar filtros:", error);
        }
      };
      loadFilters();
    }
  }, [isOpen]);

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

      console.log(`Resultados encontrados: ${results.length}`);

      // Filtrar evaluadores ya seleccionados previamente
      const filtered = results.filter(r => !alreadySelected.includes(r.id));
      setSearchResults(filtered);
      setCurrentPage(1); // Resetear a la primera página al hacer una nueva búsqueda

      if (filtered.length === 0) {
        alert("No se encontraron evaluadores con los criterios ingresados.");
      }
    } catch (error) {
      console.error("Error al buscar evaluadores:", error);
      alert("Error al buscar evaluadores. Por favor, intente nuevamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleEvaluator = (evaluator: ResearcherSearchResult) => {
    const isSelected = selectedEvaluators.find(e => e.id === evaluator.id);

    if (isSelected) {
      setSelectedEvaluators(selectedEvaluators.filter(e => e.id !== evaluator.id));
    } else {
      setSelectedEvaluators([...selectedEvaluators, evaluator]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedEvaluators.length < 2) {
      alert("Seleccione al menos 2 evaluadores.");
      return;
    }

    onSelectEvaluators(selectedEvaluators);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setKeywordSearch("");
    setFilterTerm("");
    setSearchFilters([]);
    setSearchResults([]);
    setSelectedEvaluators([]);
    setCurrentPage(1);
    setItemsPerPage(10);
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
          <h3>Seleccionar Evaluadores (Mínimo 2)</h3>
          <button className="close-btn" onClick={handleCloseModal}>×</button>
        </div>

        <div className="modal-body">
          <div className="search-section">
            {/* Campo de palabra clave */}
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
                Búsqueda por palabra clave (Nombre, Apellidos, Afiliación)
              </label>
              <input
                type="text"
                placeholder="Ej: María García, Universidad Central, TEC..."
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
                  placeholder="Escriba filtro y presione Enter: Francés, Sociología, Argentina..."
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
                    backgroundColor: '#28a745',
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

            {selectedEvaluators.length > 0 && (
              <div style={{
                padding: '10px',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <strong>Evaluadores seleccionados: {selectedEvaluators.length}</strong>
                <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                  {selectedEvaluators.map(ev => (
                    <li key={ev.id}>
                      {ev.nombre} {ev.apellido1} {ev.apellido2} - {ev.afiliacion}
                    </li>
                  ))}
                </ul>
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
                    Mostrando {startIndex + 1} a {Math.min(endIndex, searchResults.length)} de {searchResults.length} evaluadores
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
                        <th style={{ width: '40px' }}></th>
                        <th>Nombre Completo</th>
                        <th>Afiliación</th>
                        <th>País</th>
                        <th>Correo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResults.map((evaluator) => {
                        const isSelected = selectedEvaluators.find(e => e.id === evaluator.id);

                        return (
                          <tr
                            key={evaluator.id}
                            onClick={() => handleToggleEvaluator(evaluator)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#e7f3ff' : 'transparent'
                            }}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={!!isSelected}
                                onChange={() => {}}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td>{`${evaluator.nombre} ${evaluator.apellido1} ${evaluator.apellido2}`}</td>
                            <td>{evaluator.afiliacion}</td>
                            <td>{evaluator.pais}</td>
                            <td>{evaluator.correo}</td>
                          </tr>
                        );
                      })}
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
                                background: currentPage === page ? '#28a745' : 'white',
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

            <div className="modal-footer">
              <button onClick={handleCloseModal} className="cancel-btn">
                Cancelar
              </button>
              <button
                onClick={handleConfirmSelection}
                className="submit-btn"
                disabled={selectedEvaluators.length < 2}
              >
                Confirmar Selección ({selectedEvaluators.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchEvaluatorModal;
