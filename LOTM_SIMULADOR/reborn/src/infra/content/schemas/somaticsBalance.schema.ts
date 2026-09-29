import { z } from 'zod';

export const RuinaTierSchema = z.object({
  tier: z.enum(['INTEGRO', 'MARCADO', 'EROSIONADO', 'ROTO', 'PERDIDO']),
  min: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
  descriptor: z.string().min(1),
  convergence_bonus: z.number().int().nonnegative()
});

export const RuinaSourcesSchema = z.object({
  rampage: z.number().int().positive(),
  anchor_destroyed: z.number().int().positive(),
  severe_scar: z.number().int().positive(),
  whisper_choice_s: z.number().int().positive(),
  extreme_transgression: z.number().int().positive()
});

export const AnchorsBalanceSchema = z.object({
  initial_count: z.number().int().positive(),
  max_anchors: z.number().int().positive(),
  weekly_recovery_rate: z.number().int().positive(),
  confident_relation_threshold: z.number().int().positive(),
  confident_weeks_required: z.number().int().positive(),
  damage_rampage: z.number().int().positive(),
  damage_extreme_transgression: z.number().int().positive()
});

export const InitialAnchorTemplateSchema = z.object({
  id_suffix: z.string().min(1),
  type: z.enum(['PERSON', 'LOCATION', 'ROLE', 'CONVICTION', 'ROUTINE']),
  name: z.string().min(1),
  description: z.string().min(1),
  strength: z.number().int().min(1).max(100),
  origin: z.string().min(1)
});

export const ScarMechanicSchema = z.object({
  hook: z.string().min(1),
  target: z.string().min(1),
  value: z.number(),
  description: z.string().min(1)
});

export const ScarCatalogEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  narrative: z.string().min(1),
  is_severe: z.boolean(),
  mechanics: z.array(ScarMechanicSchema)
});

export const WhisperPriceMenuEntrySchema = z.object({
  id: z.string().min(1),
  type: z.enum(['CORRUPTION', 'MEMORY_RELATION', 'MEMORY_COMPENDIUM', 'ANCHOR_DAMAGE']),
  amount: z.number().int().positive().optional(),
  penalty: z.number().int().positive().optional(),
  blockCount: z.number().int().positive().optional(),
  description: z.string().min(1)
});

export const RampageEventBalanceSchema = z.object({
  time_skip_hours_min: z.number().int().positive(),
  time_skip_hours_max: z.number().int().positive(),
  time_skip_days: z.number().int().positive(),
  district_tension_increase: z.number().int().positive(),
  inquisitorial_alert_increase: z.number().int().positive(),
  investigation_clock_delay_days: z.number().int().positive()
});

export const DriftTrajectoriesBalanceSchema = z.object({
  actor_drift_consecutive_windows: z.number().int().positive(),
  actor_drift_coherence_threshold: z.number().positive(),
  actor_drift_anchor_threshold: z.number().positive(),
  actor_drift_recovery_windows: z.number().int().positive(),
  actor_drift_recovery_coherence_min: z.number().positive(),
  actor_drift_recovery_coherence_max: z.number().positive(),
  chronic_corruption_ruina_threshold: z.number().int().positive(),
  chronic_corruption_threshold: z.number().int().positive()
});

export const SomaticsBalanceSchema = z.object({
  version: z.string().min(1),
  ruina_tiers: z.array(RuinaTierSchema).min(5),
  ruina_sources: RuinaSourcesSchema,
  anchors: AnchorsBalanceSchema,
  initial_anchor_templates: z.array(InitialAnchorTemplateSchema).min(6),
  scars_catalog: z.array(ScarCatalogEntrySchema).min(9),
  whisper_prices_menu: z.array(WhisperPriceMenuEntrySchema).min(4),
  corruption_threshold_visible_signs: z.number().int().positive(),
  rampage_corruption_threshold: z.number().int().positive(),
  rampage_sanity_threshold: z.number().int().positive(),
  rampage_event: RampageEventBalanceSchema,
  drift_trajectories: DriftTrajectoriesBalanceSchema
});

export type SomaticsBalance = z.infer<typeof SomaticsBalanceSchema>;
