import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import { SearchAuthorModal, SearchEvaluatorModal } from "../components";
import ArticleInfoSection from "../components/ArticleInfoSection";
import AuthorSection from "../components/AuthorSection";
import EvaluatorsSection from "../components/EvaluatorsSection";
import { articleService } from "../services";
import { Article, ResearcherSearchResult } from "../types";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks";
import { ROUTES } from "../../../shared/constants";
import { editorialNumberService } from "../../editorial-numbers/services";
import { EditorialNumber } from "../../editorial-numbers/types";
import { useArticleForm } from "../hooks/useArticleForm";
import { useEvaluatorsManager } from "../hooks/useEvaluatorsManager";
import "../../../shared/styles/WideLayout.css";

const styles = {
  buttonFlexContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#6c757d'
  }
};

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

  // Número editorial
  const [editorialNumbers, setEditorialNumbers] = useState<EditorialNumber[]>([]);
  const [selectedEditorialNumber, setSelectedEditorialNumber] = useState<number | null>(null);

  // Autores y evaluadores
  const [selectedAuthor, setSelectedAuthor] = useState<ResearcherSearchResult | null>(null);

  // Usar custom hooks
  const { formState, setField, setToday, validateForm, getUpdateData } = useArticleForm(article);
  const {
    evaluatorsWithState,
    addEvaluators,
    removeEvaluator,
    updateEvaluatorState,
    updateEvaluatorDateCheckbox,
    validateEvaluators,
    getEvaluatorsData,
    getEvaluatorIds
  } = useEvaluatorsManager({
    initialEvaluators: article?.evaluadores_info || [],
    selectedAuthorId: selectedAuthor?.id || null
  });

  // Modales
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar números editoriales disponibles (incluyendo inactivos para mostrar correctamente los ya asociados)
  useEffect(() => {
    const loadEditorialNumbers = async () => {
      try {
        const all = await editorialNumberService.getAll({ includeInactive: true });
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

  const handleSelectAuthor = useCallback((author: ResearcherSearchResult) => {
    const isAlreadyEvaluator = getEvaluatorIds().includes(author.id);

    if (isAlreadyEvaluator) {
      alert(
        `El investigador ${author.nombre} ${author.apellido1} ${author.apellido2} ` +
        `ya está seleccionado como evaluador.\n\n` +
        `Un investigador no puede ser autor y evaluador del mismo artículo.`
      );
      return;
    }

    setSelectedAuthor(author);
  }, [getEvaluatorIds]);

  const handleSelectEvaluators = useCallback((evaluators: ResearcherSearchResult[]) => {
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

    const error = addEvaluators(evaluators);
    if (error) {
      alert(error);
    }
  }, [selectedAuthor, addEvaluators]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Validaciones
    const formError = validateForm();
    if (formError) {
      alert(formError);
      return;
    }

    if (!selectedAuthor) {
      alert("Es obligatorio tener un autor asignado.");
      return;
    }

    const evaluatorsError = validateEvaluators();
    if (evaluatorsError) {
      alert(evaluatorsError);
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        ...getUpdateData(selectedEditorialNumber),
        autores: [selectedAuthor.id],
        evaluadores_data: getEvaluatorsData()
      };

      console.log("Actualizando artículo:", updateData);

      await articleService.update(parseInt(id), updateData);

      alert("Artículo actualizado exitosamente.");
      navigate(ROUTES.MODIFY_ARTICLE);

    } catch (error: any) {
      console.error("Error al actualizar artículo:", error);
      const errorMessage = error?.message || "Error al actualizar el artículo.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    id,
    validateForm,
    selectedAuthor,
    validateEvaluators,
    getUpdateData,
    selectedEditorialNumber,
    getEvaluatorsData,
    navigate
  ]);

  if (isLoading) {
    return (
      <div className="app-layout wide-layout">
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
      <div className="app-layout wide-layout">
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
    <div className="app-layout wide-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <ArticleInfoSection
              titulo={formState.titulo}
              procedencia={formState.procedencia}
              estado={formState.estado}
              fechaRecepcion={formState.fechaRecepcion}
              fechaAceptacion={formState.fechaAceptacion}
              fechaPublicacion={formState.fechaPublicacion}
              lineasTematicas={formState.lineasTematicas}
              usarHoyRecepcion={formState.usarHoyRecepcion}
              usarHoyAceptacion={formState.usarHoyAceptacion}
              usarHoyPublicacion={formState.usarHoyPublicacion}
              selectedEditorialNumber={selectedEditorialNumber}
              editorialNumbers={editorialNumbers}
              isSubmitting={isSubmitting}
              onFieldChange={setField}
              onTodayChange={setToday}
              onEditorialNumberChange={setSelectedEditorialNumber}
            />

            <AuthorSection
              selectedAuthor={selectedAuthor}
              isSubmitting={isSubmitting}
              onSelectAuthor={() => setShowAuthorModal(true)}
            />

            <EvaluatorsSection
              evaluators={evaluatorsWithState}
              isSubmitting={isSubmitting}
              onAddEvaluators={() => setShowEvaluatorModal(true)}
              onRemoveEvaluator={removeEvaluator}
              onUpdateState={updateEvaluatorState}
              onUpdateDateCheckbox={updateEvaluatorDateCheckbox}
            />

            <div style={styles.buttonFlexContainer}>
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
                style={styles.cancelButton}
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
        articleThematicLines={formState.lineasTematicas}
        excludedIds={getEvaluatorIds()}
      />

      <SearchEvaluatorModal
        isOpen={showEvaluatorModal}
        onClose={() => setShowEvaluatorModal(false)}
        onSelectEvaluators={handleSelectEvaluators}
        alreadySelected={[...getEvaluatorIds(), ...(selectedAuthor ? [selectedAuthor.id] : [])]}
        articleThematicLines={formState.lineasTematicas}
      />
    </div>
  );
};

export default UpdateArticle;
