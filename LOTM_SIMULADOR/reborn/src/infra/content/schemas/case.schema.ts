import { z } from 'zod';

export const CaseAccompliceSchema = z.object({
  id: z.string().min(1),
  gradiente: z.string().min(1)
});

export const CaseTruthModelSchema = z.object({
  nucleo: z.string().min(1).optional(),
  operador: z.string().min(1).optional(),
  complices: z.array(CaseAccompliceSchema).optional(),
  metodo: z.string().min(1),
  motivoOriginal: z.string().min(1).optional(),
  motivoActual: z.string().min(1).optional(),
  // Retrocompatibilidad con drafts iniciales
  culpable: z.string().optional(),
  motivo: z.string().optional(),
  status: z.string().optional(),
  nota: z.string().optional()
});

export const CaseClueSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().optional(),
  fuentes: z.array(z.string().min(1)).min(2),
  gating: z.union([z.string(), z.record(z.any()), z.array(z.string())]),
  descripcion: z.string().optional(),
  esPruebaDefinitiva: z.boolean().optional(),
  isConcealed: z.boolean().optional()
});

export const CaseVectorsSchema = z.object({
  investigativo: z.any(),
  social: z.any(),
  violento: z.any(),
  esotérico: z.any()
});

export const CaseExpiryCheckpointSchema = z.object({
  day: z.number().int().positive(),
  eventId: z.string().min(1),
  description: z.string().min(1),
  effects: z.record(z.any()).optional()
});

export const CaseExpirySchema = z.object({
  dias: z.number().int().positive(),
  checkpoints: z.array(CaseExpiryCheckpointSchema).optional(),
  resultado_malo: z.string().min(1)
});

export const CaseHypothesisItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  teoria: z.string().min(1),
  pistasSoporte: z.array(z.string().min(1)),
  disparadorFalsacion: z.string().min(1),
  colapsoAnte: z.string().min(1),
  status: z.enum(['APPARENTLY_VALID', 'FALSIFIED', 'TRUE_STRUCTURE', 'DRAFT']).default('APPARENTLY_VALID')
});

export const CaseResolutionStateSchema = z.object({
  id: z.enum(['RESOLUTION_A_JUSTICE', 'RESOLUTION_B_TRUTH', 'RESOLUTION_C_STABILITY', 'RESOLUTION_D_HEIR']),
  nombre: z.string().min(1),
  accion: z.string().min(1),
  consecuenciasLocales: z.string().min(1),
  telarDeclared: z.object({
    variable: z.literal('TRUTH_VS_STABILITY'),
    deltaTruth: z.number(),
    deltaStability: z.number(),
    traitUnlocked: z.string().optional()
  })
});

export const CaseGSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  truthModel: CaseTruthModelSchema,
  clues: z.array(CaseClueSchema).min(6).max(8),
  vectors: CaseVectorsSchema,
  hypothesisSlots: z.union([
    z.number().int().positive(),
    z.array(CaseHypothesisItemSchema),
    z.record(z.any())
  ]),
  expiry: CaseExpirySchema,
  resolutionStates: z.array(CaseResolutionStateSchema).min(4).max(4).optional(),
  rewards_ref: z.union([z.string().min(1), z.record(z.any())])
});

export type CaseG = z.infer<typeof CaseGSchema>;
export type CaseTruthModel = z.infer<typeof CaseTruthModelSchema>;
export type CaseClue = z.infer<typeof CaseClueSchema>;
export type CaseResolutionState = z.infer<typeof CaseResolutionStateSchema>;
