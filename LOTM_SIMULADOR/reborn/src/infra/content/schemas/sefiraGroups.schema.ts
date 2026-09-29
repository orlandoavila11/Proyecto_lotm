import { z } from 'zod';
import { CANONICAL_PATHWAYS } from '../../../core/types/pathway.js';

export const SefiraGroupItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pathways: z.array(z.enum(CANONICAL_PATHWAYS as unknown as [string, ...string[]])).min(1)
});

export const SefiraGroupsGSchema = z.object({
  sealedBy: z.literal('Director'),
  sealedAt: z.string().min(1),
  groups: z.record(z.string(), SefiraGroupItemSchema)
}).superRefine((data, ctx) => {
  const keys = Object.keys(data.groups);
  if (keys.length !== 9) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Deben existir exactamente 9 grupos séfira (encontrados: ${keys.length})`
    });
  }
});

export type SefiraGroupsG = z.infer<typeof SefiraGroupsGSchema>;
