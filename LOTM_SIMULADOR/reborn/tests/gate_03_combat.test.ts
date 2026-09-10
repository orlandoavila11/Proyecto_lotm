import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { GridCombatEngine, HarvestQuality } from '../src/core/combat/GridCombatEngine.js';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';

describe('GATE 03: Motor Táctico 5x7, Simetría, Recolección y Bots ε-greedy', () => {
  const engine = GridCombatEngine.getInstance();

  it('1. Iniciativa Neutral: preparation_score serializado y restaurable', () => {
    // Escenario A: Jugador oculto y con ventaja táctica
    const battleA = engine.createBattle(
      'battle_prep_high',
      {
        id: 'player_prep_a',
        name: 'Vidente Oculto',
        pathway: 'FOOL',
        sequence: 9,
        hp: 100,
        maxHp: 100,
        spirituality: 100,
        maxSpirituality: 100,
        isConcealed: true,
        noRecentPowerUse: true,
        ambushDeclared: true
      },
      {
        id: 'spinal_octopus',
        name: 'Spinal Octopus',
        hp: 45,
        maxHp: 45,
        speed: 8
      },
      'NEUTRAL'
    );

    // 15 base + 35 concealed + 20 noRecent + 40 ambush = 110 vs speed 8 * 5 = 40
    assert.strictEqual(battleA.preparation_score, 110);
    assert.strictEqual(battleA.alertness_score, 40);
    assert.strictEqual(battleA.initiativeWinner, 'PLAYER');

    // Escenario B: Jugador desprevenido ante enemigo rápido
    const battleB = engine.createBattle(
      'battle_prep_low',
      {
        id: 'player_prep_b',
        name: 'Vidente Desprevenido',
        pathway: 'FOOL',
        sequence: 9,
        hp: 100,
        maxHp: 100,
        spirituality: 100,
        maxSpirituality: 100,
        isConcealed: false,
        noRecentPowerUse: false,
        ambushDeclared: false
      },
      {
        id: 'fog_wolf',
        name: 'Fog Wolf',
        hp: 180,
        maxHp: 180,
        speed: 14
      },
      'NEUTRAL'
    );

    // 15 base vs speed 14 * 5 = 70
    assert.strictEqual(battleB.preparation_score, 15);
    assert.strictEqual(battleB.alertness_score, 70);
    assert.strictEqual(battleB.initiativeWinner, 'ENEMY');
  });

  it('2. Simetría de Revelación y Opacidad: Mitigación táctica por Escudriñar', () => {
    const battle = engine.createBattle(
      'battle_symmetry',
      {
        id: 'player_sym',
        name: 'Espectador',
        pathway: 'VISIONARY',
        sequence: 9,
        hp: 100,
        maxHp: 100,
        spirituality: 100,
        maxSpirituality: 100
      },
      {
        id: 'mind_dragon_whelp',
        name: 'Mind Dragon Whelp',
        hp: 60,
        maxHp: 60,
        speed: 10
      }
    );

    // Inicialmente ambos bandos son mutuamente opacos
    assert.strictEqual(battle.player.revealedAbilities.length, 0);
    assert.strictEqual(battle.enemy.revealedAbilities.length, 0);

    // Jugador escudriña al dragón
    const scrutRes = engine.executePlayerAction(battle, { type: 'SCRUTINIZE' });
    assert.strictEqual(scrutRes.success, true);
    assert.ok(battle.player.revealedAbilities.length >= 1, 'Habilidad enemiga debe haber sido revelada');

    // Cubrir todo el repertorio conocido mediante observación profunda
    battle.player.revealedAbilities = battle.enemy.allAbilities.map(a => a.id);

    // Simular turno enemigo ejecutando una habilidad contra el jugador con atención disponible
    battle.player.attention = 1;
    const rng = new SeededRNG(42);
    const enemyRes = engine.executeEnemyTurn(battle, rng);

    // Debe haberse anticipado la habilidad mitigando un 35% de daño
    assert.ok(enemyRes.message.includes('Anticipado por Escudriñar'), 'El mensaje debe confirmar la mitigación simétrica');
  });

  it('3. Acción NEGOTIATE: Condición visible de rendición vs rechazo en Frenesí', () => {
    // Caso 1: Enemigo en Frenesí -> Negociación rechazada
    const battleFrenzy = engine.createBattle(
      'battle_neg_frenzy',
      { id: 'p1', name: 'Player', pathway: 'FOOL', sequence: 9, hp: 100, maxHp: 100, spirituality: 100, maxSpirituality: 100 },
      { id: 'chained_ghoul', name: 'Chained Ghoul', hp: 80, maxHp: 80 }
    );
    battleFrenzy.enemy.statuses.push({ status: 'FRENZY', durationTurns: 2 });

    const negFrenzyRes = engine.executePlayerAction(battleFrenzy, { type: 'NEGOTIATE' });
    assert.strictEqual(negFrenzyRes.success, false);
    assert.ok(negFrenzyRes.message.includes('frenesí homicida'), 'Debe rechazar con feedback de frenesí');

    // Caso 2: Enemigo debilitado (WEAKENED) -> Negociación exitosa
    const battleWeak = engine.createBattle(
      'battle_neg_weak',
      { id: 'p2', name: 'Player', pathway: 'VISIONARY', sequence: 9, hp: 100, maxHp: 100, spirituality: 100, maxSpirituality: 100 },
      { id: 'shadow_enforcer', name: 'Shadow Enforcer', hp: 80, maxHp: 80 }
    );
    battleWeak.enemy.statuses.push({ status: 'WEAKENED', durationTurns: 2 });

    const negWeakRes = engine.executePlayerAction(battleWeak, { type: 'NEGOTIATE' });
    assert.strictEqual(negWeakRes.success, true);
    assert.strictEqual(negWeakRes.isBattleOver, true);
    assert.strictEqual(negWeakRes.status, 'NEGOTIATED');
  });

  it('4. Recolección Precisa (Harvesting): Tres calidades gobernadas por causa de muerte', () => {
    // Caso A: PRISTINE (muerte física limpia)
    const enemyPristine: any = {
      statuses: [],
      lastDamageSource: { type: 'PHYSICAL', amount: 25 }
    };
    assert.strictEqual(engine.determineHarvestQuality(enemyPristine), 'PRISTINE');

    // Caso B: DAMAGED (muerte elemental o por veneno)
    const enemyDamaged: any = {
      statuses: [],
      lastDamageSource: { type: 'ELEMENTAL', amount: 30 }
    };
    assert.strictEqual(engine.determineHarvestQuality(enemyDamaged), 'DAMAGED');

    const enemyPoison: any = {
      statuses: [],
      lastDamageSource: { type: 'POISON', amount: 15 }
    };
    assert.strictEqual(engine.determineHarvestQuality(enemyPoison), 'DAMAGED');

    // Caso C: CONTAMINADO (muerte en estado FRENZY o corrupción)
    const enemyCorrupt: any = {
      statuses: [{ status: 'FRENZY', durationTurns: 1 }],
      lastDamageSource: { type: 'PHYSICAL', amount: 20 }
    };
    assert.strictEqual(engine.determineHarvestQuality(enemyCorrupt), 'CONTAMINADO');
  });

  it('5. 200 Simulaciones de Bots ε-greedy: Ratio de Victoria [40%, 80%] y Delta de Escudriñar', () => {
    const TOTAL_RUNS = 200;
    const rng = new SeededRNG('LOTM_GATE_03_SEED_2026');

    // Muestra representativa de encuentros de los pools jugables LOTM y GOD_ALMIGHTY + criaturas con Frenesí
    const encounterPool = [
      // LOTM
      { id: 'spinal_octopus', name: 'Spinal Octopus', hp: 45, maxHp: 45, speed: 8, pool: 'LOTM' },
      { id: 'faceless_hound', name: 'Faceless Hound', hp: 65, maxHp: 65, speed: 10, pool: 'LOTM' },
      { id: 'spirit_paper_wraith', name: 'Spirit Paper Wraith', hp: 50, maxHp: 50, speed: 9, pool: 'LOTM' },
      { id: 'fog_wolf', name: 'Fog Wolf', hp: 85, maxHp: 85, speed: 11, pool: 'LOTM' },
      // GOD_ALMIGHTY
      { id: 'dusk_specter', name: 'Dusk Specter', hp: 48, maxHp: 48, speed: 9, pool: 'GOD_ALMIGHTY' },
      { id: 'mind_dragon_whelp', name: 'Mind Dragon Whelp', hp: 70, maxHp: 70, speed: 10, pool: 'GOD_ALMIGHTY' },
      { id: 'pure_sun_hound', name: 'Pure Sun Hound', hp: 60, maxHp: 60, speed: 11, pool: 'GOD_ALMIGHTY' },
      { id: 'logic_gargoyle', name: 'Logic Gargoyle', hp: 80, maxHp: 80, speed: 6, pool: 'GOD_ALMIGHTY' },
      // CLUSTER ENCOUNTERS (Criaturas de Fuego / Corrupción en Frenesí)
      { id: 'flame_devourer', name: 'Flame Devourer', hp: 70, maxHp: 70, speed: 10, pool: 'LOTM' },
      { id: 'chained_ghoul', name: 'Chained Ghoul', hp: 75, maxHp: 75, speed: 8, pool: 'GOD_ALMIGHTY' }
    ];

    let wins = 0;
    let losses = 0;
    const poolStats: Record<string, { wins: number; total: number }> = {
      LOTM: { wins: 0, total: 0 },
      GOD_ALMIGHTY: { wins: 0, total: 0 }
    };

    const harvestStats: Record<HarvestQuality, number> = {
      PRISTINE: 0,
      DAMAGED: 0,
      CONTAMINADO: 0
    };

    // Estadísticas para Delta de Escudriñar
    let damageTakenWithScrutiny = 0;
    let battlesWithScrutiny = 0;
    let damageTakenBlind = 0;
    let battlesBlind = 0;

    // Amuleto elemental purificador como recurso de combate disponible (canon Klein Vol. 1)
    const elementalCharm = {
      id: 'ITEM_SOLAR_CHARM',
      name: 'Amuleto del Sol Purificador',
      description: 'Descarga un rayo solar elemental contra el blanco.',
      apCost: 2,
      spiritualityCost: 15,
      attentionCost: 0,
      range: 5,
      targetType: 'SINGLE_ENEMY' as const,
      atoms: [{ atomId: 'ATOM_DAMAGE_ELEMENTAL' as const, params: { baseDamage: 18, element: 'holy' } }]
    };

    for (let i = 0; i < TOTAL_RUNS; i++) {
      const monsterTemplate = encounterPool[i % encounterPool.length];
      const isFool = i % 2 === 0;
      const pathway = isFool ? 'FOOL' : 'VISIONARY';

      const battle = engine.createBattle(
        `sim_${i}`,
        {
          id: `bot_${i}`,
          name: `Bot Beyonder ${i}`,
          pathway,
          sequence: 9,
          hp: 70,
          maxHp: 70,
          spirituality: 60,
          maxSpirituality: 60
        },
        {
          id: monsterTemplate.id,
          name: monsterTemplate.name,
          hp: monsterTemplate.hp,
          maxHp: monsterTemplate.maxHp,
          speed: monsterTemplate.speed
        }
      );

      // Equipar amuleto místico como herramienta táctica del bot
      battle.player.allAbilities.push(elementalCharm);
      poolStats[monsterTemplate.pool].total++;

      // Política ε-greedy (50% con escudriñamiento sistemático, 20% exploración de habilidades)
      const useScrutinizeStrategy = (i % 2 === 0);
      let scrutinizedInBattle = false;
      let damageTakenInThisBattle = 0;

      let round = 1;
      const MAX_ROUNDS = 25;

      while (round <= MAX_ROUNDS && battle.status === 'ONGOING') {
        // Turno del Jugador (Bot)
        if (useScrutinizeStrategy && !scrutinizedInBattle && battle.player.ap >= 1) {
          engine.executePlayerAction(battle, { type: 'SCRUTINIZE' }, rng);
          scrutinizedInBattle = true;
        }

        // Seleccionar mejor habilidad asequible
        const available = battle.player.allAbilities.filter(
          a => a.apCost <= battle.player.ap && a.spiritualityCost <= battle.player.spirituality
        );

        if (available.length > 0) {
          // Explotación: mayor daño; Exploración (20%): habilidad estocástica
          let chosen = available.reduce((prev, curr) => (curr.atoms[0]?.params?.baseDamage || 0) > (prev.atoms[0]?.params?.baseDamage || 0) ? curr : prev);
          if (rng.checkChance(20)) {
            chosen = available[rng.nextInt(0, available.length - 1)];
          }

          engine.executePlayerAction(battle, { type: 'SKILL', skillId: chosen.id }, rng);
        } else {
          // Ataque básico si no hay maná
          engine.executePlayerAction(battle, { type: 'MOVE' }, rng);
        }

        if (battle.status !== 'ONGOING') break;

        // Turno del Enemigo
        const enemyRes = engine.executeEnemyTurn(battle, rng);
        damageTakenInThisBattle += enemyRes.damageDealt;

        round++;
      }

      if (battle.status === 'VICTORY') {
        wins++;
        poolStats[monsterTemplate.pool].wins++;
        const quality = battle.enemy.harvestQuality || 'PRISTINE';
        harvestStats[quality]++;
      } else {
        losses++;
      }

      if (useScrutinizeStrategy) {
        damageTakenWithScrutiny += damageTakenInThisBattle;
        battlesWithScrutiny++;
      } else {
        damageTakenBlind += damageTakenInThisBattle;
        battlesBlind++;
      }
    }

    const winRate = (wins / TOTAL_RUNS) * 100;
    const avgDmgWithScrutiny = damageTakenWithScrutiny / battlesWithScrutiny;
    const avgDmgBlind = damageTakenBlind / battlesBlind;
    const scrutinyDamageReductionDelta = ((avgDmgBlind - avgDmgWithScrutiny) / avgDmgBlind) * 100;

    console.log('\n=== [RESULTADOS SIMULACIÓN COMBATE 200 BOTS ε-GREEDY] ===');
    console.log(`Total Encuentros: ${TOTAL_RUNS}`);
    console.log(`Victorias: ${wins} | Derrotas: ${losses}`);
    console.log(`Tasa de Victoria Global: ${winRate.toFixed(1)}% (Objetivo: 40% - 80%)`);
    console.log(`- Pool LOTM: ${poolStats.LOTM.wins}/${poolStats.LOTM.total} (${((poolStats.LOTM.wins/poolStats.LOTM.total)*100).toFixed(1)}%)`);
    console.log(`- Pool GOD_ALMIGHTY: ${poolStats.GOD_ALMIGHTY.wins}/${poolStats.GOD_ALMIGHTY.total} (${((poolStats.GOD_ALMIGHTY.wins/poolStats.GOD_ALMIGHTY.total)*100).toFixed(1)}%)`);
    console.log('\nDistribución de Cosecha de Ingredientes (Wins):');
    console.log(`- PRISTINE: ${harvestStats.PRISTINE} (${((harvestStats.PRISTINE/wins)*100).toFixed(1)}%)`);
    console.log(`- DAMAGED: ${harvestStats.DAMAGED} (${((harvestStats.DAMAGED/wins)*100).toFixed(1)}%)`);
    console.log(`- CONTAMINADO: ${harvestStats.CONTAMINADO} (${((harvestStats.CONTAMINADO/wins)*100).toFixed(1)}%)`);
    console.log('\nDelta de Escudriñar:');
    console.log(`- Daño promedio recibido a ciegas: ${avgDmgBlind.toFixed(1)}`);
    console.log(`- Daño promedio con Escudriñar: ${avgDmgWithScrutiny.toFixed(1)}`);
    console.log(`- Reducción de daño por Escudriñamiento: +${scrutinyDamageReductionDelta.toFixed(1)}%`);
    console.log('=========================================================\n');

    // Aserciones estrictas del Gate 03
    assert.ok(winRate >= 40 && winRate <= 80, `Tasa de victoria ${winRate.toFixed(1)}% debe estar entre 40% y 80%`);
    assert.ok(scrutinyDamageReductionDelta > 0, `Escudriñar debe reducir el daño recibido en promedio (Delta: ${scrutinyDamageReductionDelta.toFixed(1)}%)`);
    assert.ok(harvestStats.PRISTINE > 0, 'Debe haber cosechas PRISTINE');
    assert.ok(harvestStats.DAMAGED > 0, 'Debe haber cosechas DAMAGED');
    assert.ok(harvestStats.CONTAMINADO > 0, 'Debe haber cosechas CONTAMINADO');
  });
});
