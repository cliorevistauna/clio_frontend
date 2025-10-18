import { useReducer, useEffect, useCallback } from "react";
import { Article } from "../types";
import {
  backendToFrontendDate,
  getCurrentDateFrontend,
  frontendToBackendDate,
  isValidFrontendDateFormat
} from "../../../shared/utils/dateUtils";

interface ArticleFormState {
  titulo: string;
  procedencia: string;
  estado: 'recibido' | 'asignado' | 'aceptado' | 'rechazado' | 'publicado';
  fechaRecepcion: string;
  fechaAceptacion: string;
  fechaPublicacion: string;
  lineasTematicas: number[];
  usarHoyRecepcion: boolean;
  usarHoyAceptacion: boolean;
  usarHoyPublicacion: boolean;
}

type ArticleFormAction =
  | { type: 'SET_FIELD'; field: keyof ArticleFormState; value: any }
  | { type: 'LOAD_ARTICLE'; data: Article }
  | { type: 'SET_TODAY'; field: 'fechaRecepcion' | 'fechaAceptacion' | 'fechaPublicacion'; checked: boolean };

const initialState: ArticleFormState = {
  titulo: "",
  procedencia: "",
  estado: 'recibido',
  fechaRecepcion: "",
  fechaAceptacion: "",
  fechaPublicacion: "",
  lineasTematicas: [],
  usarHoyRecepcion: false,
  usarHoyAceptacion: false,
  usarHoyPublicacion: false
};

const articleFormReducer = (
  state: ArticleFormState,
  action: ArticleFormAction
): ArticleFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'LOAD_ARTICLE':
      const { data } = action;
      return {
        ...state,
        titulo: data.titulo,
        procedencia: data.procedencia,
        estado: data.estado,
        fechaRecepcion: backendToFrontendDate(data.fecha_recepcion),
        fechaAceptacion: data.fecha_aceptacion ? backendToFrontendDate(data.fecha_aceptacion) : "",
        fechaPublicacion: data.fecha_publicacion ? backendToFrontendDate(data.fecha_publicacion) : "",
        lineasTematicas: data.lineas_tematicas_info?.map(lt => lt.id) || []
      };
    case 'SET_TODAY':
      const checkboxField = `usarHoy${action.field.charAt(0).toUpperCase() + action.field.slice(1)}` as keyof ArticleFormState;
      return {
        ...state,
        [checkboxField]: action.checked,
        [action.field]: action.checked ? getCurrentDateFrontend() : ""
      };
    default:
      return state;
  }
};

export const useArticleForm = (article: Article | null) => {
  const [formState, dispatch] = useReducer(articleFormReducer, initialState);

  useEffect(() => {
    if (article) {
      dispatch({ type: 'LOAD_ARTICLE', data: article });
    }
  }, [article]);

  const setField = useCallback((field: keyof ArticleFormState, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setToday = useCallback((field: 'fechaRecepcion' | 'fechaAceptacion' | 'fechaPublicacion', checked: boolean) => {
    dispatch({ type: 'SET_TODAY', field, checked });
  }, []);

  const validateForm = useCallback(() => {
    if (!formState.titulo || !formState.procedencia || !formState.fechaRecepcion) {
      return "Por favor, complete todos los campos obligatorios.";
    }

    if (formState.lineasTematicas.length === 0) {
      return "Se debe seleccionar al menos una línea temática.";
    }

    if (!isValidFrontendDateFormat(formState.fechaRecepcion)) {
      return "La fecha de recepción debe tener el formato DD-MM-YYYY.";
    }

    if (formState.fechaAceptacion && !isValidFrontendDateFormat(formState.fechaAceptacion)) {
      return "La fecha de aceptación debe tener el formato DD-MM-YYYY.";
    }

    if (formState.fechaPublicacion && !isValidFrontendDateFormat(formState.fechaPublicacion)) {
      return "La fecha de publicación debe tener el formato DD-MM-YYYY.";
    }

    return null;
  }, [formState]);

  const getUpdateData = useCallback((selectedEditorialNumber: number | null) => {
    return {
      titulo: formState.titulo,
      procedencia: formState.procedencia,
      estado: formState.estado,
      fecha_recepcion: frontendToBackendDate(formState.fechaRecepcion),
      fecha_aceptacion: formState.fechaAceptacion ? frontendToBackendDate(formState.fechaAceptacion) : null,
      fecha_publicacion: formState.fechaPublicacion ? frontendToBackendDate(formState.fechaPublicacion) : null,
      numero_editorial: selectedEditorialNumber || undefined,
      lineas_tematicas: formState.lineasTematicas
    };
  }, [formState]);

  return {
    formState,
    setField,
    setToday,
    validateForm,
    getUpdateData
  };
};
