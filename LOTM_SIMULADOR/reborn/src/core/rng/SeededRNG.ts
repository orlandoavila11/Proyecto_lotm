/**
 * SeededRNG: Generador Pseudoaleatorio Determinista con Semilla
 * Implementación basada en Mulberry32.
 * 
 * Garantiza determinismo estricto: misma semilla -> misma secuencia exacta de números.
 */
export class SeededRNG {
  private state: number;
  private readonly initialSeed: number | string;

  constructor(seed: number | string = 123456789) {
    this.initialSeed = seed;
    if (typeof seed === 'string') {
      this.state = SeededRNG.hashString(seed);
    } else {
      this.state = seed >>> 0;
    }
  }

  private static hashString(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  /** Retorna un float pseudoaleatorio en [0, 1) */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Retorna un entero en [min, max] inclusive */
  public nextInt(min: number, max: number): number {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.floor(this.next() * (high - low + 1)) + low;
  }

  /** Retorna true si la tirada tiene éxito según probabilidad porcentual (0 a 100) */
  public checkChance(percentage: number): boolean {
    if (percentage <= 0) return false;
    if (percentage >= 100) return true;
    return this.next() * 100 < percentage;
  }

  /** Simula una tirada de dado de N caras */
  public rollDie(sides: number): number {
    return this.nextInt(1, Math.max(1, sides));
  }

  public getState(): number {
    return this.state;
  }

  public getInitialSeed(): number | string {
    return this.initialSeed;
  }
}
