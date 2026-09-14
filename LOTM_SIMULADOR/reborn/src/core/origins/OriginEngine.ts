import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient, CharacterRow, PersonaRow } from '../../infra/database/DatabaseClient.js';
import { generateDeterministicId } from '../rng/IdGenerator.js';
import {
  OriginsCatalog,
  OriginsCatalogSchema,
  OriginTemplate
} from '../../infra/content/schemas/origins.schema.js';

export class OriginEngine {
  private static catalog: OriginsCatalog | null = null;

  public static getCatalog(): OriginsCatalog {
    if (!this.catalog) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const filePath = path.join(packageRoot, 'data', 'gameplay', 'origins', 'origins.json');
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.catalog = OriginsCatalogSchema.parse(raw);
    }
    return this.catalog;
  }

  public static getOriginTemplate(originId: string): OriginTemplate | null {
    const cat = this.getCatalog();
    return cat.origins.find(o => o.id === originId) || null;
  }

  public static getAllOrigins(): OriginTemplate[] {
    return this.getCatalog().origins;
  }

  /**
   * Aplica un origen canónico a un personaje recién creado.
   * Modifica profesión, salario, carga y genera las 3 anclas de origen firmadas en la base de datos.
   */
  public static applyOrigin(
    db: DatabaseClient,
    characterId: string,
    originId: string
  ): {
    origin: OriginTemplate;
    anchorsCreated: number;
    character: CharacterRow;
    persona: PersonaRow;
  } {
    const origin = this.getOriginTemplate(originId);
    if (!origin) {
      throw new Error(`Origen no encontrado en catálogo de Tier G: ${originId}`);
    }

    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Personaje no encontrado: ${characterId}`);
    }

    // 1. Actualizar personaje en BD con datos del origen
    db.getRawDb().prepare(`
      UPDATE characters
      SET origin_id = ?,
          raw_pence = ?,
          salary_pence = ?,
          current_location = ?,
          employer_name = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      origin.id,
      origin.startingPence,
      origin.weeklySalaryPence,
      `Backlund - ${origin.startingDistrict}`,
      origin.initialContact.name,
      characterId
    );

    // 2. Si la carga es DEUDA, registrar en los campos de deuda de characters
    if (origin.initialBurden.type === 'DEBT' && origin.initialBurden.amountPence) {
      db.getRawDb().prepare(`
        UPDATE characters
        SET rent_debt_active = 1,
            rent_debt_amount = ?,
            rent_debt_note = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        origin.initialBurden.amountPence,
        `Carga de Origen: ${origin.initialBurden.name} - ${origin.initialBurden.description}`,
        characterId
      );
    }

    // 3. Crear o actualizar persona civil activa
    let persona = db.getActivePersona(characterId);
    if (!persona) {
      persona = db.createPersona({
        id: generateDeterministicId('persona'),
        character_id: characterId,
        legal_name: char.name,
        profession: origin.profession,
        social_class: origin.socialClass,
        district: origin.startingDistrict,
        police_suspicion: 5,
        church_suspicion: 5,
        human_anchors: 35,
        is_active: 1,
        is_compromised: 0
      });
    } else {
      db.getRawDb().prepare(`
        UPDATE personas
        SET profession = ?,
            social_class = ?,
            district = ?
        WHERE id = ?
      `).run(origin.profession, origin.socialClass, origin.startingDistrict, persona.id);
    }

    // 4. Crear las 3 anclas de origen canónicas en SQLite
    let anchorsCreated = 0;
    for (const anchorDef of origin.originAnchors) {
      const anchorId = generateDeterministicId(`anc_${origin.id.toLowerCase()}`);
      db.addAnchor({
        id: anchorId,
        character_id: characterId,
        title: anchorDef.name,
        name: anchorDef.name,
        type: anchorDef.type,
        category: anchorDef.type,
        description: anchorDef.description,
        strength: anchorDef.strength,
        damage_count: 0,
        is_destroyed: 0
      });
      anchorsCreated++;
    }

    const updatedChar = db.getCharacter(characterId)!;
    const updatedPersona = db.getActivePersona(characterId)!;

    return {
      origin,
      anchorsCreated,
      character: updatedChar,
      persona: updatedPersona
    };
  }
}

