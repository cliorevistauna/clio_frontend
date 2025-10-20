import { useState, useCallback, useEffect } from "react";
import { ResearcherSearchResult } from "../types";
import {
  backendToFrontendDate,
  frontendToBackendDate,
  getCurrentDateFrontend,
  isValidFrontendDateFormat
} from "../../../shared/utils/dateUtils";

export interface EvaluatorWithState {
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

interface UseEvaluatorsManagerProps {
  initialEvaluators?: any[];
  selectedAuthorId?: number | null;
}

export const useEvaluatorsManager = ({ initialEvaluators = [], selectedAuthorId = null }: UseEvaluatorsManagerProps) => {
  const [evaluatorsWithState, setEvaluatorsWithState] = useState<EvaluatorWithState[]>([]);

  useEffect(() => {
    if (initialEvaluators.length > 0) {
      const evalWithState: EvaluatorWithState[] = initialEvaluators.map(ev => ({
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
  }, [initialEvaluators]);

  const addEvaluators = useCallback((evaluators: ResearcherSearchResult[]) => {
    if (selectedAuthorId) {
      const authorIsEvaluator = evaluators.some(ev => ev.id === selectedAuthorId);
      if (authorIsEvaluator) {
        return "El autor no puede ser seleccionado como evaluador.";
      }
    }

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

    setEvaluatorsWithState(prev => [...prev, ...newEvaluators]);
    return null;
  }, [selectedAuthorId]);

  const removeEvaluator = useCallback((id: number) => {
    setEvaluatorsWithState(prev => prev.filter(e => e.researcher.id !== id));
  }, []);

  const updateEvaluatorState = useCallback((
    id: number,
    field: 'estado_comunicacion' | 'estado_dictamen' | 'fecha_envio_dictamen' | 'fecha_limite_dictamen' | 'fecha_entrega_dictamen',
    value: any
  ) => {
    setEvaluatorsWithState(prev => prev.map(ev => {
      if (ev.researcher.id === id) {
        return { ...ev, [field]: value };
      }
      return ev;
    }));
  }, []);

  const updateEvaluatorDateCheckbox = useCallback((id: number, field: 'usarHoyEnvio' | 'usarHoyLimite' | 'usarHoyEntrega', checked: boolean) => {
    const dateFieldMap = {
      usarHoyEnvio: 'fecha_envio_dictamen',
      usarHoyLimite: 'fecha_limite_dictamen',
      usarHoyEntrega: 'fecha_entrega_dictamen'
    };

    const dateField = dateFieldMap[field];

    setEvaluatorsWithState(prev => prev.map(ev => {
      if (ev.researcher.id === id) {
        return {
          ...ev,
          [field]: checked,
          [dateField]: checked ? getCurrentDateFrontend() : ''
        };
      }
      return ev;
    }));
  }, []);

  const validateEvaluators = useCallback(() => {
    for (const ev of evaluatorsWithState) {
      if (ev.fecha_envio_dictamen && !isValidFrontendDateFormat(ev.fecha_envio_dictamen)) {
        return `La fecha de envío de dictamen del evaluador ${ev.researcher.nombre} ${ev.researcher.apellido1} debe tener el formato DD-MM-YYYY.`;
      }
      if (ev.fecha_limite_dictamen && !isValidFrontendDateFormat(ev.fecha_limite_dictamen)) {
        return `La fecha límite de dictamen del evaluador ${ev.researcher.nombre} ${ev.researcher.apellido1} debe tener el formato DD-MM-YYYY.`;
      }
      if (ev.fecha_entrega_dictamen && !isValidFrontendDateFormat(ev.fecha_entrega_dictamen)) {
        return `La fecha de entrega de dictamen del evaluador ${ev.researcher.nombre} ${ev.researcher.apellido1} debe tener el formato DD-MM-YYYY.`;
      }
    }
    return null;
  }, [evaluatorsWithState]);

  const getEvaluatorsData = useCallback(() => {
    return evaluatorsWithState.map(ev => ({
      investigador: ev.researcher.id,
      estado_comunicacion: ev.estado_comunicacion,
      estado_dictamen: ev.estado_dictamen,
      fecha_envio_dictamen: ev.fecha_envio_dictamen ? frontendToBackendDate(ev.fecha_envio_dictamen) : null,
      fecha_limite_dictamen: ev.fecha_limite_dictamen ? frontendToBackendDate(ev.fecha_limite_dictamen) : null,
      fecha_entrega_dictamen: ev.fecha_entrega_dictamen ? frontendToBackendDate(ev.fecha_entrega_dictamen) : null
    }));
  }, [evaluatorsWithState]);

  const getEvaluatorIds = useCallback(() => {
    return evaluatorsWithState.map(e => e.researcher.id);
  }, [evaluatorsWithState]);

  return {
    evaluatorsWithState,
    addEvaluators,
    removeEvaluator,
    updateEvaluatorState,
    updateEvaluatorDateCheckbox,
    validateEvaluators,
    getEvaluatorsData,
    getEvaluatorIds
  };
};
