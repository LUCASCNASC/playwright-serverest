import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/user-helper';
import { LoginCredentials } from '../models/user';

/**
 * Testes de API para Login - Serverest
 *
 * Cenários positivos:
 * - Login com credenciais válidas
 *
 * Cenários negativos:
 * - Login com senha incorreta
 * - Login com email inexistente
 * - Login com email inválido
 * - Login com dados faltantes
 * - Login com dados extras
 */

test.describe('API Login - Serverest', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ request }) => {
    // Inicializar helper com base URL da API
    const baseURL = process.env.URL_API || 'https://serverest.dev';
    authHelper = new AuthHelper(request, baseURL);
  });

  // Cenários positivos
  test('deve realizar login com sucesso', async () => {
    const credentials: LoginCredentials = {
      email: 'fulano@qa.com',
      password: 'teste'
    };

    const response = await authHelper.login(credentials);

    expect(response).toHaveProperty('message', 'Login realizado com sucesso');
    expect(response).toHaveProperty('authorization');
    expect(typeof response.authorization).toBe('string');
    expect(response.authorization).toContain('Bearer ');
  });

  // Cenários negativos
  test('não deve realizar login com senha incorreta', async () => {
    const credentials: LoginCredentials = {
      email: 'fulano@qa.com',
      password: 'senha-incorreta'
    };

    await expect(authHelper.login(credentials)).rejects.toThrow();
  });

  // Teste para login com email inexistente
  test('não deve realizar login com email inexistente', async () => {
    const credentials: LoginCredentials = {
      email: 'usuario-inexistente@qa.com',
      password: 'teste'
    };

    await expect(authHelper.login(credentials)).rejects.toThrow();
  });

  // Teste para login com email inválido
  test('não deve realizar login com email inválido', async () => {
    const credentials: LoginCredentials = {
      email: 'email-invalido',
      password: 'teste'
    };

    await expect(authHelper.login(credentials)).rejects.toThrow();
  });

  // Teste para login com dados faltantes - sem email
  test('não deve realizar login com dados faltantes - sem email', async () => {
    const credentials = {
      password: 'teste'
    } as LoginCredentials;

    await expect(authHelper.login(credentials)).rejects.toThrow();
  });

  // Teste para login com dados faltantes - sem senha
  test('não deve realizar login com dados faltantes - sem senha', async () => {
    const credentials = {
      email: 'fulano@qa.com'
    } as LoginCredentials;

    await expect(authHelper.login(credentials)).rejects.toThrow();
  });

  // Teste para login com dados extras
  test('não deve realizar login com dados extras', async () => {
    const credentials = {
      email: 'fulano@qa.com',
      password: 'teste',
      extraField: 'extra-value'
    } as any;

    await expect(authHelper.login(credentials as LoginCredentials)).rejects.toThrow();
  });
});
