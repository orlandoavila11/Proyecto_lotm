/**
 * GRAFO DE NAVEGACIÓN ESPACIAL Y TECLADO — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 * Permite recorrer la estancia con teclas de flecha y Tab secuencialmente.
 */

import type { HotspotId } from './types';

export type SpatialDirection = 'up' | 'down' | 'left' | 'right';

export const SPATIAL_TAB_ORDER: HotspotId[] = [
  'hotspot_mirror',
  'hotspot_chalice',
  'hotspot_corkboard',
  'hotspot_candle',
  'hotspot_almanack',
  'hotspot_identity_papers',
  'hotspot_acting_diary',
  'hotspot_money_pouch',
  'hotspot_bazaar_letter',
  'hotspot_staircase_door',
  'hotspot_mahogany_cracks'
];

export const SPATIAL_ADJACENCY_GRAPH: Record<HotspotId, Partial<Record<SpatialDirection, HotspotId>>> = {
  hotspot_chalice: {
    down: 'hotspot_mirror',
    left: 'hotspot_staircase_door',
    right: 'hotspot_corkboard'
  },
  hotspot_mirror: {
    up: 'hotspot_chalice',
    down: 'hotspot_identity_papers',
    left: 'hotspot_candle',
    right: 'hotspot_bazaar_letter'
  },
  hotspot_corkboard: {
    left: 'hotspot_chalice',
    down: 'hotspot_bazaar_letter'
  },
  hotspot_staircase_door: {
    up: 'hotspot_chalice',
    right: 'hotspot_candle',
    down: 'hotspot_almanack'
  },
  hotspot_candle: {
    up: 'hotspot_chalice',
    left: 'hotspot_staircase_door',
    right: 'hotspot_mirror',
    down: 'hotspot_almanack'
  },
  hotspot_bazaar_letter: {
    up: 'hotspot_corkboard',
    left: 'hotspot_mirror',
    right: 'hotspot_corkboard',
    down: 'hotspot_money_pouch'
  },
  hotspot_almanack: {
    up: 'hotspot_candle',
    right: 'hotspot_identity_papers',
    down: 'hotspot_mahogany_cracks'
  },
  hotspot_identity_papers: {
    up: 'hotspot_mirror',
    left: 'hotspot_almanack',
    right: 'hotspot_acting_diary',
    down: 'hotspot_mahogany_cracks'
  },
  hotspot_acting_diary: {
    up: 'hotspot_mirror',
    left: 'hotspot_identity_papers',
    right: 'hotspot_money_pouch',
    down: 'hotspot_mahogany_cracks'
  },
  hotspot_money_pouch: {
    up: 'hotspot_bazaar_letter',
    left: 'hotspot_acting_diary',
    down: 'hotspot_mahogany_cracks'
  },
  hotspot_mahogany_cracks: {
    up: 'hotspot_identity_papers',
    left: 'hotspot_almanack',
    right: 'hotspot_money_pouch'
  }
};

export function getNextSpatialHotspot(
  currentId: HotspotId,
  direction: SpatialDirection
): HotspotId | null {
  const neighbors = SPATIAL_ADJACENCY_GRAPH[currentId];
  return neighbors?.[direction] ?? null;
}

export function getNextTabHotspot(
  currentId: HotspotId | null,
  reverse: boolean = false
): HotspotId {
  if (!currentId) {
    return reverse ? SPATIAL_TAB_ORDER[SPATIAL_TAB_ORDER.length - 1] : SPATIAL_TAB_ORDER[0];
  }

  const index = SPATIAL_TAB_ORDER.indexOf(currentId);
  if (index === -1) {
    return SPATIAL_TAB_ORDER[0];
  }

  if (reverse) {
    const prevIndex = (index - 1 + SPATIAL_TAB_ORDER.length) % SPATIAL_TAB_ORDER.length;
    return SPATIAL_TAB_ORDER[prevIndex];
  } else {
    const nextIndex = (index + 1) % SPATIAL_TAB_ORDER.length;
    return SPATIAL_TAB_ORDER[nextIndex];
  }
}

