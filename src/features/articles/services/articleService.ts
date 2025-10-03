import { apiClient } from '../../../shared/services/api';
import {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  ResearcherSearchResult,
} from '../types';

export class ArticleService {
  private endpoint = '/articles';
  private searchAuthorsEndpoint = '/articles/search-authors';
  private searchEvaluatorsEndpoint = '/articles/search-evaluators';
  private createAuthorEndpoint = '/articles/create-author';

  /**
   * Obtener todos los artículos
   */
  async getAll(params?: {
    estado?: string;
    numero_editorial?: number;
    lineas_tematicas?: number;
    search?: string;
  }): Promise<Article[]> {
    const queryParams = new URLSearchParams();

    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.numero_editorial) queryParams.append('numero_editorial', params.numero_editorial.toString());
    if (params?.lineas_tematicas) queryParams.append('lineas_tematicas', params.lineas_tematicas.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoint}/?${queryString}` : `${this.endpoint}/`;

    const response = await apiClient.get<any>(endpoint);
    return response.results || response;
  }

  /**
   * Obtener un artículo por ID
   */
  async getById(id: number): Promise<Article> {
    return apiClient.get<Article>(`${this.endpoint}/${id}/`);
  }

  /**
   * Crear un nuevo artículo - RF-017
   */
  async create(data: CreateArticleRequest): Promise<Article> {
    console.log('Creando artículo:', data);
    const response = await apiClient.post<Article>(`${this.endpoint}/`, data);
    return response;
  }

  /**
   * Actualizar un artículo existente - RF-018
   */
  async update(id: number, data: Partial<UpdateArticleRequest>): Promise<Article> {
    console.log('Actualizando artículo:', id, data);
    const response = await apiClient.patch<Article>(`${this.endpoint}/${id}/`, data);
    return response;
  }

  /**
   * Eliminar un artículo (soft delete)
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}/`);
  }

  /**
   * Buscar autores para asignar a un artículo - RF-020
   * @param search Palabra clave para buscar (nombre, apellidos, afiliación)
   * @param filters Filtros adicionales (línea temática, país, idioma)
   */
  async searchAuthors(
    search?: string,
    filters?: {
      lineas_tematicas?: number;
      pais?: string;
      idiomas?: number;
    }
  ): Promise<ResearcherSearchResult[]> {
    const queryParams = new URLSearchParams();

    if (search) queryParams.append('search', search);
    if (filters?.lineas_tematicas) queryParams.append('lineas_tematicas', filters.lineas_tematicas.toString());
    if (filters?.pais) queryParams.append('pais', filters.pais);
    if (filters?.idiomas) queryParams.append('idiomas', filters.idiomas.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.searchAuthorsEndpoint}/?${queryString}` : `${this.searchAuthorsEndpoint}/`;

    console.log('Buscando autores en:', endpoint);
    const response = await apiClient.get<any>(endpoint);
    console.log('Respuesta del servidor (autores):', response);

    // El backend devuelve un array directo o un objeto con results
    const data = response.results || response;
    return Array.isArray(data) ? data : [];
  }

  /**
   * Buscar evaluadores para asignar a un artículo - RF-021
   * @param search Palabra clave para buscar
   * @param filters Filtros adicionales
   */
  async searchEvaluators(
    search?: string,
    filters?: {
      lineas_tematicas?: number;
      pais?: string;
      idiomas?: number;
    }
  ): Promise<ResearcherSearchResult[]> {
    const queryParams = new URLSearchParams();

    if (search) queryParams.append('search', search);
    if (filters?.lineas_tematicas) queryParams.append('lineas_tematicas', filters.lineas_tematicas.toString());
    if (filters?.pais) queryParams.append('pais', filters.pais);
    if (filters?.idiomas) queryParams.append('idiomas', filters.idiomas.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.searchEvaluatorsEndpoint}/?${queryString}` : `${this.searchEvaluatorsEndpoint}/`;

    console.log('Buscando evaluadores en:', endpoint);
    const response = await apiClient.get<any>(endpoint);
    console.log('Respuesta del servidor (evaluadores):', response);

    // El backend devuelve un array directo o un objeto con results
    const data = response.results || response;
    return Array.isArray(data) ? data : [];
  }

  /**
   * Crear un nuevo autor desde el formulario de artículo - RF-019
   */
  async createAuthorFromArticle(data: {
    orcid: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    afiliacion: string;
    grado_academico: string;
    pais: string;
    lugar_trabajo?: string;
    telefono: string;
    correo: string;
    lineas_tematicas?: number[];
    idiomas?: number[];
  }): Promise<ResearcherSearchResult> {
    console.log('Creando autor desde artículo:', data);
    const response = await apiClient.post<any>(this.createAuthorEndpoint, data);
    return response;
  }
}

export const articleService = new ArticleService();
