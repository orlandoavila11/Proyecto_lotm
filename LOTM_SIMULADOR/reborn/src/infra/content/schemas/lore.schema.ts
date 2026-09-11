import { z } from 'zod';

export const GrimoireSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(5),
  relatedCase: z.string().optional()
});

export const GrimoireMetadataSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  historical_era: z.string().min(1)
});

export const GrimoireClassificationSchema = z.object({
  risk_level: z.string().min(1),
  rarity: z.string().min(1)
});

export const GrimoireReadingRequirementsSchema = z.object({
  required_sequence: z.number().int().min(0).max(9),
  required_knowledge: z.array(z.string()),
  under_sequence_penalty: z.object({
    sanity_damage_multiplier: z.number().nonnegative(),
    forced_corruption_gain: z.number().nonnegative()
  })
});

export const GrimoireReadingEffectsSchema = z.object({
  sanity_cost: z.number().nonnegative(),
  corruption_yield: z.number().nonnegative()
});

export const GrimoireUnlocksSchema = z.object({
  events: z.array(z.string()),
  investigations: z.array(z.string()),
  rumors: z.array(z.string())
});

export const GrimoireGSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  canonRef: z.string().min(1),
  metadata: GrimoireMetadataSchema.optional(),
  classification: GrimoireClassificationSchema.optional(),
  reading_requirements: GrimoireReadingRequirementsSchema.optional(),
  knowledge_rewards: z.array(z.string()).optional(),
  knowledge_categories: z.array(z.string()).optional(),
  pathway_affinities: z.array(z.string()).optional(),
  reading_effects: GrimoireReadingEffectsSchema.optional(),
  side_effects: z.array(z.string()).optional(),
  unlocks: GrimoireUnlocksSchema.optional(),
  importance: z.string().optional(),
  lore_summary: z.string().optional(),
  danger_statement: z.string().optional(),
  sections: z.array(GrimoireSectionSchema).min(1),
  canonConfidence: z.enum(['canon', 'library', 'adapted']),
  directorApproved: z.boolean()
});

export const GrimoiresFileSchema = z.object({
  schema_version: z.literal('1.0'),
  grimoires: z.array(GrimoireGSchema).min(1)
});

export type GrimoireSection = z.infer<typeof GrimoireSectionSchema>;
export type GrimoireG = z.infer<typeof GrimoireGSchema>;
export type GrimoiresFile = z.infer<typeof GrimoiresFileSchema>;
