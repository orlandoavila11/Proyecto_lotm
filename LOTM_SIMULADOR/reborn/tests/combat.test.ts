import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';
import { CombatContent } from '../src/core/combat/CombatContent.js';

/**
 * Combate por la API real (GridCombatEngine + Tier G): el servidor elige el adversario, el cliente sólo actúa.
 * Al vencer, la cosecha definida en encounters.json entra en el inventario y la bolsa sale del balance.
 */

async function awakenedFool(app: any) {
  const start = JSON.parse((await app.inject({ method: 'POST', url: '/api/prologue/start', payload: { originId: 'ORIGIN_PRIVATE_INVESTIGATOR', name: 'Ernest Holloway' } })).body);
  const characterId = start.characterId;
  await app.inject({ method: 'POST', url: '/api/prologue/tutorial/dilemma', payload: { characterId, choice: 'PRUDENCE' } });
  await app.inject({ method: 'POST', url: '/api/prologue/drink', payload: { characterId, potionChoice: 'COBALT_EYES' } });
  return characterId as string;
}

/** Juega un turno sensato: acercarse, golpear con lo que alcance, terminar turno. */
async function playUntilOver(app: any, characterId: string, maxActions = 80) {
  const act = async (payload: Record<string, unknown>) =>
    app.inject({ method: 'POST', url: '/api/combat/action', payload: { characterId, ...payload } });
  let last: any = JSON.parse((await app.inject({ method: 'GET', url: `/api/combat/active/${characterId}` })).body);
  for (let i = 0; i < maxActions; i++) {
    const { player, enemy, availableSkills } = last;
    const dist = Math.abs(player.position.x - enemy.position.x) + Math.abs(player.position.y - enemy.position.y);
    const skill = availableSkills
      .filter((s: any) => s.targetType === 'SINGLE_ENEMY' && s.range >= dist && s.apCost <= player.ap && s.spiritualityCost <= player.spirituality)
      .sort((a: any, b: any) => b.apCost - a.apCost)[0];
    let res;
    if (skill && skill.id !== 'PLAYER_FOOL_9_SPIRIT_VISION') {
      res = await act({ actionType: 'SKILL', skillId: skill.id });
    } else if (dist > 1 && player.ap > 0) {
      const dx = Math.sign(enemy.position.x - player.position.x);
      const dy = dx === 0 ? Math.sign(enemy.position.y - player.position.y) : 0;
      res = await act({ actionType: 'MOVE', targetPosition: { x: player.position.x + dx, y: player.position.y + dy } });
    } else {
      res = await act({ actionType: 'END_TURN' });
    }
    if (res.statusCode === 422) {
      res = await act({ actionType: 'END_TURN' });
    }
    assert.strictEqual(res.statusCode, 200, res.body);
    last = JSON.parse(res.body);
    if (last.battleOver) return last;
  }
  throw new Error('El combate no terminó en el número de acciones previsto');
}

