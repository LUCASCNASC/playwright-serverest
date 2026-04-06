import { test, expect } from '@playwright/test';

const baseURL = 'https://serverest.dev';

test.describe('API ServeRest - DELETE /produtos/{_id}', () => {
  let adminToken: string;
  let commonToken: string;

  test.beforeAll(async ({ request }) => {
    const email = `admin_del_prod_${Date.now()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, { data: { nome: 'Admin', email, password: 'teste', administrador: 'true' } });
    adminToken = (await (await request.post(`${baseURL}/login`, { data: { email, password: 'teste' } })).json()).authorization;

    const emailComum = `comum_del_prod_${Date.now()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, { data: { nome: 'Comum', email: emailComum, password: 'teste', administrador: 'false' } });
    commonToken = (await (await request.post(`${baseURL}/login`, { data: { email: emailComum, password: 'teste' } })).json()).authorization;
  });

  test('Deve excluir produto com sucesso (Status 200)', async ({ request }) => {
    const resProd = await request.post(`${baseURL}/produtos`, { headers: { Authorization: adminToken }, data: { nome: `Del ${Date.now()}`, preco: 10, descricao: 'X', quantidade: 10 } });
    const productId = (await resProd.json())._id;

    const response = await request.delete(`${baseURL}/produtos/${productId}`, { headers: { Authorization: adminToken } });
    expect(response.status()).toBe(200);
    expect((await response.json()).message).toContain('Registro excluído com sucesso');
  });

  test('Não deve ser permitido excluir produto atrelado a um carrinho (Status 400)', async ({ request }) => {
    // Novo Admin que fará a compra
    const emailBuyer = `buyer_del_${Date.now()}@qa.com`;
    await request.post(`${baseURL}/usuarios`, { data: { nome: 'Buyer', email: emailBuyer, password: 'teste', administrador: 'true' } });
    const buyerToken = (await (await request.post(`${baseURL}/login`, { data: { email: emailBuyer, password: 'teste' } })).json()).authorization;

    const resProd = await request.post(`${baseURL}/produtos`, { headers: { Authorization: adminToken }, data: { nome: `Del Cart ${Date.now()}`, preco: 10, descricao: 'X', quantidade: 10 } });
    const productId = (await resProd.json())._id;

    await request.post(`${baseURL}/carrinhos`, { headers: { Authorization: buyerToken }, data: { produtos: [{ idProduto: productId, quantidade: 1 }] } });

    const response = await request.delete(`${baseURL}/produtos/${productId}`, { headers: { Authorization: adminToken } });
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe('Não é permitido excluir produto que faz parte de carrinho');
  });

  test('Deve bloquear exclusão sem token válido (Status 401)', async ({ request }) => {
    const response = await request.delete(`${baseURL}/produtos/id_qualquer`);
    expect(response.status()).toBe(401);
  });

  test('Deve bloquear exclusão por usuário não administrador (Status 403)', async ({ request }) => {
    const response = await request.delete(`${baseURL}/produtos/id_qualquer`, { headers: { Authorization: commonToken } });
    expect(response.status()).toBe(403);
  });
});