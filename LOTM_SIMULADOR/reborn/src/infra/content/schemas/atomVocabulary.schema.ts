import { z } from 'zod';

export const AtomCategorySchema = z.enum([
  'DAMAGE',
  'STATUS',
  'DISPLACEMENT',
  'REVELATION',
  'HEALING',
  'ECONOMY'
]);

export const AtomDefinitionSchema = z.object({
  id: z.string().min(1),
  category: AtomCategorySchema,
  description: z.string().min(5),
  allowedParameters: z.array(z.string()).default([]),
  baseCosts: z.object({
    ap: z.number().int().nonnegative(),
    spirituality: z.number().int().nonnegative(),
    attention: z.number().int().nonnegative().optional().default(0)
  }),
  playerOnly: z.boolean().default(false)
});

export const AtomVocabularySchema = z.object({
  schema_version: z.literal('1.0'),
  atoms: z.array(AtomDefinitionSchema).min(15)
});

export type AtomDefinition = z.infer<typeof AtomDefinitionSchema>;
export type AtomVocabulary = z.infer<typeof AtomVocabularySchema>;