describe('Combate por la API (GridCombatEngine + Tier G)', () => {
  it('habilidades de la vía más el golpe básico', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const characterId = await awakenedFool(app);
      const skills = JSON.parse((await app.inject({ method: 'GET', url: `/api/combat/skills/${characterId}` })).body);
      const ids = skills.availableSkills.map((s: any) => s.id);
      assert.ok(ids.includes('PLAYER_FOOL_9_TAROT_DIVINATION'));
      assert.ok(ids.includes(CombatContent.balance().playerBasicAttack.id), 'siempre hay una acción ofensiva sin espiritualidad');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('combate completo: victoria con cosecha real y bolsa del balance', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const characterId = await awakenedFool(app);
      // vigor de sobra para que el recorrido sea una prueba de flujo, no de suerte
      db.updateCharacterSomatics(characterId, { health: 100 });
      const penceBefore = db.getCharacter(characterId)!.raw_pence;

      const started = await app.inject({ method: 'POST', url: '/api/combat/start', payload: { characterId } });
      assert.strictEqual(started.statusCode, 200);
      const battle = JSON.parse(started.body);
      assert.strictEqual(battle.enemy.hp, undefined, 'los PV del adversario no viajan');
      const site = CombatContent.site('CHERWOOD_ALLEY')!;
      const entry = site.pool.find(p => CombatContent.combatants().get(p.combatantId).name === battle.enemy.name);
      assert.ok(entry, 'el adversario sale de la tabla de encuentros');

      const end = await playUntilOver(app, characterId);
      assert.strictEqual(end.battleOver, true);
      if (end.victory && end.status === 'VICTORY') {
        const harvestDef = CombatContent.harvestFor(entry!.combatantId)!;
        assert.ok(end.outcome.harvest, 'la victoria anuncia la cosecha');
        assert.strictEqual(end.outcome.harvest.name, harvestDef.name);
        const inv = db.getInventoryItems(characterId).filter(i => i.item_code === harvestDef.itemCode);
        assert.strictEqual(inv.length, 1, 'la cosecha entra en el inventario');
        assert.strictEqual(JSON.parse(inv[0].metadata_json).grade, harvestDef.grade);
        const purse = CombatContent.balance().victoryPurse[entry!.tier]!;
        assert.strictEqual(end.outcome.pursePence, purse);
        assert.strictEqual(db.getCharacter(characterId)!.raw_pence, penceBefore + purse, 'la bolsa sale del balance');
      } else {
        // derrota: se despierta malherido, sin perder la partida
        const char = db.getCharacter(characterId)!;
        assert.strictEqual(char.current_health, CombatContent.balance().defeat.hpLeft);
      }
      assert.strictEqual(db.getActiveBattle(characterId), null, 'el combate queda cerrado');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('victoria: la cosecha entra en el inventario y la bolsa sale del balance (rama garantizada)', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const characterId = await awakenedFool(app);
      const started = JSON.parse((await app.inject({ method: 'POST', url: '/api/combat/start', payload: { characterId } })).body);
      // preparación de la prueba: el adversario, malherido y cuerpo a cuerpo
      const row = db.getActiveBattle(characterId)!;
      const state = JSON.parse(row.state_json);
      const enemy = state.actors.find((a: any) => state.sides.enemy.includes(a.id));
      const player = state.actors.find((a: any) => state.sides.player.includes(a.id));
      enemy.hp = 1;
      enemy.position = { x: player.position.x + 1, y: player.position.y };
      player.ap = player.maxAp;
      db.updateBattle(row.id, state, 'ONGOING');
      const penceBefore = db.getCharacter(characterId)!.raw_pence;

      const hit = await app.inject({ method: 'POST', url: '/api/combat/action', payload: { characterId, actionType: 'SKILL', skillId: CombatContent.balance().playerBasicAttack.id } });
      assert.strictEqual(hit.statusCode, 200, hit.body);
      const end = JSON.parse(hit.body);
      assert.strictEqual(end.battleOver, true);
      assert.strictEqual(end.status, 'VICTORY');
      const tier = CombatContent.site('CHERWOOD_ALLEY')!.pool.find(p => p.combatantId === enemy.id)!.tier;
      const harvestDef = CombatContent.harvestFor(enemy.id)!;
      assert.deepStrictEqual(end.outcome.harvest, { name: harvestDef.name, quality: 'PRISTINE' });
      const inv = db.getInventoryItems(characterId).filter(i => i.item_code === harvestDef.itemCode);
      assert.strictEqual(inv.length, 1, 'la cosecha entra en el inventario');
      assert.strictEqual(JSON.parse(inv[0].metadata_json).grade, harvestDef.grade);
      assert.strictEqual(db.getCharacter(characterId)!.raw_pence, penceBefore + CombatContent.balance().victoryPurse[tier]!);
      assert.strictEqual(started.enemy.name, enemy.name);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('las negativas de las reglas son 422 y no cambian nada', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const characterId = await awakenedFool(app);
      await app.inject({ method: 'POST', url: '/api/combat/start', payload: { characterId } });
      const before = db.getActiveBattle(characterId)!.state_json;
      const far = await app.inject({ method: 'POST', url: '/api/combat/action', payload: { characterId, actionType: 'MOVE', targetPosition: { x: 3, y: 2 } } });
      assert.strictEqual(far.statusCode, 422);
      const flee = await app.inject({ method: 'POST', url: '/api/combat/action', payload: { characterId, actionType: 'NEGOTIATE' } });
      assert.strictEqual(flee.statusCode, 422);
      assert.strictEqual(db.getActiveBattle(characterId)!.state_json, before, 'una negativa no altera el combate');
    } finally {
      db.close();
      await app.close();
    }
  });
});
