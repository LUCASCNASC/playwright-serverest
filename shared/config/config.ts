/**
 * Configurações compartilhadas do projeto
 */
export const config = {
  api: {
    baseURL: process.env.URL_API || 'https://serverest.dev',
    timeout: 30000,
  },
  ui: {
    baseURL: process.env.URL_UI || 'https://front.serverest.dev',
    timeout: 30000,
  },
  testData: {
    adminUser: {
      nome: 'Fulano da Silva',
      email: 'fulano@qa.com',
      password: 'teste',
      administrador: 'true',
    },
  },
};