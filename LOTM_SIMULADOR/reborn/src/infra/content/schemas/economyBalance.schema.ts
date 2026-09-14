import { z } from 'zod';

export const QualityModifierSchema = z.object({
  priceMultiplier: z.number().positive(),
  successBonus: z.number(),
  corruptionRisk: z.number()
});

export const CorruptionCureTierSchema = z.object({
  tier: z.enum(['INTEGRO', 'MARCADO', 'EROSIONADO', 'ROTO', 'PERDIDO']),
  costPence: z.number().int().positive(),
  corruptionReduction: z.number().int().positive(),
  description: z.string().min(1)
});

export const PreparationChecklistItemSchema = z.object({
  id: z.enum(['lugar', 'momento', 'materiales_rituales', 'costos_anclaje']),
  name: z.string().min(1),
  description: z.string().min(1),
  costPence: z.number().int().nonnegative(),
  successBonus: z.number().positive(),
  riskReduction: z.number().positive()
});

export const DistrictRentSchema = z.object({
  districtId: z.string().min(1),
  rentPencePerWeek: z.number().int().positive()
});

export const HarvestPartPriceSchema = z.object({
  grade: z.enum(['COMMON', 'UNCOMMON', 'RARE']),
  buybackPence: z.number().int().positive()
});

export const EconomyBalanceSchema = z.object({
  version: z.string(),
  rent: z.object({
    defaultRentPencePerWeek: z.number().int().positive(),
    debtFlagName: z.string(),
    debtNarrativeNote: z.string(),
    districtOverrides: z.array(DistrictRentSchema)
  }),
  qualityModifiers: z.object({
    PRISTINE: QualityModifierSchema,
    DAMAGED: QualityModifierSchema,
    CONTAMINATED: QualityModifierSchema
  }),
  corruptionCures: z.array(CorruptionCureTierSchema),
  preparationChecklist: z.array(PreparationChecklistItemSchema),
  harvestBuybacks: z.array(HarvestPartPriceSchema),
  ascensionRisk: z.object({
    basePreparedFailChancePercentage: z.number().min(0).max(100),
    baseUnpreparedFailChancePercentage: z.number().min(0).max(100),
    rampageRuinaPenalty: z.number().int().positive()
  })
});

export type EconomyBalance = z.infer<typeof EconomyBalanceSchema>;
