import * as fs from 'fs';
import * as path from 'path';

/**
 * Carrega dados de teste do arquivo JSON
 */
export function loadTestData() {
  const dataPath = path.resolve(__dirname, '../data/test-data.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
}