import { z } from 'zod';

export const MarketItemQualitySchema = z.enum(['PRISTINE', 'DAMAGED', 'CONTAMINATED']);

export const MarketItemListingSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pathwayTarget: z.enum(['FOOL', 'VISIONARY', 'UNIVERSAL']),
  category: z.enum(['MAIN_INGREDIENT', 'SUPPLEMENTARY_INGREDIENT', 'HARVEST_LOOT', 'RITUAL_SUPPLY']),
  sequence: z.number().int().optional(),
  basePricePence: z.number().int().positive(),
  availableQualities: z.array(MarketItemQualitySchema).min(1),
  stock: z.number().int().nonnegative(),
  derivationCanon: z.string().min(1)
});

export const DistrictMarketSchema = z.object({
  districtId: z.string().min(1),
  districtName: z.string().min(1),
  vendorName: z.string().min(1),
  specialtyPathway: z.enum(['FOOL', 'VISIONARY', 'UNIVERSAL', 'DARKNESS']),
  inventory: z.array(MarketItemListingSchema)
});

export const EconomyMarketSchema = z.object({
  version: z.string(),
  markets: z.array(DistrictMarketSchema)
});

export type MarketItemQuality = z.infer<typeof MarketItemQualitySchema>;
export type MarketItemListing = z.infer<typeof MarketItemListingSchema>;
export type DistrictMarket = z.infer<typeof DistrictMarketSchema>;
export type EconomyMarket = z.infer<typeof EconomyMarketSchema>;
