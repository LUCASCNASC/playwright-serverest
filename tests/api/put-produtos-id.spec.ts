import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

const baseURL = 'https://serverest.dev';

test.describe('API ServeRest - PUT /produtos/{_id}', () => {
  let adminToken: string;
  let commonToken: string;

  test.beforeAll(async ({ request }) => {
    const emailAdmin = `admin_put_prod_${randomUUID()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, {
      data: { nome: 'Admin', email: emailAdmin, password: 'teste', administrador: 'true' }
    });
    const loginAdmin = await request.post(`${baseURL}/login`, {
      data: { email: emailAdmin, password: 'teste' }
    });
    adminToken = (await loginAdmin.json()).authorization;

    const emailComum = `comum_put_prod_${randomUUID()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, {
      data: { nome: 'Comum', email: emailComum, password: 'teste', administrador: 'false' }
    });
    const loginComum = await request.post(`${baseURL}/login`, {
      data: { email: emailComum, password: 'teste' }
    });
    commonToken = (await loginComum.json()).authorization;
  });

  test('Deve alterar produto com sucesso (Status 200)', async ({ request }) => {
    const res = await request.post(`${baseURL}/produtos`, {
      headers: { Authorization: adminToken },
      data: { nome: `Prod PUT ${randomUUID()}`, preco: 50, descricao: 'X', quantidade: 10 }
    });
    const productId = (await res.json())._id;

    const response = await request.put(`${baseURL}/produtos/${productId}`, {
      headers: { Authorization: adminToken },
      data: { nome: `Prod PUT Editado ${randomUUID()}`, preco: 60, descricao: 'Y', quantidade: 20 }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Registro alterado com sucesso');
  });

  test('Deve realizar novo cadastro se o ID não for encontrado (Status 201)', async ({ request }) => {
    const response = await request.put(`${baseURL}/produtos/id_novo_${randomUUID()}`, {
      headers: { Authorization: adminToken },
      data: { nome: `Prod Novo PUT ${randomUUID()}`, preco: 10, descricao: 'Z', quantidade: 5 }
    });
    
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('Cadastro realizado com sucesso');
  });

  test('Não deve permitir editar para nome já utilizado (Status 400)', async ({ request }) => {
    const prodDuplicado = `Prod Duplicado PUT ${randomUUID()}`;
    await request.post(`${baseURL}/produtos`, {
      headers: { Authorization: adminToken },
      data: { nome: prodDuplicado, preco: 10, descricao: 'X', quantidade: 1 }
    });

    const res = await request.post(`${baseURL}/produtos`, {
      headers: { Authorization: adminToken },
      data: { nome: `Prod PUT Falha ${randomUUID()}`, preco: 50, descricao: 'X', quantidade: 10 }
    });
    const productId = (await res.json())._id;

    const response = await request.put(`${baseURL}/produtos/${productId}`, {
      headers: { Authorization: adminToken },
      data: { nome: prodDuplicado, preco: 10, descricao: 'X', quantidade: 1 }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Já existe produto com esse nome');
  });

  test('Deve bloquear edição sem token válido (Status 401)', async ({ request }) => {
    const response = await request.put(`${baseURL}/produtos/id_qualquer`, {
      data: { nome: `X_${randomUUID()}`, preco: 10, descricao: 'Y', quantidade: 1 }
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toBe('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  });

  test('Deve bloquear edição por usuário não administrador (Status 403)', async ({ request }) => {
    const response = await request.put(`${baseURL}/produtos/id_qualquer`, {
      headers: { Authorization: commonToken },
      data: { nome: `Prod PUT Comum ${randomUUID()}`, preco: 10, descricao: 'X', quantidade: 1 }
    });
    
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.message).toBe('Rota exclusiva para administradores');
  });
});