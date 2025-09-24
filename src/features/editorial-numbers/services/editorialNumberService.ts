import { apiClient } from '../../../shared/services/api';
import {
  EditorialNumber,
  CreateEditorialNumberRequest,
  UpdateEditorialNumberRequest,
} from '../types';
import { PaginationParams } from '../../../shared/types';

export class EditorialNumberService {
  private endpoint = '/editorial-numbers';

  async getAll(params?: PaginationParams): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('page_size', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('ordering', params.sortBy);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoint}/?${queryString}` : `${this.endpoint}/`;

    const response = await apiClient.get<{ results?: EditorialNumber[] } | EditorialNumber[]>(endpoint);

    // Handle both paginated and non-paginated responses
    return Array.isArray(response) ? response : (response.results || []);
  }

  async getById(id: number): Promise<EditorialNumber> {
    return apiClient.get<EditorialNumber>(`${this.endpoint}/${id}/`);
  }

  async create(data: CreateEditorialNumberRequest): Promise<EditorialNumber> {
    return apiClient.post<EditorialNumber>(`${this.endpoint}/`, data);
  }

  async update(data: UpdateEditorialNumberRequest): Promise<EditorialNumber> {
    const { id, ...updateData } = data;
    return apiClient.patch<EditorialNumber>(`${this.endpoint}/${id}/`, updateData);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }

  async getCurrentEditorialNumber(): Promise<EditorialNumber | null> {
    return apiClient.get<EditorialNumber>(`${this.endpoint}/current/`).catch(() => null);
  }

  async updateStatus(id: number, estado: "activo" | "inactivo"): Promise<EditorialNumber> {
    return apiClient.put<EditorialNumber>(`${this.endpoint}/${id}/status/`, { estado });
  }

  // Métodos de búsqueda específica
  async searchByNumber(numero: number, anio?: number): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('numero', numero.toString());
    if (anio) queryParams.append('anio', anio.toString());

    const response = await apiClient.get<{ results?: EditorialNumber[] } | EditorialNumber[]>(`${this.endpoint}/?${queryParams.toString()}`);

    // Manejar respuesta paginada o array directo
    if (Array.isArray(response)) {
      return response;
    } else if (response && 'results' in response) {
      return response.results || [];
    } else {
      return [];
    }
  }

  async searchByYear(anio: number): Promise<EditorialNumber[]> {
    return apiClient.get<EditorialNumber[]>(`${this.endpoint}/?anio=${anio}`);
  }

  async searchText(query: string): Promise<EditorialNumber[]> {
    return apiClient.get<EditorialNumber[]>(`${this.endpoint}/?search=${encodeURIComponent(query)}`);
  }

  async getAllWithFilters(filters: {
    numero?: number;
    anio?: number;
    estado?: "activo" | "inactivo";
    search?: string;
  }): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = queryParams.toString() ?
      `${this.endpoint}/?${queryParams.toString()}` :
      `${this.endpoint}/`;

    const response = await apiClient.get<{ results?: EditorialNumber[] } | EditorialNumber[]>(endpoint);
    return Array.isArray(response) ? response : (response.results || []);
  }
}

export const editorialNumberService = new EditorialNumberService();