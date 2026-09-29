import { test, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';
import { projectPublicBattle } from '../src/server/routes/combatRoutes.js';
import { GridCombatEngine } from '../src/core/combat/GridCombatEngine.js';
import { CombatContent } from '../src/core/combat/CombatContent.js';

describe('P01: Proyecciones Públicas Veraces y Ocultamiento de Secretos', () => {
  const battleWith = (combatantId: string) => {
    const engine = GridCombatEngine.getInstance();
    const def = CombatContent.combatants().get(combatantId);
    return engine.createBattle(
      'battle_projection_test',
      { id: 'char_proj', name: 'Vidente', pathway: 'FOOL', sequence: 9, hp: 100, maxHp: 100, spirituality: 100, maxSpirituality: 100 },
      { id: def.id, name: def.name, hp: def.atomStats.hp, maxHp: def.atomStats.maxHp, abilities: def.abilities }
    );
  };

  it('1. el adversario viaja sin cifras ni técnicas no observadas', () => {
    const battle = battleWith('dusk_specter');
    const pub: any = projectPublicBattle(battle);
    assert.strictEqual(pub.enemy.hp, undefined);
    assert.strictEqual(pub.enemy.maxHp, undefined);
    assert.strictEqual(pub.enemy.spirituality, undefined);
    assert.strictEqual(pub.enemy.allAbilities, undefined);
    assert.deepStrictEqual(pub.enemy.knownAbilities, []);
    assert.strictEqual(pub.enemy.condition, 'FIRM');
    assert.ok(!JSON.stringify(pub).includes('Susurro de Letargo'), 'Ninguna técnica oculta en la proyección');
  });

  it('2. escudriñar revela técnicas con nombre y el estado se percibe por bandas', () => {
    const engine = GridCombatEngine.getInstance();
    const battle = battleWith('dusk_specter');
    engine.executePlayerAction(battle, { type: 'SCRUTINIZE' });
    const enemy = engine.getPrimaryEnemy(battle);
    let pub = projectPublicBattle(battle);
    assert.strictEqual(pub.enemy.knownAbilities.length, 1);
    assert.ok(pub.enemy.knownAbilities[0].name.length > 3);
    enemy.hp = Math.floor(enemy.maxHp * 0.5);
    assert.strictEqual(projectPublicBattle(battle).enemy.condition, 'WOUNDED');
    enemy.hp = Math.floor(enemy.maxHp * 0.2);
    pub = projectPublicBattle(battle);
    assert.strictEqual(pub.enemy.condition, 'FALTERING');
    assert.ok(pub.player.hp > 0, 'Del personaje sí viajan sus propias cifras');
  });

  it('3. iniciar combate: el servidor elige el adversario y no acepta parámetros de resultado', async () => {
    const { app } = await buildApp({ dbPath: ':memory:' });
    const charRes = await app.inject({
      method: 'POST', url: '/api/character/new',
      payload: { name: 'Ernest Holloway', pathway: 'FOOL', startingCity: 'Backlund - Cherwood', background: 'Detective Privado' }
    });
    const charId = JSON.parse(charRes.body).character.id;
    const startRes = await app.inject({
      method: 'POST', url: '/api/combat/start',
      payload: { characterId: charId, enemyName: 'Criatura Sombra', enemyHp: 1, ambushMode: 'PLAYER_AMBUSH' }
    });
    assert.strictEqual(startRes.statusCode, 200);
    const data = JSON.parse(startRes.body);
    assert.notStrictEqual(data.enemy.name, 'Criatura Sombra', 'El nombre del adversario no lo decide el cliente');
    const pool = CombatContent.site('CHERWOOD_ALLEY')!.pool.map(p => CombatContent.combatants().get(p.combatantId).name);
    assert.ok(pool.includes(data.enemy.name), 'El adversario sale de la tabla de encuentros del lugar');
    assert.strictEqual(data.enemy.hp, undefined);
    assert.deepStrictEqual(data.enemy.knownAbilities, []);
    await app.close();
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
