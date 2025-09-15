import { apiClient } from '../../../shared/services/api';
import {
  EditorialNumber,
  CreateEditorialNumberRequest,
  UpdateEditorialNumberRequest,
} from '../types';
import { PaginationParams } from '../../../shared/types';

export class EditorialNumberService {
  private endpoint = '/editorialNumbers';

  async getAll(params?: PaginationParams): Promise<EditorialNumber[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('_page', params.page.toString());
    if (params?.limit) queryParams.append('_limit', params.limit.toString());
    if (params?.search) queryParams.append('q', params.search);
    if (params?.sortBy) queryParams.append('_sort', params.sortBy);
    if (params?.sortOrder) queryParams.append('_order', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

    return apiClient.get<EditorialNumber[]>(endpoint);
  }

  async getById(id: string): Promise<EditorialNumber> {
    return apiClient.get<EditorialNumber>(`${this.endpoint}/${id}`);
  }

  async create(data: CreateEditorialNumberRequest): Promise<EditorialNumber> {
    const editorialNumber: Omit<EditorialNumber, 'id'> = {
      ...data,
      status: 'draft',
      createdBy: '1', // TODO: Get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return apiClient.post<EditorialNumber>(this.endpoint, editorialNumber);
  }

  async update(data: UpdateEditorialNumberRequest): Promise<EditorialNumber> {
    const { id, ...updateData } = data;
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return apiClient.patch<EditorialNumber>(`${this.endpoint}/${id}`, updatedData);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  async getCurrentEditorialNumber(): Promise<EditorialNumber | null> {
    const editorialNumbers = await this.getAll();
    return editorialNumbers.find(en => en.status === 'active') || null;
  }
}

export const editorialNumberService = new EditorialNumberService();