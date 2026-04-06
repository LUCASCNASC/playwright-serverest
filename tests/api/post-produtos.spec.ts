import { test, expect } from '@playwright/test';

const baseURL = 'https://serverest.dev';

test.describe('API ServeRest - POST /produtos', () => {
  let adminToken: string;
  let commonToken: string;

  test.beforeAll(async ({ request }) => {
    const adminEmail = `admin_post_prod_${Date.now()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, { data: { nome: 'Admin', email: adminEmail, password: 'teste', administrador: 'true' } });
    adminToken = (await (await request.post(`${baseURL}/login`, { data: { email: adminEmail, password: 'teste' } })).json()).authorization;

    const commonEmail = `comum_post_prod_${Date.now()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, { data: { nome: 'Comum', email: commonEmail, password: 'teste', administrador: 'false' } });
    commonToken = (await (await request.post(`${baseURL}/login`, { data: { email: commonEmail, password: 'teste' } })).json()).authorization;
  });

  test('Deve cadastrar produto com sucesso (Status 201)', async ({ request }) => {
    const prodName = `Prod POST ${Date.now()}`;
    const response = await request.post(`${baseURL}/produtos`, {
      headers: { Authorization: adminToken },
      data: { nome: prodName, preco: 100, descricao: 'Desc', quantidade: 50 }
    });
    expect(response.status()).toBe(201);
    expect((await response.json()).message).toBe('Cadastro realizado com sucesso');
  });

  test('Não deve permitir produto com nome duplicado (Status 400)', async ({ request }) => {
    const prodName = `Prod POST Duplicado ${Date.now()}`;
    await request.post(`${baseURL}/produtos`, { headers: { Authorization: adminToken }, data: { nome: prodName, preco: 100, descricao: 'Desc', quantidade: 50 } });

    const response = await request.post(`${baseURL}/produtos`, {
      headers: { Authorization: adminToken },
      data: { nome: prodName, preco: 100, descricao: 'Desc', quantidade: 50 }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe('Já existe produto com esse nome');
  });

  test('Deve bloquear acesso sem token válido (Status 401)', async ({ request }) => {
    const response = await request.post(`${baseURL}/produtos`, { data: { nome: 'X', preco: 10, descricao: 'Y', quantidade: 1 } });
    expect(response.status()).toBe(401);
  });

  test('Deve bloquear cadastro por usuário não administrador (Status 403)', async ({ request }) => {
    const response = await request.post(`${baseURL}/produtos`, {
      headers: { Authorization: commonToken },
      data: { nome: `Prod Comum ${Date.now()}`, preco: 10, descricao: 'X', quantidade: 1 }
    });
    expect(response.status()).toBe(403);
  });
});