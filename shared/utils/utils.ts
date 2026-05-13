// Utilize este arquivo para funções utilitárias isoladas

export function generateRandomEmail(): string {
  return `qa_${Math.floor(Math.random() * 10000)}@serverest.com`;
}