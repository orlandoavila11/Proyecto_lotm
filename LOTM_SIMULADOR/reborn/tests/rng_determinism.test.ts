import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';
import { GridCombatEngine } from '../src/core/combat/GridCombatEngine.js';
import { CombatContent } from '../src/core/combat/CombatContent.js';

describe('PRNG Determinista: Semilla y Reproducibilidad Estricta', () => {
  it('dos instancias con la misma semilla numérica generan exactamente la misma secuencia de números', () => {
    const seed = 987654321;
    const rngA = new SeededRNG(seed);
    const rngB = new SeededRNG(seed);

    for (let i = 0; i < 100; i++) {
      const valA = rngA.next();
      const valB = rngB.next();
      assert.strictEqual(valA, valB, `Fallo en iteración ${i}: valA (${valA}) !== valB (${valB})`);

      const intA = rngA.nextInt(-50, 150);
      const intB = rngB.nextInt(-50, 150);
      assert.strictEqual(intA, intB, `Fallo en entero ${i}: intA (${intA}) !== intB (${intB})`);

      const chanceA = rngA.checkChance(33.5);
      const chanceB = rngB.checkChance(33.5);
      assert.strictEqual(chanceA, chanceB, `Fallo en probabilidad ${i}`);
    }
  });

  it('dos instancias con la misma semilla alfanumérica generan la misma secuencia', () => {
    const seed = 'klein-moretti-tarot-club-fool';
    const rngA = new SeededRNG(seed);
    const rngB = new SeededRNG(seed);

    const seqA = Array.from({ length: 50 }, () => rngA.next());
    const seqB = Array.from({ length: 50 }, () => rngB.next());

    assert.deepStrictEqual(seqA, seqB, 'Las secuencias deben ser idénticas');
  });

  it('semillas distintas producen secuencias divergentes', () => {
    const rngA = new SeededRNG('seed-alpha');
    const rngB = new SeededRNG('seed-beta');

    let differences = 0;
    for (let i = 0; i < 20; i++) {
      if (rngA.next() !== rngB.next()) differences++;
    }

    assert.strictEqual(differences > 15, true, 'Semillas distintas deben producir resultados divergentes');
  });

  it('Determinismo en combate: el mismo encuentro produce exactamente el mismo registro de turnos', () => {
    const engine = GridCombatEngine.getInstance();
    const catalog = CombatContent.combatants();
    const simulate = (battleId: string) => {
      const def = catalog.get('dusk_specter');
      const battle = engine.createBattle(
        battleId,
        { id: 'char_test_seer', name: 'Vidente', pathway: 'FOOL', sequence: 9, hp: 100, maxHp: 100, spirituality: 100, maxSpirituality: 100 },
        { id: def.id, name: def.name, hp: def.atomStats.hp, maxHp: def.atomStats.maxHp, spirituality: def.atomStats.spirituality, maxSpirituality: def.atomStats.maxSpirituality, speed: def.atomStats.speed, abilities: def.abilities }
      );
      for (let turn = 0; turn < 30 && battle.status === 'ONGOING'; turn++) {
        const player = engine.getPlayer(battle);
        const enemy = engine.getPrimaryEnemy(battle);
        if (engine.getDistance(player.position, enemy.position) > 1) {
          engine.executePlayerAction(battle, { type: 'MOVE', targetPosition: { x: player.position.x + 1, y: player.position.y } });
        }
        engine.executePlayerAction(battle, { type: 'SKILL', skillId: 'PLAYER_BASIC_STRIKE' });
        if (battle.status === 'ONGOING') engine.executeEnemyTurn(battle);
      }
      return battle;
    };

    const a = simulate('battle_backlund_night_10492');
    const b = simulate('battle_backlund_night_10492');
    assert.strictEqual(a.status, b.status, 'El desenlace debe ser idéntico');
    assert.strictEqual(JSON.stringify(a.turnLog), JSON.stringify(b.turnLog), 'El registro de turnos debe ser byte-equivalente');
    assert.ok(a.turnLog.length > 3, 'El combate debe haber durado varios turnos');
  });
});

