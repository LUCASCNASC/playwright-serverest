import { APIRequestContext } from '@playwright/test';
import { ApiClient } from './api-client';
import { Product, ProductsListResponse, Cart, CartsListResponse, CartItem } from '../models/user';

/**
 * Helper para operações relacionadas a produtos
 */
export class ProductHelper {
  private apiClient: ApiClient;

  constructor(request: APIRequestContext, baseURL: string) {
    this.apiClient = new ApiClient(request, baseURL);
  }

  /**
   * Lista todos os produtos
   */
  async getProducts() {
    return this.apiClient.get('/produtos');
  }

  /**
   * Busca produto por ID
   */
  async getProductById(id: string) {
    return this.apiClient.get(`/produtos/${id}`);
  }

  /**
   * Cadastra um novo produto (requer autenticação admin)
   */
  async createProduct(product: Product, token: string) {
    return this.apiClient.post('/produtos', product, {
      headers: { Authorization: token }
    });
  }

  /**
   * Atualiza um produto existente (requer autenticação admin)
   */
  async updateProduct(id: string, product: Partial<Product>, token: string) {
    return this.apiClient.put(`/produtos/${id}`, product, {
      headers: { Authorization: token }
    });
  }

  /**
   * Remove um produto (requer autenticação admin)
   */
  async deleteProduct(id: string, token: string) {
    return this.apiClient.delete(`/produtos/${id}`, {
      headers: { Authorization: token }
    });
  }
}

/**
 * Helper para operações relacionadas a carrinhos
 */
export class CartHelper {
  private apiClient: ApiClient;

  constructor(request: APIRequestContext, baseURL: string) {
    this.apiClient = new ApiClient(request, baseURL);
  }

  /**
   * Lista todos os carrinhos
   */
  async getCarts() {
    return this.apiClient.get('/carrinhos');
  }

  /**
   * Busca carrinho por ID
   */
  async getCartById(id: string) {
    return this.apiClient.get(`/carrinhos/${id}`);
  }

  /**
   * Cadastra um novo carrinho (requer autenticação)
   */
  async createCart(cart: { produtos: CartItem[] }, token: string) {
    return this.apiClient.post('/carrinhos', cart, {
      headers: { Authorization: token }
    });
  }

  /**
   * Conclui compra (exclui carrinho)
   */
  async completePurchase(token: string) {
    return this.apiClient.delete('/carrinhos/concluir-compra', {
      headers: { Authorization: token }
    });
  }

  /**
   * Cancela compra (exclui carrinho e retorna produtos ao estoque)
   */
  async cancelPurchase(token: string) {
    return this.apiClient.delete('/carrinhos/cancelar-compra', {
      headers: { Authorization: token }
    });
  }
}
