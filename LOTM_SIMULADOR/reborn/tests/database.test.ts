import { test } from 'node:test';
import * as assert from 'node:assert';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';

test('DatabaseClient: Inicialización y operaciones CRUD en memoria', () => {
  const db = new DatabaseClient(':memory:');

  // 1. Crear personaje de prueba
  const char = db.createCharacter({
    id: 'char_test_1',
    name: 'Lumian Lee',
    pathway: 'RED_PRIEST',
    sequence: 9,
    current_health: 120,
    max_health: 120,
    current_spirituality: 100,
    max_spirituality: 100,
    sanity: 90,
    corruption: 0,
    digestion_progress: 15.5,
    raw_pence: 7200, // £30
    current_location: 'Trier - Barrio Subterráneo',
    current_day: 1
  });

  assert.strictEqual(char.id, 'char_test_1');
  assert.strictEqual(char.name, 'Lumian Lee');
  assert.strictEqual(char.pathway, 'RED_PRIEST');
  assert.strictEqual(char.sequence, 9);
  assert.strictEqual(char.raw_pence, 7200);

  // 2. Probar actualización somática
  db.updateCharacterSomatics('char_test_1', {
    sanity: 85,
    digestion: 35.0,
    spirituality: 80
  });

  const updatedChar = db.getCharacter('char_test_1');
  assert.ok(updatedChar);
  assert.strictEqual(updatedChar.sanity, 85);
  assert.strictEqual(updatedChar.digestion_progress, 35.0);
  assert.strictEqual(updatedChar.current_spirituality, 80);

  // 3. Crear Persona (Doble vida)
  db.createPersona({
    id: 'persona_1',
    character_id: 'char_test_1',
    legal_name: 'Lumian Lee',
    profession: 'Camarero y Explorador de Tabernas',
    social_class: 'WORKING_CLASS',
    district: 'Trier - Barrio Subterráneo',
    police_suspicion: 10,
    church_suspicion: 15,
    human_anchors: 40,
    is_active: 1,
    is_compromised: 0
  });

  const activePersona = db.getActivePersona('char_test_1');
  assert.ok(activePersona);
  assert.strictEqual(activePersona.legal_name, 'Lumian Lee');
  assert.strictEqual(activePersona.police_suspicion, 10);

  // 4. Anclas de fe
  db.addAnchor({
    id: 'anchor_1',
    character_id: 'char_test_1',
    title: 'Recuerdo de Aurore Lee',
    strength: 50,
    category: 'FAMILY'
  });

  const anchors = db.getAnchors('char_test_1');
  assert.strictEqual(anchors.length, 1);
  assert.strictEqual(anchors[0].title, 'Recuerdo de Aurore Lee');

  // 5. Inventario
  db.addItem({
    id: 'item_1',
    character_id: 'char_test_1',
    item_code: 'ING_RED_CHESTNUT',
    name: 'Blood Red Chestnut',
    category: 'INGREDIENT',
    grade: null,
    quantity: 1,
    metadata_json: '{}',
    is_equipped: 0
  });

  const items = db.getInventory('char_test_1');
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].name, 'Blood Red Chestnut');

  // 6. Distritos inicializados
  const districts = db.getDistricts();
  assert.ok(districts.length >= 5);

  db.close();
});

