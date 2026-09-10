import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('Brief 02.4: Compilación Tier G (Fool + Visionary)', () => {
  const packageRoot = fileURLToPath(new URL('..', import.meta.url));
  const dilemmasDir = path.join(packageRoot, 'data', 'gameplay', 'dilemmas');
  const combatantsPath = path.join(packageRoot, 'data', 'gameplay', 'combatants', 'combatants.json');
  const artifactsPath = path.join(packageRoot, 'data', 'gameplay', 'artifacts', 'artifacts.json');
  const conspiraciesPath = path.join(packageRoot, 'data', 'gameplay', 'conspiracies', 'conspiracies.json');
  const npcWeeksPath = path.join(packageRoot, 'data', 'gameplay', 'npc_weeks', 'npc_weeks.json');
  const casePath = path.join(packageRoot, 'data', 'gameplay', 'cases', 'case_cherwood_heirloom.json');
  const forcesPath = path.join(packageRoot, 'data', 'gameplay', 'convergence_forces.json');

  it('1. DILEMMA_G: 0 dilemas telegrafiados, narrativeOutcome y anti dual authority', () => {
    const foolDilemmas = JSON.parse(fs.readFileSync(path.join(dilemmasDir, 'fool.json'), 'utf-8'));
    const visDilemmas = JSON.parse(fs.readFileSync(path.join(dilemmasDir, 'visionary.json'), 'utf-8'));
    const effectsData = JSON.parse(fs.readFileSync(path.join(packageRoot, 'data', 'gameplay', 'balance', 'dilemma_effects.json'), 'utf-8'));
    const validEffectKeys = new Set(Object.keys(effectsData.profiles));
    const all = [...foolDilemmas, ...visDilemmas];

    assert.ok(all.length >= 16, `Deben existir al menos 16 dilemas (obtenidos: ${all.length})`);

    const FORBIDDEN_PESOS_KEYS = [
      'digestion', 'digestionGain', 'sanity', 'sanityDelta',
      'policeSuspicion', 'churchSuspicion', 'suspicion',
      'pence', 'penceReward', 'spirituality', 'spiritualityCost',
      'health', 'hp'
    ];

    let narrativeOutcomeCount = 0;

    for (const dilemma of all) {
      assert.ok(dilemma.options.length >= 2 && dilemma.options.length <= 3, `Dilema ${dilemma.id} debe tener 2 o 3 opciones`);
      for (const opt of dilemma.options) {
        assert.strictEqual(
          (opt as any).isAlignedWithPrinciple,
          undefined,
          `PROHIBIDO telegrafiar alineación: opción ${opt.id} contiene isAlignedWithPrinciple`
        );
        assert.strictEqual(
          (opt as any).isCorrect,
          undefined,
          `PROHIBIDO telegrafiar corrección: opción ${opt.id} contiene isCorrect`
        );
        assert.ok(opt.pesos && typeof opt.pesos === 'object', `Opción ${opt.id} debe tener perfil interno de pesos`);
        
        // Anti dual authority check:
        const pesosKeys = Object.keys(opt.pesos);
        const forbiddenFound = pesosKeys.filter(k => FORBIDDEN_PESOS_KEYS.includes(k));
        assert.deepStrictEqual(
          forbiddenFound,
          [],
          `DUAL AUTHORITY FAIL: Opción ${opt.id} en ${dilemma.id} duplica stats en pesos: ${forbiddenFound.join(', ')}`
        );

        assert.ok(opt.tradeOffs, `Opción ${opt.id} debe declarar tradeOffs`);
        assert.ok(opt.effectKey, `Opción ${opt.id} debe referenciar effectKey de balance`);
        assert.ok(
          validEffectKeys.has(opt.effectKey),
          `Opción ${opt.id} referencia effectKey '${opt.effectKey}' ausente en dilemma_effects.json`
        );

        assert.ok(
          typeof opt.narrativeOutcome === 'string' && opt.narrativeOutcome.length >= 10,
          `Opción ${opt.id} debe contener narrativeOutcome de al menos 10 caracteres`
        );
        narrativeOutcomeCount++;
      }
    }

    assert.strictEqual(narrativeOutcomeCount, 34, 'Deben existir exactamente 34 narrativeOutcomes (17 en fool + 17 en visionary)');
  });

  it('2. DILEMMA_G: Unicidad de choiceText y sin repetición de plantillas genéricas (Test 5)', () => {
    const foolDilemmas = JSON.parse(fs.readFileSync(path.join(dilemmasDir, 'fool.json'), 'utf-8'));
    const visDilemmas = JSON.parse(fs.readFileSync(path.join(dilemmasDir, 'visionary.json'), 'utf-8'));
    const all = [...foolDilemmas, ...visDilemmas];

    function normalize(text: string): string {
      return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    const seen = new Map<string, string>();
    const choiceEntries: Array<{ id: string; text: string; tokens: Set<string> }> = [];

    for (const d of all) {
      for (const opt of d.options) {
        const norm = normalize(opt.texto);
        assert.strictEqual(
          seen.has(norm),
          false,
          `DUPLICADO EXACTO detectado: "${opt.texto}" en ${opt.id} vs ${seen.get(norm)}`
        );
        seen.set(norm, opt.id);
        const tokens = new Set(norm.split(/\s+/).filter(t => t.length > 2));
        choiceEntries.push({ id: opt.id, text: norm, tokens });
      }
    }

    // Comprobación de solapamiento de tokens > 80%
    const highOverlapPairs: string[] = [];
    for (let i = 0; i < choiceEntries.length; i++) {
      for (let j = i + 1; j < choiceEntries.length; j++) {
        const t1 = choiceEntries[i].tokens;
        const t2 = choiceEntries[j].tokens;
        let common = 0;
        for (const tok of t1) {
          if (t2.has(tok)) common++;
        }
        const similarity = (2 * common) / (t1.size + t2.size);
        if (similarity > 0.8) {
          highOverlapPairs.push(`${choiceEntries[i].id} <-> ${choiceEntries[j].id} (${(similarity * 100).toFixed(1)}%)`);
        }
      }
    }

    assert.deepStrictEqual(highOverlapPairs, [], 'No debe existir solapamiento de tokens > 80% entre opciones de dilemas');
  });

  it('3. CONSPIRACY_G: 100% de conspiraciones referencian fuerzas válidas de convergence_forces.json', () => {
    const conspiracies = JSON.parse(fs.readFileSync(conspiraciesPath, 'utf-8'));
    const forcesData = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));

    const validForceIds = new Set<string>();
    for (const s of Object.values(forcesData.sefirot) as Array<{ forces: any[] }>) {
      for (const f of s.forces) {
        validForceIds.add(f.id);
      }
    }

    assert.strictEqual(conspiracies.length, 10, 'Deben existir exactamente 10 conspiraciones activas compiladas');

    for (const c of conspiracies) {
      assert.ok(Array.isArray(c.actors) && c.actors.length >= 1, `Conspiración ${c.id} debe tener actores declarados`);
      for (const actor of c.actors) {
        assert.strictEqual(
          validForceIds.has(actor),
          true,
          `Conspiración ${c.id} referencia actor no canónico '${actor}' ausente en convergence_forces.json`
        );
      }
    }
  });

  it('4. COMBATANT_G: 100% de combatantes poseen sefiraGroupRef y opacity estructurados', () => {
    const combatants = JSON.parse(fs.readFileSync(combatantsPath, 'utf-8'));
    assert.ok(combatants.length >= 25, `Deben existir al menos 25 combatientes (obtenidos: ${combatants.length})`);

    for (const c of combatants) {
      assert.ok(c.id, 'Combatiente debe tener id');
      assert.ok(c.atomStats && c.atomStats.hp > 0, `Combatiente ${c.id} debe tener atomStats válidas`);
      assert.ok(c.opacity && typeof c.opacity.oculto_hasta === 'string', `Combatiente ${c.id} debe tener opacity.oculto_hasta`);
      assert.ok(c.sefiraGroupRef, `Combatiente ${c.id} debe declarar sefiraGroupRef`);
      assert.ok(c.pathwayTag, `Combatiente ${c.id} debe declarar pathwayTag`);
    }
  });

  it('5. CASE_G: Scaffold de CASE_CHERWOOD_HEIRLOOM con gating, 4 vectores y especialización de vías', () => {
    const caseData = JSON.parse(fs.readFileSync(casePath, 'utf-8'));

    assert.strictEqual(caseData.id, 'CASE_CHERWOOD_HEIRLOOM');
    assert.ok(caseData.clues.length >= 6 && caseData.clues.length <= 8, 'Debe contener entre 6 y 8 pistas');

    for (const clue of caseData.clues) {
      assert.ok(Array.isArray(clue.fuentes) && clue.fuentes.length >= 2, `Pista ${clue.id} debe tener al menos 2 fuentes independientes`);
      assert.ok(clue.gating, `Pista ${clue.id} debe tener gating estructurado`);
    }

    assert.ok(caseData.vectors.esotérico.dominantPathway === 'FOOL', 'Vector esotérico debe estar dominado por FOOL');
    assert.ok(caseData.vectors.social.dominantPathway === 'VISIONARY', 'Vector social debe estar dominado por VISIONARY');
    assert.strictEqual(caseData.truthModel.status, 'DRAFT', 'truthModel debe estar marcado como DRAFT esperando pluma del Director');
  });

  it('6. NPC_WEEK_G: 30 rutinas semanales, Sharron/Xio canónicas y 3 sustituciones ejecutadas', () => {
    const npcs = JSON.parse(fs.readFileSync(npcWeeksPath, 'utf-8'));
    assert.strictEqual(npcs.length, 30, 'Deben compilarse exactamente 30 rutinas de NPC');

    const canonicalNpcs = npcs.filter((n: any) => n.isCanonical);
    assert.strictEqual(canonicalNpcs.length, 2, 'Solo Sharron (NPC_004) y Xio (NPC_010) permanecen como canónicas vivas');

    const sharron = npcs.find((n: any) => n.id === 'NPC_004');
    assert.ok(sharron && sharron.name.includes('Sharron') && sharron.isCanonical, 'Sharron debe estar viva y activa');

    const xio = npcs.find((n: any) => n.id === 'NPC_010');
    assert.ok(xio && xio.name === 'Xio Derecha' && xio.isCanonical, 'Xio debe estar viva y activa');

    // Comprobación de las 3 sustituciones aprobadas por el Director:
    const npc006 = npcs.find((n: any) => n.id === 'NPC_006');
    assert.ok(npc006 && npc006.name.includes('Evaluador') && !npc006.isCanonical, 'Hvin Rambis debe estar sustituido');

    const npc008 = npcs.find((n: any) => n.id === 'NPC_008');
    assert.ok(npc008 && npc008.name.includes('Oráculo') && !npc008.isCanonical, 'Mr. X debe estar sustituido');

    const npc009 = npcs.find((n: any) => n.id === 'NPC_009');
    assert.ok(npc009 && npc009.name.includes('Archivista') && !npc009.isCanonical, 'Old Neil debe estar sustituido');

    for (const n of npcs) {
      assert.ok(n.schedule, `NPC ${n.id} debe tener schedule`);
      const days = Object.keys(n.schedule);
      assert.strictEqual(days.length, 7, `NPC ${n.id} debe tener exactamente 7 días`);
      for (const d of days) {
        assert.ok(n.schedule[d].mañana, `Falta mañana en día ${d} para ${n.id}`);
        assert.ok(n.schedule[d].tarde, `Falta tarde en día ${d} para ${n.id}`);
        assert.ok(n.schedule[d].noche, `Falta noche en día ${d} para ${n.id}`);
      }

      if (n.isCanonical) {
        assert.ok(n.eraCoherenceNote, `NPC canónico ${n.id} (${n.name}) debe llevar nota de coherencia de era`);
      }
    }
  });

  it('7. Cobertura de Pools 02.4-BIS: Auditoría de Combatientes por Pool Jugable', () => {
    const combatants = JSON.parse(fs.readFileSync(combatantsPath, 'utf-8'));
    const counts: Record<string, number> = {};

    for (const c of combatants) {
      counts[c.sefiraGroupRef] = (counts[c.sefiraGroupRef] || 0) + 1;
    }

    console.log('[POOL_COVERAGE_02.4_BIS] Combatientes por pool jugable:');
    for (const [pool, count] of Object.entries(counts)) {
      const gapNote = count < 8 ? ` -> GAP REPORTADO (${count} < 8, cola HUMAN_REVIEW)` : ' -> SUFICIENTE (>= 8)';
      console.log(`  - ${pool}: ${count} entidades${gapNote}`);
    }

    assert.strictEqual(counts['LOTM'], 8, 'Pool LOTM debe tener 8 combatientes en el slice');
    assert.strictEqual(counts['GOD_ALMIGHTY'], 8, 'Pool GOD_ALMIGHTY debe tener 8 combatientes en el slice');
    assert.ok(counts['CALAMITY_CLUSTER'] < 8, 'Pool CALAMITY_CLUSTER reporta gap legítimo');
  });

  it('8. ARTIFACT_G: Distribución canónica de artefactos (7 canon de novela, 8 library)', () => {
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf-8'));
    assert.strictEqual(artifacts.length, 15, 'Deben existir exactamente 15 artefactos');

    const canonArtifacts = artifacts.filter((a: any) => a.canonConfidence === 'canon');
    const libraryArtifacts = artifacts.filter((a: any) => a.canonConfidence === 'library');

    assert.strictEqual(canonArtifacts.length, 7, 'Deben existir exactamente 7 artefactos canon provenientes de grade_0..3');
    assert.strictEqual(libraryArtifacts.length, 8, 'Deben existir exactamente 8 artefactos clasificados como library');
  });
});

