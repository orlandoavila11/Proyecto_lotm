import { z } from 'zod';

export const StatusTypeSchema = z.enum([
  'FEAR',
  'BLESSING',
  'STUN',
  'POISON',
  'CONCEALED',
  'FRENZY',
  'WEAKENED',
  'ILLUSION'
]);

export const StatusInteractionSchema = z.object({
  statusA: StatusTypeSchema,
  statusB: StatusTypeSchema,
  resolution: z.enum([
    'MUTUAL_CANCELLATION',
    'REMOVE_A',
    'REMOVE_B',
    'A_IMMUNE_TO_B',
    'B_IMMUNE_TO_A',
    'CUSTOM_TRANSFORMATION'
  ]),
  description: z.string().min(5)
});

export const StatusMatrixSchema = z.object({
  schema_version: z.literal('1.0'),
  statuses: z.array(StatusTypeSchema).length(8),
  interactions: z.array(StatusInteractionSchema).min(6)
});

export type StatusType = z.infer<typeof StatusTypeSchema>;
export type StatusInteraction = z.infer<typeof StatusInteractionSchema>;
export type StatusMatrix = z.infer<typeof StatusMatrixSchema>;
