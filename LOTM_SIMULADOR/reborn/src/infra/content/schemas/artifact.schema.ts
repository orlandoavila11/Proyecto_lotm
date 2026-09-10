import { z } from 'zod';

export const ArtifactPresagioSchema = z.object({
  pasivo: z.string().min(1),
  tabú: z.string().min(1),
  mirada: z.string().min(1)
});

export const ArtifactAtomEffectSchema = z.object({
  atomId: z.string().min(1),
  params: z.record(z.any()).default({}),
  trigger: z.string().min(1).default('ON_EQUIP'),
  description: z.string().min(5).optional()
});

export const ArtifactGSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  atomEffects: z.array(ArtifactAtomEffectSchema).min(1),
  presagio: ArtifactPresagioSchema,
  grade: z.union([
    z.enum(['GRADE_0', 'GRADE_1', 'GRADE_2', 'GRADE_3']),
    z.string().min(1)
  ]),
  canonConfidence: z.union([
    z.number().min(0).max(1),
    z.enum(['canon', 'library', 'CANON', 'HIGH_CONFIDENCE', 'LEGEND', 'HUMAN_REVIEW', 'APOCRYPHAL'])
  ])
});

export type ArtifactAtomEffect = z.infer<typeof ArtifactAtomEffectSchema>;
export type ArtifactG = z.infer<typeof ArtifactGSchema>;
