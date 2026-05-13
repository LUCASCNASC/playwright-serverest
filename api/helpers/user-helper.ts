import { APIRequestContext } from '@playwright/test';
import { ApiClient } from './api-client';
import { User, LoginCredentials, LoginResponse } from '../models/user';

/**
 * Helper para operações relacionadas a usuários
 */
export class UserHelper {
  private apiClient: ApiClient;

  constructor(request: APIRequestContext, baseURL: string) {
    this.apiClient = new ApiClient(request, baseURL);
  }

  /**
   * Lista todos os usuários
   */
  async getUsers() {
    return this.apiClient.get('/usuarios');
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string) {
    return this.apiClient.get(`/usuarios/${id}`);
  }

  /**
   * Cadastra um novo usuário
   */
  async createUser(user: User) {
    return this.apiClient.post('/usuarios', user);
  }

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id: string, user: Partial<User>) {
    return this.apiClient.put(`/usuarios/${id}`, user);
  }

  /**
   * Remove um usuário
   */
  async deleteUser(id: string) {
    return this.apiClient.delete(`/usuarios/${id}`);
  }
}

/**
 * Helper para operações de autenticação
 */
export class AuthHelper {
  private apiClient: ApiClient;

  constructor(request: APIRequestContext, baseURL: string) {
    this.apiClient = new ApiClient(request, baseURL);
  }

  /**
   * Realiza login e retorna token
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.apiClient.post('/login', credentials);

    if (!response.ok()) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(errorData.message || 'Erro no login');
    }

    return response.json();
  }

  /**
   * Valida se o token é válido (opcional, dependendo da API)
   */
  async validateToken(token: string) {
    // Implementar se a API tiver endpoint de validação
    return this.apiClient.get('/validate', { headers: { Authorization: token } });
  }
}