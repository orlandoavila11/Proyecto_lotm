import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';
import { TacticalCombatEngine, CombatActor } from '../src/core/combat/TacticalCombatEngine.js';

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

  it('Determinismo en combate: misma semilla produce exactamente el mismo resultado y turnLog byte-equivalente', () => {
    const makePlayer = (): CombatActor => ({
      id: 'char_test_hunter',
      name: 'Danitz',
      isPlayer: true,
      pathway: 'RED_PRIEST',
      sequence: 9,
      currentHp: 80,
      maxHp: 80,
      currentSpirituality: 60,
      maxSpirituality: 60
    });

    const makeEnemy = (): CombatActor => ({
      id: 'enemy_wraith',
      name: 'Espectro de las Alcantarillas',
      isPlayer: false,
      sequence: 9,
      currentHp: 75,
      maxHp: 75,
      currentSpirituality: 30,
      maxSpirituality: 30
    });

    const battleSeed = 'battle_backlund_night_10492';

    // Ejecución 1
    const sim1 = TacticalCombatEngine.simulateDeterministicCombat(
      makePlayer(),
      makeEnemy(),
      battleSeed
    );

    // Ejecución 2 (con misma semilla)
    const sim2 = TacticalCombatEngine.simulateDeterministicCombat(
      makePlayer(),
      makeEnemy(),
      battleSeed
    );

    // Verificación de determinismo estricto
    assert.strictEqual(sim1.victory, sim2.victory, 'La victoria/derrota debe ser idéntica');
    assert.strictEqual(sim1.turnsCount, sim2.turnsCount, 'El número de turnos debe ser idéntico');
    assert.strictEqual(sim1.playerFinalHp, sim2.playerFinalHp, 'La salud final del jugador debe ser idéntica');
    assert.strictEqual(sim1.enemyFinalHp, sim2.enemyFinalHp, 'La salud final del enemigo debe ser idéntica');

    // Verificación byte-equivalente de toda la traza de combate
    const json1 = JSON.stringify(sim1.turnLog);
    const json2 = JSON.stringify(sim2.turnLog);
    assert.strictEqual(json1, json2, 'El log de turnos completo debe ser byte-equivalente');

    // Verificación contra semilla distinta (debe divergir)
    const simDivergent = TacticalCombatEngine.simulateDeterministicCombat(
      makePlayer(),
      makeEnemy(),
      'battle_divergent_seed_99999'
    );
    const jsonDivergent = JSON.stringify(simDivergent.turnLog);
    assert.notStrictEqual(json1, jsonDivergent, 'Semillas distintas deben producir simulaciones divergentes');
  });
});
