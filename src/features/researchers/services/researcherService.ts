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

  async getAll(params?: PaginationParams): Promise<Researcher[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('ordering', params.sortBy);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoint}/researchers/?${queryString}` : `${this.endpoint}/researchers/`;

    const response = await apiClient.get<any>(endpoint);
    return response.results || response;
  }

  async getById(id: string): Promise<Researcher> {
    return apiClient.get<Researcher>(`${this.endpoint}/researchers/${id}/`);
  }

  async create(data: CreateResearcherRequest): Promise<Researcher> {
    // Mapear los datos del frontend al formato esperado por Django
    const djangoData = {
      orcid: data.orcid,
      nombre: data.name.split(' ')[0], // Primer nombre
      apellido1: data.name.split(' ')[1] || '', // Primer apellido
      apellido2: data.name.split(' ')[2] || '', // Segundo apellido
      afiliacion: data.affiliation,
      grado_academico: data.academicDegree,
      pais: data.country,
      lugar_trabajo: '', // Campo nuevo en Django
      idioma: data.languages,
      telefono: data.phones.mobile || data.phones.home || data.phones.university || '',
      correo: data.email,
      estado: data.status === 'active' ? 'activo' : data.status === 'inactive' ? 'inactivo' : 'pendiente',
      lineas_tematicas: data.thematicLines
    };

    const response = await apiClient.post<any>(`${this.endpoint}/researchers/create/`, djangoData);
    return this.mapDjangoToFrontend(response.researcher || response);
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
      thematicLines: djangoData.lineas_tematicas || [],
      languages: djangoData.idioma || '',
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

  async update(data: UpdateResearcherRequest): Promise<Researcher> {
    const { id, ...updateData } = data;
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return apiClient.patch<Researcher>(`${this.endpoint}/${id}`, updatedData);
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