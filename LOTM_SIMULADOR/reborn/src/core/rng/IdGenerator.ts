import { SeededRNG } from './SeededRNG.js';

let counter = 0;
let defaultRng = new SeededRNG(13530101); // Época canónica 1353

/**
 * Configura la semilla base para pruebas y reanudación determinista.
 */
export function setDeterministicSeed(seed: number | string): void {
  defaultRng = new SeededRNG(seed);
  counter = 0;
}

/**
 * Resetea el contador determinista.
 */
export function resetDeterministicCounter(): void {
  counter = 0;
}

/**
 * Generador canónico de IDs deterministas.
 * Erradica por completo fuentes no deterministas en la generación de entidades (anclas, cicatrices, casos, eventos, batallas).
 * 
 * @param prefix Prefijo semántico de la entidad (ej: 'anchor', 'scar', 'battle', 'act')
 * @param seed Opcional: semilla local para derivación reproducible
 */
export function generateDeterministicId(prefix: string, seed?: string | number): string {
  counter += 1;
  const rng = seed !== undefined ? new SeededRNG(`${seed}_${counter}`) : defaultRng;
  const part = rng.nextInt(100000, 999999).toString(36);
  return `${prefix}_${part}_${counter}`;
}
