import { z } from 'zod';
import { CANONICAL_PATHWAYS } from '../../../core/types/pathway.js';

export const DilemmaOptionSchema = z.object({
  id: z.string().min(1),
  texto: z.string().min(1),
  tradeOffs: z.union([z.record(z.any()), z.array(z.any())]),
  pesos: z.record(z.number()),
  costes: z.union([z.record(z.number()), z.record(z.any())]),
  effectKey: z.string().optional(),
  narrativeOutcome: z.string().min(10)
});

export const AntiExploitSchema = z.object({
  decay: z.number().min(0).max(1),
  minCost: z.number().min(0),
  variety: z.union([z.number(), z.string()])
});

export const DilemmaDerivationNoteSchema = z.object({
  source: z.string().min(1),
  eraAdaptations: z.string().min(1)
});

export const DilemmaGSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  situation: z.string().optional(),
  pathway: z.enum(CANONICAL_PATHWAYS as unknown as [string, ...string[]]),
  sequence: z.number().int().min(8).max(9),
  options: z.array(DilemmaOptionSchema).min(2).max(3),
  whisperOptions: z.array(DilemmaOptionSchema).optional(),
  antiExploit: AntiExploitSchema,
  derivationNote: DilemmaDerivationNoteSchema.optional(),
  canonConfidence: z.enum(['canon', 'library', 'adapted']).optional(),
  directorApproved: z.boolean().optional()
});

export type DilemmaG = z.infer<typeof DilemmaGSchema>;

export const DilemmaEffectProfileSchema = z.object({
  digestion: z.number(),
  sanity: z.number(),
  policeSuspicion: z.number().int(),
  churchSuspicion: z.number().int(),
  penceReward: z.number().nonnegative(),
  spiritualityCost: z.number().nonnegative()
});

export const DilemmaEffectsTableSchema = z.object({
  schema_version: z.literal('1.0'),
  description: z.string().optional(),
  profiles: z.record(z.string(), DilemmaEffectProfileSchema)
});

export type DilemmaEffectsTable = z.infer<typeof DilemmaEffectsTableSchema>;
