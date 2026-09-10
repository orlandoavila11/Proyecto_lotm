import { z } from 'zod';

export const CombatantAtomStatsSchema = z.object({
  hp: z.number().int().nonnegative(),
  maxHp: z.number().int().positive(),
  spirituality: z.number().int().nonnegative(),
  maxSpirituality: z.number().int().nonnegative(),
  ap: z.number().int().nonnegative(),
  speed: z.number().optional()
});

export const CombatantOpacitySchema = z.object({
  oculto_hasta: z.string().min(1)
});

export const AbilityAtomInvocationSchema = z.object({
  atomId: z.string().min(1),
  params: z.record(z.any()).optional().default({})
});

export const CombatantAbilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(5),
  apCost: z.number().int().min(0).max(4),
  spiritualityCost: z.number().int().min(0),
  attentionCost: z.number().int().min(0).max(2).optional().default(0),
  range: z.number().int().min(1).max(7),
  targetType: z.enum(['SELF', 'SINGLE_ENEMY', 'SINGLE_ALLY', 'AREA', 'GRID_CELL']),
  atoms: z.array(AbilityAtomInvocationSchema).min(1),
  canonConfidence: z.enum(['canon', 'library', 'CANON', 'HIGH_CONFIDENCE', 'high_confidence', 'LEGEND', 'HUMAN_REVIEW', 'APOCRYPHAL']),
  derivationNote: z.string().min(5)
});

export const CombatantGSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  atomStats: CombatantAtomStatsSchema,
  statuses: z.array(z.union([z.string(), z.record(z.any())])),
  opacity: CombatantOpacitySchema,
  pathwayTag: z.string().min(1),
  sefiraGroupRef: z.string().min(1),
  observationChance: z.number().min(0).max(100).default(35),
  abilities: z.array(CombatantAbilitySchema).min(2).max(3)
});

export type CombatantAbility = z.infer<typeof CombatantAbilitySchema>;
export type CombatantG = z.infer<typeof CombatantGSchema>;
