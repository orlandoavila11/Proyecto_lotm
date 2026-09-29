import { z } from 'zod';
import { AbilityAtomInvocationSchema } from './combatant.schema.js';

/**
 * Balance del combate táctico (Ley 4: ningún número de juego en el código).
 * Lo consume GridCombatEngine y la ruta /api/combat.
 */
export const CombatBalanceSchema = z.object({
  version: z.string(),
  grid: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }),
  actionPoints: z.object({ player: z.number().int().positive(), enemy: z.number().int().positive(), maxAttention: z.number().int().positive() }),
  initiative: z.object({
    basePreparation: z.number(),
    enemyAlertnessPerSpeed: z.number(),
    defaultEnemySpeed: z.number()
  }),
  scrutiny: z.object({
    /** fracción del daño que se añade si el jugador conoce alguna técnica del adversario */
    damageBonus: z.number().min(0).max(1),
    /** fracción del daño que se evita si el jugador conoce la técnica usada y le queda atención */
    mitigation: z.number().min(0).max(1),
    defaultEnemyObservationChance: z.number().min(0).max(100),
    playerObservationChance: z.number().min(0).max(100)
  }),
  negotiation: z.object({ hpFractionThreshold: z.number().min(0).max(1) }),
  /** lo que el personaje percibe del adversario: bandas de vigor, nunca la cifra (al borde = por debajo del umbral de negociación) */
  conditionBands: z.object({ woundedBelow: z.number().min(0).max(1) }),
  flee: z.object({ minDistance: z.number().int().nonnegative() }),
  /** golpe sin coste de espiritualidad: con él nadie queda sin acción ofensiva */
  playerBasicAttack: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    apCost: z.number().int().min(0),
    spiritualityCost: z.number().int().min(0),
    range: z.number().int().min(1),
    atoms: z.array(AbilityAtomInvocationSchema).min(1)
  }),
  enemyBasicAttack: z.object({ name: z.string(), damage: z.number().int().positive() }),
  weakenedDamageMultiplier: z.number().positive(),
  /** daño por turno del veneno (las duraciones de estado se descuentan al final del turno de su portador) */
  poisonDamagePerTurn: z.number().int().nonnegative(),
  defeat: z.object({
    /** vigor con el que despierta el personaje tras caer */
    hpLeft: z.number().int().positive(),
    sanityLoss: z.number().int().nonnegative()
  }),
  /** bolsa encontrada al vencer, por categoría del encuentro */
  victoryPurse: z.record(z.enum(['MINOR', 'STANDARD', 'DANGEROUS']), z.number().int().nonnegative())
});
export type CombatBalance = z.infer<typeof CombatBalanceSchema>;

/** Encuentros por lugar: qué combatientes de Tier G pueden aparecer y con qué peso. */
export const EncountersFileSchema = z.object({
  version: z.string(),
  sites: z.array(z.object({
    id: z.string().min(1),
    districtId: z.string().min(1),
    label: z.string().min(1),
    pool: z.array(z.object({
      combatantId: z.string().min(1),
      weight: z.number().positive(),
      minSequence: z.number().int().min(0).max(9),
      maxSequence: z.number().int().min(0).max(9),
      tier: z.enum(['MINOR', 'STANDARD', 'DANGEROUS'])
    })).min(1)
  })).min(1),
  /** lo que se puede cosechar de cada combatiente vencido (sin entrada = nada que cosechar: Regla del Hueco) */
  harvest: z.array(z.object({
    combatantId: z.string().min(1),
    itemCode: z.string().regex(/^HARVEST_[A-Z0-9_]+$/),
    name: z.string().min(3),
    grade: z.enum(['COMMON', 'UNCOMMON', 'RARE']),
    source: z.enum(['TIER_L', 'GAMEPLAY']),
    derivationNote: z.string().min(5)
  }))
});
export type EncountersFile = z.infer<typeof EncountersFileSchema>;
