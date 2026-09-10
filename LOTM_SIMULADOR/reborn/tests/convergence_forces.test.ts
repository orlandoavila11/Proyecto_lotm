import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANONICAL_PATHWAYS, CanonicalPathwayId } from '../src/core/types/pathway.js';

describe('Brief 02.2-bis: Convergence Forces por Séfira (Validación Fail-Loud y Era Pre-Novela)', () => {
  const packageRoot = fileURLToPath(new URL('..', import.meta.url));
  const forcesPath = path.join(packageRoot, 'data', 'gameplay', 'convergence_forces.json');
  const sefiraGroupsPath = path.join(packageRoot, 'data', 'gameplay', 'sefira_groups.json');
  const contentDir = path.join(packageRoot, 'data', 'content');

  const VALID_TYPES = new Set(['family', 'organization', 'lineage', 'entity', 'pathway', 'artifact']);
  const VALID_POWER_TIERS = new Set(['encounter', 'telar', 'mythic']);

  it('el archivo convergence_forces.json existe en Tier G, tiene version 1.0 y firma del Director', () => {
    assert.strictEqual(fs.existsSync(forcesPath), true, 'convergence_forces.json debe existir');
    const data = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));

    assert.strictEqual(data.schema_version, '1.0');
    assert.strictEqual(data.sealedBy, 'Director');
    assert.ok(data.generatedAt, 'Debe incluir timestamp de generación');
    assert.ok(data.sefirot, 'Debe contener el objeto de séfirot');
  });

  it('Validación 1: Las 9 séfirot canónicas están presentes y corresponden exactamente a sefira_groups.json', () => {
    const forcesData = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));
    const sefiraData = JSON.parse(fs.readFileSync(sefiraGroupsPath, 'utf-8'));

    const expectedSefiraIds = new Set(
      Object.values(sefiraData.groups as Record<string, { id: string }>).map(g => g.id)
    );

    const actualSefirotKeys = Object.keys(forcesData.sefirot);
    assert.strictEqual(actualSefirotKeys.length, 9, 'Deben existir exactamente 9 séfirot');

    for (const sId of actualSefirotKeys) {
      assert.strictEqual(
        expectedSefiraIds.has(sId),
        true,
        `Séfira ${sId} no existe en sefira_groups.json`
      );
    }
  });

  it('Validación 2: Cada fuerza tiene enums y atributos canónicos válidos (type, powerTier, eraVerified, canonRef)', () => {
    const forcesData = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));

    for (const [sefirahId, sefirahObj] of Object.entries(forcesData.sefirot) as Array<[string, { forces: any[] }]>) {
      assert.ok(Array.isArray(sefirahObj.forces), `forces en ${sefirahId} debe ser un array`);
      assert.ok(sefirahObj.forces.length > 0, `forces en ${sefirahId} no debe estar vacío`);

      for (const force of sefirahObj.forces) {
        assert.ok(force.id, `Fuerza en ${sefirahId} debe tener id`);
        assert.strictEqual(force.sefirahId, sefirahId, `sefirahId en fuerza ${force.id} debe coincidir con su contenedor`);

        assert.strictEqual(
          VALID_TYPES.has(force.type),
          true,
          `Tipo inválido ${force.type} en fuerza ${force.id}. Válidos: ${Array.from(VALID_TYPES).join(', ')}`
        );

        assert.strictEqual(
          VALID_POWER_TIERS.has(force.powerTier),
          true,
          `powerTier inválido ${force.powerTier} en fuerza ${force.id}. Válidos: ${Array.from(VALID_POWER_TIERS).join(', ')}`
        );

        const validEra = force.eraVerified === true || force.eraVerified === false || force.eraVerified === 'PENDING_ERA_REVIEW';
        assert.strictEqual(
          validEra,
          true,
          `eraVerified inválido en fuerza ${force.id}: ${force.eraVerified}`
        );

        assert.strictEqual(force.sefiraGroupRef, sefirahObj.group, `sefiraGroupRef en ${force.id} debe coincidir con el grupo de la séfira`);

        assert.ok(
          typeof force.canonRef === 'string' && force.canonRef.length > 0,
          `canonRef obligatorio en fuerza ${force.id}`
        );

        // Coherencia tier <-> modes
        assert.ok(Array.isArray(force.interactionModes) && force.interactionModes.length > 0, `interactionModes obligatorio en ${force.id}`);
        const allowedModes = force.powerTier === 'encounter'
          ? new Set(['encounter', 'investigation', 'event', 'case', 'artifact', 'narrative', 'telar'])
          : force.powerTier === 'telar'
            ? new Set(['investigation', 'event', 'case', 'artifact', 'narrative', 'telar'])
            : new Set(['narrative', 'lore', 'telar_root']);

        for (const mode of force.interactionModes) {
          assert.strictEqual(
            allowedModes.has(mode),
            true,
            `Modo de interacción incoherente '${mode}' para powerTier '${force.powerTier}' en fuerza ${force.id}`
          );
        }
      }
    }
  });

  it('Validación 3: 0 duplicados entre pools (disyunción estricta de fuerzas)', () => {
    const forcesData = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));
    const forceToSefira = new Map<string, string>();
    const duplicates: Array<{ forceId: string; sefirot: string[] }> = [];

    for (const [sefirahId, sefirahObj] of Object.entries(forcesData.sefirot) as Array<[string, { forces: any[] }]>) {
      for (const force of sefirahObj.forces) {
        if (forceToSefira.has(force.id)) {
          duplicates.push({ forceId: force.id, sefirot: [forceToSefira.get(force.id)!, sefirahId] });
        } else {
          forceToSefira.set(force.id, sefirahId);
        }
      }
    }

    assert.deepStrictEqual(duplicates, [], 'No debe existir ninguna fuerza asignada a múltiples séfirot');
  });

  it('Validación 4: 0 IDs huérfanos y vías canónicas resueltas (22 de 22 vías presentes)', () => {
    const forcesData = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));
    const canonicalSet = new Set<string>(CANONICAL_PATHWAYS);
    const assignedPathways = new Set<string>();

    for (const sefirahObj of Object.values(forcesData.sefirot) as Array<{ forces: any[] }>) {
      for (const force of sefirahObj.forces) {
        if (force.type === 'pathway') {
          assert.ok(force.pathwayId, `Fuerza de vía ${force.id} debe declarar pathwayId`);
          assert.strictEqual(
            canonicalSet.has(force.pathwayId),
            true,
            `Vía no canónica en fuerza: ${force.pathwayId}`
          );
          assignedPathways.add(force.pathwayId);
        }
      }
    }

    assert.strictEqual(assignedPathways.size, 22, 'Las 22 vías canónicas deben estar representadas como fuerzas');
  });

  it('Validación 5: Correcciones obligatorias del Director (Cero Klein, Amon mythic, Rose School única)', () => {
    const rawContent = fs.readFileSync(forcesPath, 'utf-8');
    const forcesData = JSON.parse(rawContent);

    // Corrección a: CERO referencias a Klein
    const hasKlein = /klein/i.test(rawContent);
    assert.strictEqual(hasKlein, false, 'PROHIBIDO: No debe existir ninguna referencia a Klein (era pre-novela)');

    // El Señor de los Misterios como leyenda
    const lotmForce = forcesData.sefirot.sefirah_castle.forces.find((f: any) => f.id === 'ENTITY_LORD_OF_MYSTERIES');
    assert.ok(lotmForce, 'ENTITY_LORD_OF_MYSTERIES debe existir en Sefirah Castle');
    assert.strictEqual(lotmForce.canonRef, 'legend', 'ENTITY_LORD_OF_MYSTERIES debe tener canonRef: "legend"');
    assert.strictEqual(lotmForce.powerTier, 'mythic', 'ENTITY_LORD_OF_MYSTERIES debe ser powerTier: "mythic"');

    // Corrección b: Escuela de la Rosa estrictamente en tenebrous_world (ABYSS_CLUSTER)
    const roseSchoolInChaosSea = forcesData.sefirot.chaos_sea.forces.find((f: any) => f.id === 'ORG_ROSE_SCHOOL');
    assert.strictEqual(roseSchoolInChaosSea, undefined, 'ORG_ROSE_SCHOOL NO debe estar en Chaos Sea');

    const roseSchoolInAbyss = forcesData.sefirot.tenebrous_world.forces.find((f: any) => f.id === 'ORG_ROSE_SCHOOL');
    assert.ok(roseSchoolInAbyss, 'ORG_ROSE_SCHOOL debe pertenecer únicamente a Tenebrous World');

    // Corrección c: Amon y seres supremos son powerTier mythic, excluidos de encuentros ordinarios
    const amonForce = forcesData.sefirot.sefirah_castle.forces.find((f: any) => f.id === 'KOA_AMON');
    assert.ok(amonForce, 'KOA_AMON debe existir');
    assert.strictEqual(amonForce.powerTier, 'mythic', 'KOA_AMON debe tener powerTier: mythic');

    // Pathways hermanos son encounter
    for (const sefirahObj of Object.values(forcesData.sefirot) as Array<{ forces: any[] }>) {
      for (const force of sefirahObj.forces) {
        if (force.type === 'pathway') {
          assert.strictEqual(force.powerTier, 'encounter', `Vía ${force.id} debe ser encounter`);
        }
      }
    }
  });

  it('Validación 6: Verificación de Era contra Tier L y Cola HUMAN_REVIEW para elementos no verificables', () => {
    const forcesData = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));
    const pendingReviewQueue: Array<{ id: string; sefirahId: string; canonRef: string }> = [];
    let verifiedCount = 0;

    for (const [sefirahId, sefirahObj] of Object.entries(forcesData.sefirot) as Array<[string, { forces: any[] }]>) {
      for (const force of sefirahObj.forces) {
        if (force.eraVerified === 'PENDING_ERA_REVIEW') {
          pendingReviewQueue.push({ id: force.id, sefirahId, canonRef: force.canonRef });
        } else if (force.eraVerified === true) {
          verifiedCount++;
        }
      }
    }

    assert.ok(verifiedCount > 70, `Al menos 70 fuerzas deben estar verificadas en era (obtenidas: ${verifiedCount})`);
    assert.strictEqual(pendingReviewQueue.length, 3, 'La cola HUMAN_REVIEW debe contener exactamente las 3 familias pendientes (§3.8)');
    const pendingIds = pendingReviewQueue.map(p => p.id).sort();
    assert.deepStrictEqual(pendingIds, ['FAM_BERIA', 'FAM_CASTIYA', 'FAM_EINHORN']);

    // Imprimir para el reporte §12
    console.log(`[ERA_AUDIT] Verificadas en era: ${verifiedCount} fuerzas`);
    console.log(`[HUMAN_REVIEW_QUEUE] Elementos en cola (${pendingReviewQueue.length}):`);
    for (const item of pendingReviewQueue) {
      console.log(`  - ${item.id} (${item.sefirahId}) -> ref: ${item.canonRef}`);
    }
  });

  it('Validación 7: Directivas del Director BRIEF-02.3-BIS (84 fuerzas, 20 míticos, Roselle sellado, Sol Eterno, Dancers precursor, exclusión de Combat)', () => {
    const forcesData = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));
    let totalForces = 0;
    const mythics: string[] = [];

    for (const sefirahObj of Object.values(forcesData.sefirot) as Array<{ forces: any[] }>) {
      totalForces += sefirahObj.forces.length;
      for (const force of sefirahObj.forces) {
        if (force.powerTier === 'mythic') {
          mythics.push(force.id);
        }
      }
    }

    assert.strictEqual(totalForces, 84, 'Total de fuerzas debe mantenerse exactamente en 84');
    assert.strictEqual(mythics.length, 20, 'Deben existir exactamente 20 seres míticos');

    // Roselle sellado
    const roselle = forcesData.sefirot.nation_of_disorder.forces.find((f: any) => f.id === 'GOD_ROSELLE_BLACK_EMPEROR');
    assert.ok(roselle, 'GOD_ROSELLE_BLACK_EMPEROR debe existir en nation_of_disorder');
    assert.strictEqual(roselle.status, 'SEALED_MAUSOLEUM');
    assert.strictEqual(roselle.powerTier, 'mythic');
    assert.deepStrictEqual(roselle.interactionModes, ['narrative', 'lore', 'telar_root']);
    assert.ok(roselle.nota && roselle.nota.includes('HISTORICAL_EMPEROR_CORRUPTED'));

    // ORG_DANCERS_PRECURSOR
    const dancers = forcesData.sefirot.key_of_light.forces.find((f: any) => f.id === 'ORG_DANCERS_PRECURSOR');
    assert.ok(dancers, 'ORG_DANCERS_PRECURSOR debe existir en key_of_light');
    assert.strictEqual(dancers.powerTier, 'telar');
    assert.ok(dancers.nota && dancers.nota.includes('semilla pre-CoI (R3)'));

    // Exclusión de CHURCH_COMBAT
    for (const sefirahObj of Object.values(forcesData.sefirot) as Array<{ forces: any[] }>) {
      const combatFound = sefirahObj.forces.find((f: any) => f.id === 'CHURCH_COMBAT');
      assert.strictEqual(combatFound, undefined, 'CHURCH_COMBAT no debe existir como fuerza activa');
    }

    // GOD_ETERNAL_BLAZING_SUN
    const sunGod = forcesData.sefirot.chaos_sea.forces.find((f: any) => f.id === 'GOD_ETERNAL_BLAZING_SUN');
    assert.ok(sunGod, 'GOD_ETERNAL_BLAZING_SUN debe existir en chaos_sea');
    assert.strictEqual(sunGod.powerTier, 'mythic');
    assert.strictEqual(sunGod.canonRef, 'reborn/data/content/world/gods.json');
  });
});

