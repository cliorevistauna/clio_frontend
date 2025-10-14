import { ApiError } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Obtener token de localStorage para incluir en las peticiones
    const token = localStorage.getItem('access_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Extraer mensaje de error de la respuesta de Django REST Framework
        let errorMessage = `HTTP ${response.status}`;

        if (errorData && typeof errorData === 'object') {
          // Prioridad 1: Campo 'message' explícito
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          // Prioridad 2: Campo 'detail' (común en DRF)
          else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
          // Prioridad 3: Errores no relacionados con campos específicos
          else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors[0];
          }
          // Prioridad 4: Primer error de campo encontrado
          else {
            // Buscar el primer campo con errores
            for (const [key, value] of Object.entries(errorData)) {
              if (Array.isArray(value) && value.length > 0) {
                errorMessage = value[0];
                break;
              }
            }
          }
        }

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
          details: errorData,
        };
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        const apiError: ApiError = {
          message: error.message,
          status: 0,
          details: error,
        };
        throw apiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options
    });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;