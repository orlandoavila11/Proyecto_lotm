import { z } from 'zod';
import { CANONICAL_PATHWAYS } from '../../../core/types/pathway.js';

export const DilemmaOptionSchema = z.object({
  id: z.string().min(1),
  texto: z.string().min(1),
  tradeOffs: z.union([z.record(z.any()), z.array(z.any())]),
  pesos: z.record(z.number()),
  costes: z.union([z.record(z.number()), z.record(z.any())])
});

export const AntiExploitSchema = z.object({
  decay: z.number().min(0).max(1),
  minCost: z.number().min(0),
  variety: z.union([z.number(), z.string()])
});

export const DilemmaGSchema = z.object({
  id: z.string().min(1),
  pathway: z.enum(CANONICAL_PATHWAYS as unknown as [string, ...string[]]),
  sequence: z.number().int().min(8).max(9),
  options: z.array(DilemmaOptionSchema).min(2).max(3),
  antiExploit: AntiExploitSchema
});

export type DilemmaG = z.infer<typeof DilemmaGSchema>;
