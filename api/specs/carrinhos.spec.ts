import { test, expect, APIRequestContext } from '@playwright/test';
import { CartHelper, ProductHelper } from '../helpers/product-cart-helper';
import { AuthHelper } from '../helpers/user-helper';
import { UserHelper } from '../helpers/user-helper';
import { CartItem } from '../models/user';
import { generateRandomEmail } from '../../shared/utils/utils';

/**
 * Testes de API para Carrinhos - Serverest
 *
 * Cenários positivos:
 * - Listar carrinhos
 * - Buscar carrinho por ID
 * - Cadastrar carrinho
 * - Concluir compra
 * - Cancelar compra
 *
 * Cenários negativos:
 * - Cadastrar carrinho sem autenticação
 * - Cadastrar carrinho com produto inexistente
 * - Cadastrar carrinho com quantidade insuficiente
 * - Cadastrar carrinho duplicado para mesmo usuário
 * - Buscar carrinho inexistente
 * - Concluir/cancelar compra sem carrinho
 */

test.describe('API Carrinhos - Serverest', () => {
  let requestContext: APIRequestContext;
  let cartHelper: CartHelper;
  let productHelper: ProductHelper;
  let userHelper: UserHelper;
  let authHelper: AuthHelper;
  let userToken: string;
  let adminToken: string;
  let testUserId: string;
  let testProductId: string;

  test.beforeAll(async ({ playwright }) => {
    const baseURL = process.env.URL_API || 'https://serverest.dev';
    requestContext = await playwright.request.newContext({ baseURL });

    cartHelper = new CartHelper(requestContext, baseURL);
    productHelper = new ProductHelper(requestContext, baseURL);
    userHelper = new UserHelper(requestContext, baseURL);
    authHelper = new AuthHelper(requestContext, baseURL);

    const adminLogin = await authHelper.login({
      email: 'fulano@qa.com',
      password: 'teste'
    });
    adminToken = adminLogin.authorization;

    const testUser = {
      nome: 'Usuario Carrinho Teste',
      email: generateRandomEmail(),
      password: 'teste123',
      administrador: 'false'
    };

    const userResponse = await userHelper.createUser(testUser);
    const userData = await userResponse.json();
    testUserId = userData._id;

    const userLogin = await authHelper.login({
      email: testUser.email,
      password: testUser.password
    });
    userToken = userLogin.authorization;

    const testProduct = {
      nome: `Produto Carrinho ${Date.now()}`,
      preco: 50,
      descricao: 'Produto para teste de carrinho',
      quantidade: 10
    };

    const productResponse = await productHelper.createProduct(testProduct, adminToken);
    const productData = await productResponse.json();
    testProductId = productData._id;
  });

  test.afterAll(async () => {
    await requestContext.dispose();
  });

  // Cenários positivos
  test('deve listar todos os carrinhos', async () => {
    const response = await cartHelper.getCarts();

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('quantidade');
    expect(data).toHaveProperty('carrinhos');
    expect(Array.isArray(data.carrinhos)).toBe(true);
  });

  test('deve buscar carrinho por ID', async () => {
    // Primeiro, listar carrinhos para obter um ID válido
    const listResponse = await cartHelper.getCarts();
    const carts = (await listResponse.json()).carrinhos;

    if (carts.length > 0) {
      const cartId = carts[0]._id;
      const response = await cartHelper.getCartById(cartId);

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('_id', cartId);
    } else {
      // Se não há carrinhos, pular o teste
      test.skip();
    }
  });

  test('deve cadastrar novo carrinho', async () => {
    const cartData = {
      produtos: [
        {
          idProduto: testProductId,
          quantidade: 2
        }
      ]
    };

    const response = await cartHelper.createCart(cartData, userToken);

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Cadastro realizado com sucesso');
    expect(data).toHaveProperty('_id');
  });

  test('deve concluir compra', async () => {
    // Primeiro, criar um carrinho
    const cartData = {
      produtos: [
        {
          idProduto: testProductId,
          quantidade: 1
        }
      ]
    };

    await cartHelper.createCart(cartData, userToken);

    // Agora concluir a compra
    const response = await cartHelper.completePurchase(userToken);

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.message).toContain('Registro excluído com sucesso');
  });

  test('deve cancelar compra', async () => {
    // Primeiro, criar um carrinho
    const cartData = {
      produtos: [
        {
          idProduto: testProductId,
          quantidade: 1
        }
      ]
    };

    await cartHelper.createCart(cartData, userToken);

    // Agora cancelar a compra
    const response = await cartHelper.cancelPurchase(userToken);

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.message).toContain('Registro excluído com sucesso');
  });

  // Cenários negativos
  test('não deve cadastrar carrinho sem autenticação', async () => {
    const cartData = {
      produtos: [
        {
          idProduto: testProductId,
          quantidade: 1
        }
      ]
    };

    const response = await cartHelper.createCart(cartData, '');

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  });

  test('não deve cadastrar carrinho com produto inexistente', async () => {
    const cartData = {
      produtos: [
        {
          idProduto: 'produto-inexistente-123',
          quantidade: 1
        }
      ]
    };

    const response = await cartHelper.createCart(cartData, userToken);

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Produto não encontrado');
  });

  test('não deve cadastrar carrinho com quantidade insuficiente', async () => {
    const cartData = {
      produtos: [
        {
          idProduto: testProductId,
          quantidade: 100 // Quantidade maior que o disponível
        }
      ]
    };

    const response = await cartHelper.createCart(cartData, userToken);

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Produto não possui quantidade suficiente');
  });

  test('não deve cadastrar carrinho duplicado para mesmo usuário', async () => {
    // Criar primeiro carrinho
    const cartData = {
      produtos: [
        {
          idProduto: testProductId,
          quantidade: 1
        }
      ]
    };

    await cartHelper.createCart(cartData, userToken);

    // Tentar criar segundo carrinho
    const response = await cartHelper.createCart(cartData, userToken);

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Não é permitido ter mais de 1 carrinho');
  });

  test('não deve buscar carrinho inexistente', async () => {
    const response = await cartHelper.getCartById('1234567890123456');

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Carrinho não encontrado');
  });

  test('não deve concluir compra sem carrinho', async () => {
    // Garantir que não há carrinho (cancelando se existir)
    await cartHelper.cancelPurchase(userToken);

    const response = await cartHelper.completePurchase(userToken);

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Não foi encontrado carrinho para esse usuário');
  });

  test('não deve cancelar compra sem carrinho', async () => {
    // Garantir que não há carrinho
    await cartHelper.cancelPurchase(userToken);

    const response = await cartHelper.cancelPurchase(userToken);

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Não foi encontrado carrinho para esse usuário');
  });
});
