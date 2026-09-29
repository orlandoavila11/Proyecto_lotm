import { test } from 'node:test';
import * as assert from 'node:assert';
import { CanonicalDataLoader } from '../src/infra/data/CanonicalDataLoader.js';

test('CanonicalDataLoader: Carga exacta y validación de las 22 vías canónicas', () => {
  const loader = CanonicalDataLoader.getInstance();
  const all = loader.getAllPathways();

  assert.strictEqual(all.length, 22, 'Deben existir exactamente 22 vías canónicas cargadas');

  // 1. Probar Vía del Loco (FOOL / SEER)
  const fool = loader.getPathway('FOOL');
  assert.strictEqual(fool.id, 'FOOL');
  const seer = loader.getSequenceData('SEER', 9);
  assert.strictEqual(seer.name, 'Seer');
  assert.ok(seer.abilities.length > 0, 'Seer debe tener habilidades registradas');
  assert.ok(seer.formula.mainIngredients.length > 0, 'Seer debe tener ingredientes de fórmula');

  // 2. Probar Vía del Cazador (RED_PRIEST / HUNTER)
  const hunterPathway = loader.getPathway('HUNTER');
  assert.strictEqual(hunterPathway.id, 'RED_PRIEST');
  const hunterS9 = loader.getSequenceData('HUNTER', 9);
  assert.strictEqual(hunterS9.name, 'Hunter');
  const provoker = loader.getSequenceData('RED_PRIEST', 8);
  assert.strictEqual(provoker.name, 'Provoker');
  const pyromaniac = loader.getSequenceData('RED_PRIEST', 7);
  assert.ok(pyromaniac.name === 'Pyromaniac' || pyromaniac.name === 'Pyromancer');

  // 3. Probar Vía del Espectador (VISIONARY / SPECTATOR)
  const spectator = loader.getSequenceData('SPECTATOR', 9);
  assert.strictEqual(spectator.name, 'Spectator');

  // 4. Probar que todas las vías tienen Secuencias 9, 8 y 7 definidas
  all.forEach(p => {
    assert.ok(p.sequences[9], `Vía ${p.id} debe tener Secuencia 9`);
    assert.ok(p.sequences[8], `Vía ${p.id} debe tener Secuencia 8`);
    assert.ok(p.sequences[7], `Vía ${p.id} debe tener Secuencia 7`);
  });
});
