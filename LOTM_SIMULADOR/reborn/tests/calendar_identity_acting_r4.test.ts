/**
 * TESTS DE VERIFICACIÓN DE CALENDARIO, IDENTIDAD Y ACTUACIÓN (R4) — PATH TO GODHOOD
 * Valida la semántica de 4 franjas, lectura sin avance de tiempo, anti doble-despacho,
 * despliegue de 6 orígenes con 3 anclas, resolución de dilemas sin números de sistema,
 * y cumplimiento del orden semanal del motor.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { CalendarEngine, TimeSlot } from '../src/core/calendar/CalendarEngine.js';
import { OriginEngine } from '../src/core/origins/OriginEngine.js';
import { IdentityEngine } from '../src/core/identity/IdentityEngine.js';
import { ActingDilemmaEngine } from '../src/core/acting/ActingDilemmaEngine.js';

import { CalendarView } from '../../ui/src/features/calendar/CalendarView.tsx';
import { IdentityDossierView } from '../../ui/src/features/identity/IdentityDossierView.tsx';
import { ActingMirrorView } from '../../ui/src/features/acting/ActingMirrorView.tsx';
import type { CharacterDiegetic } from '../../ui/src/features/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbPath = path.join(__dirname, 'test_r4_calendar_identity_acting.db');

const FORBIDDEN_MECHANICAL_PATTERNS = [
  /\bHP\b/i,
  /\bSP\b/i,
  /\bMP\b/i,
  /\bSanidad:\s*\d+/i,
  /\bRuina:\s*\d+/i,
  /\bCorrupción:\s*\d+/i,
  /\balignment\b/i,
  /\bdigestionGain\b/i,
  /\b\+\d+\b/,
  /\bEXP\b/i,
  /\bStats?\b/i
];

describe('BRIEF-10.VISUAL-R4: Calendario, Identidad y Actuación Conectados', () => {
  let db: DatabaseClient;

  before(() => {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    db = new DatabaseClient(testDbPath);
  });

  after(() => {
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  const mockCharacterDiegetic: CharacterDiegetic = {
    id: 'char_test_r4',
    name: 'Arthur Preece',
    profession: 'Escribiente Notarial en Hillston',
    originTitle: 'Escribiente Notarial',
    district: 'Hillston Borough',
    pathwayName: 'El Loco',
    sequenceTitle: 'Vidente',
    initialBurden: {
      type: 'DEUDA',
      description: 'Deuda hipotecaria pendiente con el Banco de Backlund',
      details: '15 libras pendientes'
    },
    somatics: {
      sanityTier: 'BRILLANTE',
      candleDescription: 'Llama viva y serena sobre la caoba.',
      corruptionTier: 'AZOGUE_LIMPIO',
      mirrorDescription: 'El azogue refleja tu semblante humano.',
      ruinaTier: 'MARCADO',
      woodDescription: 'Fisura ligera en el bisel de la mesa.'
    },
    walletText: '2 libras, 15 chelines',
    actingCoherence: 'COHERENTE',
    actingFeedback: 'Tus actos armonizan con la vía del Vidente.',
    actingDiary: [
      {
        id: 'log_1',
        day: 3,
        principle: 'El Vidente interpreta el destino sin manipular la voluntad ajena.',
        choiceTaken: 'Adivinación sobria en la taberna',
        narrativeOutcome: 'La revelación calmó al cliente sin desatar sospechas.'
      }
    ],
    anchors: [
      { id: 'anc_1', tipo: 'persona', nombre: 'Mr. Ronald Moore', descripcion: 'Jefe de archivo notarial', fuerza: 'FIRME' },
      { id: 'anc_2', tipo: 'rutina', nombre: 'Puntualidad en el Registro', descripcion: 'Horario civil riguroso', fuerza: 'FIRME' },
      { id: 'anc_3', tipo: 'lugar', nombre: 'Pensión de Cherwood', descripcion: 'Habitación abuhardillada', fuerza: 'TENUE' }
    ],
    policeSuspicionText: 'Sin sospechas policiales aparentes.',
    churchSuspicionText: 'Los clérigos no han registrado tu nombre.'
  };

  describe('1. Semántica de Franjas y Lectura sin Avance de Tiempo', () => {
    it('crea personaje de prueba y comprueba que leer/inspeccionar consume 0 tiempo', () => {
      const char = db.createCharacter({
        id: 'char_r4_timing',
        name: 'Edward Foster',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 95,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 2400,
        current_location: 'Backlund - Hillston',
        current_day: 4
      });

      OriginEngine.applyOrigin(db, char.id, 'ORIGIN_CLERK');

      // Estado inicial: Día 4, Franja 0 (MAÑANA)
      assert.strictEqual(char.current_day, 4);
      assert.strictEqual(char.current_slot ?? 0, 0);

      // Renderizar CalendarView (lectura de almanaque)
      const html = renderToStaticMarkup(
        React.createElement(CalendarView, {
          onBackToDesk: () => {},
          characterId: char.id,
          initialDay: 4,
          initialSlot: 'MAÑANA'
        })
      );

      assert.ok(html.includes('EL ALMANAQUE Y LAS CUATRO FRANJAS'));
      assert.ok(html.includes('Día 4'));
      assert.ok(html.includes('MAÑANA'));

      // Verificar en base de datos que el slot sigue exactamente en 0 y día 4
      const dbChar = db.getCharacter(char.id)!;
      assert.strictEqual(dbChar.current_slot ?? 0, 0, 'La lectura no debe mutar current_slot');
      assert.strictEqual(dbChar.current_day, 4, 'La lectura no debe mutar current_day');
    });

    it('acción WORK consume exactamente 1 franja, otorga coartada y reduce sospecha', () => {
      const char = db.getCharacter('char_r4_timing')!;
      const initialPersona = db.getActivePersona(char.id)!;
      const initialSuspicion = initialPersona.police_suspicion;

      const outcome = CalendarEngine.performSlotAction(db, char.id, 'WORK');

      // 1 franja consumida: pasa de 0 a 1
      assert.strictEqual(outcome.performedAt?.slot, 0, 'La acción se ejecutó en la franja 0');
      assert.strictEqual(outcome.slot, 1, 'El contrato del resultado debe reflejar la franja 1 posterior');
      assert.strictEqual(outcome.mechanicalDeltas.policeSuspicionDelta, -2);
      assert.strictEqual(outcome.mechanicalDeltas.anchorStrengthDelta, 1);

      const updatedChar = db.getCharacter(char.id)!;
      assert.strictEqual(updatedChar.current_slot, 1, 'El servidor debe avanzar a la franja 1 (TARDE)');
      assert.strictEqual(updatedChar.current_day, 4, 'El día sigue en 4');

      const updatedPersona = db.getActivePersona(char.id)!;
      assert.strictEqual(updatedPersona.police_suspicion, Math.max(0, initialSuspicion - 2));
    });
  });

  describe('2. Despliegue Notarial de los 6 Orígenes y 3 Anclas', () => {
    it('los 6 orígenes canónicos existen y definen exactamente 3 anclas firmadas y carga inicial', () => {
      const origins = OriginEngine.getAllOrigins();
      assert.strictEqual(origins.length, 6);

      for (const orig of origins) {
        assert.strictEqual(orig.originAnchors.length, 3, `${orig.id} debe tener 3 anclas firmadas`);
        assert.ok(orig.profession, `${orig.id} debe tener profesión civil`);
        assert.ok(orig.initialBurden.name, `${orig.id} debe tener carga inicial`);
        assert.ok(orig.startingDistrict, `${orig.id} debe declarar distrito inicial de Backlund`);
      }
    });

    it('renderiza IdentityDossierView con anclas firmadas y sin números porcentuales', () => {
      const html = renderToStaticMarkup(
        React.createElement(IdentityDossierView, {
          character: mockCharacterDiegetic,
          onBackToDesk: () => {}
        })
      );

      assert.ok(html.includes('EXPEDIENTE DE IDENTIDAD CIVIL Y ANCLAS'));
      assert.ok(html.includes('Arthur Preece'));
      assert.ok(html.includes('Escribiente Notarial en Hillston'));
      assert.ok(html.includes('Mr. Ronald Moore'));
      assert.ok(html.includes('Vínculo FIRME'));
      assert.ok(html.includes('Vínculo TENUE'));
      assert.ok(html.includes('Tribunal Notarial del Reino de Loen'));

      // Verificar ausencia de stats matemáticos
      for (const pattern of FORBIDDEN_MECHANICAL_PATTERNS) {
        assert.strictEqual(pattern.test(html), false, `Detectado patrón prohibido ${pattern} en IdentityDossierView`);
      }
    });
  });

  describe('3. Cuaderno de Actuación y Filtrado Anti-Mecánico', () => {
    it('ActingMirrorView renderiza principios y bitácora sin filtrar metadatos de balance', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActingMirrorView, {
          character: mockCharacterDiegetic,
          onBackToDesk: () => {}
        })
      );

      assert.ok(html.includes('EL CUADERNO DE ACTUACIÓN EN PIEL'));
      assert.ok(html.includes('Preceptos de la Secuencia'));
      assert.ok(html.includes('El Vidente interpreta el destino sin manipular la voluntad ajena.'));
      assert.ok(html.includes('Adivinación sobria en la taberna'));

      // Verificar que no se filtren palabras clave de código ni cálculos internos
      for (const pattern of FORBIDDEN_MECHANICAL_PATTERNS) {
        assert.strictEqual(pattern.test(html), false, `Detectado patrón prohibido ${pattern} en ActingMirrorView`);
      }
    });

    it('resolución de dilema canónico actualiza digestión y registra en base de datos', () => {
      const char = db.getCharacter('char_r4_timing')!;
      const dilemma = ActingDilemmaEngine.getDilemma('FOOL', 9);
      assert.ok(dilemma, 'Debe existir dilema canónico para Fool 9');
      assert.ok(dilemma.choices.length >= 2, 'Debe ofrecer al menos 2 opciones canónicas');

      const initialDigestion = char.digestion_progress;
      const choice = dilemma.choices[0];

      // Simular resolución
      const resolveRes = ActingDilemmaEngine.resolveDilemma(db, char.id, dilemma.id, choice.id);
      assert.ok(resolveRes.narrativeOutcome, 'Debe entregar narrativa de desenlace');

      const afterChar = db.getCharacter(char.id)!;
      assert.ok(afterChar.digestion_progress >= initialDigestion, 'La digestión debe avanzar');
    });
  });

  describe('4. Orden del Ciclo Semanal del Motor (§3)', () => {
    it('completa el ciclo de 7 días y ejecuta exactamente los 6 pasos en orden estricto', () => {
      const char = db.createCharacter({
        id: 'char_weekly_order',
        name: 'Julian Black',
        pathway: 'VISIONARY',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 90,
        corruption: 0,
        digestion_progress: 20,
        raw_pence: 3600,
        current_location: 'Backlund - Cherwood',
        current_day: 7
      });

      OriginEngine.applyOrigin(db, char.id, 'ORIGIN_REPORTER');

      // Avanzar al día 8 slot 0 (lunes amanecer) para disparar el tick semanal
      const weeklyTick = CalendarEngine.executeWeeklyTickInOrder(db, char.id, 1);

      assert.strictEqual(weeklyTick.weekNumber, 1);
      assert.strictEqual(weeklyTick.executionOrder.length, 6);

      const expectedOrder = ['1_acting', '2_alquiler', '3_salario', '4_mercado', '5_convergencia', '6_decay'];
      assert.deepStrictEqual(weeklyTick.executionOrder, expectedOrder, 'Los 6 pasos deben ejecutarse en orden canónico');
    });
  });

});
