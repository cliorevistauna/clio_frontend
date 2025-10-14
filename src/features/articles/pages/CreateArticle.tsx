import React, { useState, useEffect } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import { SearchAuthorModal, SearchEvaluatorModal } from "../components";
import { articleService } from "../services";
import { ResearcherSearchResult } from "../types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks";
import { ROUTES } from "../../../shared/constants";
import { editorialNumberService } from "../../editorial-numbers/services";
import { EditorialNumber } from "../../editorial-numbers/types";
import {
  frontendToBackendDate,
  isValidFrontendDateFormat,
  getCurrentDateFrontend
} from "../../../shared/utils/dateUtils";
import { DateInput } from "../../../shared/components/ui";

/**
 * RF-017: Creación de Artículos
 *
 * Permite a Administradores y Editores crear nuevos artículos.
 * - Autor obligatorio (buscar o crear nuevo)
 * - Mínimo 1 línea temática
 * - Evaluadores opcionales al crear
 * - Número editorial se asigna automáticamente si no se proporciona
 * - Estado inicial "Recibido" (asignado automáticamente por el backend)
 * - Si se agregan evaluadores, el backend cambiará automáticamente a "Asignado"
 */
const CreateArticle: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Campos del formulario
  const [titulo, setTitulo] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [fechaRecepcion, setFechaRecepcion] = useState("");
  const [fechaAceptacion, setFechaAceptacion] = useState("");
  const [fechaPublicacion, setFechaPublicacion] = useState("");
  const [lineasTematicas, setLineasTematicas] = useState<number[]>([]);

  // Número editorial
  const [editorialNumbers, setEditorialNumbers] = useState<EditorialNumber[]>([]);
  const [selectedEditorialNumber, setSelectedEditorialNumber] = useState<number | null>(null);
  const [currentEditorialNumber, setCurrentEditorialNumber] = useState<EditorialNumber | null>(null);

  // Autores y evaluadores
  const [selectedAuthor, setSelectedAuthor] = useState<ResearcherSearchResult | null>(null);
  const [selectedEvaluators, setSelectedEvaluators] = useState<ResearcherSearchResult[]>([]);

  // Modales
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para checkboxes "Hoy"
  const [usarHoyRecepcion, setUsarHoyRecepcion] = useState(false);
  const [usarHoyAceptacion, setUsarHoyAceptacion] = useState(false);
  const [usarHoyPublicacion, setUsarHoyPublicacion] = useState(false);

  // Manejar cambio de checkbox "Hoy" para fecha de recepción
  const handleUsarHoyRecepcion = (checked: boolean) => {
    setUsarHoyRecepcion(checked);
    if (checked) {
      setFechaRecepcion(getCurrentDateFrontend());
    } else {
      setFechaRecepcion("");
    }
  };

  // Manejar cambio de checkbox "Hoy" para fecha de aceptación
  const handleUsarHoyAceptacion = (checked: boolean) => {
    setUsarHoyAceptacion(checked);
    if (checked) {
      setFechaAceptacion(getCurrentDateFrontend());
    } else {
      setFechaAceptacion("");
    }
  };

  // Manejar cambio de checkbox "Hoy" para fecha de publicación
  const handleUsarHoyPublicacion = (checked: boolean) => {
    setUsarHoyPublicacion(checked);
    if (checked) {
      setFechaPublicacion(getCurrentDateFrontend());
    } else {
      setFechaPublicacion("");
    }
  };

  // Cargar números editoriales disponibles
  useEffect(() => {
    const loadEditorialNumbers = async () => {
      try {
        const [all, current] = await Promise.all([
          editorialNumberService.getAll(),
          editorialNumberService.getCurrentEditorialNumber()
        ]);
        setEditorialNumbers(all);
        setCurrentEditorialNumber(current);
        if (current) {
          setSelectedEditorialNumber(current.id);
        }
      } catch (error) {
        console.error("Error al cargar números editoriales:", error);
      }
    };
    loadEditorialNumbers();
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

  const handleSelectAuthor = (author: ResearcherSearchResult) => {
    // Verificar si el autor seleccionado ya está como evaluador
    const isAlreadyEvaluator = selectedEvaluators.some(ev => ev.id === author.id);

    if (isAlreadyEvaluator) {
      alert(
        `El investigador ${author.nombre} ${author.apellido1} ${author.apellido2} ` +
        `ya está seleccionado como evaluador.\n\n` +
        `Un investigador no puede ser autor y evaluador del mismo artículo.`
      );
      return;
    }

    setSelectedAuthor(author);
  };

  const handleRemoveAuthor = () => {
    setSelectedAuthor(null);
  };

  const handleSelectEvaluators = (evaluators: ResearcherSearchResult[]) => {
    // Verificar si alguno de los evaluadores seleccionados es el autor
    if (selectedAuthor) {
      const authorIsEvaluator = evaluators.some(ev => ev.id === selectedAuthor.id);

      if (authorIsEvaluator) {
        alert(
          `El autor ${selectedAuthor.nombre} ${selectedAuthor.apellido1} ${selectedAuthor.apellido2} ` +
          `no puede ser seleccionado como evaluador.\n\n` +
          `Un investigador no puede ser autor y evaluador del mismo artículo.`
        );
        return;
      }
    }

    setSelectedEvaluators(evaluators);
  };

  const handleRemoveEvaluator = (id: number) => {
    setSelectedEvaluators(selectedEvaluators.filter(e => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones RF-017
    if (!titulo || !procedencia || !fechaRecepcion) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (!selectedAuthor) {
      alert("Es obligatorio ingresar un autor. Use el botón 'Seleccionar Autor'.");
      return;
    }

    if (lineasTematicas.length === 0) {
      alert("Se debe seleccionar al menos una línea temática.");
      return;
    }

    // Validar formato de fechas
    if (!isValidFrontendDateFormat(fechaRecepcion)) {
      alert("La fecha de recepción debe tener el formato DD-MM-YYYY.");
      return;
    }

    if (fechaAceptacion && !isValidFrontendDateFormat(fechaAceptacion)) {
      alert("La fecha de aceptación debe tener el formato DD-MM-YYYY.");
      return;
    }

    if (fechaPublicacion && !isValidFrontendDateFormat(fechaPublicacion)) {
      alert("La fecha de publicación debe tener el formato DD-MM-YYYY.");
      return;
    }

    // Los evaluadores son opcionales al crear
    // No se requiere mínimo de evaluadores

    setIsSubmitting(true);
    try {
      const articleData = {
        titulo,
        procedencia,
        fecha_recepcion: frontendToBackendDate(fechaRecepcion),
        fecha_aceptacion: fechaAceptacion ? frontendToBackendDate(fechaAceptacion) : undefined,
        fecha_publicacion: fechaPublicacion ? frontendToBackendDate(fechaPublicacion) : undefined,
        numero_editorial: selectedEditorialNumber || undefined,
        lineas_tematicas: lineasTematicas,
        autores: [selectedAuthor.id],
        evaluadores_data: selectedEvaluators.map(ev => ({
          investigador: ev.id,
          estado_comunicacion: 'invitado' as const,
        })),
      };

      console.log("Datos del artículo a crear:", articleData);

      await articleService.create(articleData);

      alert("Artículo registrado exitosamente.");

      // Limpiar formulario
      setTitulo("");
      setProcedencia("");
      setFechaRecepcion("");
      setFechaAceptacion("");
      setFechaPublicacion("");
      setLineasTematicas([]);
      setSelectedAuthor(null);
      setSelectedEvaluators([]);
      setUsarHoyRecepcion(false);
      setUsarHoyAceptacion(false);
      setUsarHoyPublicacion(false);

    } catch (error: any) {
      console.error("Error al registrar artículo:", error);

      // El apiClient ahora extrae automáticamente el mensaje del backend
      const errorMessage = error?.message || "Error al registrar el artículo.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">
          <h2>Formulario de Registro</h2>

          {/* Número de Publicación - Editable */}
          <div className="form-group">
            <label>Número de Publicación</label>
            <select
              value={selectedEditorialNumber || ''}
              onChange={(e) => setSelectedEditorialNumber(e.target.value ? parseInt(e.target.value) : null)}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
            >
              <option value="">Sin asignar</option>
              {editorialNumbers.map(en => (
                <option key={en.id} value={en.id}>
                  Número {en.numero} - Año {en.anio} ({en.estado})
                  {currentEditorialNumber?.id === en.id ? ' (Actual)' : ''}
                </option>
              ))}
            </select>
            <small style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Por defecto se asigna el número de publicación vigente, pero puede cambiarlo
            </small>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Título del Artículo */}
            <div className="form-group">
              <label>Título del Artículo *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Ingrese el título del artículo"
              />
            </div>

            {/* Procedencia */}
            <div className="form-group">
              <label>Procedencia *</label>
              <input
                type="text"
                value={procedencia}
                onChange={(e) => setProcedencia(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Ejemplo: Universidad Nacional"
              />
            </div>

            {/* Líneas Temáticas */}
            <div className="form-group">
              <ThematicLineSelector
                selected={lineasTematicas}
                onChange={setLineasTematicas}
              />
              {lineasTematicas.length === 0 && (
                <small style={{ color: '#dc3545' }}>
                  * Se debe seleccionar al menos una línea temática
                </small>
              )}
            </div>

            {/* Fechas */}
            <div className="form-group">
              <label>Fecha de Recepción *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <DateInput
                    value={fechaRecepcion}
                    onChange={setFechaRecepcion}
                    disabled={isSubmitting || usarHoyRecepcion}
                    required
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={usarHoyRecepcion}
                    onChange={(e) => handleUsarHoyRecepcion(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  Hoy
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Fecha de Aceptación</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <DateInput
                    value={fechaAceptacion}
                    onChange={setFechaAceptacion}
                    disabled={isSubmitting || usarHoyAceptacion}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={usarHoyAceptacion}
                    onChange={(e) => handleUsarHoyAceptacion(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  Hoy
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Fecha de Publicación</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <DateInput
                    value={fechaPublicacion}
                    onChange={setFechaPublicacion}
                    disabled={isSubmitting || usarHoyPublicacion}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={usarHoyPublicacion}
                    onChange={(e) => handleUsarHoyPublicacion(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  Hoy
                </label>
              </div>
            </div>

            {/* Autor - RF-019 y RF-020 */}
            <div className="form-group">
              <label>Autor *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowAuthorModal(true)}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {selectedAuthor ? 'Cambiar Autor' : 'Seleccionar Autor'}
                </button>

                {selectedAuthor && (
                  <div style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      <strong>{selectedAuthor.nombre} {selectedAuthor.apellido1} {selectedAuthor.apellido2}</strong>
                      {' '}- {selectedAuthor.afiliacion}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveAuthor}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#721c24',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0 10px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Evaluadores - RF-021 */}
            <div className="form-group">
              <label>Evaluadores (Opcional)</label>

              {selectedEvaluators.length > 0 && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}>
                  <strong>Seleccionados:</strong>
                  <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                    {selectedEvaluators.map(ev => (
                      <li key={ev.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '5px 0'
                      }}>
                        <span>
                          {ev.nombre} {ev.apellido1} {ev.apellido2} - {ev.afiliacion}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvaluator(ev.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setShowEvaluatorModal(true)}
                disabled={isSubmitting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                Seleccionar Evaluadores ({selectedEvaluators.length})
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Artículo"}
            </button>
          </form>
        </div>
      </main>

      {/* Modales */}
      <SearchAuthorModal
        isOpen={showAuthorModal}
        onClose={() => setShowAuthorModal(false)}
        onSelectAuthor={handleSelectAuthor}
        articleThematicLines={lineasTematicas}
        excludedIds={selectedEvaluators.map(e => e.id)}
      />

      <SearchEvaluatorModal
        isOpen={showEvaluatorModal}
        onClose={() => setShowEvaluatorModal(false)}
        onSelectEvaluators={handleSelectEvaluators}
        alreadySelected={selectedEvaluators.map(e => e.id).concat(selectedAuthor ? [selectedAuthor.id] : [])}
        articleThematicLines={lineasTematicas}
      />
    </div>
  );
};

export default CreateArticle;
