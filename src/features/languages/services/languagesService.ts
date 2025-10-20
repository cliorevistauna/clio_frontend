import { apiClient } from "../../../shared/services/api";
import { Language, CreateLanguageRequest, UpdateLanguageRequest } from "../types";

class LanguagesService {
  private basePath = "/languages";

  async getLanguages(includeInactive: boolean = false): Promise<Language[]> {
    try {
      const queryParams = new URLSearchParams();
      if (includeInactive) {
        queryParams.append('include_inactive', 'true');
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${this.basePath}/?${queryString}` : `${this.basePath}/`;

      console.log('Attempting to fetch languages from:', url);

      const response = await apiClient.get<{ results?: Language[] } | Language[]>(url);

      // Handle both paginated and non-paginated responses
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error: any) {
      console.error('Error fetching languages:', error);
      console.error('URL was:', includeInactive ? `${this.basePath}/?include_inactive=true` : `${this.basePath}/`);
      throw error;
    }
  }

  async getLanguageById(id: number, includeInactive: boolean = true): Promise<Language> {
    const queryParams = new URLSearchParams();
    if (includeInactive) {
      queryParams.append('include_inactive', 'true');
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/${id}/?${queryString}` : `${this.basePath}/${id}/`;

    const response = await apiClient.get<Language>(url);
    return response;
  }

  async createLanguage(data: CreateLanguageRequest): Promise<Language> {
    try {
      console.log('Creating language with data:', data);
      console.log('POST URL:', `${this.basePath}/`);

      const response = await apiClient.post<Language>(`${this.basePath}/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating language:', error);
      console.error('Data was:', data);
      throw error;
    }
  }

  async updateLanguage(id: number, data: UpdateLanguageRequest): Promise<Language> {
    const response = await apiClient.put<Language>(`${this.basePath}/${id}/`, data);
    return response;
  }

  async deactivateLanguage(id: number): Promise<{ message: string; language: Language }> {
    const response = await apiClient.delete<{ message: string; language: Language }>(`${this.basePath}/${id}/`);
    return response;
  }
}

export const languagesService = new LanguagesService();
