import { z } from 'zod';

export const ConvergenceBalanceSchema = z.object({
  schema_version: z.string(),
  sources: z.object({
    public_combat_index_gain: z.number().int().positive(),
    ascension_index_gain: z.number().int().positive(),
    ecclesiastical_dilemma_gain_low: z.number().int().positive(),
    ecclesiastical_dilemma_gain_high: z.number().int().positive(),
    whisper_purchase_gain: z.number().int().positive()
  }),
  ruina_effective_bonus: z.object({
    INTEGRO: z.number().int().nonnegative(),
    MARCADO: z.number().int().positive(),
    EROSIONADO: z.number().int().positive(),
    ROTO: z.number().int().positive(),
    PERDIDO: z.number().int().positive()
  }),
  decay: z.object({
    weekly_decay_per_district: z.number().int().negative(),
    minimum_index: z.number().int().nonnegative(),
    maximum_index: z.number().int().positive()
  }),
  encounter_roll: z.object({
    base_chance_percentage: z.number().min(0).max(100),
    index_factor: z.number().positive(),
    dominant_sefira_attraction_percentage: z.number().min(0).max(100),
    open_pool_attraction_percentage: z.number().min(0).max(100)
  }),
  incursion: z.object({
    trigger_church_suspicion_threshold: z.number().int().positive(),
    purge_suspicion_on_resolution: z.number().int().negative(),
    default_nighthawk_squad: z.array(z.string().min(1)).min(1)
  })
});

export type ConvergenceBalance = z.infer<typeof ConvergenceBalanceSchema>;
