import { z } from 'zod';

export const AnclaTemporalSchema = z.object({
  year: z.number().int(),
  epoch: z.string().min(1),
  context: z.string().min(1),
  sealStatus: z.string().min(1)
});

export const DiosesStateSchema = z.object({
  vivos: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    status: z.string().min(1),
    notes: z.string().optional()
  })).min(1),
  muertos: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    cause: z.string().min(1),
    absorbedBy: z.string().optional()
  })).min(1),
  absorbidos: z.array(z.object({
    authorityId: z.string().min(1),
    name: z.string().min(1),
    absorbedBy: z.string().min(1),
    notes: z.string().optional()
  })).min(1),
  cambiados: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    transformation: z.string().min(1),
    notes: z.string().optional()
  })).min(1)
});

export const IglesiaEnPieSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.string().min(1),
  territories: z.array(z.string()).min(1),
  notes: z.string().optional()
});

export const IglesiaAbsorbidaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  absorbedBy: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().optional()
});

export const NacionPostGuerraSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  capital: z.string().min(1),
  postWarCondition: z.string().min(1),
  dominantFactions: z.array(z.string()).min(1)
});

export const MitoActivoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sefiraGroupRef: z.string().min(1),
  interactionModes: z.array(z.string()).min(1),
  postWarRole: z.string().min(1)
});

export const ReglasDeEraSchema = z.object({
  R1: z.string().min(1),
  R2: z.string().min(1),
  R3: z.string().min(1),
  R4: z.string().min(1)
});

export const WorldStateRootSchema = z.object({
  schema_version: z.literal('1.0'),
  era: z.literal('POST-LOTM · PRE-COI'),
  anclaTemporal: AnclaTemporalSchema,
  reglasDeEra: ReglasDeEraSchema,
  dioses: DiosesStateSchema,
  iglesiasEnPie: z.array(IglesiaEnPieSchema).min(1),
  iglesiasAbsorbidas: z.array(IglesiaAbsorbidaSchema).min(1),
  nacionesPostGuerra: z.array(NacionPostGuerraSchema).min(1),
  mitosActivos: z.array(MitoActivoSchema).length(20)
});

export type WorldStateRoot = z.infer<typeof WorldStateRootSchema>;
