import { apiClient } from "../../../shared/services/api";

export interface ThematicLine {
  id: number;
  nombre: string;
  estado: boolean;
}

export interface CreateThematicLineRequest {
  nombre: string;
}

export interface UpdateThematicLineRequest {
  nombre: string;
}

class ThematicLinesService {
  private basePath = "/thematic-lines";

  async getThematicLines(includeInactive: boolean = false): Promise<ThematicLine[]> {
    try {
      const queryParams = new URLSearchParams();
      if (includeInactive) {
        queryParams.append('include_inactive', 'true');
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.basePath}/?${queryString}` : `${this.basePath}/`;

      console.log('Attempting to fetch thematic lines from:', url);

      const response = await apiClient.get<{ results?: ThematicLine[] } | ThematicLine[]>(url);

      // Handle both paginated and non-paginated responses
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error: any) {
      console.error('Error fetching thematic lines:', error);
      console.error('URL was:', includeInactive ? `${this.basePath}/?include_inactive=true` : `${this.basePath}/`);
      throw error;
    }
  }

  async getThematicLineById(id: number, includeInactive: boolean = true): Promise<ThematicLine> {
    const queryParams = new URLSearchParams();
    if (includeInactive) {
      queryParams.append('include_inactive', 'true');
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/${id}/?${queryString}` : `${this.basePath}/${id}/`;

    const response = await apiClient.get<ThematicLine>(url);
    return response;
  }

  async createThematicLine(data: CreateThematicLineRequest): Promise<ThematicLine> {
    try {
      console.log('Creating thematic line with data:', data);
      console.log('POST URL:', `${this.basePath}/`);

      const response = await apiClient.post<ThematicLine>(`${this.basePath}/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating thematic line:', error);
      console.error('Data was:', data);
      throw error;
    }
  }

  async updateThematicLine(id: number, data: UpdateThematicLineRequest): Promise<ThematicLine> {
    const response = await apiClient.put<ThematicLine>(`${this.basePath}/${id}/`, data);
    return response;
  }

  async deactivateThematicLine(id: number): Promise<{ message: string; thematic_line: ThematicLine }> {
    const response = await apiClient.put<{ message: string; thematic_line: ThematicLine }>(`${this.basePath}/${id}/deactivate/`);
    return response;
  }
}

export const thematicLinesService = new ThematicLinesService();