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

    assert.strictEqual(narrativeOutcomeCount, 35, 'Deben existir exactamente 35 narrativeOutcomes (17 en fool + 18 en visionary tras reautoría de DIL_VISIONARY_8_3)');
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

  it('5. CASE_G v2: Truth Model fundador, 8 pistas (>=2 fuentes), hipótesis colapsables, expiry y 4 resoluciones', () => {
    const caseData = JSON.parse(fs.readFileSync(casePath, 'utf-8'));

    assert.strictEqual(caseData.id, 'CASE_CHERWOOD_HEIRLOOM');
    assert.strictEqual(caseData.title, 'El Eco en el Nido Vacío');
    assert.strictEqual(caseData.truthModel.status, 'APPROVED_BY_DIRECTOR', 'truthModel debe estar firmado por el Director');
    assert.strictEqual(caseData.truthModel.nucleo, 'Dr. Avery Sterling');
    assert.strictEqual(caseData.truthModel.operador, 'Evangeline Sterling');
    assert.strictEqual(caseData.truthModel.complices.length, 3, 'Deben existir exactamente 3 facilitadores con gradiente');

    // Validación de las 8 pistas y sus >= 2 fuentes
    assert.strictEqual(caseData.clues.length, 8, 'Deben existir exactamente 8 pistas compiladas');
    const clueIds = new Set(caseData.clues.map((c: any) => c.id));
    const expectedClues = [
      'CLUE_BURNED_TOYS',
      'CLUE_WILL_DRAFT',
      'CLUE_MIND_TRACES',
      'CLUE_ASTROLOGY_RECORD',
      'CLUE_CONCEALED_SAFE',
      'CLUE_FINANCIAL_BLACKMAIL',
      'CLUE_FORGED_LETTERS',
      'CLUE_BLOODLINE_TALISMAN'
    ];
    for (const exp of expectedClues) {
      assert.ok(clueIds.has(exp), `Falta la pista obligatoria ${exp}`);
    }

    for (const clue of caseData.clues) {
      assert.ok(Array.isArray(clue.fuentes) && clue.fuentes.length >= 2, `Pista ${clue.id} debe tener al menos 2 fuentes independientes`);
      assert.ok(clue.gating, `Pista ${clue.id} debe tener gating estructurado`);
    }

    // Gating específico de vías y prueba definitiva
    const mindTraces = caseData.clues.find((c: any) => c.id === 'CLUE_MIND_TRACES');
    assert.strictEqual(mindTraces.gating.pathway, 'VISIONARY', 'CLUE_MIND_TRACES debe tener gating VISIONARY');

    const astro = caseData.clues.find((c: any) => c.id === 'CLUE_ASTROLOGY_RECORD');
    assert.strictEqual(astro.gating.pathway, 'FOOL', 'CLUE_ASTROLOGY_RECORD debe tener gating FOOL');

    const safe = caseData.clues.find((c: any) => c.id === 'CLUE_CONCEALED_SAFE');
    assert.strictEqual(safe.esPruebaDefinitiva, true, 'CLUE_CONCEALED_SAFE debe ser la prueba definitiva');
    assert.strictEqual(safe.isConcealed, true, 'CLUE_CONCEALED_SAFE debe ser concealed');

    // Validación de hipótesis (3 falsas colapsables ante el Libro de Transferencias)
    assert.ok(Array.isArray(caseData.hypothesisSlots) && caseData.hypothesisSlots.length === 4, 'Deben existir 4 slots de hipótesis');
    const falseHyps = caseData.hypothesisSlots.filter((h: any) => h.id !== 'HYPOTHESIS_TRUE_NETWORK');
    assert.strictEqual(falseHyps.length, 3, 'Deben existir exactamente 3 hipótesis falsas');
    for (const fh of falseHyps) {
      assert.strictEqual(fh.colapsoAnte, 'CLUE_CONCEALED_SAFE', `Hipótesis ${fh.id} debe colapsar ante CLUE_CONCEALED_SAFE`);
      assert.ok(fh.disparadorFalsacion, `Hipótesis ${fh.id} debe tener disparador de falsación explícito`);
    }

    // Validación de vector violento y riesgo
    assert.ok(caseData.vectors.violento.risk, 'Vector violento debe explicitar el riesgo de fractura de la Red');

    // Validación de Expiry (checkpoints 14, 21, 30)
    assert.strictEqual(caseData.expiry.dias, 30, 'Caducidad global debe ser de 30 días');
    assert.strictEqual(caseData.expiry.checkpoints.length, 3, 'Deben existir checkpoints en días 14, 21 y 30');
    assert.deepStrictEqual(caseData.expiry.checkpoints.map((cp: any) => cp.day), [14, 21, 30]);
    assert.strictEqual(caseData.expiry.checkpoints[2].eventId, 'THE_BROKEN_FATHER');

    // Validación de las 4 resoluciones y Telar
    assert.ok(Array.isArray(caseData.resolutionStates) && caseData.resolutionStates.length === 4, 'Deben existir exactamente 4 resoluciones');
    const resD = caseData.resolutionStates.find((r: any) => r.id === 'RESOLUTION_D_HEIR');
    assert.strictEqual(resD.telarDeclared.traitUnlocked, 'LOS_SUSURROS_DEL_NIDO');

    // Comprobación de que la biblia narrativa existe
    const narrativePath = path.join(packageRoot, 'data', 'gameplay', 'cases', 'case_cherwood_heirloom.narrative.md');
    assert.ok(fs.existsSync(narrativePath), 'Debe existir case_cherwood_heirloom.narrative.md');
  });

  it('6. NPC_WEEK_G: 39 rutinas semanales, Sharron/Xio canónicas, 3 sustituciones y NPCs del caso Cherwood', () => {
    const npcs = JSON.parse(fs.readFileSync(npcWeeksPath, 'utf-8'));
    assert.ok(npcs.length >= 39, `Deben compilarse al menos 39 rutinas de NPC (actual: ${npcs.length})`);

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

    // Comprobación de NPCs clave del caso Cherwood
    const julian = npcs.find((n: any) => n.id === 'NPC_CASE_JULIAN_VANCE');
    assert.ok(julian, 'Julian Vance debe estar en npc_weeks.json');
    assert.ok(julian.schedule.lunes.noche.includes('San Dionisio') || julian.schedule.lunes.noche.includes('orfanato'), 'Julian debe ser encontrable de noche en orfanato');

    const sterling = npcs.find((n: any) => n.id === 'NPC_CASE_AVERY_STERLING');
    assert.ok(sterling, 'Dr. Avery Sterling debe estar en npc_weeks.json');

    const evangeline = npcs.find((n: any) => n.id === 'NPC_CASE_EVANGELINE');
    assert.ok(evangeline, 'Evangeline Sterling debe estar en npc_weeks.json');

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

  it('8. ARTIFACT_G: Distribución canónica de artefactos (7 canon de novela, 9 library)', () => {
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf-8'));
    assert.strictEqual(artifacts.length, 16, 'Deben existir exactamente 16 artefactos');

    const canonArtifacts = artifacts.filter((a: any) => a.canonConfidence === 'canon');
    const libraryArtifacts = artifacts.filter((a: any) => a.canonConfidence === 'library');

    assert.strictEqual(canonArtifacts.length, 7, 'Deben existir exactamente 7 artefactos canon provenientes de grade_0..3');
    assert.strictEqual(libraryArtifacts.length, 9, 'Deben existir exactamente 9 artefactos clasificados como library (incluido G3-0711)');

    const espejo = artifacts.find((a: any) => a.id === 'ARTIFACT_G3_0711');
    assert.ok(espejo, 'El Espejo del Huérfano ARTIFACT_G3_0711 debe existir');
    assert.strictEqual(espejo.pathwayTag, 'ERROR');
    assert.strictEqual(espejo.sefiraGroupRef, 'LOTM');
  });
});

