import { z } from 'zod';
import { CANONICAL_PATHWAYS } from '../../../core/types/pathway.js';

export const PlayerAbilityAtomSchema = z.object({
  atomId: z.string().min(1),
  params: z.record(z.any()).optional()
});

export const PlayerAbilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pathway: z.enum(CANONICAL_PATHWAYS as unknown as [string, ...string[]]),
  sequence: z.number().int().min(0).max(9),
  description: z.string().min(5),
  apCost: z.number().int().min(0).max(4),
  spiritualityCost: z.number().int().min(0),
  attentionCost: z.number().int().min(0).max(2).default(0),
  range: z.number().int().min(1).max(7),
  targetType: z.enum(['SELF', 'SINGLE_ENEMY', 'SINGLE_ALLY', 'AREA', 'GRID_CELL']),
  atoms: z.array(PlayerAbilityAtomSchema).min(1),
  canonConfidence: z.enum(['canon', 'library', 'CANON', 'HIGH_CONFIDENCE', 'LEGEND', 'HUMAN_REVIEW', 'APOCRYPHAL']),
  derivationNote: z.string().min(5),
  directorApproved: z.boolean().optional()
});

export const PlayerAbilitiesFileSchema = z.object({
  schema_version: z.literal('1.0'),
  abilities: z.array(PlayerAbilitySchema).min(12)
});

export type PlayerAbility = z.infer<typeof PlayerAbilitySchema>;
export type PlayerAbilitiesFile = z.infer<typeof PlayerAbilitiesFileSchema>;
