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

export const CombatantGSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  atomStats: CombatantAtomStatsSchema,
  statuses: z.array(z.union([z.string(), z.record(z.any())])),
  opacity: CombatantOpacitySchema,
  pathwayTag: z.string().min(1),
  sefiraGroupRef: z.string().min(1)
});

export type CombatantG = z.infer<typeof CombatantGSchema>;
