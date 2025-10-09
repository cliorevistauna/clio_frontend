import React, { useState, useEffect } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import LanguageSelector from "../../../shared/components/LanguageSelector";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import { useAuth } from "../../auth/hooks";
import { researcherService } from "../services";
import { Researcher } from "../types";
import { thematicLinesService, ThematicLine } from "../../thematic-lines/services/thematicLinesService";
import { Language } from "../../../shared/components/LanguageSelector";

/**
 * RF-020: Modificar Investigadores
 * Vista con pestañas: Búsqueda específica y tabla con todos los investigadores
 */
const ModifyResearcher: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState<'search' | 'table'>('search');

  // Estados para la búsqueda específica con filtros múltiples
  const [keywordSearch, setKeywordSearch] = useState(""); // Búsqueda por palabra clave
  const [filterTerm, setFilterTerm] = useState(""); // Término para agregar filtros
  const [searchFilters, setSearchFilters] = useState<Array<{ type: string, value: string, label: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Datos para búsqueda inteligente de tags
  const [thematicLines, setThematicLines] = useState<ThematicLine[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // Estados para la tabla
  const [allAuthors, setAllAuthors] = useState<Researcher[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Researcher[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [confirmLoadTable, setConfirmLoadTable] = useState(false);

  // Estados para paginación de la tabla
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para la edición
  const [selectedAuthor, setSelectedAuthor] = useState<Researcher | null>(null);
  const [searchResults, setSearchResults] = useState<Researcher[]>([]);
  const [orcid, setOrcid] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [afiliacion, setAfiliacion] = useState("");
  const [gradoAcademico, setGradoAcademico] = useState("");
  const [pais, setPais] = useState("");
  const [lugarTrabajo, setLugarTrabajo] = useState("");
  const [correo, setCorreo] = useState("");
  const [lineas, setLineas] = useState<number[]>([]);
  const [idiomas, setIdiomas] = useState<number[]>([]);
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState("activo");
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar líneas temáticas e idiomas al montar
  useEffect(() => {
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
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error during logout:', error);
      navigate(ROUTES.LOGIN);
    }
  };

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

  // Buscar y precargar datos del investigador
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchFilters.length === 0 && !keywordSearch.trim()) {
      alert("Agregue al menos un criterio de búsqueda o palabra clave.");
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

      const results = await researcherService.search(
        searchKeyword,
        advancedFilters
      );

      console.log(`Resultados encontrados: ${results.length}`);

      if (results.length === 0) {
        alert("No se encuentra autor o evaluador bajo estos filtros.");
        clearForm();
        setSearchResults([]);
      } else if (results.length === 1) {
        // Si hay un resultado, precargar el formulario
        preloadForm(results[0]);
        setSearchResults([]);
        alert(`${results[0].name} cargado exitosamente.`);
      } else {
        // Si hay múltiples resultados, mostrar la lista para selección
        setSearchResults(results);
        alert(`Se encontraron ${results.length} resultados. Seleccione uno de la lista.`);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
      alert("Error al buscar el autor o evaluador.");
      clearForm();
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar un investigador de los resultados múltiples
  const selectAuthorForEdit = (author: Researcher) => {
    preloadForm(author);
    setSearchResults([]);
  };

  // Precargar formulario con datos del backend
  const preloadForm = (author: Researcher) => {
    console.log("Precargando formulario con:", author);

    setSelectedAuthor(author);
    setOrcid(author.orcid || '');

    // Separar nombre completo en partes si existe
    if (author.name) {
      const nameParts = author.name.trim().split(' ');
      setNombre(nameParts[0] || '');
      setApellido1(nameParts[1] || '');
      setApellido2(nameParts.slice(2).join(' ') || '');
    } else {
      setNombre('');
      setApellido1('');
      setApellido2('');
    }

    setAfiliacion(author.affiliation || '');
    setGradoAcademico(author.academicDegree || '');
    setPais(author.country || '');
    setLugarTrabajo(''); // Campo no mapeado en el tipo actual
    setCorreo(author.email || '');
    setLineas(author.thematicLines || []);
    setIdiomas(Array.isArray(author.languages) ? author.languages : []);
    setTelefono(author.phones?.mobile || '');
    setEstado(author.status === 'active' ? 'activo' : author.status === 'inactive' ? 'inactivo' : 'pendiente');
  };

  // Limpiar formulario
  const clearForm = () => {
    setSelectedAuthor(null);
    setOrcid("");
    setNombre("");
    setApellido1("");
    setApellido2("");
    setAfiliacion("");
    setGradoAcademico("");
    setPais("");
    setLugarTrabajo("");
    setCorreo("");
    setLineas([]);
    setIdiomas([]);
    setTelefono("");
    setEstado("activo");
  };

  // Cancelar edición y volver a búsqueda
  const cancelEdit = () => {
    clearForm();
    setSearchResults([]);
    setSearchFilters([]);
    setKeywordSearch("");
    setFilterTerm("");
    if (activeTab === 'table') {
      loadAllAuthors();
    }
  };

  // Modificar investigador
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAuthor) {
      alert("Primero debe buscar un autor o evaluador para modificar.");
      return;
    }

    // Validaciones
    if (!orcid || !nombre || !apellido1 || !apellido2 || !correo) {
      alert("Debe completar todos los campos obligatorios (ORCID, nombre, apellidos y correo).");
      return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      alert("Formato de correo inválido.");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        orcid,
        nombre,
        apellido1,
        apellido2,
        afiliacion,
        grado_academico: gradoAcademico,
        pais,
        lugar_trabajo: lugarTrabajo,
        correo,
        lineas_tematicas: lineas,
        idiomas,
        telefono,
        estado,
      };

      await researcherService.update(selectedAuthor.id, updateData);

      alert("Actualizado exitosamente.");

      // Limpiar formulario y búsqueda
      clearForm();
      setSearchFilters([]);

    } catch (error: any) {
      console.error("Error al actualizar:", error);

      let errorMessage = "Error al actualizar.";
      if (error?.details && typeof error.details === 'object') {
        const details = error.details;
        if (details.orcid && Array.isArray(details.orcid)) {
          errorMessage = details.orcid[0];
        } else if (details.correo && Array.isArray(details.correo)) {
          errorMessage = details.correo[0];
        } else if (details.message) {
          errorMessage = details.message;
        }
      }
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Cargar todos los investigadores para la tabla
  const loadAllAuthors = async () => {
    setIsLoadingTable(true);
    try {
      const authors = await researcherService.getAll();
      setAllAuthors(authors);
      setFilteredAuthors(authors);
    } catch (error) {
      console.error('Error al cargar los autores y evaluadores:', error);
      alert('Error al cargar los autores y evaluadores.');
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Efecto removido - ahora se carga manualmente con confirmación del usuario

  // Filtrar investigadores en tiempo real
  useEffect(() => {
    if (!tableFilter.trim()) {
      setFilteredAuthors(allAuthors);
    } else {
      const filtered = allAuthors.filter(author => {
        const searchTerm = tableFilter.toLowerCase();
        return (
          (author.name && author.name.toLowerCase().includes(searchTerm)) ||
          (author.orcid && author.orcid.toLowerCase().includes(searchTerm)) ||
          (author.email && author.email.toLowerCase().includes(searchTerm)) ||
          (author.affiliation && author.affiliation.toLowerCase().includes(searchTerm)) ||
          (author.country && author.country.toLowerCase().includes(searchTerm)) ||
          (author.status && author.status.toLowerCase().includes(searchTerm))
        );
      });
      setFilteredAuthors(filtered);
    }
  }, [tableFilter, allAuthors]);

  // Seleccionar investigador desde la tabla
  const selectFromTable = (author: Researcher) => {
    preloadForm(author);
  };

  // Lógica de paginación para la tabla
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAuthors = filteredAuthors.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Renderizar pestaña de búsqueda específica
  const renderSearchTab = () => {
    if (selectedAuthor) {
      return renderEditForm();
    }

    return (
      <div>
        <form onSubmit={handleSearch}>
          {/* Campo de palabra clave */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Búsqueda por palabra clave (ORCID, Nombre, Apellidos, Afiliación)</label>
            <input
              type="text"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              placeholder="Ej: Juan Pérez, 0000-0000-0000-0000, Universidad Central..."
              disabled={isSearching}
              style={{ width: '100%', padding: '8px' }}
            />
            <small style={{ display: 'block', marginTop: '5px', color: '#6c757d', fontSize: '12px' }}>
              💡 Busca en ORCID, nombre, apellidos, afiliación, correo y lugar de trabajo
            </small>
          </div>

          {/* Campo de filtros */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Filtros (Idioma, Línea Temática, País)</label>
            <input
              type="text"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              onKeyDown={handleAddFilter}
              placeholder="Escriba filtro y presione Enter: Francés, Historia, México..."
              disabled={isSearching}
              style={{ width: '100%', padding: '8px' }}
            />
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
                    type="button"
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

          <button type="submit" className="submit-btn" disabled={isSearching}>
            {isSearching ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {/* Resultados de búsqueda múltiples */}
        {searchResults.length > 1 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Resultados encontrados:</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map(author => (
                <div
                  key={author.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: '10px',
                    margin: '5px 0',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                  onClick={() => selectAuthorForEdit(author)}
                >
                  <strong>{author.name}</strong><br />
                  <small>
                    ORCID: {author.orcid} | Correo: {author.email}<br />
                    {author.affiliation && `Afiliación: ${author.affiliation} | `}
                    Estado: {author.status}
                  </small>
                </div>
              ))}
            </div>
            <p><small>Haz clic en un resultado para editarlo.</small></p>
          </div>
        )}
      </div>
    );
  };

  // Renderizar pestaña de tabla
  const renderTableTab = () => {
    if (selectedAuthor) {
      return renderEditForm();
    }

    return (
      <div>
        <h3>Todos los Autores y Evaluadores</h3>

        {/* Advertencia antes de cargar */}
        {allAuthors.length === 0 && !isLoadingTable && (
          <>
            <div style={{
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              marginBottom: '10px',
              color: '#856404'
            }}>
              ⚠️ <strong>Advertencia:</strong> Cargar todos los autores y evaluadores consume más recursos del sistema.
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
                <span>Entiendo que cargar todos los autores y evaluadores puede afectar el rendimiento del sistema</span>
              </label>
            </div>

            {/* Botón para cargar la tabla */}
            <button
              type="button"
              onClick={loadAllAuthors}
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
              Cargar Todos los Autores y Evaluadores
            </button>
          </>
        )}

        {isLoadingTable && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '1.2rem', color: '#007bff' }}>Cargando...</div>
            <small style={{ color: '#6c757d' }}>Por favor espere mientras se cargan los datos</small>
          </div>
        )}

        {!isLoadingTable && allAuthors.length > 0 && (
          <div>
            {/* Buscador en tiempo real */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Filtrar en la tabla:</label>
              <input
                type="text"
                value={tableFilter}
                onChange={(e) => {
                  setTableFilter(e.target.value);
                  setCurrentPage(1); // Resetear a página 1 al filtrar
                }}
                placeholder="Filtrar por nombre, ORCID, correo, afiliación..."
                style={{ width: '100%' }}
              />
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
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAuthors.length)} de {filteredAuthors.length} investigadores
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

            {/* Tabla */}
            <div style={{ border: '1px solid #ddd', borderRadius: '5px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ORCID</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Nombre</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Correo</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>País</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAuthors.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No se encontraron resultados
                      </td>
                    </tr>
                  ) : (
                    currentAuthors.map((author) => (
                      <tr key={author.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{author.orcid}</td>
                        <td style={{ padding: '10px' }}>{author.name}</td>
                        <td style={{ padding: '10px' }}>{author.email}</td>
                        <td style={{ padding: '10px' }}>{author.country || '-'}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: author.status === 'active' ? '#d4edda' : author.status === 'inactive' ? '#f8d7da' : '#fff3cd',
                            color: author.status === 'active' ? '#155724' : author.status === 'inactive' ? '#721c24' : '#856404',
                            fontSize: '12px'
                          }}>
                            {author.status === 'active' ? 'Activo' : author.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            onClick={() => selectFromTable(author)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                          >
                            Actualizar
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
          </div>
        )}
      </div>
    );
  };

  // Renderizar formulario de edición
  const renderEditForm = () => {
    return (
      <div>
        <h4 style={{ textAlign: "center" }}>Datos de {selectedAuthor?.name}</h4>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>ORCID *</label>
            <input
              type="text"
              value={orcid}
              onChange={(e) => setOrcid(e.target.value)}
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Primer Apellido *</label>
            <input
              type="text"
              value={apellido1}
              onChange={(e) => setApellido1(e.target.value)}
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Segundo Apellido *</label>
            <input
              type="text"
              value={apellido2}
              onChange={(e) => setApellido2(e.target.value)}
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Afiliación Institucional</label>
            <input
              type="text"
              value={afiliacion}
              onChange={(e) => setAfiliacion(e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Grado Académico</label>
            <input
              type="text"
              value={gradoAcademico}
              onChange={(e) => setGradoAcademico(e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>País</label>
            <input
              type="text"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Lugar de Trabajo</label>
            <input
              type="text"
              value={lugarTrabajo}
              onChange={(e) => setLugarTrabajo(e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico *</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <ThematicLineSelector selected={lineas} onChange={setLineas} />
          </div>

          <div className="form-group">
            <LanguageSelector selected={idiomas} onChange={setIdiomas} />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} disabled={isUpdating}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="submit-btn" disabled={isUpdating}>
              {isUpdating ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              className="submit-btn"
              onClick={cancelEdit}
              disabled={isUpdating}
              style={{ backgroundColor: '#6c757d' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">

          {/* Pestañas */}
          <div style={{
            display: 'flex',
            marginBottom: '20px',
            borderBottom: '2px solid #dee2e6'
          }}>
            <button
              onClick={() => setActiveTab('search')}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === 'search' ? '#007bff' : 'transparent',
                color: activeTab === 'search' ? 'white' : '#007bff',
                borderBottom: activeTab === 'search' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'search') {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'search') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Buscar Uno Específico
            </button>
            <button
              onClick={() => setActiveTab('table')}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === 'table' ? '#007bff' : 'transparent',
                color: activeTab === 'table' ? 'white' : '#007bff',
                borderBottom: activeTab === 'table' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'table') {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'table') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Ver Todos en Tabla
            </button>
          </div>

          {/* Contenido de las pestañas */}
          {activeTab === 'search' ? renderSearchTab() : renderTableTab()}
        </div>
      </main>
    </div>
  );
};

export default ModifyResearcher;
