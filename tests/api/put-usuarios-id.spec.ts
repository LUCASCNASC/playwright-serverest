import { test, expect } from '@playwright/test';

const baseURL = 'https://serverest.dev';

test.describe('API ServeRest - PUT /usuarios/{_id}', () => {
  test('Deve editar um usuário existente (Status 200)', async ({ request }) => {
    const resNovo = await request.post(`${baseURL}/usuarios`, { data: { nome: 'Put QA', email: `put_${Date.now()}@qa.com`, password: 'teste', administrador: 'true' } });
    const userId = (await resNovo.json())._id;

    const response = await request.put(`${baseURL}/usuarios/${userId}`, {
      data: { nome: 'Put QA Editado', email: `put_editado_${Date.now()}@qa.com`, password: 'teste', administrador: 'true' }
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).message).toBe('Registro alterado com sucesso');
  });

  test('Deve realizar novo cadastro se o ID não for encontrado (Status 201)', async ({ request }) => {
    const response = await request.put(`${baseURL}/usuarios/novo_id_${Date.now()}`, {
      data: { nome: 'Novo via PUT', email: `novo_put_${Date.now()}@qa.com`, password: 'teste', administrador: 'false' }
    });
    expect(response.status()).toBe(201);
    expect((await response.json()).message).toBe('Cadastro realizado com sucesso');
  });

  test('Não deve permitir alteração com email já utilizado por outro (Status 400)', async ({ request }) => {
    const emailExistente = `put_existente_${Date.now()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, { data: { nome: 'Existente', email: emailExistente, password: 'teste', administrador: 'true' } });

    const resNovo = await request.post(`${baseURL}/usuarios`, { data: { nome: 'Put QA Falha', email: `put_falha_${Date.now()}@qa.com`, password: 'teste', administrador: 'true' } });
    const userId = (await resNovo.json())._id;

    const response = await request.put(`${baseURL}/usuarios/${userId}`, {
      data: { nome: 'Put Falha', email: emailExistente, password: 'teste', administrador: 'true' }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe('Este email já está sendo usado');
  });
});