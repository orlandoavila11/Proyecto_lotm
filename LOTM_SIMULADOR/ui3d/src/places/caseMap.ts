/**
 * Contrato escénico del caso CASE_CHERWOOD_HEIRLOOM (reborn/data/gameplay/cases/case_cherwood_heirloom.json).
 *
 * El servidor define pistas y fuentes (clueId + índice de fuente); aquí sólo se decide DÓNDE se
 * encuentra cada fuente en el mundo dibujado. Ningún texto de pista vive en el cliente: nombre y
 * descripción llegan de /api/investigation/clue/visit-source cuando el servidor la concede.
 */

export type SiteId = 'mansion' | 'orfanato' | 'barrio';

export interface ClueSource {
  clueId: string;
  sourceIndex: number;
  site: SiteId;
  /** rótulo del lugar físico o de la persona (no revela la pista) */
  label: string;
  /** hotspot de la lámina del lugar, si la fuente está dibujada */
  hotspot?: string;
  /** franja en la que la persona es accesible, sólo orientativo: el servidor valida */
  when?: string;
}

export const CLUE_SOURCES: ClueSource[] = [
  // Mansión Sterling · despacho (lámina V03)
  { clueId: 'CLUE_BURNED_TOYS', sourceIndex: 0, site: 'mansion', label: 'Las cenizas de la chimenea', hotspot: 'fireplace' },
  { clueId: 'CLUE_WILL_DRAFT', sourceIndex: 0, site: 'mansion', label: 'El escritorio del despacho', hotspot: 'desk' },
  { clueId: 'CLUE_CONCEALED_SAFE', sourceIndex: 0, site: 'mansion', label: 'El retrato de familia', hotspot: 'portrait' },
  { clueId: 'CLUE_MIND_TRACES', sourceIndex: 0, site: 'mansion', label: 'El tocador de Evangeline, arriba' },
  { clueId: 'CLUE_BLOODLINE_TALISMAN', sourceIndex: 0, site: 'mansion', label: 'El estuche de plomo del sótano' },

  // San Dionisio · orfanato y parroquia
  { clueId: 'CLUE_ASTROLOGY_RECORD', sourceIndex: 0, site: 'orfanato', label: 'Las vigas del dormitorio común' },
  { clueId: 'CLUE_FORGED_LETTERS', sourceIndex: 0, site: 'orfanato', label: 'La cripta de los archivos parroquiales' },

  // Cherwood · personas con agenda propia
  { clueId: 'CLUE_BURNED_TOYS', sourceIndex: 1, site: 'barrio', label: 'Wendy Clark, en el mercado', when: 'mañana' },
  { clueId: 'CLUE_WILL_DRAFT', sourceIndex: 1, site: 'barrio', label: 'Arthur Hale, contable', when: 'mañana o tarde' },
  { clueId: 'CLUE_MIND_TRACES', sourceIndex: 1, site: 'barrio', label: 'Evangeline, en la farmacia' },
  { clueId: 'CLUE_ASTROLOGY_RECORD', sourceIndex: 1, site: 'barrio', label: 'La vigilia ante la mansión', when: 'noche' },
  { clueId: 'CLUE_FINANCIAL_BLACKMAIL', sourceIndex: 0, site: 'barrio', label: 'El libro mayor del banco de Cherwood' },
  { clueId: 'CLUE_FINANCIAL_BLACKMAIL', sourceIndex: 1, site: 'barrio', label: 'El salón de Madame Vivien', when: 'tarde' },
  { clueId: 'CLUE_FORGED_LETTERS', sourceIndex: 1, site: 'barrio', label: 'La hermana Beatrice, tras la misa', when: 'mañana' },
  { clueId: 'CLUE_CONCEALED_SAFE', sourceIndex: 1, site: 'barrio', label: 'Evangeline, acorralada' },
  { clueId: 'CLUE_BLOODLINE_TALISMAN', sourceIndex: 1, site: 'barrio', label: 'Edward Rowe, en la aduana' }
];

/** franja del calendario → parámetro timeOfDay del motor de investigación */
export function timeOfDay(slot: number | undefined): 'mañana' | 'tarde' | 'noche' {
  if (slot === 0) return 'mañana';
  if (slot === 1) return 'tarde';
  return 'noche';
}

/** arte de la pista: fotografía definitiva o provisional */
export const clueArt = (clueId: string) => `art/clues/clue_${clueId}.webp`;
