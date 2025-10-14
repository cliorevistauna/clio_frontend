import React, { useState, useEffect } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import { SearchAuthorModal, SearchEvaluatorModal } from "../components";
import { articleService } from "../services";
import { Article, ResearcherSearchResult } from "../types";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks";
import { ROUTES } from "../../../shared/constants";
import { editorialNumberService } from "../../editorial-numbers/services";
import { EditorialNumber } from "../../editorial-numbers/types";
import {
  frontendToBackendDate,
  backendToFrontendDate,
  isValidFrontendDateFormat,
  getCurrentDateFrontend
} from "../../../shared/utils/dateUtils";
import { DateInput } from "../../../shared/components/ui";

interface EvaluatorWithState {
  researcher: ResearcherSearchResult;
  estado_comunicacion: 'invitado' | 'aceptado' | 'rechazado' | 'sin_respuesta';
  estado_dictamen: 'aceptado' | 'rechazado' | null;
  fecha_envio_dictamen?: string | null;
  fecha_limite_dictamen?: string | null;
  fecha_entrega_dictamen?: string | null;
  usarHoyEnvio?: boolean;
  usarHoyLimite?: boolean;
  usarHoyEntrega?: boolean;
}

/**
 * RF-018: Modificación de Artículos
 *
 * Permite a Administradores y Editores modificar artículos existentes.
 * - Precarga datos actuales del backend
 * - Estados "Recibido" y "Asignado" son automáticos (gestionados por el backend según evaluadores)
 * - Estados finales "Aceptado", "Rechazado", "Publicado" son seleccionables manualmente
 * - Una vez en estado final, no se puede volver a recibido/asignado
 * - Gestión de estados de invitación y dictámenes de evaluadores
 */
const UpdateArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);

  // Campos del formulario
  const [titulo, setTitulo] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [estado, setEstado] = useState<'recibido' | 'asignado' | 'aceptado' | 'rechazado' | 'publicado'>('recibido');
  const [fechaRecepcion, setFechaRecepcion] = useState("");
  const [fechaAceptacion, setFechaAceptacion] = useState("");
  const [fechaPublicacion, setFechaPublicacion] = useState("");
  const [lineasTematicas, setLineasTematicas] = useState<number[]>([]);

  // Número editorial
  const [editorialNumbers, setEditorialNumbers] = useState<EditorialNumber[]>([]);
  const [selectedEditorialNumber, setSelectedEditorialNumber] = useState<number | null>(null);

  // Autores y evaluadores
  const [selectedAuthor, setSelectedAuthor] = useState<ResearcherSearchResult | null>(null);
  const [evaluatorsWithState, setEvaluatorsWithState] = useState<EvaluatorWithState[]>([]);

  // Modales
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para checkboxes "Hoy" de fechas principales
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
        const all = await editorialNumberService.getAll();
        setEditorialNumbers(all);
      } catch (error) {
        console.error("Error al cargar números editoriales:", error);
      }
    };
    loadEditorialNumbers();
  }, []);

  // Cargar datos del artículo
  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await articleService.getById(parseInt(id));
        setArticle(data);

        // Precargar campos
        setTitulo(data.titulo);
        setProcedencia(data.procedencia);
        setEstado(data.estado);
        setFechaRecepcion(backendToFrontendDate(data.fecha_recepcion));
        setFechaAceptacion(data.fecha_aceptacion ? backendToFrontendDate(data.fecha_aceptacion) : "");
        setFechaPublicacion(data.fecha_publicacion ? backendToFrontendDate(data.fecha_publicacion) : "");

        // Precargar líneas temáticas
        const lineasIds = data.lineas_tematicas_info?.map(lt => lt.id) || [];
        setLineasTematicas(lineasIds);

        // Precargar número editorial
        if (data.numero_editorial_info) {
          setSelectedEditorialNumber(data.numero_editorial_info.id);
        }

        // Precargar autor
        if (data.autores_info && data.autores_info.length > 0) {
          const autorInfo = data.autores_info[0].investigador_info;
          setSelectedAuthor({
            id: autorInfo.id,
            orcid: autorInfo.orcid,
            nombre: autorInfo.nombre,
            apellido1: autorInfo.apellido1,
            apellido2: autorInfo.apellido2,
            afiliacion: autorInfo.afiliacion,
            grado_academico: '',
            pais: autorInfo.pais,
            lugar_trabajo: '',
            correo: autorInfo.correo,
            telefono: '',
            estado: 'activo'
          });
        }

        // Precargar evaluadores con sus estados y fechas de dictamen
        if (data.evaluadores_info && data.evaluadores_info.length > 0) {
          const evalWithState: EvaluatorWithState[] = data.evaluadores_info.map(ev => ({
            researcher: {
              id: ev.investigador_info.id,
              orcid: ev.investigador_info.orcid,
              nombre: ev.investigador_info.nombre,
              apellido1: ev.investigador_info.apellido1,
              apellido2: ev.investigador_info.apellido2,
              afiliacion: ev.investigador_info.afiliacion,
              grado_academico: '',
              pais: ev.investigador_info.pais,
              lugar_trabajo: '',
              correo: ev.investigador_info.correo,
              telefono: '',
              estado: 'activo'
            },
            estado_comunicacion: ev.estado_comunicacion,
            estado_dictamen: ev.estado_dictamen,
            fecha_envio_dictamen: ev.fecha_envio_dictamen ? backendToFrontendDate(ev.fecha_envio_dictamen) : null,
            fecha_limite_dictamen: ev.fecha_limite_dictamen ? backendToFrontendDate(ev.fecha_limite_dictamen) : null,
            fecha_entrega_dictamen: ev.fecha_entrega_dictamen ? backendToFrontendDate(ev.fecha_entrega_dictamen) : null,
            usarHoyEnvio: false,
            usarHoyLimite: false,
            usarHoyEntrega: false
          }));
          setEvaluatorsWithState(evalWithState);
        }

      } catch (error) {
        console.error("Error al cargar artículo:", error);
        alert("Error al cargar el artículo.");
        navigate(ROUTES.MODIFY_ARTICLE);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [id, navigate]);

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
    const isAlreadyEvaluator = evaluatorsWithState.some(ev => ev.researcher.id === author.id);

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

    // Agregar nuevos evaluadores con estado por defecto "invitado" y fechas null
    const newEvaluators: EvaluatorWithState[] = evaluators.map(ev => ({
      researcher: ev,
      estado_comunicacion: 'invitado',
      estado_dictamen: null,
      fecha_envio_dictamen: null,
      fecha_limite_dictamen: null,
      fecha_entrega_dictamen: null,
      usarHoyEnvio: false,
      usarHoyLimite: false,
      usarHoyEntrega: false
    }));
    setEvaluatorsWithState([...evaluatorsWithState, ...newEvaluators]);
  };

  const handleRemoveEvaluator = (id: number) => {
    setEvaluatorsWithState(evaluatorsWithState.filter(e => e.researcher.id !== id));
  };

  const handleUpdateEvaluatorState = (
    id: number,
    field: 'estado_comunicacion' | 'estado_dictamen' | 'fecha_envio_dictamen' | 'fecha_limite_dictamen' | 'fecha_entrega_dictamen',
    value: any
  ) => {
    setEvaluatorsWithState(evaluatorsWithState.map(ev => {
      if (ev.researcher.id === id) {
        return { ...ev, [field]: value };
      }
      return ev;
    }));
  };

  // Manejar checkbox "Hoy" para fecha de envío de dictamen
  const handleUsarHoyEnvio = (id: number, checked: boolean) => {
    setEvaluatorsWithState(evaluatorsWithState.map(ev => {
      if (ev.researcher.id === id) {
        return {
          ...ev,
          usarHoyEnvio: checked,
          fecha_envio_dictamen: checked ? getCurrentDateFrontend() : ''
        };
      }
      return ev;
    }));
  };

  // Manejar checkbox "Hoy" para fecha límite de dictamen
  const handleUsarHoyLimite = (id: number, checked: boolean) => {
    setEvaluatorsWithState(evaluatorsWithState.map(ev => {
      if (ev.researcher.id === id) {
        return {
          ...ev,
          usarHoyLimite: checked,
          fecha_limite_dictamen: checked ? getCurrentDateFrontend() : ''
        };
      }
      return ev;
    }));
  };

  // Manejar checkbox "Hoy" para fecha de entrega de dictamen
  const handleUsarHoyEntrega = (id: number, checked: boolean) => {
    setEvaluatorsWithState(evaluatorsWithState.map(ev => {
      if (ev.researcher.id === id) {
        return {
          ...ev,
          usarHoyEntrega: checked,
          fecha_entrega_dictamen: checked ? getCurrentDateFrontend() : ''
        };
      }
      return ev;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Validaciones RF-018
    if (!titulo || !procedencia || !fechaRecepcion) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (!selectedAuthor) {
      alert("Es obligatorio tener un autor asignado.");
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

    // Validar fechas de dictámenes
    for (const ev of evaluatorsWithState) {
      if (ev.fecha_envio_dictamen && !isValidFrontendDateFormat(ev.fecha_envio_dictamen)) {
        alert(`La fecha de envío de dictamen del evaluador ${ev.researcher.nombre} ${ev.researcher.apellido1} debe tener el formato DD-MM-YYYY.`);
        return;
      }
      if (ev.fecha_limite_dictamen && !isValidFrontendDateFormat(ev.fecha_limite_dictamen)) {
        alert(`La fecha límite de dictamen del evaluador ${ev.researcher.nombre} ${ev.researcher.apellido1} debe tener el formato DD-MM-YYYY.`);
        return;
      }
      if (ev.fecha_entrega_dictamen && !isValidFrontendDateFormat(ev.fecha_entrega_dictamen)) {
        alert(`La fecha de entrega de dictamen del evaluador ${ev.researcher.nombre} ${ev.researcher.apellido1} debe tener el formato DD-MM-YYYY.`);
        return;
      }
    }

    // Los evaluadores son opcionales
    // No se requiere mínimo de evaluadores

    setIsSubmitting(true);
    try {
      const updateData = {
        titulo,
        procedencia,
        estado,
        fecha_recepcion: frontendToBackendDate(fechaRecepcion),
        fecha_aceptacion: fechaAceptacion ? frontendToBackendDate(fechaAceptacion) : null,
        fecha_publicacion: fechaPublicacion ? frontendToBackendDate(fechaPublicacion) : null,
        numero_editorial: selectedEditorialNumber || undefined,
        lineas_tematicas: lineasTematicas,
        autores: [selectedAuthor.id],
        evaluadores_data: evaluatorsWithState.map(ev => ({
          investigador: ev.researcher.id,
          estado_comunicacion: ev.estado_comunicacion,
          estado_dictamen: ev.estado_dictamen,
          fecha_envio_dictamen: ev.fecha_envio_dictamen ? frontendToBackendDate(ev.fecha_envio_dictamen) : null,
          fecha_limite_dictamen: ev.fecha_limite_dictamen ? frontendToBackendDate(ev.fecha_limite_dictamen) : null,
          fecha_entrega_dictamen: ev.fecha_entrega_dictamen ? frontendToBackendDate(ev.fecha_entrega_dictamen) : null
        }))
      };

      console.log("Actualizando artículo:", updateData);

      await articleService.update(parseInt(id), updateData);

      alert("Artículo actualizado exitosamente.");
      navigate(ROUTES.MODIFY_ARTICLE);

    } catch (error: any) {
      console.error("Error al actualizar artículo:", error);

      // El apiClient ahora extrae automáticamente el mensaje del backend
      const errorMessage = error?.message || "Error al actualizar el artículo.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <PageHeader onLogout={handleLogout} />
        <main className="main-content">
          <div className="form-container">
            <p>Cargando artículo...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="app-layout">
        <PageHeader onLogout={handleLogout} />
        <main className="main-content">
          <div className="form-container">
            <p>Artículo no encontrado.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">
            <h4 style={{ textAlign: "center" }}>Datos del Artículo</h4>

          <form onSubmit={handleSubmit}>
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
                  </option>
                ))}
              </select>
              <small style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                Puede modificar el número de publicación asignado
              </small>
            </div>

            {/* Título del Artículo */}
            <div className="form-group">
              <label>Título del Artículo *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                disabled={isSubmitting}
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
              />
            </div>

            {/* Líneas Temáticas */}
            <div className="form-group">
              <ThematicLineSelector
                selected={lineasTematicas}
                onChange={setLineasTematicas}
              />
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

            {/* Autor */}
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
                  </div>
                )}
              </div>
            </div>

            {/* Evaluadores con gestión de estados */}
            <div className="form-group">
              <label>Evaluadores</label>

              {evaluatorsWithState.length > 0 && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}>
                  <strong>Asignados:</strong>
                  {evaluatorsWithState.map(ev => (
                    <div key={ev.researcher.id} style={{
                      marginTop: '15px',
                      padding: '15px',
                      backgroundColor: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong>
                          {ev.researcher.nombre} {ev.researcher.apellido1} {ev.researcher.apellido2}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvaluator(ev.researcher.id)}
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
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>
                            Estado de Invitación:
                          </label>
                          <select
                            value={ev.estado_comunicacion}
                            onChange={(e) => handleUpdateEvaluatorState(
                              ev.researcher.id,
                              'estado_comunicacion',
                              e.target.value
                            )}
                            style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ced4da' }}
                          >
                            <option value="invitado">Invitado</option>
                            <option value="aceptado">Aceptado</option>
                            <option value="rechazado">Rechazado</option>
                            <option value="sin_respuesta">Sin Respuesta</option>
                          </select>
                        </div>

                        {ev.estado_comunicacion === 'aceptado' && (
                          <>
                            <div>
                              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>
                                Dictamen:
                              </label>
                              <select
                                value={ev.estado_dictamen || ''}
                                onChange={(e) => handleUpdateEvaluatorState(
                                  ev.researcher.id,
                                  'estado_dictamen',
                                  e.target.value || null
                                )}
                                style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ced4da' }}
                              >
                                <option value="">Sin dictamen</option>
                                <option value="aceptado">Aceptado</option>
                                <option value="rechazado">Rechazado</option>
                              </select>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>
                                Fecha de Envío de Dictamen:
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                  <DateInput
                                    value={ev.fecha_envio_dictamen || ''}
                                    onChange={(value) => handleUpdateEvaluatorState(
                                      ev.researcher.id,
                                      'fecha_envio_dictamen',
                                      value || null
                                    )}
                                    disabled={ev.usarHoyEnvio}
                                  />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, whiteSpace: 'nowrap' }}>
                                  <input
                                    type="checkbox"
                                    checked={ev.usarHoyEnvio || false}
                                    onChange={(e) => handleUsarHoyEnvio(ev.researcher.id, e.target.checked)}
                                  />
                                  Hoy
                                </label>
                              </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>
                                Fecha Límite de Dictamen:
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                  <DateInput
                                    value={ev.fecha_limite_dictamen || ''}
                                    onChange={(value) => handleUpdateEvaluatorState(
                                      ev.researcher.id,
                                      'fecha_limite_dictamen',
                                      value || null
                                    )}
                                    disabled={ev.usarHoyLimite}
                                  />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, whiteSpace: 'nowrap' }}>
                                  <input
                                    type="checkbox"
                                    checked={ev.usarHoyLimite || false}
                                    onChange={(e) => handleUsarHoyLimite(ev.researcher.id, e.target.checked)}
                                  />
                                  Hoy
                                </label>
                              </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>
                                Fecha de Entrega de Dictamen:
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                  <DateInput
                                    value={ev.fecha_entrega_dictamen || ''}
                                    onChange={(value) => handleUpdateEvaluatorState(
                                      ev.researcher.id,
                                      'fecha_entrega_dictamen',
                                      value || null
                                    )}
                                    disabled={ev.usarHoyEntrega}
                                  />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, whiteSpace: 'nowrap' }}>
                                  <input
                                    type="checkbox"
                                    checked={ev.usarHoyEntrega || false}
                                    onChange={(e) => handleUsarHoyEntrega(ev.researcher.id, e.target.checked)}
                                  />
                                  Hoy
                                </label>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
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
                Agregar Evaluadores ({evaluatorsWithState.length})
              </button>
            </div>

            {/* Estado del Artículo */}
            <div className="form-group">
              <label>Estado del Artículo</label>

              {/* Mostrar estado actual si es recibido o asignado (solo lectura) */}
              {(estado === 'recibido' || estado === 'asignado') && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}>
                  <strong>Estado actual: </strong>
                  <span style={{
                    color: estado === 'recibido' ? '#0d6efd' : '#ffc107',
                    fontWeight: 'bold'
                  }}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </span>
                  <br />
                  <small style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    {estado === 'recibido'
                      ? 'Este estado es automático (sin evaluadores asignados)'
                      : 'Este estado es automático (con evaluadores asignados)'}
                  </small>
                </div>
              )}

              {/* Selector solo para estados finales */}
              {estado !== 'recibido' && estado !== 'asignado' && (
                <>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as 'aceptado' | 'rechazado' | 'publicado')}
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="aceptado">Aceptado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="publicado">Publicado</option>
                  </select>
                  <small style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    Puede cambiar entre estados finales manualmente
                  </small>
                </>
              )}

              {/* Opción para cambiar a estado final */}
              {(estado === 'recibido' || estado === 'asignado') && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#6c757d' }}>
                    Cambiar a estado final:
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setEstado(e.target.value as 'aceptado' | 'rechazado' | 'publicado');
                      }
                    }}
                    value=""
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="">Seleccione un estado final...</option>
                    <option value="aceptado">Aceptado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={() => navigate(ROUTES.MODIFY_ARTICLE)}
                disabled={isSubmitting}
                style={{ backgroundColor: '#6c757d' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modales */}
      <SearchAuthorModal
        isOpen={showAuthorModal}
        onClose={() => setShowAuthorModal(false)}
        onSelectAuthor={handleSelectAuthor}
        articleThematicLines={lineasTematicas}
        excludedIds={evaluatorsWithState.map(e => e.researcher.id)}
      />

      <SearchEvaluatorModal
        isOpen={showEvaluatorModal}
        onClose={() => setShowEvaluatorModal(false)}
        onSelectEvaluators={handleSelectEvaluators}
        alreadySelected={evaluatorsWithState.map(e => e.researcher.id).concat(selectedAuthor ? [selectedAuthor.id] : [])}
        articleThematicLines={lineasTematicas}
      />
    </div>
  );
};

export default UpdateArticle;
