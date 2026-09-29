import { test } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';

test('Combat API: Combate táctico por turnos contra monstruos con habilidades canónicas', async () => {
  const { app, db } = await buildApp({ dbPath: ':memory:' });

  try {
    // 1. Crear personaje Cazador
    const charRes = await app.inject({
      method: 'POST',
      url: '/api/character/new',
      payload: {
        name: 'Anderson Hood',
        pathway: 'HUNTER',
        startingCity: 'Bayam - Ciudad Portuaria',
        background: 'Cazador de Bestias',
        socialClass: 'WORKING_CLASS'
      }
    });
    const charData = JSON.parse(charRes.body);
    const charId = charData.character.id;

    // 2. Consultar habilidades de combate activas
    const skillsRes = await app.inject({
      method: 'GET',
      url: `/api/combat/skills/${charId}`
    });
    assert.strictEqual(skillsRes.statusCode, 200);
    const skillsData = JSON.parse(skillsRes.body);
    assert.strictEqual(skillsData.pathway, 'RED_PRIEST');
    assert.ok(skillsData.availableSkills.length >= 1);
    assert.strictEqual(skillsData.availableSkills[0].id, 'SKILL_HUNTER_9_SNIPE');

    // 3. Iniciar Combate contra Criatura Mística
    const startRes = await app.inject({
      method: 'POST',
      url: '/api/combat/start',
      payload: {
        characterId: charId,
        enemyName: 'Espectro de la Niebla Ácida',
        enemyHp: 40
      }
    });
    assert.strictEqual(startRes.statusCode, 200);
    const startData = JSON.parse(startRes.body);
    assert.strictEqual(startData.enemy.name, 'Espectro de la Niebla Ácida');
    assert.strictEqual(startData.enemy.currentHp, 40);

    // 4. Ejecutar Habilidad de Combate Canónica (Tiro de Precisión)
    const actionRes = await app.inject({
      method: 'POST',
      url: '/api/combat/action',
      payload: {
        characterId: charId,
        skillId: 'SKILL_HUNTER_9_SNIPE'
      }
    });
    assert.strictEqual(actionRes.statusCode, 200);
    const actionData = JSON.parse(actionRes.body);
    assert.strictEqual(actionData.playerResult.damageDealt, 25);
    assert.strictEqual(actionData.playerResult.spiritualitySpent, 10);
    assert.strictEqual(actionData.enemyState.hp, 15);
    assert.strictEqual(actionData.battleOver, false);

    // 5. Segundo Turno: Ejecutar segundo ataque para finalizar el combate
    const finishRes = await app.inject({
      method: 'POST',
      url: '/api/combat/action',
      payload: {
        characterId: charId,
        skillId: 'SKILL_HUNTER_9_SNIPE'
      }
    });
    assert.strictEqual(finishRes.statusCode, 200);
    const finishData = JSON.parse(finishRes.body);
    assert.strictEqual(finishData.battleOver, true);
    assert.strictEqual(finishData.victory, true);
    assert.ok(finishData.message.includes('Victoria'));

    // 6. Verificar que la salud y espiritualidad están actualizadas en base de datos
    const updatedChar = db.getCharacter(charId);
    assert.ok(updatedChar);
    assert.strictEqual(updatedChar.current_spirituality, 80); // 100 - 10 - 10

  } finally {
    db.close();
    await app.close();
  }
});

