import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WorldStateRootSchema } from '../src/infra/content/schemas/worldState.schema.js';

describe('Brief 02.3-bis: World State Canónico (Post-LOTM · Pre-COI, ~1353 Quinta Época)', () => {
  const packageRoot = fileURLToPath(new URL('..', import.meta.url));
  const worldStatePath = path.join(packageRoot, 'data', 'gameplay', 'world_state.json');
  const convergenceForcesPath = path.join(packageRoot, 'data', 'gameplay', 'convergence_forces.json');

  it('1. world_state.json existe y cumple estrictamente con WorldStateRootSchema (Zod)', () => {
    assert.strictEqual(fs.existsSync(worldStatePath), true, 'world_state.json debe existir en data/gameplay/');
    const rawData = JSON.parse(fs.readFileSync(worldStatePath, 'utf-8'));
    const parseResult = WorldStateRootSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error('Error parseando world_state.json:', parseResult.error.format());
    }
    assert.strictEqual(parseResult.success, true, 'world_state.json debe validar sin errores contra WorldStateRootSchema');
  });

  it('2. Ancla temporal y era oficial: POST-LOTM · PRE-COI (1353 Quinta Época)', () => {
    const data = JSON.parse(fs.readFileSync(worldStatePath, 'utf-8'));
    assert.strictEqual(data.era, 'POST-LOTM · PRE-COI');
    assert.strictEqual(data.anclaTemporal.year, 1353);
    assert.strictEqual(data.anclaTemporal.epoch, 'FIFTH_EPOCH');
    assert.ok(data.anclaTemporal.context.includes('1 año después de la Guerra de los Dioses'));
    assert.strictEqual(data.anclaTemporal.sealStatus, 'SEALED_DIRECTOR_1353', 'El ancla temporal 1353 debe estar sellada por el Director');
  });

  it('3. Reglas de Era R1-R4 están formalizadas', () => {
    const data = JSON.parse(fs.readFileSync(worldStatePath, 'utf-8'));
    assert.ok(data.reglasDeEra.R1 && data.reglasDeEra.R1.includes('HISTORIA'));
    assert.ok(data.reglasDeEra.R2 && data.reglasDeEra.R2.includes('LEYENDA'));
    assert.ok(data.reglasDeEra.R3 && data.reglasDeEra.R3.includes('semillas'));
    assert.ok(data.reglasDeEra.R4 && data.reglasDeEra.R4.includes('El Loco'));
    assert.ok(data.reglasDeEra.R4.includes('LORE-ONLY'), 'Ruling R4 permanente: la Iglesia del Loco debe ser LORE-ONLY');
  });

  it('4. Coherencia de Deidades: Vivas, Muertas, Absorbidas y Cambiadas', () => {
    const data = JSON.parse(fs.readFileSync(worldStatePath, 'utf-8'));

    // Vivos
    const livingIds = new Set(data.dioses.vivos.map((d: any) => d.id));
    assert.ok(livingIds.has('GOD_EVERNIGHT'), 'Evernight debe estar viva');
    assert.ok(livingIds.has('GOD_THE_FOOL_KLEIN'), 'The Fool debe estar vivo (en letargo)');
    assert.ok(livingIds.has('GOD_ETERNAL_BLAZING_SUN'), 'Sol Eterno debe estar vivo');
    assert.ok(livingIds.has('GOD_ROSELLE_BLACK_EMPEROR'), 'Roselle debe estar en vivos como SEALED_MAUSOLEUM');

    const roselle = data.dioses.vivos.find((d: any) => d.id === 'GOD_ROSELLE_BLACK_EMPEROR');
    assert.strictEqual(roselle.status, 'SEALED_MAUSOLEUM');

    // Muertos
    const deadIds = new Set(data.dioses.muertos.map((d: any) => d.id));
    assert.ok(deadIds.has('GOD_COMBAT_BADHEIL'), 'Dios del Combate debe estar listado en muertos');
    assert.ok(deadIds.has('GOD_DEATH_SALINGER'), 'Salinger debe estar listado en muertos');

    // Absorbidos
    const absorbedAuths = new Set(data.dioses.absorbidos.map((a: any) => a.authorityId));
    assert.ok(absorbedAuths.has('AUTHORITY_TWILIGHT_GIANT'), 'Autoridad del Crepúsculo absorbida por Evernight');
    assert.ok(absorbedAuths.has('AUTHORITY_DEATH'), 'Autoridad de la Muerte absorbida por Evernight');

    // Cambiados
    const changedIds = new Set(data.dioses.cambiados.map((c: any) => c.id));
    assert.ok(changedIds.has('GOD_ADAM_TRUE_CREATOR'), 'Adam / Verdadero Creador como deidad fusionada/cambiada');
  });

  it('5. Iglesias en Pie vs Iglesia Absorbida (Church of Combat)', () => {
    const data = JSON.parse(fs.readFileSync(worldStatePath, 'utf-8'));
    const churchesEnPie = new Set(data.iglesiasEnPie.map((c: any) => c.id));

    assert.ok(churchesEnPie.has('CHURCH_EVERNIGHT'));
    assert.ok(churchesEnPie.has('CHURCH_STORMS'));
    assert.ok(churchesEnPie.has('CHURCH_STEAM'));
    assert.ok(churchesEnPie.has('CHURCH_SUN'));
    assert.ok(churchesEnPie.has('CHURCH_WISDOM'));
    assert.ok(churchesEnPie.has('CHURCH_EARTH_MOTHER'));
    assert.ok(churchesEnPie.has('CHURCH_FOOL'));

    assert.strictEqual(churchesEnPie.has('CHURCH_COMBAT'), false, 'CHURCH_COMBAT NO debe figurar en iglesias en pie');

    const absorbedChurches = new Set(data.iglesiasAbsorbidas.map((c: any) => c.id));
    assert.ok(absorbedChurches.has('CHURCH_COMBAT'), 'CHURCH_COMBAT debe estar en iglesias absorbidas');
    const combatChurch = data.iglesiasAbsorbidas.find((c: any) => c.id === 'CHURCH_COMBAT');
    assert.strictEqual(combatChurch.absorbedBy, 'CHURCH_EVERNIGHT');
  });

  it('6. Naciones post-guerra detalladas', () => {
    const data = JSON.parse(fs.readFileSync(worldStatePath, 'utf-8'));
    const nationIds = new Set(data.nacionesPostGuerra.map((n: any) => n.id));

    assert.ok(nationIds.has('COUN_LOEN'));
    assert.ok(nationIds.has('COUN_INTIS'));
    assert.ok(nationIds.has('COUN_FEYSAC'));
    assert.ok(nationIds.has('COUN_FEYNABOTTER'));
    assert.ok(nationIds.has('COUN_LENBURG'));

    const feysac = data.nacionesPostGuerra.find((n: any) => n.id === 'COUN_FEYSAC');
    assert.ok(feysac.postWarCondition.includes('militar quebrantado') || feysac.postWarCondition.includes('derrota'));
  });

  it('7. Paridad 20/20 exacta entre mitosActivos y convergence_forces.json (powerTier: mythic)', () => {
    const worldData = JSON.parse(fs.readFileSync(worldStatePath, 'utf-8'));
    const forcesData = JSON.parse(fs.readFileSync(convergenceForcesPath, 'utf-8'));

    assert.strictEqual(worldData.mitosActivos.length, 20, 'world_state.json debe contener exactamente 20 mitos activos');

    const forcesMythics: string[] = [];
    for (const sefirahObj of Object.values(forcesData.sefirot) as Array<{ forces: any[] }>) {
      for (const force of sefirahObj.forces) {
        if (force.powerTier === 'mythic') {
          forcesMythics.push(force.id);
        }
      }
    }

    assert.strictEqual(forcesMythics.length, 20, 'convergence_forces.json debe contener exactamente 20 míticos');

    const worldMythicIds = worldData.mitosActivos.map((m: any) => m.id).sort();
    forcesMythics.sort();

    assert.deepStrictEqual(worldMythicIds, forcesMythics, 'La lista de mitos activos en world_state debe ser idéntica a los míticos de convergence_forces');
  });
});

