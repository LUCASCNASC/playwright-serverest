import { APIRequestContext } from '@playwright/test';

/**
 * Classe base para operações de API
 * Centraliza a configuração e reutilização de requests
 */
export class ApiClient {
  private request: APIRequestContext;
  private baseURL: string;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
  }

  /**
   * Faz uma requisição GET
   */
  async get(endpoint: string, options?: { headers?: Record<string, string> }) {
    return this.request.get(`${this.baseURL}${endpoint}`, {
      headers: options?.headers,
    });
  }

  /**
   * Faz uma requisição POST
   */
  async post(endpoint: string, data: any, options?: { headers?: Record<string, string> }) {
    return this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * Faz uma requisição PUT
   */
  async put(endpoint: string, data: any, options?: { headers?: Record<string, string> }) {
    return this.request.put(`${this.baseURL}${endpoint}`, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * Faz uma requisição DELETE
   */
  async delete(endpoint: string, options?: { headers?: Record<string, string> }) {
    return this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: options?.headers,
    });
  }
}
