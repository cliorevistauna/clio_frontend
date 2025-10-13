import { apiClient } from '../../../shared/services/api';
import {
  EditorialNumber,
  CreateEditorialNumberRequest,
  UpdateEditorialNumberRequest,
} from '../types';
import { PaginationParams } from '../../../shared/types';

export class EditorialNumberService {
  private endpoint = '/editorial-numbers';

  async getAll(params?: PaginationParams & { includeInactive?: boolean }): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('page_size', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('ordering', params.sortBy);
    // Incluir números editoriales inactivos si se especifica
    if (params?.includeInactive) queryParams.append('include_inactive', 'true');

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
  async searchByNumber(numero: number, anio?: number, includeInactive: boolean = true): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('numero', numero.toString());
    if (anio) queryParams.append('anio', anio.toString());
    // Incluir números editoriales inactivos por defecto para reportes
    if (includeInactive) queryParams.append('include_inactive', 'true');

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

  async searchByYear(anio: number, includeInactive: boolean = true): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('anio', anio.toString());
    if (includeInactive) queryParams.append('include_inactive', 'true');

    return apiClient.get<EditorialNumber[]>(`${this.endpoint}/?${queryParams.toString()}`);
  }

  async searchText(query: string, includeInactive: boolean = true): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('search', encodeURIComponent(query));
    if (includeInactive) queryParams.append('include_inactive', 'true');

    return apiClient.get<EditorialNumber[]>(`${this.endpoint}/?${queryParams.toString()}`);
  }

  async getAllWithFilters(filters: {
    numero?: number;
    anio?: number;
    estado?: "activo" | "inactivo";
    search?: string;
    includeInactive?: boolean;
  }): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Manejar includeInactive de forma especial
        if (key === 'includeInactive' && value === true) {
          queryParams.append('include_inactive', 'true');
        } else if (key !== 'includeInactive') {
          queryParams.append(key, value.toString());
        }
      }
    });

    const endpoint = queryParams.toString() ?
      `${this.endpoint}/?${queryParams.toString()}` :
      `${this.endpoint}/`;

    const response = await apiClient.get<{ results?: EditorialNumber[] } | EditorialNumber[]>(endpoint);
    return Array.isArray(response) ? response : (response.results || []);
  }

  /**
   * Verifica si las fechas de un número editorial se solapan con otros números activos
   * @param fechaInicio - Fecha de inicio en formato YYYY-MM-DD
   * @param fechaFinal - Fecha final en formato YYYY-MM-DD
   * @param excludeId - ID del número editorial a excluir de la verificación (útil al actualizar)
   * @returns El número editorial con el que hay conflicto, o null si no hay conflictos
   */
  async checkDateOverlap(
    fechaInicio: string,
    fechaFinal: string,
    excludeId?: number
  ): Promise<EditorialNumber | null> {
    // Obtener todos los números editoriales activos
    const activeNumbers = await this.getAll({ includeInactive: false });

    // Convertir fechas a objetos Date para comparación
    const newStart = new Date(fechaInicio);
    const newEnd = new Date(fechaFinal);

    // Buscar solapamientos
    for (const number of activeNumbers) {
      // Excluir el número actual si estamos actualizando
      if (excludeId && number.id === excludeId) {
        continue;
      }

      // Saltar si no tiene fechas definidas
      if (!number.fecha_inicio || !number.fecha_final) {
        continue;
      }

      const existingStart = new Date(number.fecha_inicio);
      const existingEnd = new Date(number.fecha_final);

      // Verificar solapamiento:
      // Hay solapamiento si las fechas se intersectan
      const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

      if (hasOverlap) {
        return number; // Retornar el número con el que hay conflicto
      }
    }

    return null; // No hay conflictos
  }
}

export const editorialNumberService = new EditorialNumberService();