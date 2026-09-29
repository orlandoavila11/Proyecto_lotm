/**
 * Presentación de identificadores del motor en la prosa del juego. El motor narra con marcas técnicas
 * ("[FOOL]", "[SKILL_ENEMY_PRIMARY_STRIKE]", "[Sombra…]"); aquí sólo se traducen a lectura, nunca se inventa estado.
 */

export const PATHWAY_LABEL: Record<string, string> = { FOOL: 'la Vía del Loco', VISIONARY: 'la Vía del Espectador' };

/** calidad de la cosecha tras una victoria (GridCombatEngine.HarvestQuality) */
const HARVEST_LABEL: Record<string, string> = { PRISTINE: 'íntegro', DAMAGED: 'dañado', CONTAMINADO: 'contaminado' };

/** quita las marcas técnicas de una línea narrada por el motor */
export function cleanNarration(text: string): string {
  return text
    .replace(/\[([A-Z_]+)\]/g, (m, id: string) => PATHWAY_LABEL[id] ?? HARVEST_LABEL[id] ?? m.slice(1, -1).toLowerCase())
    .replace(/\[([^\]]+)\]/g, '$1');
}
