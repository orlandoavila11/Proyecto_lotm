import { z } from 'zod';

export const ActingVerdictBalanceSchema = z.object({
  acting_weight: z.number().positive(),
  variety: z.string().min(1)
});

export const ActingCostFactorsSchema = z.object({
  high_sp_threshold: z.number().nonnegative(),
  high_cost_factor: z.number().positive(),
  low_cost_factor: z.number().positive(),
  base_factor: z.number().positive()
});

export const ActingBalanceSchema = z.object({
  schema_version: z.literal('1.0'),
  description: z.string().optional(),
  window_acts_cap_k: z.number().positive(),
  assimilation_multiplier: z.number().positive(),
  max_coherence_clamp: z.number().positive(),
  stagnation_threshold: z.number().min(0).max(1),
  overacting_threshold: z.number().positive(),
  variety_penalty: z.number().min(0).max(1),
  misfire_chance: z.number().min(0).max(100),
  transgression_corruption: z.number().int().positive(),
  decay_ladder: z.array(z.number().min(0).max(1)).min(3),
  verdicts: z.object({
    major_case: ActingVerdictBalanceSchema,
    minor_case: ActingVerdictBalanceSchema
  }),
  cost_factors: ActingCostFactorsSchema.optional(),
  witness_factor: z.number().positive().optional()
});

export type ActingBalance = z.infer<typeof ActingBalanceSchema>;
