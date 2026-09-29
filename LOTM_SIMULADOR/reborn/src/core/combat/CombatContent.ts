import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CombatBalanceSchema, EncountersFileSchema, type CombatBalance, type EncountersFile
} from '../../infra/content/schemas/combat.schema.js';

/**
 * Datos del combate (Tier G): balance numérico, encuentros por lugar y cosecha por combatiente.
 * Se validan con Zod al cargar y se cruzan con el catálogo de combatientes: una referencia rota falla en
 * el arranque (fail-loud), no en mitad de una partida.
 */
const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
const gameplay = (...p: string[]) => path.join(packageRoot, 'data', 'gameplay', ...p);

let balanceCache: CombatBalance | null = null;
let encountersCache: EncountersFile | null = null;
let combatantsCache: Map<string, any> | null = null;

export const CombatContent = {
  balance(): CombatBalance {
    if (!balanceCache) {
      balanceCache = CombatBalanceSchema.parse(JSON.parse(fs.readFileSync(gameplay('balance', 'combat.json'), 'utf-8')));
    }
    return balanceCache;
  },

  combatants(): Map<string, any> {
    if (!combatantsCache) {
      const list = JSON.parse(fs.readFileSync(gameplay('combatants', 'combatants.json'), 'utf-8')) as any[];
      combatantsCache = new Map(list.map((c) => [c.id, c]));
    }
    return combatantsCache;
  },

  encounters(): EncountersFile {
    if (!encountersCache) {
      const data = EncountersFileSchema.parse(JSON.parse(fs.readFileSync(gameplay('encounters', 'encounters.json'), 'utf-8')));
      const known = this.combatants();
      const refs = [
        ...data.sites.flatMap((s) => s.pool.map((p) => p.combatantId)),
        ...data.harvest.map((h) => h.combatantId)
      ];
      const broken = refs.filter((id) => !known.has(id));
      if (broken.length) {
        throw new Error(`encounters.json referencia combatientes inexistentes en Tier G: ${[...new Set(broken)].join(', ')}`);
      }
      encountersCache = data;
    }
    return encountersCache;
  },

  site(siteId: string) {
    return this.encounters().sites.find((s) => s.id === siteId) ?? null;
  },

  harvestFor(combatantId: string) {
    return this.encounters().harvest.find((h) => h.combatantId === combatantId) ?? null;
  }
};
