/**
 * TESTS DE VERIFICACIÓN DE OBJETOS DIEGÉTICOS Y EL DESVÁN (R3) — PATH TO GODHOOD
 * Valida los 11 objetos físicos canónicos, mapeo somático de 4 tiers, franjas horarias
 * y cumplimiento de la Ley del Objeto (ESTADO = OBJETO · MOMENTO = PROSA · ≤ 7 palabras).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { StaircaseDoorObject } from '../../ui/src/features/desk/objects/StaircaseDoorObject.tsx';
import { NicheChaliceObject } from '../../ui/src/features/desk/objects/NicheChaliceObject.tsx';
import { CorkboardObject } from '../../ui/src/features/desk/objects/CorkboardObject.tsx';
import { CandleObject } from '../../ui/src/features/desk/objects/CandleObject.tsx';
import { SomaticMirrorObject } from '../../ui/src/features/desk/objects/SomaticMirrorObject.tsx';
import { PocketWatchObject } from '../../ui/src/features/desk/objects/PocketWatchObject.tsx';
import { IdentityPapersObject } from '../../ui/src/features/desk/objects/IdentityPapersObject.tsx';
import { ActingBookObject } from '../../ui/src/features/desk/objects/ActingBookObject.tsx';
import { LeatherPouchObject } from '../../ui/src/features/desk/objects/LeatherPouchObject.tsx';
import { BazaarLetterObject } from '../../ui/src/features/desk/objects/BazaarLetterObject.tsx';
import { DeskCracksOverlay } from '../../ui/src/features/desk/objects/DeskCracksOverlay.tsx';

import { CANONICAL_HOTSPOTS } from '../../ui/src/scene/types.ts';
import type { SanityTier, CorruptionTier, RuinaTier, TimeSlot } from '../../ui/src/features/types.ts';

const FORBIDDEN_MECHANICAL_PATTERNS = [
  /\bHP\b/i,
  /\bSP\b/i,
  /\bMP\b/i,
  /\bSanidad:\s*\d+/i,
  /\bRuina:\s*\d+/i,
  /\bCorrupción:\s*\d+/i,
  /\b\+\d+\b/,
  /\bEXP\b/i,
  /\bNivel\s*\d+\b/i,
  /\bStats?\b/i
];

describe('BRIEF-10.VISUAL-R3: El Desván como Lugar — 11 Objetos Físicos Diegéticos', () => {

  describe('1. Comprobación de Renderizado Estático de los 11 Objetos', () => {
    it('renderiza StaircaseDoorObject con amenaza inactiva y activa', () => {
      const peacefulHtml = renderToStaticMarkup(
        React.createElement(StaircaseDoorObject, { threatActive: false })
      );
      assert.ok(peacefulHtml.includes('EL ZAGUÁN'));
      assert.ok(peacefulHtml.includes('svg'));

      const alertHtml = renderToStaticMarkup(
        React.createElement(StaircaseDoorObject, { threatActive: true, threatLevelText: 'Pasos en la madera.' })
      );
      assert.ok(alertHtml.includes('INTRUSIÓN'));
      assert.ok(alertHtml.includes('Pasos en la madera.'));
    });

    it('renderiza NicheChaliceObject en reposo y con poción lista', () => {
      const restingHtml = renderToStaticMarkup(
        React.createElement(NicheChaliceObject, { advancementReady: false })
      );
      assert.ok(restingHtml.includes('El Cáliz'));

      const readyHtml = renderToStaticMarkup(
        React.createElement(NicheChaliceObject, { advancementReady: true })
      );
      assert.ok(readyHtml.includes('Poción lista'));
    });

    it('renderiza CorkboardObject con indicios y clavos de latón', () => {
      const html = renderToStaticMarkup(
        React.createElement(CorkboardObject, { caseTitle: 'Expediente Cherwood', activeCluesCount: 4 })
      );
      assert.ok(html.includes('Expediente Cherwood'));
      assert.ok(html.includes('4 indicios'));
      assert.ok(html.includes('El Heraldo'));
    });

    it('renderiza PocketWatchObject en las 4 franjas horarias', () => {
      const slots: { slot: TimeSlot; expected: string }[] = [
        { slot: 'MAÑANA', expected: 'Amanecer' },
        { slot: 'TARDE', expected: 'Mediodía' },
        { slot: 'NOCHE', expected: 'Crepúsculo' },
        { slot: 'MADRUGADA', expected: 'Medianoche' }
      ];

      for (const { slot, expected } of slots) {
        const html = renderToStaticMarkup(
          React.createElement(PocketWatchObject, { timeSlot: slot, dayNumber: 4 })
        );
        assert.ok(html.includes(expected), `Debe contener la etiqueta ${expected} para ${slot}`);
        assert.ok(html.includes('DÍA 4'));
      }
    });

    it('renderiza BazaarLetterObject con sello de lacre carmesí', () => {
      const html = renderToStaticMarkup(
        React.createElement(BazaarLetterObject, { unread: true })
      );
      assert.ok(html.includes('Taberna Bravehearts'));
      assert.ok(html.includes('bazaar-wax-seal'));
    });

    it('renderiza IdentityPapersObject con anclas civiles', () => {
      const html = renderToStaticMarkup(
        React.createElement(IdentityPapersObject, {
          name: 'Edward Vance',
          profession: 'Escribiente Notarial',
          originTitle: 'Escribiente',
          district: 'Cherwood',
          burden: { type: 'DEUDA', description: 'Deuda hipotecaria', details: '15 libras pendientes' },
          anchors: [
            { id: 'anc_1', tipo: 'persona', nombre: 'Hermana Marie', descripcion: 'Cartas semanales', fuerza: 'FIRME' }
          ]
        })
      );
      assert.ok(html.includes('Edward Vance'));
      assert.ok(html.includes('Escribiente Notarial'));
      assert.ok(html.includes('REINO DE LOEN'));
    });

    it('renderiza ActingBookObject con preceptos y afinidad', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActingBookObject, {
          coherence: 'COHERENTE',
          actingFeedback: 'Tus actos armonizan con la vía del Vidente.',
          entries: [],
          pathwayName: 'El Loco',
          sequenceTitle: 'Vidente'
        })
      );
      assert.ok(html.includes('El Loco'));
      assert.ok(html.includes('Vidente'));
    });

    it('renderiza LeatherPouchObject con monedas de Loen', () => {
      const html = renderToStaticMarkup(
        React.createElement(LeatherPouchObject, { walletText: '2 libras, 5 chelines' })
      );
      assert.ok(html.includes('Fondo Civil'));
      assert.ok(html.includes('chelines'));
    });
  });

  describe('2. Mapeo Somático Completo de 4 Tiers', () => {
    it('CandleObject cubre los 4 estados de sanidad', () => {
      const sanityTiers: SanityTier[] = ['BRILLANTE', 'VACILANTE', 'CREPITANTE', 'AHOGADA_EN_CERA'];
      for (const tier of sanityTiers) {
        const html = renderToStaticMarkup(
          React.createElement(CandleObject, { tier, description: `Prueba de estado ${tier}` })
        );
        assert.ok(html.includes('svg'));
        assert.ok(html.length > 500);
      }
    });

    it('SomaticMirrorObject cubre los 4 estados de corrupción y toggle de Velo', () => {
      const corruptionTiers: CorruptionTier[] = [
        'AZOGUE_LIMPIO',
        'VAHO_TENUE',
        'REFLEJOS_DESFASADOS',
        'EL_REFLEJO_NO_PARPADEA'
      ];
      for (const tier of corruptionTiers) {
        const html = renderToStaticMarkup(
          React.createElement(SomaticMirrorObject, {
            tier,
            description: `Prueba de azogue ${tier}`,
            spiritVisionActive: false
          })
        );
        assert.ok(html.includes('somatic-mirror-frame') && (html.includes('Superficie de azogue') || html.includes('Sombras tenues') || html.includes('El azogue') || html.includes('La silueta')));
      }

      // Con Spirit Vision activo
      const veilHtml = renderToStaticMarkup(
        React.createElement(SomaticMirrorObject, {
          tier: 'AZOGUE_LIMPIO',
          description: 'Visión activa',
          spiritVisionActive: true,
          onToggleSpiritVision: () => {}
        })
      );
      assert.ok(veilHtml.includes('border-[#a855f7]'));
    });

    it('DeskCracksOverlay cubre los 5 estados de ruina', () => {
      const ruinaTiers: RuinaTier[] = ['INTEGRO', 'MARCADO', 'EROSIONADO', 'ROTO', 'PERDIDO'];
      for (const tier of ruinaTiers) {
        const html = renderToStaticMarkup(
          React.createElement(DeskCracksOverlay, { tier, description: `Prueba de ruina ${tier}` })
        );
        assert.ok(html.includes('svg'), `Debe renderizar SVG para ruina ${tier}`);
        assert.ok(html.length > 200, `El contenido estático debe ser sustancial para ${tier}`);
      }
    });
  });

  describe('3. Ley Anti-Mecánica y Restricción de Palabras (Ley del Objeto)', () => {
    it('todos los hotspots canónicos cumplen el límite estricto de ≤ 7 palabras en restingLabel', () => {
      for (const [id, hotspot] of Object.entries(CANONICAL_HOTSPOTS)) {
        const words = hotspot.restingLabel.trim().split(/\s+/);
        assert.ok(
          words.length <= 7,
          `Hotspot ${id} excede 7 palabras en restingLabel: "${hotspot.restingLabel}" (${words.length} palabras)`
        );
      }
    });

    it('ningún string rendered de los 11 objetos contiene términos mecánicos prohibidos', () => {
      const renderedStrings = [
        renderToStaticMarkup(React.createElement(StaircaseDoorObject, { threatActive: true, threatLevelText: 'Alerta de sombras.' })),
        renderToStaticMarkup(React.createElement(NicheChaliceObject, { advancementReady: true })),
        renderToStaticMarkup(React.createElement(CorkboardObject, { caseTitle: 'Expediente Cherwood', activeCluesCount: 3 })),
        renderToStaticMarkup(React.createElement(CandleObject, { tier: 'BRILLANTE', description: 'La llama arde recta.' })),
        renderToStaticMarkup(React.createElement(SomaticMirrorObject, { tier: 'AZOGUE_LIMPIO', description: 'Reflejo claro.', spiritVisionActive: true })),
        renderToStaticMarkup(React.createElement(PocketWatchObject, { timeSlot: 'TARDE', dayNumber: 5 })),
        renderToStaticMarkup(React.createElement(IdentityPapersObject, {
          name: 'Edward Vance',
          profession: 'Escribiente',
          originTitle: 'Escribiente',
          district: 'Cherwood',
          burden: { type: 'DEUDA', description: 'Deuda', details: 'Carga' },
          anchors: []
        })),
        renderToStaticMarkup(React.createElement(ActingBookObject, {
          coherence: 'COHERENTE',
          actingFeedback: 'Fidelidad al rol.',
          entries: [],
          pathwayName: 'El Loco',
          sequenceTitle: 'Vidente'
        })),
        renderToStaticMarkup(React.createElement(LeatherPouchObject, { walletText: 'Tres chelines' })),
        renderToStaticMarkup(React.createElement(BazaarLetterObject, { unread: false })),
        renderToStaticMarkup(React.createElement(DeskCracksOverlay, { tier: 'MARCADO', description: 'Fisura ligera.' }))
      ];

      for (const html of renderedStrings) {
        for (const pattern of FORBIDDEN_MECHANICAL_PATTERNS) {
          assert.equal(
            pattern.test(html),
            false,
            `Se detectó término mecánico prohibido (${pattern}) en el render: ${html.substring(0, 100)}...`
          );
        }
      }
    });
  });

});
