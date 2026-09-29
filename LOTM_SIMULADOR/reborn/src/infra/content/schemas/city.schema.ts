import { z } from 'zod';

/** Presentación de los distritos de Backlund alcanzables en carruaje (Tier G). */
export const CityDistrictsFileSchema = z.object({
  version: z.string(),
  derivationNote: z.string().min(5),
  districts: z.array(z.object({
    id: z.string().regex(/^DIST_[A-Z_]+$/),
    landmark: z.string().min(3),
    ambience: z.string().min(3),
    description: z.string().min(10)
  })).min(1)
});
export type CityDistrictsFile = z.infer<typeof CityDistrictsFileSchema>;
