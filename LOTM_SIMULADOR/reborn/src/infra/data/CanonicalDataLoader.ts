import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CanonicalPathwayId, PathwayCompendium, SequenceData } from '../../core/types/pathway.js';

export class CanonicalDataLoader {
  private static instance: CanonicalDataLoader | null = null;
  private pathways: Map<CanonicalPathwayId, PathwayCompendium> = new Map();
  private aliasMap: Map<string, CanonicalPathwayId> = new Map();

  private constructor(baseDataPath?: string) {
    this.initAliases();
    this.loadPathways(baseDataPath);
  }

  public static getInstance(baseDataPath?: string): CanonicalDataLoader {
    if (!CanonicalDataLoader.instance) {
      CanonicalDataLoader.instance = new CanonicalDataLoader(baseDataPath);
    }
    return CanonicalDataLoader.instance;
  }

  private initAliases(): void {
    const mapping: Record<CanonicalPathwayId, string[]> = {
      FOOL: ['FOOL', 'SEER'],
      DOOR: ['DOOR', 'APPRENTICE'],
      ERROR: ['ERROR', 'MARAUDER'],
      VISIONARY: ['VISIONARY', 'SPECTATOR'],
      SUN: ['SUN', 'BARD'],
      TYRANT: ['TYRANT', 'SAILOR'],
      WHITE_TOWER: ['WHITE_TOWER', 'READER', 'TOWER'],
      HANGED_MAN: ['HANGED_MAN', 'SECRETS_SUPPLIANT'],
      DARKNESS: ['DARKNESS', 'SLEEPLESS', 'NIGHT'],
      DEATH: ['DEATH', 'CORPSE_COLLECTOR'],
      TWILIGHT_GIANT: ['TWILIGHT_GIANT', 'WARRIOR', 'GIANT'],
      RED_PRIEST: ['RED_PRIEST', 'HUNTER'],
      DEMONESS: ['DEMONESS', 'ASSASSIN'],
      BLACK_EMPEROR: ['BLACK_EMPEROR', 'LAWYER'],
      JUSTICIAR: ['JUSTICIAR', 'ARBITER'],
      CHAINED: ['CHAINED', 'PRISONER', 'MUTANT'],
      ABYSS: ['ABYSS', 'CRIMINAL'],
      MOON: ['MOON', 'APOTHECARY'],
      MOTHER: ['MOTHER', 'PLANTER'],
      PARAGON: ['PARAGON', 'SAVANT'],
      HERMIT: ['HERMIT', 'MYSTERY_PRYER'],
      WHEEL_OF_FORTUNE: ['WHEEL_OF_FORTUNE', 'MONSTER']
    };

    for (const [canonicalId, aliases] of Object.entries(mapping)) {
      aliases.forEach(a => this.aliasMap.set(a.toUpperCase(), canonicalId as CanonicalPathwayId));
    }
  }

  public resolvePathwayId(input: string): CanonicalPathwayId {
    const upper = input.toUpperCase().trim();
    const resolved = this.aliasMap.get(upper);
    if (!resolved) {
      throw new Error(`Vía Beyonder '${input}' no es canónica o no fue reconocida.`);
    }
    return resolved;
  }

  private loadPathways(customPath?: string): void {
    let dir = customPath;
    if (!dir) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const candidates = [
        path.join(packageRoot, 'data', 'canonical', 'pathways'),
        path.join(packageRoot, 'data', 'content', 'pathways')
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          dir = c;
          break;
        }
      }
    }

    if (!dir || !fs.existsSync(dir)) {
      throw new Error(`Directorio de datos canónicos no encontrado. Ruta evaluada: ${dir}`);
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
      const fullPath = path.join(dir!, file);
      const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      const rawPathway = raw.pathway || file.replace('.json', '').toUpperCase();
      const canonicalId = this.resolvePathwayId(rawPathway);

      const seqMap: Record<number, SequenceData> = {};

      if (raw.sequences) {
        if (Array.isArray(raw.sequences)) {
          raw.sequences.forEach((s: any, idx: number) => {
            const num = s.sequenceNumber !== undefined ? s.sequenceNumber : (9 - idx);
            seqMap[num] = this.normalizeSequence(num, s);
          });
        } else if (typeof raw.sequences === 'object') {
          for (const key of Object.keys(raw.sequences)) {
            const num = parseInt(key, 10);
            if (!isNaN(num)) {
              seqMap[num] = this.normalizeSequence(num, raw.sequences[key]);
            }
          }
        }
      }

      const compendium: PathwayCompendium = {
        id: canonicalId,
        displayName: raw.displayName || `${canonicalId} Pathway`,
        sequences: seqMap,
        mythicalCreatureForm: raw.mythicalCreatureForm
      };

      this.pathways.set(canonicalId, compendium);
    });
  }

  private normalizeSequence(sequenceNum: number, raw: any): SequenceData {
    const rawFormula = raw.formula || {};
    return {
      sequenceNumber: sequenceNum,
      name: raw.name || `Secuencia ${sequenceNum}`,
      abilities: Array.isArray(raw.abilities) ? raw.abilities : [],
      actingMethods: Array.isArray(raw.actingMethods) ? raw.actingMethods : [],
      formula: {
        mainIngredients: Array.isArray(rawFormula.mainIngredients) ? rawFormula.mainIngredients : [],
        supplementaryIngredients: Array.isArray(rawFormula.supplementaryIngredients) ? rawFormula.supplementaryIngredients : [],
        potionAppearance: rawFormula.potionAppearance
      },
      ritual: raw.ritual || null,
      characteristicAppearance: raw.characteristicAppearance
    };
  }

  public getPathway(pathwayId: string): PathwayCompendium {
    const resolved = this.resolvePathwayId(pathwayId);
    const p = this.pathways.get(resolved);
    if (!p) {
      throw new Error(`Compendio de la vía '${resolved}' no está cargado en memoria.`);
    }
    return p;
  }

  public getAllPathways(): PathwayCompendium[] {
    return Array.from(this.pathways.values());
  }

  public getSequenceData(pathwayId: string, sequenceNum: number): SequenceData {
    const p = this.getPathway(pathwayId);
    const s = p.sequences[sequenceNum];
    if (!s) {
      throw new Error(`Secuencia ${sequenceNum} no existe para la vía ${p.id}.`);
    }
    return s;
  }
}

