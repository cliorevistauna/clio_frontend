// RF-022: Histórico de evaluaciones por evaluador
export interface EvaluatorHistoryItem {
  evaluador_id: number;
  evaluador_nombre: string;
  evaluador_orcid: string;
  articulo_id: number;
  articulo_titulo: string;
  numero_editorial: number;
  fecha_asignacion: string;
  estado_comunicacion: 'invitado' | 'aceptado' | 'rechazado' | 'sin_respuesta';
  estado_dictamen: 'aceptado' | 'rechazado' | null;
  fecha_entrega_dictamen: string | null;
}

export interface EvaluatorHistoryResponse {
  evaluador: {
    id: number;
    nombre: string;
    orcid: string;
  };
  total_evaluaciones: number;
  evaluaciones: EvaluatorHistoryItem[];
}

export interface EvaluatorHistoryParams {
  evaluador_id: number;
  numero_editorial_id?: number[];
  formato?: 'json' | 'pdf';
}

// RF-023: Estadísticas de evaluadores por línea temática
export interface EvaluatorsByThemeItem {
  linea_tematica_id: number;
  linea_tematica_nombre: string;
  total_evaluadores: number;
  evaluadores?: Array<{
    id: number;
    nombre_completo: string;
    afiliacion: string;
    idiomas: string;
    telefono: string;
    correo: string;
  }>;
}

export interface EvaluatorsByThemeResponse {
  total_lineas_tematicas: number;
  estadisticas: EvaluatorsByThemeItem[];
}

export interface EvaluatorsByThemeParams {
  linea_tematica_id?: number | null;
  include_detail?: boolean;
  formato?: 'json' | 'pdf';
}

// RF-024: Carga de trabajo de evaluadores
export interface EvaluatorWorkloadItem {
  evaluador_id: number;
  evaluador_nombre: string;
  evaluador_orcid: string;
  total_dictamenes: number;
  numeros_editoriales: number[];
}

export interface EvaluatorWorkloadResponse {
  total_evaluadores: number;
  carga_trabajo: EvaluatorWorkloadItem[];
}

export interface EvaluatorWorkloadParams {
  evaluador_id?: number;
  formato?: 'json' | 'pdf';
}

// RF-025: Invitaciones por número editorial
export interface InvitationsByIssueResponse {
  numero_editorial_id: number;
  numero_editorial_nombre: number;
  total_invitaciones: number;
  desglose_por_articulo?: Array<{
    articulo_id: number;
    articulo_titulo: string;
    total_invitaciones: number;
  }>;
  articulo_id?: number;
  articulo_titulo?: string;
}

export interface InvitationsByIssueParams {
  numero_editorial_id: number;
  articulo_id?: number;
  formato?: 'json' | 'pdf';
}

// RF-026: Participación por artículo
export interface ParticipationByArticleResponse {
  articulo_id: number;
  articulo_titulo: string;
  numero_editorial: number;
  total_evaluadores_dictamen: number;
  evaluadores_detalle?: Array<{
    evaluador_id: number;
    evaluador_nombre: string;
    evaluador_orcid: string;
    estado_dictamen: string;
    fecha_entrega_dictamen: string | null;
  }>;
}

export interface ParticipationByArticleParams {
  articulo_id: number;
  include_detail?: boolean;
  formato?: 'json' | 'pdf';
}

// RF-027: Participación en números anteriores
export interface PreviousParticipationResponse {
  evaluador_id?: number;
  evaluador_nombre?: string;
  numero_editorial_anterior: string;
  participo: boolean;
  articulos_evaluados?: Array<{
    articulo_id: number;
    articulo_titulo: string;
    estado_dictamen: string | null;
  }>;
  // Para consulta general
  total_evaluadores?: number;
  participaciones?: Array<{
    evaluador_id: number;
    evaluador_nombre: string;
    numero_editorial_anterior: string;
    participo: boolean;
    articulos_evaluados: Array<{
      articulo_id: number;
      articulo_titulo: string;
      estado_dictamen: string | null;
    }>;
  }>;
  mensaje?: string;
}

export interface PreviousParticipationParams {
  evaluador_id?: number;
  formato?: 'json' | 'pdf';
}
