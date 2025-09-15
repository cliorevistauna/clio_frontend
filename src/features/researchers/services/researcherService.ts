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

    if (params?.page) queryParams.append('_page', params.page.toString());
    if (params?.limit) queryParams.append('_limit', params.limit.toString());
    if (params?.search) queryParams.append('q', params.search);
    if (params?.sortBy) queryParams.append('_sort', params.sortBy);
    if (params?.sortOrder) queryParams.append('_order', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

    return apiClient.get<Researcher[]>(endpoint);
  }

  async getById(id: string): Promise<Researcher> {
    return apiClient.get<Researcher>(`${this.endpoint}/${id}`);
  }

  async create(data: CreateResearcherRequest): Promise<Researcher> {
    const researcher: Omit<Researcher, 'id'> = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return apiClient.post<Researcher>(this.endpoint, researcher);
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