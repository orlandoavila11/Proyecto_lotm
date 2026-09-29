import { test, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';
import { projectPublicBattleActor } from '../src/server/routes/combatRoutes.js';

describe('P01: Proyecciones Públicas Veraces y Ocultamiento de Secretos', () => {
  it('1. projectPublicBattleActor oculta habilidades no reveladas de enemigos', () => {
    const rawEnemy: any = {
      id: 'enemy_specter',
      name: 'Espectro de Niebla',
      abilities: ['SKILL_CORRUPTING_TOUCH', 'SKILL_ASTRAL_TERROR', 'SKILL_SHADOW_ESCAPE'],
      revealedAbilities: ['SKILL_CORRUPTING_TOUCH'],
      currentHp: 40,
      maxHp: 40
    };

    const projected = projectPublicBattleActor(rawEnemy, false);
    // Solo debe incluir las habilidades en revealedAbilities
    assert.deepStrictEqual(projected.abilities, ['SKILL_CORRUPTING_TOUCH']);
    assert.strictEqual(projected.abilities.includes('SKILL_ASTRAL_TERROR'), false);
    assert.strictEqual(projected.abilities.includes('SKILL_SHADOW_ESCAPE'), false);
  });

  it('2. projectPublicBattleActor preserva todas las habilidades si es el jugador', () => {
    const rawPlayer: any = {
      id: 'player_seer',
      name: 'Vidente',
      abilities: ['SKILL_SEER_DIVINATION', 'SKILL_SEER_SPIRIT_VISION'],
      revealedAbilities: [],
      currentHp: 100,
      maxHp: 100
    };

    const projected = projectPublicBattleActor(rawPlayer, true);
    assert.deepStrictEqual(projected.abilities, ['SKILL_SEER_DIVINATION', 'SKILL_SEER_SPIRIT_VISION']);
  });

  it('3. Iniciar combate proyecta al enemigo sin filtrar habilidades secretas', async () => {
    const { app } = await buildApp({ dbPath: ':memory:' });

    // Crear personaje
    const charRes = await app.inject({
      method: 'POST',
      url: '/api/character/new',
      payload: {
        name: 'Leonard Mitchell',
        pathway: 'FOOL',
        startingCity: 'Backlund - Cherwood',
        background: 'Detective Privado'
      }
    });
    const char = JSON.parse(charRes.body);
    const charId = char.character.id;

    // Iniciar combate
    const startRes = await app.inject({
      method: 'POST',
      url: '/api/combat/start',
      payload: {
        characterId: charId,
        enemyName: 'Criatura Sombra'
      }
    });

    assert.strictEqual(startRes.statusCode, 200);
    const startData = JSON.parse(startRes.body);
    assert.ok(startData.enemy);
    assert.strictEqual(startData.enemy.name, 'Criatura Sombra');
    // abilities proyectadas deben estar vacías o coincidir con revealedAbilities
    assert.deepStrictEqual(startData.enemy.abilities, []);
  });

  it('4. La activación de un caso no expone truthModel al cliente', async () => {
    const { app } = await buildApp({ dbPath: ':memory:' });

    const charRes = await app.inject({
      method: 'POST',
      url: '/api/character/new',
      payload: {
        name: 'Audrey Hall',
        pathway: 'VISIONARY',
        startingCity: 'Backlund - Queen',
        background: 'Espiritista de Salón'
      }
    });
    const char = JSON.parse(charRes.body);
    const charId = char.character.id;

    const caseRes = await app.inject({
      method: 'POST',
      url: '/api/investigation/case/activate',
      payload: {
        characterId: charId,
        caseId: 'CASE_CHERWOOD_HEIRLOOM'
      }
    });

    assert.strictEqual(caseRes.statusCode, 200);
    const caseData = JSON.parse(caseRes.body);
    assert.ok(caseData.caseState);
    assert.strictEqual(caseData.caseState.truthModel, undefined);
    assert.strictEqual(caseData.caseState.authorSolution, undefined);
    // Solo expone pistas descubiertas
    assert.ok(Array.isArray(caseData.caseState.discoveredClues));
  });

  it('5. Consultar un personaje inexistente devuelve 404 honesto sin fabricar datos', async () => {
    const { app } = await buildApp({ dbPath: ':memory:' });

    const res = await app.inject({
      method: 'GET',
      url: '/api/character/char_nonexistent_99999'
    });

    assert.strictEqual(res.statusCode, 404);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.error, 'Personaje no encontrado');
  });
});
