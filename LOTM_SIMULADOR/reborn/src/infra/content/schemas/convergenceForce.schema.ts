import { z } from 'zod';

export const SEFIRA_GROUPS = [
  'LOTM',
  'GOD_ALMIGHTY',
  'DEATH_CLUSTER',
  'MOTHER_CLUSTER',
  'ORDER_CLUSTER',
  'ABYSS_CLUSTER',
  'HERMIT_CLUSTER',
  'CALAMITY_CLUSTER',
  'FATE_CLUSTER'
] as const;

export const FORCE_TYPES = [
  'family',
  'organization',
  'lineage',
  'entity',
  'pathway',
  'artifact'
] as const;

export const POWER_TIERS = [
  'encounter',
  'telar',
  'mythic'
] as const;

export const ENCOUNTER_ALLOWED_MODES = new Set([
  'encounter', 'investigation', 'event', 'case', 'artifact', 'narrative', 'telar'
]);

export const TELAR_ALLOWED_MODES = new Set([
  'investigation', 'event', 'case', 'artifact', 'narrative', 'telar'
]);

export const MYTHIC_ALLOWED_MODES = new Set([
  'narrative', 'lore', 'telar_root'
]);

export const ConvergenceForceGSchema = z.object({
  id: z.string().min(1),
  pathwayId: z.string().optional(),
  sefirahId: z.string().optional(),
  sefiraGroupRef: z.enum(SEFIRA_GROUPS),
  type: z.enum(FORCE_TYPES),
  powerTier: z.enum(POWER_TIERS),
  eraVerified: z.union([z.boolean(), z.literal('PENDING_ERA_REVIEW')]),
  canonRef: z.string().min(1),
  interactionModes: z.array(z.string()).min(1)
}).superRefine((force, ctx) => {
  const allowed = force.powerTier === 'encounter'
    ? ENCOUNTER_ALLOWED_MODES
    : force.powerTier === 'telar'
      ? TELAR_ALLOWED_MODES
      : MYTHIC_ALLOWED_MODES;

  for (const mode of force.interactionModes) {
    if (!allowed.has(mode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Modo de interacción incoherente '${mode}' para powerTier '${force.powerTier}' en fuerza '${force.id}'. Válidos: ${Array.from(allowed).join(', ')}`
      });
    }
  }
});

export const SefirahForcesBlockSchema = z.object({
  group: z.enum(SEFIRA_GROUPS),
  name: z.string().min(1),
  forces: z.array(ConvergenceForceGSchema).min(1)
});

export const ConvergenceForcesRootGSchema = z.object({
  $schema: z.string().optional(),
  schema_version: z.literal('1.0'),
  sealedBy: z.literal('Director'),
  generatedAt: z.string().min(1),
  description: z.string().min(1),
  sefirot: z.record(z.string(), SefirahForcesBlockSchema)
}).superRefine((root, ctx) => {
  const keys = Object.keys(root.sefirot);
  if (keys.length !== 9) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Deben existir exactamente 9 séfirot, encontradas: ${keys.length}`
    });
  }
});

export type ConvergenceForceG = z.infer<typeof ConvergenceForceGSchema>;
export type ConvergenceForcesRootG = z.infer<typeof ConvergenceForcesRootGSchema>;
