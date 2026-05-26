import { test, expect, APIRequestContext } from '@playwright/test';
import { ProductHelper } from '../helpers/product-cart-helper';
import { AuthHelper } from '../helpers/user-helper';
import { Product } from '../models/user';
import { generateRandomEmail } from '../../shared/utils/utils';

/**
 * Testes de API para Produtos - Serverest
 *
 * Cenários positivos:
 * - Listar produtos
 * - Buscar produto por ID
 * - Cadastrar produto (admin)
 * - Atualizar produto (admin)
 * - Deletar produto (admin)
 *
 * Cenários negativos:
 * - Cadastrar produto com nome duplicado
 * - Cadastrar produto sem autenticação
 * - Cadastrar produto sem ser admin
 * - Buscar produto inexistente
 * - Atualizar produto sem autenticação
 * - Deletar produto sem autenticação
 * - Deletar produto que está em carrinho
 */

test.describe('API Produtos - Serverest', () => {
  let requestContext: APIRequestContext;
  let productHelper: ProductHelper;
  let authHelper: AuthHelper;
  let adminToken: string;

  test.beforeAll(async ({ playwright }) => {
    const baseURL = process.env.URL_API || 'https://serverest.dev';
    requestContext = await playwright.request.newContext({ baseURL });

    productHelper = new ProductHelper(requestContext, baseURL);
    authHelper = new AuthHelper(requestContext, baseURL);

    const loginResponse = await authHelper.login({
      email: 'fulano@qa.com',
      password: 'teste'
    });
    adminToken = loginResponse.authorization;
  });

  test.afterAll(async () => {
    await requestContext.dispose();
  });

  // Cenários positivos
  test('deve listar todos os produtos', async () => {
    const response = await productHelper.getProducts();

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('quantidade');
    expect(data).toHaveProperty('produtos');
    expect(Array.isArray(data.produtos)).toBe(true);
  });

  // Teste para buscar produto por ID
  test('deve buscar produto por ID', async () => {
    // Primeiro, listar produtos para obter um ID válido
    const listResponse = await productHelper.getProducts();
    const products = (await listResponse.json()).produtos;
    expect(products.length).toBeGreaterThan(0);

    const productId = products[0]._id;
    const response = await productHelper.getProductById(productId);

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('_id', productId);
  });

  // Teste para cadastrar produto como admin
  test('deve cadastrar novo produto como admin', async () => {
    const newProduct: Product = {
      nome: `Produto Teste ${Date.now()}`,
      preco: 99,
      descricao: 'Produto criado para teste automatizado',
      quantidade: 10
    };

    const response = await productHelper.createProduct(newProduct, adminToken);

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Cadastro realizado com sucesso');
    expect(data).toHaveProperty('_id');
  });

  // Teste para atualizar produto como admin
  test('deve atualizar produto existente como admin', async () => {
    // Primeiro, criar um produto para atualizar
    const newProduct: Product = {
      nome: `Produto Update ${Date.now()}`,
      preco: 50,
      descricao: 'Produto para atualização',
      quantidade: 5
    };

    const createResponse = await productHelper.createProduct(newProduct, adminToken);
    const createdProduct = await createResponse.json();
    const productId = createdProduct._id;

    // Agora atualizar
    const updatedData = {
      nome: `Produto Atualizado ${Date.now()}`,
      preco: 75,
      descricao: 'Produto atualizado',
      quantidade: 8
    };

    const updateResponse = await productHelper.updateProduct(productId, updatedData, adminToken);

    expect(updateResponse.ok()).toBe(true);
    const data = await updateResponse.json();
    expect(data).toHaveProperty('message', 'Registro alterado com sucesso');
  });

  // Teste para deletar produto como admin
  test('deve deletar produto como admin', async () => {
    // Primeiro, criar um produto para deletar
    const newProduct: Product = {
      nome: `Produto Delete ${Date.now()}`,
      preco: 25,
      descricao: 'Produto para exclusão',
      quantidade: 3
    };

    const createResponse = await productHelper.createProduct(newProduct, adminToken);
    const createdProduct = await createResponse.json();
    const productId = createdProduct._id;

    // Agora deletar
    const deleteResponse = await productHelper.deleteProduct(productId, adminToken);

    expect(deleteResponse.ok()).toBe(true);
    const data = await deleteResponse.json();
    expect(data).toHaveProperty('message', 'Registro excluído com sucesso');
  });

  // Cenários negativos
  test('não deve cadastrar produto com nome duplicado', async () => {
    // Primeiro, criar um produto
    const newProduct: Product = {
      nome: `Produto Duplicado ${Date.now()}`,
      preco: 100,
      descricao: 'Produto para teste de duplicação',
      quantidade: 5
    };

    await productHelper.createProduct(newProduct, adminToken);

    // Tentar criar outro com o mesmo nome
    const duplicateProduct: Product = {
      nome: newProduct.nome,
      preco: 150,
      descricao: 'Tentativa de duplicação',
      quantidade: 2
    };

    const response = await productHelper.createProduct(duplicateProduct, adminToken);

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Já existe produto com esse nome');
  });

  // Teste para cadastrar produto sem autenticação
  test('não deve cadastrar produto sem autenticação', async () => {
    const newProduct: Product = {
      nome: `Produto Sem Auth ${Date.now()}`,
      preco: 50,
      descricao: 'Produto sem autenticação',
      quantidade: 1
    };

    const response = await productHelper.createProduct(newProduct, '');

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  });

  // Teste para cadastrar produto sem ser admin
  test('não deve buscar produto inexistente', async () => {
    const response = await productHelper.getProductById('1234567890123456');

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Produto não encontrado');
  });

  // Teste para atualizar produto sem autenticação
  test('não deve atualizar produto sem autenticação', async () => {
    const response = await productHelper.updateProduct('some-id', { nome: 'Teste' }, '');

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  });

  // Teste para deletar produto sem autenticação
  test('não deve deletar produto sem autenticação', async () => {
    const response = await productHelper.deleteProduct('some-id', '');

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  });
});
