import { z } from 'zod';

export const ConspiracyGSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  actors: z.union([z.array(z.string()).min(1), z.record(z.any())]).optional(),
  trigger: z.union([z.string().min(1), z.record(z.any())]),
  temporizador: z.union([z.number().nonnegative(), z.record(z.any())]),
  escalationPhases: z.array(z.any()),
  playerAffordances: z.array(z.any()),
  resolutionStates: z.array(z.any()).min(2).max(4),
  systemicEffects: z.record(z.any())
});

export type ConspiracyG = z.infer<typeof ConspiracyGSchema>;
