import { test } from 'node:test';
import * as assert from 'node:assert';
import { SomaticsEngine } from '../src/core/somatics/SomaticsEngine.js';
import { SomaticsState } from '../src/core/types/somatics.js';
import { ActingDilemmaEngine } from '../src/core/acting/ActingDilemmaEngine.js';

test('SomaticsEngine: Cálculo determinista y umbrales de sanidad/corrupción', () => {
  const initial: SomaticsState = {
    currentHealth: 100,
    maxHealth: 100,
    currentSpirituality: 100,
    maxSpirituality: 100,
    sanity: 100,
    corruption: 0,
    digestionProgress: 0,
    anchorStrength: 50
  };

  // 1. Evaluación inicial
  const eval1 = SomaticsEngine.evaluate(initial);
  assert.strictEqual(eval1.sanityTier, 'LUCID');
  assert.strictEqual(eval1.corruptionTier, 'PRISTINE');
  assert.strictEqual(eval1.isRampaging, false);
  assert.strictEqual(eval1.canSafelyConsumePotion, false, 'No debe consumir poción con digestión 0%');

  // 2. Pérdida de sanidad mitigada por anclas (ancla 50 > 30)
  const afterDamage = SomaticsEngine.applySanityDelta(initial, -20);
  assert.ok(afterDamage.sanity > 80, 'Las anclas deben mitigar el daño mental');
  assert.strictEqual(afterDamage.sanity, 82);

  // 3. Ganancia de digestión
  const digested = SomaticsEngine.applyDigestionGain(afterDamage, 100.0);
  assert.strictEqual(digested.digestionProgress, 100.0);

  // 4. Con digestión 100% y sanidad lúcida, puede ascender con seguridad
  const eval2 = SomaticsEngine.evaluate(digested);
  assert.strictEqual(eval2.canSafelyConsumePotion, true);
  assert.strictEqual(eval2.blockers.length, 0);
});

test('ActingDilemmaEngine: Dilemas y principios para vías clave (Fool, Hunter, Spectator)', () => {
  // 1. Vía Cazador (Hunter S9)
  const hunterDil = ActingDilemmaEngine.getDilemma('RED_PRIEST', 9);
  assert.strictEqual(hunterDil.pathway, 'RED_PRIEST');
  assert.strictEqual(hunterDil.sequenceName, 'Hunter');
  assert.ok(hunterDil.choices.length >= 2);

  const alignedChoice = hunterDil.choices.find(c => c.isAlignedWithPrinciple);
  assert.ok(alignedChoice);
  assert.ok(alignedChoice.digestionGain >= 15.0);

  // 2. Vía Vidente (Fool S9)
  const foolDil = ActingDilemmaEngine.getDilemma('FOOL', 9);
  assert.strictEqual(foolDil.pathway, 'FOOL');
  assert.strictEqual(foolDil.sequenceName, 'Seer');

  // 3. Fallback estructurado para vías secundarias
  const paragonDil = ActingDilemmaEngine.getDilemma('PARAGON', 9);
  assert.strictEqual(paragonDil.pathway, 'PARAGON');
  assert.ok(paragonDil.principleText.length > 0);
});

