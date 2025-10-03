export interface Article {
  id: number;
  titulo: string;
  procedencia: string;
  estado: 'recibido' | 'asignado' | 'aceptado' | 'rechazado' | 'publicado';
  fecha_recepcion: string;
  fecha_aceptacion: string | null;
  fecha_publicacion: string | null;
  estado_activo: 'activo' | 'inactivo';
  numero_editorial: number;
  numero_editorial_info?: {
    id: number;
    numero: number;
    anio: number;
    estado: string;
  };
  lineas_tematicas_info?: Array<{
    id: number;
    nombre: string;
    estado: boolean;
  }>;
  autores_info?: Array<{
    id: number;
    investigador: number;
    investigador_info: {
      id: number;
      orcid: string;
      nombre: string;
      apellido1: string;
      apellido2: string;
      correo: string;
      afiliacion: string;
      pais: string;
    };
  }>;
  evaluadores_info?: Array<{
    id: number;
    investigador: number;
    estado_comunicacion: 'invitado' | 'aceptado' | 'rechazado' | 'sin_respuesta';
    estado_dictamen: 'aceptado' | 'rechazado' | null;
    fecha_envio_dictamen: string | null;
    fecha_limite_dictamen: string | null;
    fecha_entrega_dictamen: string | null;
    investigador_info: {
      id: number;
      orcid: string;
      nombre: string;
      apellido1: string;
      apellido2: string;
      correo: string;
      afiliacion: string;
      pais: string;
    };
  }>;
}

export interface CreateArticleRequest {
  titulo: string;
  procedencia: string;
  fecha_recepcion: string;
  fecha_aceptacion?: string;
  fecha_publicacion?: string;
  numero_editorial?: number | null; // Opcional, se asigna automático si no se proporciona
  lineas_tematicas: number[]; // Array de IDs de líneas temáticas (mínimo 1)
  autores?: number[]; // Array de IDs de investigadores autores
  evaluadores_data?: Array<{
    investigador: number;
    estado_comunicacion?: 'invitado' | 'aceptado' | 'rechazado' | 'sin_respuesta';
    estado_dictamen?: 'aceptado' | 'rechazado' | null;
    fecha_envio_dictamen?: string | null;
    fecha_limite_dictamen?: string | null;
    fecha_entrega_dictamen?: string | null;
  }>;
}

export interface UpdateArticleRequest {
  id: number;
  titulo?: string;
  procedencia?: string;
  fecha_recepcion?: string;
  fecha_aceptacion?: string | null;
  fecha_publicacion?: string | null;
  estado?: 'recibido' | 'asignado' | 'aceptado' | 'rechazado' | 'publicado';
  numero_editorial?: number;
  lineas_tematicas?: number[];
  autores?: number[];
  evaluadores_data?: Array<{
    investigador: number;
    estado_comunicacion?: 'invitado' | 'aceptado' | 'rechazado' | 'sin_respuesta';
    estado_dictamen?: 'aceptado' | 'rechazado' | null;
    fecha_envio_dictamen?: string | null;
    fecha_limite_dictamen?: string | null;
    fecha_entrega_dictamen?: string | null;
  }>;
}

export interface ResearcherSearchResult {
  id: number;
  orcid: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  afiliacion: string;
  grado_academico: string;
  pais: string;
  lugar_trabajo: string;
  correo: string;
  telefono: string;
  lineas_tematicas?: number[];
  idiomas?: number[];
  estado: 'activo' | 'inactivo';
}
