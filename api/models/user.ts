/**
 * Modelo de dados para Usuário
 */
export interface User {
  nome: string;
  email: string;
  password: string;
  administrador: string; // "true" ou "false" como string
  _id?: string; // Presente apenas em respostas
}

/**
 * Credenciais para login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Resposta do login
 */
export interface LoginResponse {
  message: string;
  authorization: string; // Token JWT
}

/**
 * Resposta da listagem de usuários
 */
export interface UsersListResponse {
  quantidade: number;
  usuarios: User[];
}

/**
 * Modelo de dados para Produto
 */
export interface Product {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
  _id?: string; // Presente apenas em respostas
}

/**
 * Resposta da listagem de produtos
 */
export interface ProductsListResponse {
  quantidade: number;
  produtos: Product[];
}

/**
 * Modelo de dados para Carrinho
 */
export interface CartItem {
  idProduto: string;
  quantidade: number;
}

export interface Cart {
  idUsuario: string;
  produtos: CartItem[];
  precoTotal?: number;
  quantidadeTotal?: number;
  _id?: string; // Presente apenas em respostas
}

/**
 * Resposta da listagem de carrinhos
 */
export interface CartsListResponse {
  quantidade: number;
  carrinhos: Cart[];
}

/**
 * Resposta de erro da API
 */
export interface ApiErrorResponse {
  message: string;
  [key: string]: any; // Para campos específicos de erro
}
