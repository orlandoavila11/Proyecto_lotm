import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AtomRuntime, RuntimeCombatant } from '../src/core/combat/AtomRuntime.js';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));

describe('Brief 03.a: Runtime de Átomos, Loadouts y Matriz de Estados', () => {
  const runtime = AtomRuntime.getInstance();

  it('1. Vocabulario de Átomos: 17 átomos cargados correctamente con categorías y costes', () => {
    const vocabPath = path.join(packageRoot, 'data', 'gameplay', 'balance', 'atom_vocabulary.json');
    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
    assert.strictEqual(vocabData.schema_version, '1.0');
    assert.strictEqual(vocabData.atoms.length, 17);

    const expectedAtoms = [
      'ATOM_DAMAGE_PHYSICAL', 'ATOM_DAMAGE_SPIRITUAL', 'ATOM_DAMAGE_ELEMENTAL',
      'ATOM_APPLY_STATUS', 'ATOM_REMOVE_STATUS',
      'ATOM_DISPLACE_PUSH', 'ATOM_DISPLACE_PULL', 'ATOM_DISPLACE_MOVE', 'ATOM_DISPLACE_TELEPORT',
      'ATOM_SCRUTINIZE', 'ATOM_REVEAL',
      'ATOM_HEAL_HP', 'ATOM_HEAL_SPIRITUALITY', 'ATOM_HEAL_SANITY',
      'ATOM_DRAIN_AP', 'ATOM_GAIN_AP', 'ATOM_ATTENTION_EXCHANGE'
    ];

    for (const atomId of expectedAtoms) {
      const atom = runtime.getAtom(atomId);
      assert.ok(atom, `Átomo '${atomId}' debe estar registrado en el runtime`);
      assert.ok(atom.category, `Átomo '${atomId}' debe tener categoría`);
      assert.ok(typeof atom.baseCosts.ap === 'number', `Átomo '${atomId}' debe tener baseCost de AP`);
    }

    // Regla de economía: ATOM_ATTENTION_EXCHANGE solo en player abilities
    const attAtom = runtime.getAtom('ATOM_ATTENTION_EXCHANGE');
    assert.strictEqual(attAtom?.playerOnly, true, 'ATOM_ATTENTION_EXCHANGE debe ser playerOnly');
  });

  it('2. Matriz de Interacción de Estados: Resolución 100% conducida por datos (status_matrix.json)', () => {
    const matrix = runtime.getStatusMatrix();
    assert.strictEqual(matrix.statuses.length, 8);
    assert.ok(matrix.interactions.length >= 6);

    // Caso A: FEAR + BLESSING = MUTUAL_CANCELLATION
    const resCancel = runtime.resolveStatusInteraction(
      [{ status: 'FEAR', durationTurns: 2 }],
      'BLESSING'
    );
    assert.strictEqual(resCancel.applied, false, 'Bendición no debe quedar activa');
    assert.strictEqual(resCancel.removed, 'FEAR', 'Miedo debe haber sido removido por cancelación mutua');
    assert.strictEqual(resCancel.updatedStatuses.length, 0, 'Ambos estados deben haberse consumido');

    // Caso B: FRENZY + BLESSING = REMOVE_A (Purga Frenesí)
    const resPurge = runtime.resolveStatusInteraction(
      [{ status: 'FRENZY', durationTurns: 2 }],
      'BLESSING'
    );
    assert.strictEqual(resPurge.applied, true, 'Bendición se aplica');
    assert.strictEqual(resPurge.removed, 'FRENZY', 'Frenesí purgado');
    assert.deepStrictEqual(resPurge.updatedStatuses.map(s => s.status), ['BLESSING']);

    // Caso C: FRENZY + FEAR = Inmunidad (A_IMMUNE_TO_B)
    const resImmunity = runtime.resolveStatusInteraction(
      [{ status: 'FRENZY', durationTurns: 2 }],
      'FEAR'
    );
    assert.strictEqual(resImmunity.applied, false, 'Miedo no puede aplicarse a un ser en Frenesí');
    assert.deepStrictEqual(resImmunity.updatedStatuses.map(s => s.status), ['FRENZY']);
  });

  it('3. Ejecución de Átomos en Runtime: Daño, Desplazamiento y Escudriñar deterministas', () => {
    const actor: RuntimeCombatant = {
      id: 'player_test',
      name: 'Klein Moretti',
      isPlayer: true,
      hp: 100,
      maxHp: 100,
      spirituality: 100,
      maxSpirituality: 100,
      ap: 3,
      maxAp: 3,
      attention: 1,
      maxAttention: 2,
      position: { x: 0, y: 2 },
      statuses: [],
      revealedAbilities: []
    };

    const target: RuntimeCombatant = {
      id: 'enemy_test',
      name: 'Spinal Octopus',
      isPlayer: false,
      hp: 45,
      maxHp: 45,
      spirituality: 30,
      maxSpirituality: 30,
      ap: 3,
      maxAp: 3,
      attention: 0,
      maxAttention: 1,
      position: { x: 5, y: 2 },
      statuses: [],
      revealedAbilities: [],
      allAbilityIds: ['ABILITY_SPINAL_TENTACLE_STRIKE', 'ABILITY_SPINAL_ILLUSORY_INK']
    };

    // A. Daño Espiritual
    const dmgResult = runtime.executeAtom(actor, target, 'ATOM_DAMAGE_SPIRITUAL', { baseDamage: 18 });
    assert.strictEqual(dmgResult.damageDealt, 18);
    assert.strictEqual(target.hp, 27);
    assert.strictEqual(target.lastDamageSource?.type, 'SPIRITUAL');

    // B. Desplazamiento Empujar
    const pushResult = runtime.executeAtom(actor, target, 'ATOM_DISPLACE_PUSH', { distance: 1 });
    assert.strictEqual(target.position.x, 6, 'Debe haber sido empujado de x:5 a x:6');

    // C. Escudriñar (Scrutinize)
    const scrutResult = runtime.executeAtom(actor, target, 'ATOM_SCRUTINIZE', { revealCount: 1 });
    assert.strictEqual(scrutResult.revealedAbilities?.length, 1);
    assert.strictEqual(actor.revealedAbilities.length, 1);
    assert.strictEqual(actor.revealedAbilities[0], 'ABILITY_SPINAL_TENTACLE_STRIKE');

    // D. Intercambio de Atención (solo Player)
    const attResult = runtime.executeAtom(actor, target, 'ATOM_ATTENTION_EXCHANGE', { apCost: 1, attentionGained: 1 });
    assert.strictEqual(actor.ap, 2);
    assert.strictEqual(actor.attention, 2);
  });

  it('4. Loadouts de los 25 Combatientes: 2-3 habilidades, 0 átomos huérfanos, máx 1 economía', () => {
    const combatantsPath = path.join(packageRoot, 'data', 'gameplay', 'combatants', 'combatants.json');
    const combatants = JSON.parse(fs.readFileSync(combatantsPath, 'utf-8'));
    assert.strictEqual(combatants.length, 25);

    let totalAbilities = 0;
    for (const c of combatants) {
      assert.ok(Array.isArray(c.abilities), `Combatiente '${c.id}' debe poseer array de habilidades`);
      assert.ok(c.abilities.length >= 2 && c.abilities.length <= 3, `Combatiente '${c.id}' debe tener 2 o 3 habilidades`);
      totalAbilities += c.abilities.length;

      for (const a of c.abilities) {
        assert.ok(a.id, 'Habilidad debe tener id');
        assert.ok(a.name, 'Habilidad debe tener name');
        assert.ok(a.description, 'Habilidad debe tener description');
        assert.ok(typeof a.apCost === 'number', 'Habilidad debe tener apCost');
        assert.ok(typeof a.range === 'number', 'Habilidad debe tener range');
        assert.ok(a.atoms.length >= 1, 'Habilidad debe invocar al menos 1 átomo');
        assert.ok(a.canonConfidence, 'Habilidad debe tener canonConfidence');
        assert.ok(a.derivationNote, 'Habilidad debe tener derivationNote');

        let econCount = 0;
        for (const atom of a.atoms) {
          const def = runtime.getAtom(atom.atomId);
          assert.ok(def, `Átomo '${atom.atomId}' debe existir en el vocabulario`);
          assert.notStrictEqual(atom.atomId, 'ATOM_ATTENTION_EXCHANGE', 'Prohibido ATOM_ATTENTION_EXCHANGE en combatientes');
          if (def?.category === 'ECONOMY') {
            econCount++;
          }
        }
        assert.ok(econCount <= 1, `Habilidad '${a.id}' no debe tener más de 1 átomo de economía`);
      }
    }

    assert.ok(totalAbilities >= 50 && totalAbilities <= 75, `Total de habilidades de combatientes: ${totalAbilities}`);
  });

  it('5. Habilidades del Jugador: FOOL + VISIONARY (S9 y S8), Cola 1c auditada', () => {
    const abilitiesPath = path.join(packageRoot, 'data', 'gameplay', 'abilities', 'player_abilities.json');
    const data = JSON.parse(fs.readFileSync(abilitiesPath, 'utf-8'));
    assert.strictEqual(data.schema_version, '1.0');
    assert.strictEqual(data.abilities.length, 12, 'Debe haber exactamente 12 habilidades de jugador compiladas');

    const foolS9 = data.abilities.filter((a: any) => a.pathway === 'FOOL' && a.sequence === 9);
    const foolS8 = data.abilities.filter((a: any) => a.pathway === 'FOOL' && a.sequence === 8);
    const visS9 = data.abilities.filter((a: any) => a.pathway === 'VISIONARY' && a.sequence === 9);
    const visS8 = data.abilities.filter((a: any) => a.pathway === 'VISIONARY' && a.sequence === 8);

    assert.strictEqual(foolS9.length, 3, 'FOOL S9 (Seer) debe tener 3 habilidades');
    assert.strictEqual(foolS8.length, 3, 'FOOL S8 (Clown) debe tener 3 habilidades');
    assert.strictEqual(visS9.length, 3, 'VISIONARY S9 (Spectator) debe tener 3 habilidades');
    assert.strictEqual(visS8.length, 3, 'VISIONARY S8 (Telepathist) debe tener 3 habilidades');

    let canonCount = 0;
    let libraryCount = 0;
    for (const a of data.abilities) {
      if (a.canonConfidence === 'canon') canonCount++;
      if (a.canonConfidence === 'library') libraryCount++;
    }

    assert.strictEqual(canonCount, 11, '11 habilidades deben ser canon');
    assert.strictEqual(libraryCount, 1, '1 habilidad (Grotesque Grin) debe ser library (Cola 1c)');
    const grin = data.abilities.find((a: any) => a.id === 'PLAYER_FOOL_8_GROTESQUE_GRIN');
    assert.ok(grin, 'Grotesque Grin debe existir');
    assert.strictEqual(grin.canonConfidence, 'library');
    assert.ok(grin.derivationNote.includes('1c'), 'Nota de derivación debe referenciar cola 1c');
  });

  it('6. Artefactos Atados al Vocabulario: 15/15 con atomEffects válidos', () => {
    const artifactsPath = path.join(packageRoot, 'data', 'gameplay', 'artifacts', 'artifacts.json');
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf-8'));
    assert.strictEqual(artifacts.length, 15);

    for (const art of artifacts) {
      assert.ok(Array.isArray(art.atomEffects), `Artefacto '${art.id}' debe tener atomEffects`);
      assert.ok(art.atomEffects.length >= 1, `Artefacto '${art.id}' debe tener al menos 1 efecto`);
      for (const eff of art.atomEffects) {
        const def = runtime.getAtom(eff.atomId);
        assert.ok(def, `Efecto de artefacto '${eff.atomId}' debe existir en el vocabulario`);
        assert.ok(eff.trigger, `Efecto de artefacto debe tener trigger declarado`);
      }
    }
  });
});
