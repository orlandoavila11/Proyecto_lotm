import { DatabaseManager } from '../database/DatabaseManager';

export interface PathwaySequenceDetails {
  sequenceNumber: number;
  name: string;
  abilities: string[];
  actingMethods: string[];
  formulaStatus: string;
  mainIngredients: any[];
  supplementaryIngredients: string[];
  ritual: string | null;
}

export class PathwaySystem {
  constructor() {}

  /**
   * Mapea alias comunes de vías para garantizar la resolución en la Base de Datos.
   */
  private normalizePathwayName(pathwayName: string): string[] {
    const p = pathwayName.toUpperCase();
    const aliases: Record<string, string[]> = {
      "FOOL": ["FOOL", "SEER"],
      "SEER": ["SEER", "FOOL"],
      "VISIONARY": ["VISIONARY", "SPECTATOR"],
      "SPECTATOR": ["SPECTATOR", "VISIONARY"],
      "NIGHT": ["NIGHT", "SLEEPLESS"],
      "SLEEPLESS": ["SLEEPLESS", "NIGHT"],
      "WHITE_TOWER": ["WHITE_TOWER", "READER"],
      "READER": ["READER", "WHITE_TOWER"],
      "MYSTERY_PRYING": ["MYSTERY_PRYING", "MYSTERY_PRYER"],
      "MYSTERY_PRYER": ["MYSTERY_PRYER", "MYSTERY_PRYING"],
      "JUSTICIAR": ["JUSTICIAR", "ARBITER"],
      "ARBITER": ["ARBITER", "JUSTICIAR"]
    };

    return aliases[p] || [p];
  }

  /**
   * Consulta los detalles completos de una secuencia escaneando la base de datos JSON en tiempo real.
   * Resuelve propiedades anidadas de 'formula' e ingredientes.
   */
  public getSequenceDetails(pathwayName: string, sequenceNumber: number): PathwaySequenceDetails | null {
    const db = DatabaseManager.getInstance();
    const candidateNames = this.normalizePathwayName(pathwayName);
    
    let seqData: any = null;
    for (const name of candidateNames) {
      seqData = db.getSequenceData(name, sequenceNumber);
      if (seqData) break;
    }
    
    if (!seqData) return null;

    // Extracción segura soportando estructura plana o estructura anidada en 'formula'
    const formulaObj = seqData.formula || {};
    const mainIngs = seqData.mainIngredients || formulaObj.mainIngredients || [];
    const suppIngs = seqData.supplementaryIngredients || formulaObj.supplementaryIngredients || [];
    const ritualData = seqData.ritual !== undefined ? seqData.ritual : (formulaObj.ritual || null);

    // Normalización de actingMethods (soporta actingMethod string o actingMethods Array)
    let actingArray: string[] = [];
    if (Array.isArray(seqData.actingMethods)) {
      actingArray = seqData.actingMethods;
    } else if (Array.isArray(seqData.actingMethod)) {
      actingArray = seqData.actingMethod;
    } else if (typeof seqData.actingMethod === 'string') {
      actingArray = [seqData.actingMethod];
    }

    return {
      sequenceNumber: seqData.sequenceNumber,
      name: seqData.name,
      abilities: seqData.abilities || [],
      actingMethods: actingArray,
      formulaStatus: seqData.formulaStatus || (formulaObj.status || "KNOWN"),
      mainIngredients: mainIngs,
      supplementaryIngredients: suppIngs,
      ritual: typeof ritualData === 'object' && ritualData !== null ? JSON.stringify(ritualData) : ritualData
    };
  }

  /**
   * Resuelve el grupo supremo de Sephirot de una vía para verificar compatibilidades (Canon Completo).
   */
  private resolveCanonicalGroup(pathway: string): string {
    const p = pathway.toUpperCase();
    
    // Lord of the Mysteries (Castle of Sefirah)
    if (["FOOL", "SEER", "APPRENTICE", "DOOR", "MARAUDER", "ERROR"].includes(p)) {
      return "Lord of the Mysteries";
    }
    // God Almighty (Chaos Sea)
    if (["SPECTATOR", "VISIONARY", "SECRET_SUPPLIANT", "HANGED_MAN", "SAILOR", "TYRANT", "SUN", "BARD", "READER", "WHITE_TOWER"].includes(p)) {
      return "God Almighty";
    }
    // Eternal Darkness (River of Eternal Darkness)
    if (["SLEEPLESS", "NIGHT", "DEATH", "CORPSE", "COMBAT", "WARRIOR"].includes(p)) {
      return "Eternal Darkness";
    }
    // Calamity of Destruction (City of Calamity)
    if (["HUNTER", "RED_PRIEST", "ASSASSIN", "DEMONESS"].includes(p)) {
      return "Calamity of Destruction";
    }
    // Goddess of Origin (Goddess of Origin)
    if (["MOON", "VAMPIRE", "MOTHER", "PLANTER"].includes(p)) {
      return "Goddess of Origin";
    }
    // The Anarchy (Nation of Disorder)
    if (["LAWYER", "BLACK_EMPEROR", "ARBITER", "JUSTICIAR"].includes(p)) {
      return "The Anarchy";
    }
    // Demon of Knowledge (Knowledge Moor)
    if (["MYSTERY_PRYER", "HERMIT", "SAVANT", "PARAGON"].includes(p)) {
      return "Demon of Knowledge";
    }
    // Key of Light (Key of Light)
    if (["MONSTER", "WHEEL_OF_FORTUNE"].includes(p)) {
      return "Key of Light";
    }

    return "STATUS_UNKNOWN";
  }

  /**
   * Regla de Intercambio Canónico: Las vías vecinas del mismo grupo pueden alternar características 
   * en Secuencias Altas (Secuencia 4 o superior).
   */
  public isNeighboringPathway(currentPathway: string, targetPathway: string): boolean {
    const groupCurrent = this.resolveCanonicalGroup(currentPathway);
    const groupTarget = this.resolveCanonicalGroup(targetPathway);

    if (groupCurrent === "STATUS_UNKNOWN" || groupTarget === "STATUS_UNKNOWN") {
      return false;
    }
    return groupCurrent === groupTarget;
  }
}