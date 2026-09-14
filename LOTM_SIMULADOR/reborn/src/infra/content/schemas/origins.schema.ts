import { z } from 'zod';

export const OriginAnchorDefSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['PERSON', 'LOCATION', 'ROLE', 'CONVICTION', 'ROUTINE']),
  description: z.string().min(1),
  strength: z.number().int().min(1).max(100)
});

export type OriginAnchorDef = z.infer<typeof OriginAnchorDefSchema>;

export const OriginContactDefSchema = z.object({
  name: z.string().min(1),
  relation: z.string().min(1),
  description: z.string().min(1)
});

export type OriginContactDef = z.infer<typeof OriginContactDefSchema>;

export const OriginBurdenDefSchema = z.object({
  type: z.enum(['DEBT', 'SECRET']),
  name: z.string().min(1),
  amountPence: z.number().int().nonnegative().optional(),
  description: z.string().min(1),
  mechanicalEffect: z.string().min(1)
});

export type OriginBurdenDef = z.infer<typeof OriginBurdenDefSchema>;

export const OriginTemplateSchema = z.object({
  id: z.string().regex(/^ORIGIN_[A-Z_]+$/),
  name: z.string().min(1),
  profession: z.string().min(1),
  socialClass: z.enum(['POOR', 'WORKING_CLASS', 'MIDDLE_CLASS', 'ARISTOCRAT']),
  startingDistrict: z.string().min(1),
  startingPence: z.number().int().nonnegative(),
  weeklySalaryPence: z.number().int().positive(),
  originAnchors: z.array(OriginAnchorDefSchema).length(3),
  initialContact: OriginContactDefSchema,
  initialBurden: OriginBurdenDefSchema,
  prologueIntro: z.string().min(1),
  derivationNote: z.string().min(1)
});

export type OriginTemplate = z.infer<typeof OriginTemplateSchema>;

export const OriginsCatalogSchema = z.object({
  version: z.string(),
  description: z.string(),
  origins: z.array(OriginTemplateSchema).min(5)
});

export type OriginsCatalog = z.infer<typeof OriginsCatalogSchema>;

