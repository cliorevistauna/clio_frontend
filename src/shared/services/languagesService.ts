import { apiClient } from "./api";

export interface Language {
  id: number;
  nombre: string;
}

class LanguagesService {
  private basePath = "/languages";

  async getLanguages(): Promise<Language[]> {
    try {
      console.log('Attempting to fetch languages from:', `${this.basePath}/`);

      const response = await apiClient.get<{ results?: Language[] } | Language[]>(`${this.basePath}/`);

      // Handle both paginated and non-paginated responses
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error: any) {
      console.error('Error fetching languages:', error);
      console.error('URL was:', `${this.basePath}/`);
      throw error;
    }
  }

  async getLanguageById(id: number): Promise<Language> {
    const response = await apiClient.get<Language>(`${this.basePath}/${id}/`);
    return response;
  }
}

export const languagesService = new LanguagesService();
