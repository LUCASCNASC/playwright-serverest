# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\put-produtos-id.spec.ts >> API ServeRest - PUT /produtos/{_id} >> Deve realizar novo cadastro se o ID não for encontrado (Status 201)
- Location: tests\api\put-produtos-id.spec.ts:31:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 400
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const baseURL = 'https://serverest.dev';
  4  | 
  5  | test.describe('API ServeRest - PUT /produtos/{_id}', () => {
  6  |   let adminToken: string;
  7  |   let commonToken: string;
  8  | 
  9  |   test.beforeAll(async ({ request }) => {
  10 |     const email = `admin_put_prod_${Date.now()}@qa.com`;
  11 |     await request.post(`${baseURL}/usuarios`, { data: { nome: 'Admin', email, password: 'teste', administrador: 'true' } });
  12 |     adminToken = (await (await request.post(`${baseURL}/login`, { data: { email, password: 'teste' } })).json()).authorization;
  13 | 
  14 |     const commonEmail = `comum_put_prod_${Date.now()}@qa.com`;
  15 |     await request.post(`${baseURL}/usuarios`, { data: { nome: 'Comum', email: commonEmail, password: 'teste', administrador: 'false' } });
  16 |     commonToken = (await (await request.post(`${baseURL}/login`, { data: { email: commonEmail, password: 'teste' } })).json()).authorization;
  17 |   });
  18 | 
  19 |   test('Deve alterar produto com sucesso (Status 200)', async ({ request }) => {
  20 |     const res = await request.post(`${baseURL}/produtos`, { headers: { Authorization: adminToken }, data: { nome: `Prod PUT ${Date.now()}`, preco: 50, descricao: 'X', quantidade: 10 } });
  21 |     const productId = (await res.json())._id;
  22 | 
  23 |     const response = await request.put(`${baseURL}/produtos/${productId}`, {
  24 |       headers: { Authorization: adminToken },
  25 |       data: { nome: `Prod PUT Editado ${Date.now()}`, preco: 60, descricao: 'Y', quantidade: 20 }
  26 |     });
  27 |     expect(response.status()).toBe(200);
  28 |     expect((await response.json()).message).toBe('Registro alterado com sucesso');
  29 |   });
  30 | 
  31 |   test('Deve realizar novo cadastro se o ID não for encontrado (Status 201)', async ({ request }) => {
  32 |     const response = await request.put(`${baseURL}/produtos/id_novo_${Date.now()}`, {
  33 |       headers: { Authorization: adminToken }, data: { nome: `Prod Novo PUT ${Date.now()}`, preco: 10, descricao: 'Z', quantidade: 5 }
  34 |     });
> 35 |     expect(response.status()).toBe(201);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  36 |   });
  37 | 
  38 |   test('Não deve permitir editar para nome já utilizado (Status 400)', async ({ request }) => {
  39 |     const prodDuplicado = `Prod Duplicado PUT ${Date.now()}`;
  40 |     await request.post(`${baseURL}/produtos`, { headers: { Authorization: adminToken }, data: { nome: prodDuplicado, preco: 10, descricao: 'X', quantidade: 1 } });
  41 | 
  42 |     const res = await request.post(`${baseURL}/produtos`, { headers: { Authorization: adminToken }, data: { nome: `Prod PUT Falha ${Date.now()}`, preco: 50, descricao: 'X', quantidade: 10 } });
  43 |     const productId = (await res.json())._id;
  44 | 
  45 |     const response = await request.put(`${baseURL}/produtos/${productId}`, { headers: { Authorization: adminToken }, data: { nome: prodDuplicado, preco: 10, descricao: 'X', quantidade: 1 } });
  46 |     expect(response.status()).toBe(400);
  47 |   });
  48 | 
  49 |   test('Deve bloquear edição sem token válido (Status 401)', async ({ request }) => {
  50 |     const response = await request.put(`${baseURL}/produtos/id_qualquer`, { data: { nome: 'X', preco: 10, descricao: 'Y', quantidade: 1 } });
  51 |     expect(response.status()).toBe(401);
  52 |   });
  53 | 
  54 |   test('Deve bloquear edição por usuário não administrador (Status 403)', async ({ request }) => {
  55 |     const response = await request.put(`${baseURL}/produtos/id_qualquer`, {
  56 |       headers: { Authorization: commonToken },
  57 |       data: { nome: `Prod PUT Comum ${Date.now()}`, preco: 10, descricao: 'X', quantidade: 1 }
  58 |     });
  59 |     expect(response.status()).toBe(403);
  60 |   });
  61 | });
```