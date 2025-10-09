import React, { useState, useEffect } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import { editorialNumberService } from "../services";
import { EditorialNumber, UpdateEditorialNumberRequest } from "../types";
import {
  backendToFrontendDate,
  frontendToBackendDate,
  isValidFrontendDateFormat
} from "../../../shared/utils/dateUtils";
import { DateInput } from "../../../shared/components/ui";

/**
 * RF-009: Modificación de Números Editoriales
 * Vista con pestañas: Búsqueda específica y tabla con todos los números
 */
const ModifyEditorialNumber: React.FC = () => {
  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState<'search' | 'table'>('search');

  // Estados para la búsqueda específica
  const [searchNumero, setSearchNumero] = useState("");
  const [searchAnio, setSearchAnio] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Estados para la tabla
  const [allEditorialNumbers, setAllEditorialNumbers] = useState<EditorialNumber[]>([]);
  const [filteredNumbers, setFilteredNumbers] = useState<EditorialNumber[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [confirmLoadTable, setConfirmLoadTable] = useState(false);

  // Estados para paginación de la tabla
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para la edición - el mismo formulario que creación pero adaptado
  const [selectedEditorial, setSelectedEditorial] = useState<EditorialNumber | null>(null);
  const [searchResults, setSearchResults] = useState<EditorialNumber[]>([]);
  const [numero, setNumero] = useState("");
  const [anio, setAnio] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // RF-009: Buscar y precargar datos del número editorial
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchNumero) {
      alert("Ingrese el número de publicación a buscar.");
      return;
    }

    const numeroInt = parseInt(searchNumero);
    if (isNaN(numeroInt) || numeroInt <= 0) {
      alert("Ingrese un número válido.");
      return;
    }

    setIsSearching(true);
    try {
      const anioInt = searchAnio ? parseInt(searchAnio) : undefined;
      const results = await editorialNumberService.searchByNumber(numeroInt, anioInt);

      console.log("Resultados de búsqueda:", results); // Debug

      if (results.length === 0) {
        alert("No se encontraron números de publicación con esos criterios.");
        // Limpiar formulario si no hay resultados
        clearForm();
        setSearchResults([]);
      } else if (results.length === 1) {
        // Si hay un resultado, precargar el formulario
        preloadForm(results[0]);
        setSearchResults([]);
        alert(`Número de publicación ${results[0].numero}-${results[0].anio} cargado exitosamente.`);
      } else {
        // Si hay múltiples resultados, mostrar la lista para selección
        setSearchResults(results);
        alert(`Se encontraron ${results.length} resultados. Seleccione uno de la lista.`);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
      alert("Error al buscar el número de publicación.");
      clearForm();
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar un número editorial de los resultados múltiples
  const selectEditorialForEdit = (editorial: EditorialNumber) => {
    preloadForm(editorial);
    setSearchResults([]);
  };

  // Precargar formulario con datos del backend
  const preloadForm = (editorial: EditorialNumber) => {
    console.log("Precargando formulario con:", editorial); // Debug

    setSelectedEditorial(editorial);
    setNumero(editorial.numero.toString());
    setAnio(editorial.anio.toString());
    // Convertir fechas de formato backend (YYYY-MM-DD) a frontend (DD-MM-YYYY)
    setFechaInicio(editorial.fecha_inicio ? backendToFrontendDate(editorial.fecha_inicio) : "");
    setFechaFin(editorial.fecha_final ? backendToFrontendDate(editorial.fecha_final) : "");
    setComentarios(editorial.comentarios || "");
  };

  // Limpiar formulario
  const clearForm = () => {
    setSelectedEditorial(null);
    setNumero("");
    setAnio("");
    setFechaInicio("");
    setFechaFin("");
    setComentarios("");
  };

  // Cancelar edición y volver a búsqueda
  const cancelEdit = () => {
    clearForm();
    setSearchResults([]);
    // Recargar la tabla si estamos en esa pestaña
    if (activeTab === 'table') {
      loadAllEditorialNumbers();
    }
  };

  // RF-009: Modificar número editorial
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEditorial) {
      alert("Primero debe buscar un número de publicación para modificar.");
      return;
    }

    // Validaciones
    if (!numero || !anio || !fechaInicio || !fechaFin) {
      alert("Debe completar todos los campos obligatorios.");
      return;
    }

    // Validar que número y año sean números válidos
    const numeroInt = parseInt(numero);
    const anioInt = parseInt(anio);

    if (isNaN(numeroInt) || numeroInt <= 0) {
      alert("El número debe ser un valor positivo.");
      return;
    }

    if (isNaN(anioInt) || anioInt < 1990 || anioInt > new Date().getFullYear() + 10) {
      alert("Ingrese un año válido.");
      return;
    }

    // Validar formato de fecha (DD-MM-YYYY en frontend)
    if (!isValidFrontendDateFormat(fechaInicio) || !isValidFrontendDateFormat(fechaFin)) {
      alert("Las fechas deben estar en formato DD-MM-YYYY.");
      return;
    }

    // Convertir fechas a formato backend para comparación y envío
    const fechaInicioBackend = frontendToBackendDate(fechaInicio);
    const fechaFinBackend = frontendToBackendDate(fechaFin);

    // Validar que la fecha de inicio sea anterior a la de fin
    if (new Date(fechaInicioBackend) >= new Date(fechaFinBackend)) {
      alert("La fecha de inicio debe ser anterior a la fecha de finalización.");
      return;
    }

    setIsUpdating(true);
    try {
      const updateRequest: UpdateEditorialNumberRequest = {
        id: selectedEditorial.id,
        numero: numeroInt,
        anio: anioInt,
        fecha_inicio: fechaInicioBackend, // Enviar en formato YYYY-MM-DD al backend
        fecha_final: fechaFinBackend, // Enviar en formato YYYY-MM-DD al backend
        comentarios: comentarios || "",
      };

      await editorialNumberService.update(updateRequest);

      alert("Número de publicación modificado exitosamente.");

      // Limpiar formulario y búsqueda
      clearForm();
      setSearchNumero("");
      setSearchAnio("");

    } catch (error: any) {
      console.error("Error al modificar número editorial:", error);

      let errorMessage = "Error al modificar el número de publicación.";
      if (error?.details && typeof error.details === 'object') {
        const details = error.details;
        if (details.numero && Array.isArray(details.numero)) {
          errorMessage = details.numero[0];
        } else if (details.anio && Array.isArray(details.anio)) {
          errorMessage = details.anio[0];
        } else if (details.fecha_inicio && Array.isArray(details.fecha_inicio)) {
          errorMessage = details.fecha_inicio[0];
        } else if (details.fecha_final && Array.isArray(details.fecha_final)) {
          errorMessage = details.fecha_final[0];
        } else if (details.non_field_errors && Array.isArray(details.non_field_errors)) {
          errorMessage = details.non_field_errors[0];
        } else if (details.message) {
          errorMessage = details.message;
        }
      }
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };


  // Cargar todos los números editoriales para la tabla
  const loadAllEditorialNumbers = async () => {
    setIsLoadingTable(true);
    try {
      const numbers = await editorialNumberService.getAll();
      setAllEditorialNumbers(numbers);
      setFilteredNumbers(numbers);
    } catch (error) {
      console.error('Error al cargar números editoriales:', error);
      alert('Error al cargar los números de publicación.');
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Efecto removido - ahora se carga manualmente con confirmación del usuario

  // Filtrar números en tiempo real
  useEffect(() => {
    if (!tableFilter.trim()) {
      setFilteredNumbers(allEditorialNumbers);
    } else {
      const filtered = allEditorialNumbers.filter(editorial => {
        const searchTerm = tableFilter.toLowerCase();
        return (
          editorial.numero.toString().includes(searchTerm) ||
          editorial.anio.toString().includes(searchTerm) ||
          editorial.estado.toLowerCase().includes(searchTerm) ||
          (editorial.comentarios && editorial.comentarios.toLowerCase().includes(searchTerm)) ||
          (editorial.fecha_inicio && editorial.fecha_inicio.includes(searchTerm)) ||
          (editorial.fecha_final && editorial.fecha_final.includes(searchTerm))
        );
      });
      setFilteredNumbers(filtered);
    }
  }, [tableFilter, allEditorialNumbers]);

  // Seleccionar editorial desde la tabla
  const selectFromTable = (editorial: EditorialNumber) => {
    preloadForm(editorial);
  };

  // Lógica de paginación para la tabla
  const totalPages = Math.ceil(filteredNumbers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNumbers = filteredNumbers.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Renderizar pestaña de búsqueda específica
  const renderSearchTab = () => {
    if (selectedEditorial) {
      return renderEditForm();
    }

    return (
      <div>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Número de Publicación *</label>
            <input
              type="number"
              value={searchNumero}
              onChange={(e) => setSearchNumero(e.target.value)}
              min="1"
              required
              disabled={isSearching}
            />
          </div>

          <div className="form-group">
            <label>Año (opcional)</label>
            <input
              type="number"
              value={searchAnio}
              onChange={(e) => setSearchAnio(e.target.value)}
              min="1990"
              max={new Date().getFullYear() + 10}
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
              {searchResults.map(editorial => (
                <div
                  key={editorial.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: '10px',
                    margin: '5px 0',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                  onClick={() => selectEditorialForEdit(editorial)}
                >
                  <strong>Número {editorial.numero}-{editorial.anio}</strong><br />
                  <small>
                    Estado: {editorial.estado} |
                    Fechas: {editorial.fecha_inicio ? backendToFrontendDate(editorial.fecha_inicio) : '-'} a {editorial.fecha_final ? backendToFrontendDate(editorial.fecha_final) : '-'}
                    {editorial.comentarios && ` | ${editorial.comentarios}`}
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
    if (selectedEditorial) {
      return renderEditForm();
    }

    return (
      <div>
        <h3>Todos los Números de Publicación</h3>

        {/* Advertencia antes de cargar */}
        {allEditorialNumbers.length === 0 && !isLoadingTable && (
          <>
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
          </>
        )}

        {isLoadingTable && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '1.2rem', color: '#007bff' }}>Cargando...</div>
            <small style={{ color: '#6c757d' }}>Por favor espere mientras se cargan los datos</small>
          </div>
        )}

        {!isLoadingTable && allEditorialNumbers.length > 0 && (
          <div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Filtrar en la tabla:</label>
              <input
                type="text"
                value={tableFilter}
                onChange={(e) => {
                  setTableFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filtrar por número, año, estado, comentarios o fechas..."
                style={{ width: '100%' }}
              />
            </div>

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
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredNumbers.length)} de {filteredNumbers.length} números editoriales
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

            <div style={{ border: '1px solid #ddd', borderRadius: '5px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Número</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Año</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Fecha Inicio</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Fecha Fin</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Comentarios</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentNumbers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No se encontraron resultados
                      </td>
                    </tr>
                  ) : (
                    currentNumbers.map((editorial) => (
                      <tr key={editorial.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{editorial.numero}</td>
                        <td style={{ padding: '10px' }}>{editorial.anio}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: editorial.estado === 'activo' ? '#d4edda' : '#f8d7da',
                            color: editorial.estado === 'activo' ? '#155724' : '#721c24',
                            fontSize: '12px'
                          }}>
                            {editorial.estado}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{editorial.fecha_inicio ? backendToFrontendDate(editorial.fecha_inicio) : '-'}</td>
                        <td style={{ padding: '10px' }}>{editorial.fecha_final ? backendToFrontendDate(editorial.fecha_final) : '-'}</td>
                        <td style={{ padding: '10px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={editorial.comentarios}>
                          {editorial.comentarios || '-'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            onClick={() => selectFromTable(editorial)}
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
                            Modificar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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
          </div>
        )}
      </div>
    );
  };

  // Renderizar formulario de edición
  const renderEditForm = () => {
    return (
      <div>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Número de Publicación *</label>
            <input
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              min="1"
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Año *</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              min="1990"
              max={new Date().getFullYear() + 10}
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label>Fecha de Inicio *</label>
            <DateInput
              value={fechaInicio}
              onChange={setFechaInicio}
              disabled={isUpdating}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha de Finalización *</label>
            <DateInput
              value={fechaFin}
              onChange={setFechaFin}
              disabled={isUpdating}
              required
            />
          </div>

          <div className="form-group">
            <label>Comentarios</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
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
      <PageHeader onLogout={() => console.log("Logout")} />

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

export default ModifyEditorialNumber;