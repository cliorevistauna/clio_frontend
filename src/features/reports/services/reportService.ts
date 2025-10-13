import { apiClient } from '../../../shared/services/api';
import {
  EvaluatorHistoryResponse,
  EvaluatorHistoryParams,
  EvaluatorsByThemeResponse,
  EvaluatorsByThemeParams,
  EvaluatorWorkloadResponse,
  EvaluatorWorkloadParams,
  InvitationsByIssueResponse,
  InvitationsByIssueParams,
  ParticipationByArticleResponse,
  ParticipationByArticleParams,
  PreviousParticipationResponse,
  PreviousParticipationParams,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Servicio para gestión de reportes
 */
export const reportService = {
  // ==================== RF-022: Histórico de evaluaciones por evaluador ====================

  getEvaluatorHistory: async (params: EvaluatorHistoryParams): Promise<EvaluatorHistoryResponse> => {
    if (!params.evaluador_id) {
      throw new Error('evaluador_id es requerido');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('evaluador_id', params.evaluador_id.toString());

    if (params.numero_editorial_id && params.numero_editorial_id.length > 0) {
      params.numero_editorial_id.forEach(id => {
        queryParams.append('numero_editorial_id', id.toString());
      });
    }

    if (params.formato) {
      queryParams.append('formato', params.formato);
    }

    const response = await apiClient.get<EvaluatorHistoryResponse>(
      `/evaluator-history/?${queryParams.toString()}`
    );
    return response;
  },

  downloadEvaluatorHistoryPDF: async (params: EvaluatorHistoryParams): Promise<Blob> => {
    if (!params.evaluador_id) {
      throw new Error('evaluador_id es requerido');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('evaluador_id', params.evaluador_id.toString());
    queryParams.append('formato', 'pdf');

    if (params.numero_editorial_id && params.numero_editorial_id.length > 0) {
      params.numero_editorial_id.forEach(id => {
        queryParams.append('numero_editorial_id', id.toString());
      });
    }

    const url = `${API_BASE_URL}/evaluator-history/?${queryParams.toString()}`;
    const token = localStorage.getItem('access_token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Error al descargar PDF: ${response.status}`);
    }

    return await response.blob();
  },

  // ==================== RF-023: Estadísticas de evaluadores por línea temática ====================

  getEvaluatorsByTheme: async (params: EvaluatorsByThemeParams = {}): Promise<EvaluatorsByThemeResponse> => {
    const queryParams = new URLSearchParams();

    if (params.linea_tematica_id !== undefined && params.linea_tematica_id !== null) {
      queryParams.append('linea_tematica_id', params.linea_tematica_id.toString());
    }

    if (params.include_detail) {
      queryParams.append('include_detail', 'true');
    }

    if (params.formato) {
      queryParams.append('formato', params.formato);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/evaluators-by-theme/?${queryString}` : '/evaluators-by-theme/';

    const response = await apiClient.get<EvaluatorsByThemeResponse>(endpoint);
    return response;
  },

  downloadEvaluatorsByThemePDF: async (params: EvaluatorsByThemeParams = {}): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('formato', 'pdf');

    if (params.linea_tematica_id !== undefined && params.linea_tematica_id !== null) {
      queryParams.append('linea_tematica_id', params.linea_tematica_id.toString());
    }

    if (params.include_detail) {
      queryParams.append('include_detail', 'true');
    }

    const url = `${API_BASE_URL}/evaluators-by-theme/?${queryParams.toString()}`;
    const token = localStorage.getItem('access_token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Error al descargar PDF: ${response.status}`);
    }

    return await response.blob();
  },

  // ==================== RF-024: Carga de trabajo de evaluadores ====================

  getEvaluatorWorkload: async (params: EvaluatorWorkloadParams = {}): Promise<EvaluatorWorkloadResponse> => {
    const queryParams = new URLSearchParams();

    if (params.evaluador_id) {
      queryParams.append('evaluador_id', params.evaluador_id.toString());
    }

    if (params.formato) {
      queryParams.append('formato', params.formato);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/evaluator-workload/?${queryString}` : '/evaluator-workload/';

    const response = await apiClient.get<EvaluatorWorkloadResponse>(endpoint);
    return response;
  },

  downloadEvaluatorWorkloadPDF: async (params: EvaluatorWorkloadParams = {}): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('formato', 'pdf');

    if (params.evaluador_id) {
      queryParams.append('evaluador_id', params.evaluador_id.toString());
    }

    const url = `${API_BASE_URL}/evaluator-workload/?${queryParams.toString()}`;
    const token = localStorage.getItem('access_token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Error al descargar PDF: ${response.status}`);
    }

    return await response.blob();
  },

  // ==================== RF-025: Invitaciones por número editorial ====================

  getInvitationsByIssue: async (params: InvitationsByIssueParams): Promise<InvitationsByIssueResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('numero_editorial_id', params.numero_editorial_id.toString());

    if (params.articulo_id) {
      queryParams.append('articulo_id', params.articulo_id.toString());
    }

    if (params.formato) {
      queryParams.append('formato', params.formato);
    }

    const response = await apiClient.get<InvitationsByIssueResponse>(
      `/invitations-by-issue/?${queryParams.toString()}`
    );
    return response;
  },

  downloadInvitationsByIssuePDF: async (params: InvitationsByIssueParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('numero_editorial_id', params.numero_editorial_id.toString());
    queryParams.append('formato', 'pdf');

    if (params.articulo_id) {
      queryParams.append('articulo_id', params.articulo_id.toString());
    }

    const url = `${API_BASE_URL}/invitations-by-issue/?${queryParams.toString()}`;
    const token = localStorage.getItem('access_token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Error al descargar PDF: ${response.status}`);
    }

    return await response.blob();
  },

  // ==================== RF-026: Participación por artículo ====================

  getParticipationByArticle: async (params: ParticipationByArticleParams): Promise<ParticipationByArticleResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('articulo_id', params.articulo_id.toString());

    if (params.include_detail) {
      queryParams.append('include_detail', 'true');
    }

    if (params.formato) {
      queryParams.append('formato', params.formato);
    }

    const response = await apiClient.get<ParticipationByArticleResponse>(
      `/participation-by-article/?${queryParams.toString()}`
    );
    return response;
  },

  downloadParticipationByArticlePDF: async (params: ParticipationByArticleParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('articulo_id', params.articulo_id.toString());
    queryParams.append('formato', 'pdf');

    if (params.include_detail) {
      queryParams.append('include_detail', 'true');
    }

    const url = `${API_BASE_URL}/participation-by-article/?${queryParams.toString()}`;
    const token = localStorage.getItem('access_token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Error al descargar PDF: ${response.status}`);
    }

    return await response.blob();
  },

  // ==================== RF-027: Participación en números anteriores ====================

  getPreviousParticipation: async (params: PreviousParticipationParams = {}): Promise<PreviousParticipationResponse> => {
    const queryParams = new URLSearchParams();

    if (params.evaluador_id) {
      queryParams.append('evaluador_id', params.evaluador_id.toString());
    }

    if (params.formato) {
      queryParams.append('formato', params.formato);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/previous-participation/?${queryString}` : '/previous-participation/';

    const response = await apiClient.get<PreviousParticipationResponse>(endpoint);
    return response;
  },

  downloadPreviousParticipationPDF: async (params: PreviousParticipationParams = {}): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('formato', 'pdf');

    if (params.evaluador_id) {
      queryParams.append('evaluador_id', params.evaluador_id.toString());
    }

    const url = `${API_BASE_URL}/previous-participation/?${queryParams.toString()}`;
    const token = localStorage.getItem('access_token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Error al descargar PDF: ${response.status}`);
    }

    return await response.blob();
  },
};
