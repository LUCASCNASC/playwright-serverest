import { test, expect } from '@playwright/test';
import { UserHelper } from '../helpers/user-helper';
import { User } from '../models/user';
import { generateRandomEmail } from '../../shared/utils/utils';

/**
 * Testes de API para Usuários - Serverest
 *
 * Cenários positivos:
 * - Listar usuários
 * - Buscar usuário por ID
 * - Cadastrar usuário
 * - Atualizar usuário
 * - Deletar usuário
 *
 * Cenários negativos:
 * - Cadastrar usuário com email duplicado
 * - Cadastrar usuário com dados inválidos
 * - Buscar usuário inexistente
 * - Atualizar usuário inexistente
 * - Deletar usuário inexistente
 * - Deletar usuário com carrinho
 */

const baseURL = process.env.URL_API || 'https://serverest.dev';

test.describe('API Usuários - Serverest', () => {
  let userHelper: UserHelper;

  test.beforeEach(async ({ request }) => {
    userHelper = new UserHelper(request, baseURL);
  });

  // Cenários positivos
  test('deve listar todos os usuários', async () => {
    const response = await userHelper.getUsers();

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('quantidade');
    expect(data).toHaveProperty('usuarios');
    expect(Array.isArray(data.usuarios)).toBe(true);
  });

  // Teste para buscar usuário por ID
  test('deve buscar usuário por ID', async () => {
    // Usar o ID do usuário admin conhecido
    const response = await userHelper.getUserById('0uxuPY0cbmQhpEz1');

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('_id', '0uxuPY0cbmQhpEz1');
    expect(data).toHaveProperty('nome', 'Fulano da Silva');
    expect(data).toHaveProperty('email', 'fulano@qa.com');
  });

  // Teste para cadastrar novo usuário
  test('deve cadastrar novo usuário', async () => {
    const newUser: User = {
      nome: 'Usuario Teste API',
      email: generateRandomEmail(),
      password: 'teste123',
      administrador: 'false'
    };

    const response = await userHelper.createUser(newUser);

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Cadastro realizado com sucesso');
    expect(data).toHaveProperty('_id');
  });

  // Teste para atualizar usuário
  test('deve atualizar usuário existente', async () => {
    // Primeiro, criar um usuário para atualizar
    const newUser: User = {
      nome: 'Usuario Update Teste',
      email: generateRandomEmail(),
      password: 'teste123',
      administrador: 'false'
    };

    const createResponse = await userHelper.createUser(newUser);
    const createdUser = await createResponse.json();
    const userId = createdUser._id;

    // Agora atualizar
    const updatedData = {
      nome: 'Usuario Atualizado',
      email: generateRandomEmail(),
      password: 'novasenha123',
      administrador: 'true'
    };

    const updateResponse = await userHelper.updateUser(userId, updatedData);

    expect(updateResponse.ok()).toBe(true);
    const data = await updateResponse.json();
    expect(data).toHaveProperty('message', 'Registro alterado com sucesso');
  });

  // Teste para deletar usuário
  test('deve deletar usuário', async () => {
    // Primeiro, criar um usuário para deletar
    const newUser: User = {
      nome: 'Usuario Delete Teste',
      email: generateRandomEmail(),
      password: 'teste123',
      administrador: 'false'
    };

    const createResponse = await userHelper.createUser(newUser);
    const createdUser = await createResponse.json();
    const userId = createdUser._id;

    // Agora deletar
    const deleteResponse = await userHelper.deleteUser(userId);

    expect(deleteResponse.ok()).toBe(true);
    const data = await deleteResponse.json();
    expect(data).toHaveProperty('message', 'Registro excluído com sucesso');
  });

  // Cenários negativos
  test('não deve cadastrar usuário com email duplicado', async () => {
    const newUser: User = {
      nome: 'Usuario Duplicado',
      email: 'fulano@qa.com', // Email já existente
      password: 'teste123',
      administrador: 'false'
    };

    const response = await userHelper.createUser(newUser);

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Este email já está sendo usado');
  });

  // Teste para cadastrar usuário com dados inválidos
  test('não deve cadastrar usuário com dados inválidos', async () => {
    const invalidUser = {
      nome: '', // Nome vazio
      email: 'email-invalido', // Email inválido
      password: '', // Senha vazia
      administrador: 'invalid' // Administrador inválido
    };

    const response = await userHelper.createUser(invalidUser as User);

    expect(response.status()).toBe(400);
    // A API pode retornar diferentes mensagens de erro para dados inválidos
  });

  // Teste para buscar usuário inexistente
  test('não deve buscar usuário inexistente', async () => {
    const response = await userHelper.getUserById('0000000000000001');

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Usuário não encontrado');
  });

  // Teste para atualizar usuário inexistente
  test('deve criar novo usuário ao atualizar usuário inexistente', async () => {
    const updatedData = {
      nome: 'Usuario Inexistente Atualizado',
      email: generateRandomEmail(),
      password: 'teste123',
      administrador: 'false'
    };

    const response = await userHelper.updateUser('0000000000000001', updatedData);

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Cadastro realizado com sucesso');
  });

  // Teste para deletar usuário inexistente
  test('não deve deletar usuário inexistente', async () => {
    const response = await userHelper.deleteUser('usuario-inexistente-123');

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('message', 'Nenhum registro excluído');
  });
});
