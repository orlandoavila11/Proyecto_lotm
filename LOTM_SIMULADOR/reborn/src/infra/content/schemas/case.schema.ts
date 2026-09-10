import { z } from 'zod';

export const CaseTruthModelSchema = z.object({
  culpable: z.string().min(1),
  metodo: z.string().min(1),
  motivo: z.string().min(1)
});

export const CaseClueSchema = z.object({
  id: z.string().min(1),
  fuentes: z.array(z.string().min(1)).min(2),
  gating: z.union([z.string(), z.record(z.any()), z.array(z.string())])
});

export const CaseVectorsSchema = z.object({
  investigativo: z.any(),
  social: z.any(),
  violento: z.any(),
  esotérico: z.any()
});

export const CaseExpirySchema = z.object({
  dias: z.number().int().positive(),
  resultado_malo: z.string().min(1)
});

export const CaseGSchema = z.object({
  id: z.string().min(1),
  truthModel: CaseTruthModelSchema,
  clues: z.array(CaseClueSchema).min(6).max(8),
  vectors: CaseVectorsSchema,
  hypothesisSlots: z.union([z.number().int().positive(), z.array(z.any()), z.record(z.any())]),
  expiry: CaseExpirySchema,
  rewards_ref: z.union([z.string().min(1), z.record(z.any())])
});

export type CaseG = z.infer<typeof CaseGSchema>;
