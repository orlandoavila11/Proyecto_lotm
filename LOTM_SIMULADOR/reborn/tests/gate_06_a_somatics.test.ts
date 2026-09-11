import { test } from 'node:test';
import * as assert from 'node:assert';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { SomaticsEngine } from '../src/core/somatics/SomaticsEngine.js';
import { ActingDilemmaEngine } from '../src/core/acting/ActingDilemmaEngine.js';
import { WhisperPrice } from '../src/core/types/somatics.js';

test('GATE 06.a: La Columna Vertebral Somática (Ruina, Anclas, Cicatrices y Precios [S])', async (t) => {
  const db = new DatabaseClient(':memory:');

  // Crear personaje base
  const char = db.createCharacter({
    id: 'char_somatic_01',
    name: 'Edward Sterling',
    pathway: 'FOOL',
    sequence: 9,
    current_health: 100,
    max_health: 100,
    current_spirituality: 100,
    max_spirituality: 100,
    sanity: 100,
    corruption: 0,
    digestion_progress: 25.0,
    raw_pence: 7200,
    current_location: 'Backlund - Cherwood',
    current_day: 1,
    ruina: 0,
    terminal_state: null
  });

  const somaticsBalance = SomaticsEngine.getSomaticsBalance();

  await t.test('1. Test del Suelo de Ruina: Monotonía estricta y Tiers de Ruina', () => {
    // Ruina inicial es 0 (Íntegro)
    let eval0 = SomaticsEngine.evaluate({
      currentHealth: 100,
      maxHealth: 100,
      currentSpirituality: 100,
      maxSpirituality: 100,
      sanity: 100,
      corruption: 0,
      ruina: 0,
      digestionProgress: 25,
      anchorStrength: 50
    });
    assert.strictEqual(eval0.ruina, 0);
    assert.strictEqual(eval0.ruinaTier, 'INTEGRO');
    assert.strictEqual(eval0.ruinaDescriptor, 'Íntegro');
    assert.strictEqual(eval0.convergenceBonus, 0);

    // Sumar ruina por fuentes
    SomaticsEngine.addRuina(db, char.id, 'rampage'); // +15
    let updatedChar = db.getCharacter(char.id)!;
    assert.strictEqual(updatedChar.ruina, 15);

    let eval1 = SomaticsEngine.evaluate({
      currentHealth: 100,
      maxHealth: 100,
      currentSpirituality: 100,
      maxSpirituality: 100,
      sanity: 100,
      corruption: 0,
      ruina: updatedChar.ruina,
      digestionProgress: 25,
      anchorStrength: 50
    });
    assert.strictEqual(eval1.ruinaTier, 'MARCADO');
    assert.strictEqual(eval1.ruinaDescriptor, 'Marcado');
    assert.strictEqual(eval1.convergenceBonus, 5);

    // Intentar reducir ruina con delta negativo -> jamás baja (regla del suelo)
    db.updateCharacterRuina(char.id, -10);
    updatedChar = db.getCharacter(char.id)!;
    assert.strictEqual(updatedChar.ruina, 15, 'La ruina jamás debe descender ante deltas negativos');

    // Curar sanidad y limpiar corrupción no disminuye ruina
    const stateWithCorr = SomaticsEngine.applyCorruptionDelta({
      currentHealth: 100,
      maxHealth: 100,
      currentSpirituality: 100,
      maxSpirituality: 100,
      sanity: 40,
      corruption: 45,
      ruina: 15,
      digestionProgress: 25,
      anchorStrength: 50
    }, -20);
    assert.strictEqual(stateWithCorr.corruption, 25);
    assert.strictEqual(stateWithCorr.ruina, 15, 'La curación somática no reduce la ruina');
  });

  await t.test('2. Anclas: Creación de las 6 anclas canónicas (tipología estricta) y tope 8', () => {
    // Inicializar anclas
    SomaticsEngine.initializeCharacterAnchors(db, char.id);
    const anchors = db.getAnchors(char.id);
    assert.strictEqual(anchors.length, 6, 'Debe inicializar exactamente 6 anclas');

    // Verificar tipología
    const types = anchors.map(a => a.type);
    assert.strictEqual(types.filter(t => t === 'PERSON').length, 2, '2 personas');
    assert.strictEqual(types.filter(t => t === 'LOCATION').length, 1, '1 lugar');
    assert.strictEqual(types.filter(t => t === 'ROLE').length, 1, '1 rol');
    assert.strictEqual(types.filter(t => t === 'CONVICTION').length, 1, '1 convicción');
    assert.strictEqual(types.filter(t => t === 'ROUTINE').length, 1, '1 rutina');

    // Añadir hasta el tope de 8
    const added1 = SomaticsEngine.formNewAnchor(db, char.id, {
      type: 'PERSON',
      name: 'Wendy Miller (Confidente)',
      description: 'Lazo forjado tras semanas de confidencias',
      strength: 40
    });
    assert.strictEqual(added1, true);

    const added2 = SomaticsEngine.formNewAnchor(db, char.id, {
      type: 'LOCATION',
      name: 'Cafetería de San Dionisio',
      description: 'Un rincón tranquilo para pensar',
      strength: 30
    });
    assert.strictEqual(added2, true);

    assert.strictEqual(db.getAnchors(char.id).length, 8, 'Debe tener 8 anclas');

    // Intentar añadir la 9na ancla -> debe ser rechazada (tope 8)
    const added3 = SomaticsEngine.formNewAnchor(db, char.id, {
      type: 'PERSON',
      name: 'Novena Ancla Ilegal',
      description: 'Supera el tope de 8 anclas',
      strength: 30
    });
    assert.strictEqual(added3, false, 'No puede exceder el tope de 8 anclas');
    assert.strictEqual(db.getAnchors(char.id).length, 8);
  });

  await t.test('3. Daño Determinista, Destrucción de Anclas y Gatillo de Cicatrices', () => {
    // Daño determinista selecciona la de mayor fuerza (Convicción fuerza 50)
    const res1 = SomaticsEngine.damageDeterministicAnchor(db, char.id, 20);
    assert.ok(res1.damagedAnchor);
    assert.strictEqual(res1.damagedAnchor.name, 'El inocente no pagará con sangre lo que el culpable ocultó');
    assert.strictEqual(res1.damagedAnchor.strength, 30);
    assert.strictEqual(res1.damagedAnchor.damage_count, 1);
    assert.strictEqual(res1.destroyed, false);
    assert.strictEqual(res1.scarCreated, null, 'No genera cicatriz en el primer daño');

    // Segundo daño a la misma ancla (ahora tiene fuerza 30, pero sigue siendo alta o compite)
    // Forzamos segundo daño en la misma ancla
    const res2 = db.damageAnchor(res1.damagedAnchor.id, 30);
    assert.strictEqual(res2.anchor.strength, 0);
    assert.strictEqual(res2.anchor.damage_count, 2);
    assert.strictEqual(res2.destroyed, true);

    // Gatillo de cicatriz: daño >= 2
    const scar = SomaticsEngine.checkForScarTrigger(db, char.id, res2.anchor);
    assert.ok(scar, 'Debe generar cicatriz al ser dañada >= 2 veces');
    assert.strictEqual(scar.originAnchorId, res2.anchor.id);

    // Verificar que las cicatrices se listan
    const scars = db.getScars(char.id);
    assert.ok(scars.length >= 1);
    assert.strictEqual(scars[0].scarCode, scar.scarCode);

    // Si la ancla fue destruida, otorga +10 de ruina
    SomaticsEngine.addRuina(db, char.id, 'anchor_destroyed');
    const updatedChar = db.getCharacter(char.id)!;
    assert.ok(updatedChar.ruina >= 25);
  });

  await t.test('4. Regeneración de Anclas por Interacción Semanal', () => {
    // Seleccionar ancla activa con daño
    const active = db.getActiveAnchors(char.id);
    const target = active[0];
    const initialStrength = target.strength;

    const repaired = SomaticsEngine.repairAnchorWeekly(db, char.id, target.id);
    assert.strictEqual(repaired.strength, Math.min(100, initialStrength + somaticsBalance.anchors.weekly_recovery_rate));
  });

  await t.test('5. Precios [S] de Susurros: Informados en Payload, Cobrados y Ventaja Otorgada', () => {
    // Simular dilema con opción de susurro
    const price: WhisperPrice = {
      type: 'CORRUPTION',
      amount: 4,
      description: 'La mácula astral se profundiza (+4 corrupción, +3 ruina)'
    };

    const initialRuina = db.getCharacter(char.id)!.ruina;
    const initialCorr = db.getCharacter(char.id)!.corruption;

    SomaticsEngine.payWhisperPrice(
      db,
      char.id,
      price,
      'DIL_FOOL_9_1',
      'CHOICE_FOOL_9_WHISPER_FOG',
      'Devoción absoluta y tributo'
    );

    const postChar = db.getCharacter(char.id)!;
    assert.strictEqual(postChar.corruption, initialCorr + 4, 'La corrupción debe aumentar en +4');
    assert.strictEqual(postChar.ruina, initialRuina + 3, 'La ruina debe aumentar en +3');

    // Verificar auditoría de compra de susurro
    const purchases = db.getWhisperPurchases(char.id);
    assert.strictEqual(purchases.length, 1);
    assert.strictEqual(purchases[0].dilemmaId, 'DIL_FOOL_9_1');
    assert.strictEqual(purchases[0].choiceId, 'CHOICE_FOOL_9_WHISPER_FOG');
    assert.strictEqual(purchases[0].pricePaid.type, 'CORRUPTION');
  });

  await t.test('6. Umbral 60 de Corrupción: Flags Somáticos y Diagnóstico', () => {
    const evalBelow60 = SomaticsEngine.evaluate({
      currentHealth: 100,
      maxHealth: 100,
      currentSpirituality: 100,
      maxSpirituality: 100,
      sanity: 80,
      corruption: 55,
      ruina: 20,
      digestionProgress: 50,
      anchorStrength: 40
    });
    assert.strictEqual(evalBelow60.corruptionTier, 'ASTRAL_STRAIN');
    assert.strictEqual(evalBelow60.somaticFlags.includes('MUTATING_SIGNS'), false);

    const evalAbove60 = SomaticsEngine.evaluate({
      currentHealth: 100,
      maxHealth: 100,
      currentSpirituality: 100,
      maxSpirituality: 100,
      sanity: 80,
      corruption: 65,
      ruina: 20,
      digestionProgress: 50,
      anchorStrength: 40
    });
    assert.strictEqual(evalAbove60.corruptionTier, 'MUTATING');
    assert.ok(evalAbove60.somaticFlags.includes('MUTATING_SIGNS'), 'Debe emitir MUTATING_SIGNS en umbral 60+');
    assert.ok(evalAbove60.somaticFlags.includes('ALTERED_SENSORY_PERCEPTION'), 'Debe emitir ALTERED_SENSORY_PERCEPTION en umbral 60+');
  });
});
