import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';

describe('DomainError y Semantic HTTP Handling', () => {
  it('responde con 404 semántico y código ENTITY_NOT_FOUND al buscar personaje inexistente', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const res = await app.inject({
        method: 'GET',
        url: '/api/combat/skills/char_non_existent_999'
      });
      assert.strictEqual(res.statusCode, 404);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.code, 'ENTITY_NOT_FOUND');
      assert.strictEqual(data.error, 'Personaje no encontrado');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('responde con 404 semántico al intentar actuar en un combate inexistente', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const res = await app.inject({
        method: 'POST',
        url: '/api/combat/action',
        payload: {
          characterId: 'char_no_battle'
        }
      });
      assert.strictEqual(res.statusCode, 404);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.code, 'ENTITY_NOT_FOUND');
      assert.strictEqual(data.error, 'No hay combate activo para este personaje.');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('responde con 400 semántico y VALIDATION_ERROR si el payload es inválido', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const res = await app.inject({
        method: 'POST',
        url: '/api/combat/action',
        payload: {
          // falta characterId
          skillId: 'SKILL_FOOL_9_SPIRIT_VISION'
        }
      });
      assert.strictEqual(res.statusCode, 400);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.code, 'VALIDATION_ERROR');
    } finally {
      db.close();
      await app.close();
    }
  });
});

