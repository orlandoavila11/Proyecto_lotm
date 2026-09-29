import { z } from 'zod';
import { CANONICAL_PATHWAYS } from '../../../core/types/pathway.js';

export const PathwayItemManifestGSchema = z.object({
  id: z.enum(CANONICAL_PATHWAYS as unknown as [string, ...string[]]),
  name: z.string().min(1),
  tier: z.literal('G'),
  playable: z.boolean(),
  tierLContentFile: z.string().min(1),
  sefirahGroupRef: z.string().min(1),
  sefirahIdRef: z.string().min(1)
});

export const PathwaysManifestGSchema = z.object({
  version: z.string().min(1),
  description: z.string().min(1),
  authorizedBy: z.string().min(1),
  sealedAt: z.string().min(1),
  totalPathways: z.literal(22),
  playableCount: z.literal(6),
  playablePathways: z.array(z.string()).length(6),
  sefirahSource: z.string().min(1),
  pathways: z.array(PathwayItemManifestGSchema).length(22)
});

export type PathwaysManifestG = z.infer<typeof PathwaysManifestGSchema>;
