import { test, expect } from '@playwright/test';

const baseURL = 'https://serverest.dev';

test.describe('API ServeRest - POST /usuarios', () => {
  test('Deve cadastrar um novo usuário com sucesso (Status 201)', async ({ request }) => {
    const uniqueEmail = `post_user_${Date.now()}@qa.com`;
    const response = await request.post(`${baseURL}/usuarios`, {
      data: { nome: 'Automação QA', email: uniqueEmail, password: 'teste', administrador: 'true' }
    });
    
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('Cadastro realizado com sucesso');
    expect(body._id).toBeDefined();
  });

  test('Não deve permitir cadastro com email já utilizado (Status 400)', async ({ request }) => {
    const duplicatedEmail = `duplicado_${Date.now()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, {
      data: { nome: 'Original QA', email: duplicatedEmail, password: 'teste', administrador: 'true' }
    });

    const response = await request.post(`${baseURL}/usuarios`, {
      data: { nome: 'Duplicado QA', email: duplicatedEmail, password: 'teste', administrador: 'true' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Este email já está sendo usado');
  });
});