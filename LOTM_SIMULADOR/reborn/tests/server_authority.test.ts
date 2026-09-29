import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';
import { EconomyEngine } from '../src/core/economy/EconomyEngine.js';
import { IdentityEngine } from '../src/core/identity/IdentityEngine.js';
import { awakenedCharacter } from './helpers/characters.js';

/**
 * El servidor decide; el cliente pide (auditoría general, regla B1). Cada caso comprueba que un parámetro que
 * antes decidía el resultado ya no lo hace.
 */
describe('Autoridad del servidor', () => {
  it('rito de ascensión: cada paso se paga una vez y exige su condición', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const characterId = await awakenedCharacter(app);
      const prep = (checklist: Record<string, boolean>) =>
        app.inject({ method: 'POST', url: '/api/ascension/prepare', payload: { characterId, checklist } });
      const steps = EconomyEngine.getEconomyBalance().preparationChecklist;
      const cost = (id: string) => steps.find(s => s.id === id)!.costPence;

      // de mañana, el momento propicio no está disponible
      const early = await prep({ momento: true });
      assert.strictEqual(early.statusCode, 422);

      const before = db.getCharacter(characterId)!.raw_pence;
      const ok = await prep({ materiales_rituales: true });
      assert.strictEqual(ok.statusCode, 200, ok.body);
      assert.strictEqual(db.getCharacter(characterId)!.raw_pence, before - cost('materiales_rituales'), 'el paso se paga');
      const again = await prep({ materiales_rituales: true });
      assert.strictEqual(again.statusCode, 200);
      assert.strictEqual(db.getCharacter(characterId)!.raw_pence, before - cost('materiales_rituales'), 'y sólo una vez');

      const status = JSON.parse((await app.inject({ method: 'GET', url: `/api/ascension/status/${characterId}` })).body).status;
      const momento = status.door4_preparation.steps.find((s: any) => s.id === 'momento');
      assert.ok(momento.blockedReason, 'el cliente recibe por qué no puede prepararse');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('identidad: la tirada no acepta semilla y sólo se resuelve el compromiso ofrecido', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const characterId = await awakenedCharacter(app);
      const a = JSON.parse((await app.inject({ method: 'GET', url: `/api/identity/roll/${characterId}?seed=1` })).body).event;
      const b = JSON.parse((await app.inject({ method: 'GET', url: `/api/identity/roll/${characterId}?seed=999` })).body).event;
      assert.deepStrictEqual(a?.id, b?.id, 'la semilla del cliente no cambia la tirada');
      if (a) {
        const other = IdentityEngine.getEvents().find(e => e.id !== a.id)!;
        const cheat = await app.inject({ method: 'POST', url: '/api/identity/resolve', payload: { characterId, eventId: other.id, optionIndex: 0 } });
        assert.strictEqual(cheat.statusCode, 400, 'no se puede elegir otro evento del catálogo');
        const fair = await app.inject({ method: 'POST', url: '/api/identity/resolve', payload: { characterId, eventId: a.id, optionIndex: 0 } });
        assert.strictEqual(fair.statusCode, 200, fair.body);
      }
    } finally {
      db.close();
      await app.close();
    }
  });

  it('rutas de depuración y atajos retirados', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const characterId = await awakenedCharacter(app);
      for (const url of ['/api/character/new', '/api/character/advance-day', '/api/character/advance', '/api/character/trigger-rampage',
        '/api/character/interact-anchor', '/api/acting/weekly-tick', '/api/investigation/case/advance-day',
        '/api/investigation/case/generate', '/api/investigation/clue/investigate', '/api/investigation/verdict']) {
        const r = await app.inject({ method: 'POST', url, payload: { characterId } });
        assert.strictEqual(r.statusCode, 404, `${url} no debe existir`);
      }
      const cases = JSON.parse((await app.inject({ method: 'GET', url: `/api/investigation/cases/${characterId}` })).body);
      assert.ok(!JSON.stringify(cases).includes('culprit'), 'el expediente no trae culpables');
    } finally {
      db.close();
      await app.close();
    }
  });
});
