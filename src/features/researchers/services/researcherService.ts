import { apiClient } from '../../../shared/services/api';
import {
  Researcher,
  CreateResearcherRequest,
  UpdateResearcherRequest,
  ThematicLine,
} from '../types';
import { PaginationParams } from '../../../shared/types';

export class ResearcherService {
  private endpoint = '/researchers';

  async getAll(params?: PaginationParams & { includeInactive?: boolean }): Promise<Researcher[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('ordering', params.sortBy);
    if (params?.includeInactive === true) queryParams.append('include_inactive', 'true');

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoint}/?${queryString}` : `${this.endpoint}/`;

    const response = await apiClient.get<any>(endpoint);
    const results = response.results || response;
    return results.map((r: any) => this.mapDjangoToFrontend(r));
  }

  async getById(id: string): Promise<Researcher> {
    return apiClient.get<Researcher>(`${this.endpoint}/${id}/`);
  }

  async create(data: CreateResearcherRequest): Promise<Researcher> {
    // Mapear los datos del frontend al formato esperado por Django
    // Usa el endpoint del ViewSet que acepta ResearcherSerializer completo
    const djangoData = {
      orcid: data.orcid,
      nombre: data.nombre,
      apellido1: data.apellido1,
      apellido2: data.apellido2,
      afiliacion: data.affiliation,
      grado_academico: data.academicDegree,
      pais: data.country,
      lugar_trabajo: data.workPlace || '',
      telefono: data.phones.mobile || data.phones.home || data.phones.university || '',
      correo: data.email,
      estado: 'activo',
      idiomas: data.languages || [],
      lineas_tematicas: data.thematicLines || []
    };

    console.log('Datos enviados al backend:', djangoData);

    const response = await apiClient.post<any>(`${this.endpoint}/`, djangoData);
    return this.mapDjangoToFrontend(response);
  }

  // Mapear respuesta de Django al formato del frontend
  private mapDjangoToFrontend(djangoData: any): Researcher {
    return {
      id: djangoData.id.toString(),
      orcid: djangoData.orcid,
      name: `${djangoData.nombre} ${djangoData.apellido1} ${djangoData.apellido2}`.trim(),
      affiliation: djangoData.afiliacion || '',
      academicDegree: djangoData.grado_academico || '',
      country: djangoData.pais || '',
      email: djangoData.correo,
      alternativeEmail: '',
      thematicLines: djangoData.lineas_tematicas || [], // Array de IDs
      languages: djangoData.idiomas || [], // Array de IDs
      phones: {
        mobile: djangoData.telefono || '',
        home: '',
        university: ''
      },
      status: djangoData.estado === 'activo' ? 'active' : djangoData.estado === 'inactivo' ? 'inactive' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async update(id: string, data: any): Promise<Researcher> {
    // Mapear datos del frontend al formato Django
    const djangoData = {
      orcid: data.orcid,
      nombre: data.nombre,
      apellido1: data.apellido1,
      apellido2: data.apellido2,
      afiliacion: data.afiliacion,
      grado_academico: data.grado_academico,
      pais: data.pais,
      lugar_trabajo: data.lugar_trabajo || '',
      idiomas: data.idiomas, // Array de IDs de idiomas
      telefono: data.telefono,
      correo: data.correo,
      estado: data.estado,
      lineas_tematicas: data.lineas_tematicas
    };

    const response = await apiClient.put<any>(`${this.endpoint}/${id}/`, djangoData);
    return this.mapDjangoToFrontend(response);
  }

  // Buscar researchers por ORCID, nombre o correo con filtros opcionales
  async search(
    searchTerm?: string,
    filters?: {
      lineas_tematicas?: number;
      pais?: string;
      grado_academico?: string;
      estado?: string;
      idiomas?: number;
      includeInactive?: boolean; // Nuevo parámetro opcional para incluir inactivos
    }
  ): Promise<Researcher[]> {
    const queryParams = new URLSearchParams();

    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }
    if (filters?.lineas_tematicas) {
      queryParams.append('lineas_tematicas', filters.lineas_tematicas.toString());
    }
    if (filters?.pais) {
      queryParams.append('pais', filters.pais);
    }
    if (filters?.grado_academico) {
      queryParams.append('grado_academico', filters.grado_academico);
    }
    if (filters?.estado) {
      queryParams.append('estado', filters.estado);
    }
    if (filters?.idiomas) {
      queryParams.append('idiomas', filters.idiomas.toString());
    }
    // Solo agregar include_inactive si es true (para researchers/modify)
    // Los modales nunca pasarán este parámetro, por lo que siempre excluirán inactivos
    if (filters?.includeInactive === true) {
      queryParams.append('include_inactive', 'true');
    }

    const response = await apiClient.get<any>(`${this.endpoint}/?${queryParams.toString()}`);
    const results = response.results || response;
    return results.map((r: any) => this.mapDjangoToFrontend(r));
  }

  // Buscar por ORCID específico
  async searchByOrcid(orcid: string): Promise<Researcher[]> {
    const response = await apiClient.get<any>(`${this.endpoint}/?search=${orcid}`);
    const results = response.results || response;
    return results.map((r: any) => this.mapDjangoToFrontend(r));
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  async getThematicLines(): Promise<ThematicLine[]> {
    return apiClient.get<ThematicLine[]>('/thematicLines');
  }

  async getActiveThematicLines(): Promise<ThematicLine[]> {
    const lines = await this.getThematicLines();
    return lines.filter(line => line.isActive);
  }
}

export const researcherService = new ResearcherService();