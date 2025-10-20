import { useReducer, useCallback } from "react";
import { Researcher } from "../types";
import { researcherService } from "../services";

export interface ResearcherFormState {
  orcid: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  afiliacion: string;
  gradoAcademico: string;
  pais: string;
  lugarTrabajo: string;
  correo: string;
  lineas: number[];
  idiomas: number[];
  telefono: string;
  estado: string;
}

type ResearcherFormAction =
  | { type: 'SET_FIELD'; field: keyof ResearcherFormState; value: any }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_RESEARCHER'; data: Researcher };

const initialFormState: ResearcherFormState = {
  orcid: "",
  nombre: "",
  apellido1: "",
  apellido2: "",
  afiliacion: "",
  gradoAcademico: "",
  pais: "",
  lugarTrabajo: "",
  correo: "",
  lineas: [],
  idiomas: [],
  telefono: "",
  estado: "activo"
};

const researcherFormReducer = (
  state: ResearcherFormState,
  action: ResearcherFormAction
): ResearcherFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_FORM':
      return initialFormState;
    case 'LOAD_RESEARCHER':
      const { data } = action;
      let nombre = '';
      let apellido1 = '';
      let apellido2 = '';

      if (data.name) {
        const nameParts = data.name.trim().split(' ');
        if (nameParts.length === 1) {
          nombre = nameParts[0];
        } else if (nameParts.length === 2) {
          nombre = nameParts[0];
          apellido1 = nameParts[1];
        } else {
          apellido2 = nameParts[nameParts.length - 1];
          apellido1 = nameParts[nameParts.length - 2];
          nombre = nameParts.slice(0, nameParts.length - 2).join(' ');
        }
      }

      return {
        orcid: data.orcid || '',
        nombre,
        apellido1,
        apellido2,
        afiliacion: data.affiliation || '',
        gradoAcademico: data.academicDegree || '',
        pais: data.country || '',
        lugarTrabajo: '',
        correo: data.email || '',
        lineas: data.thematicLines || [],
        idiomas: Array.isArray(data.languages) ? data.languages : [],
        telefono: data.phones?.mobile || '',
        estado: data.status === 'active' ? 'activo' : 'inactivo'
      };
    default:
      return state;
  }
};

export const useResearcherForm = () => {
  const [formState, dispatch] = useReducer(researcherFormReducer, initialFormState);
  const [isUpdating, setIsUpdating] = useReducer((state: boolean, action: boolean) => action, false);
  const [selectedAuthor, setSelectedAuthor] = useReducer(
    (state: Researcher | null, action: Researcher | null) => action,
    null
  );

  const loadResearcher = useCallback((author: Researcher) => {
    setSelectedAuthor(author);
    dispatch({ type: 'LOAD_RESEARCHER', data: author });
  }, []);

  const clearForm = useCallback(() => {
    setSelectedAuthor(null);
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const updateField = useCallback((field: keyof ResearcherFormState, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const handleUpdate = useCallback(async (onSuccess?: () => void) => {
    if (!selectedAuthor) {
      return { success: false, message: "Primero debe buscar un autor o evaluador para modificar." };
    }

    if (!formState.nombre || !formState.apellido1 || !formState.apellido2 || !formState.correo) {
      return { success: false, message: "Debe completar todos los campos obligatorios (nombre, apellidos y correo)." };
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(formState.correo)) {
      return { success: false, message: "Formato de correo inválido." };
    }

    setIsUpdating(true);
    try {
      const updateData = {
        orcid: formState.orcid,
        nombre: formState.nombre,
        apellido1: formState.apellido1,
        apellido2: formState.apellido2,
        afiliacion: formState.afiliacion,
        grado_academico: formState.gradoAcademico,
        pais: formState.pais,
        lugar_trabajo: formState.lugarTrabajo,
        correo: formState.correo,
        lineas_tematicas: formState.lineas,
        idiomas: formState.idiomas,
        telefono: formState.telefono,
        estado: formState.estado,
      };

      await researcherService.update(selectedAuthor.id, updateData);

      clearForm();
      if (onSuccess) onSuccess();

      return { success: true, message: "Actualizado exitosamente." };
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
      return { success: false, message: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  }, [selectedAuthor, formState, clearForm]);

  return {
    formState,
    selectedAuthor,
    isUpdating,
    loadResearcher,
    clearForm,
    updateField,
    handleUpdate,
    dispatch
  };
};
