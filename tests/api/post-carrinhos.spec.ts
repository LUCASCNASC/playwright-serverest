import { test, expect } from '@playwright/test';

const baseURL = 'https://serverest.dev';

test.describe('API ServeRest - POST /carrinhos', () => {
  let userToken: string;
  let productId: string;

  test.beforeEach(async ({ request }) => {
    const email = `post_cart_${Date.now()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, { data: { nome: 'Comprador', email, password: 'teste', administrador: 'true' } });
    userToken = (await (await request.post(`${baseURL}/login`, { data: { email, password: 'teste' } })).json()).authorization;

    const prod = await request.post(`${baseURL}/produtos`, { headers: { Authorization: userToken }, data: { nome: `Prod Cart ${Date.now()}`, preco: 10, descricao: 'X', quantidade: 50 } });
    productId = (await prod.json())._id;
  });

  test('Deve cadastrar um carrinho com sucesso (Status 201)', async ({ request }) => {
    const response = await request.post(`${baseURL}/carrinhos`, {
      headers: { Authorization: userToken },
      data: { produtos: [{ idProduto: productId, quantidade: 2 }] }
    });
    expect(response.status()).toBe(201);
    expect((await response.json()).message).toBe('Cadastro realizado com sucesso');
  });

  test('Não é permitido ter mais de um carrinho por usuário (Status 400)', async ({ request }) => {
    await request.post(`${baseURL}/carrinhos`, {
      headers: { Authorization: userToken }, data: { produtos: [{ idProduto: productId, quantidade: 1 }] }
    });

    const response2 = await request.post(`${baseURL}/carrinhos`, {
      headers: { Authorization: userToken }, data: { produtos: [{ idProduto: productId, quantidade: 1 }] }
    });
    expect(response2.status()).toBe(400);
    expect((await response2.json()).message).toBe('Não é permitido ter mais de 1 carrinho');
  });

  test('Deve retornar erro de produto não encontrado (Status 400)', async ({ request }) => {
    const response = await request.post(`${baseURL}/carrinhos`, {
      headers: { Authorization: userToken },
      data: { produtos: [{ idProduto: 'id_inexistente_123', quantidade: 1 }] }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe('Produto não encontrado');
  });

  test('Deve retornar erro de quantidade insuficiente (Status 400)', async ({ request }) => {
    const response = await request.post(`${baseURL}/carrinhos`, {
      headers: { Authorization: userToken },
      data: { produtos: [{ idProduto: productId, quantidade: 9999 }] }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe('Produto não possui quantidade suficiente');
  });

  test('Não é permitido possuir produto duplicado no mesmo request (Status 400)', async ({ request }) => {
    const response = await request.post(`${baseURL}/carrinhos`, {
      headers: { Authorization: userToken },
      data: { produtos: [
        { idProduto: productId, quantidade: 1 },
        { idProduto: productId, quantidade: 1 }
      ] }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe('Não é permitido possuir produto duplicado');
  });

  test('Deve validar falta de token (Status 401)', async ({ request }) => {
    const response = await request.post(`${baseURL}/carrinhos`, {
      data: { produtos: [{ idProduto: productId, quantidade: 1 }] }
    });
    expect(response.status()).toBe(401);
  });
});