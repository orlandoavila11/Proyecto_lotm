import { z } from 'zod';

export const DayScheduleSchema = z.object({
  mañana: z.string().min(1),
  tarde: z.string().min(1),
  noche: z.string().min(1)
});

export const Schedule7dSchema = z.union([
  z.record(z.string(), DayScheduleSchema).refine(rec => Object.keys(rec).length === 7, {
    message: 'schedule debe contener exactamente 7 días'
  }),
  z.array(DayScheduleSchema).length(7)
]);

export const NpcWeekGSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  canonicalRef: z.string().optional(),
  isCanonical: z.boolean().optional(),
  eraCoherenceNote: z.string().optional(),
  schedule: Schedule7dSchema,
  memoryHooks: z.array(z.string()),
  opinionPorIdentidad: z.record(z.any())
});

export type NpcWeekG = z.infer<typeof NpcWeekGSchema>;
