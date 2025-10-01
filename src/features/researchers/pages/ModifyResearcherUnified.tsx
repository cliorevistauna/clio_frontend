import React, { useState, useEffect } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import LanguageSelector from "../../../shared/components/LanguageSelector";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import { useAuth } from "../../auth/hooks";
import { researcherService } from "../services";
import { Researcher } from "../types";

/**
 * RF-020: Modificar Investigadores
 * Vista con pestañas: Búsqueda específica y tabla con todos los investigadores
 */
const ModifyResearcher: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState<'search' | 'table'>('search');

  // Estados para la búsqueda específica
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Estados para la tabla
  const [allAuthors, setAllAuthors] = useState<Researcher[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Researcher[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [isLoadingTable, setIsLoadingTable] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error during logout:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  // Buscar y precargar datos del investigador
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      alert("Ingrese un término de búsqueda (ORCID, nombre, apellido o correo).");
      return;
    }

    setIsSearching(true);
    try {
      const results = await researcherService.search(searchTerm.trim());

      console.log("Resultados de búsqueda:", results);

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
      setSearchTerm("");

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

  // Efecto para cargar datos cuando se cambia a la pestaña de tabla
  useEffect(() => {
    if (activeTab === 'table' && allAuthors.length === 0) {
      loadAllAuthors();
    }
  }, [activeTab, allAuthors.length]);

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

  // Renderizar pestaña de búsqueda específica
  const renderSearchTab = () => {
    if (selectedAuthor) {
      return renderEditForm();
    }

    return (
      <div>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Buscar por ORCID, Nombre, Apellido o Correo *</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej: 0000-0001-2345-6789, Juan Pérez, juan@example.com"
              required
              disabled={isSearching}
            />
          </div>

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

        {/* Buscador en tiempo real */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>Filtrar en la tabla:</label>
          <input
            type="text"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            placeholder="Filtrar por nombre, ORCID, correo, afiliación..."
            style={{ width: '100%' }}
          />
        </div>

        {isLoadingTable ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Cargando investigadores...</p>
          </div>
        ) : (
          <div>
            <p><small>Mostrando {filteredAuthors.length} de {allAuthors.length} registros.</small></p>

            <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ORCID</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Correo</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>País</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuthors.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        {allAuthors.length === 0 ? 'No hay investigadores registrados' : 'No se encontraron resultados'}
                      </td>
                    </tr>
                  ) : (
                    filteredAuthors.map((author) => (
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
