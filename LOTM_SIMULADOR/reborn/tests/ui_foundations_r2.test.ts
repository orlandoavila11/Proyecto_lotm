/**
 * TESTS DE VERIFICACIÓN DE FUNDAMENTOS DE ESCENA (R2) — PATH TO GODHOOD
 * Valida máquina de navegación, transformaciones de coordenadas, grafo espacial,
 * fórmulas de viewport en las 5 resoluciones y ley anti-mecánica en hotspots.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  sceneNavigationReducer,
  INITIAL_NAVIGATION_STATE,
  isValidTransition
} from '../../ui/src/scene/navigation/navigationReducer.ts';

import {
  CANONICAL_HOTSPOTS,
  CAMERA_PRESETS,
  type HotspotId,
  type NavigationState
} from '../../ui/src/scene/types.ts';

import {
  SPATIAL_TAB_ORDER,
  SPATIAL_ADJACENCY_GRAPH,
  getNextSpatialHotspot,
  getNextTabHotspot
} from '../../ui/src/scene/spatialNavigation.ts';

import {
  LOGICAL_WIDTH,
  LOGICAL_HEIGHT,
  SAFE_WIDTH,
  SAFE_HEIGHT
} from '../../ui/src/scene/SceneViewport.tsx';

describe('BRIEF-10.VISUAL-R2: Fundamentos de Escena y Navegación Central', () => {

  describe('1. Máquina de Navegación Central y Reducer Puro', () => {
    it('inicia en DESK_WIDE con cámara WIDE_OVERVIEW y sin operaciones pendientes', () => {
      assert.equal(INITIAL_NAVIGATION_STATE.currentView, 'DESK_WIDE');
      assert.equal(INITIAL_NAVIGATION_STATE.activeCameraPreset, 'WIDE_OVERVIEW');
      assert.equal(INITIAL_NAVIGATION_STATE.isPendingOperation, false);
      assert.equal(INITIAL_NAVIGATION_STATE.isAttentionModeActive, false);
      assert.equal(INITIAL_NAVIGATION_STATE.focusHistory.length, 0);
    });

    it('permite transiciones canónicas válidas desde DESK_WIDE', () => {
      const validTargets: NavigationState[] = [
        'DESK_FOCUS',
        'INSPECTION_LAYER',
        'CORKBOARD_STAGE',
        'COMBAT_STAGE',
        'CEREMONY_STAGE',
        'CALENDAR_STAGE',
        'MARKET_STAGE',
        'ACTING_STAGE'
      ];

      for (const target of validTargets) {
        assert.equal(
          isValidTransition('DESK_WIDE', target),
          true,
          `Debe permitir DESK_WIDE -> ${target}`
        );
      }
    });

    it('rechaza transiciones inválidas directas desde INSPECTION_LAYER a COMBAT_STAGE sin cerrar', () => {
      assert.equal(isValidTransition('INSPECTION_LAYER', 'COMBAT_STAGE'), false);
      assert.equal(isValidTransition('INSPECTION_LAYER', 'CEREMONY_STAGE'), false);

      const inspectionState = {
        ...INITIAL_NAVIGATION_STATE,
        currentView: 'INSPECTION_LAYER' as NavigationState,
        activeHotspotId: 'hotspot_mirror' as HotspotId
      };

      const result = sceneNavigationReducer(inspectionState, {
        type: 'NAVIGATE_TO',
        view: 'COMBAT_STAGE'
      });

      // El estado no debe mutar
      assert.equal(result.currentView, 'INSPECTION_LAYER');
    });

    it('gestiona el historial de foco y restaura el hotspot previo al volver o cerrar inspección', () => {
      // 1. Abrir inspección en la vela
      const state1 = sceneNavigationReducer(INITIAL_NAVIGATION_STATE, {
        type: 'OPEN_INSPECTION',
        hotspotId: 'hotspot_candle'
      });
      assert.equal(state1.currentView, 'INSPECTION_LAYER');
      assert.equal(state1.activeHotspotId, 'hotspot_candle');
      assert.deepEqual(state1.focusHistory, ['hotspot_candle']);

      // 2. Cerrar inspección -> restaura DESK_WIDE y focusedHotspotId = 'hotspot_candle'
      const state2 = sceneNavigationReducer(state1, {
        type: 'CLOSE_INSPECTION'
      });
      assert.equal(state2.currentView, 'DESK_WIDE');
      assert.equal(state2.activeHotspotId, null);
      assert.equal(state2.focusedHotspotId, 'hotspot_candle');
      assert.equal(state2.focusHistory.length, 0);
    });

    it('bloquea nuevas transiciones si isPendingOperation es true (anti doble-despacho)', () => {
      const pendingState = {
        ...INITIAL_NAVIGATION_STATE,
        isPendingOperation: true
      };

      const attempted = sceneNavigationReducer(pendingState, {
        type: 'NAVIGATE_TO',
        view: 'COMBAT_STAGE'
      });

      assert.equal(attempted.currentView, 'DESK_WIDE');
    });

    it('conmuta correctamente el Modo Atención y la Visión Espiritual', () => {
      let state = sceneNavigationReducer(INITIAL_NAVIGATION_STATE, { type: 'TOGGLE_ATTENTION' });
      assert.equal(state.isAttentionModeActive, true);
      state = sceneNavigationReducer(state, { type: 'TOGGLE_ATTENTION' });
      assert.equal(state.isAttentionModeActive, false);

      let spiritState = sceneNavigationReducer(INITIAL_NAVIGATION_STATE, { type: 'TOGGLE_SPIRIT_VISION' });
      assert.equal(spiritState.isSpiritVisionActive, true);
      spiritState = sceneNavigationReducer(spiritState, { type: 'TOGGLE_SPIRIT_VISION' });
      assert.equal(spiritState.isSpiritVisionActive, false);
    });
  });

  describe('2. Transformaciones de Coordenadas y Viewport 1920x1080', () => {
    function computeViewport(windowW: number, windowH: number) {
      const scale = Math.min(windowW / LOGICAL_WIDTH, windowH / LOGICAL_HEIGHT);
      const offsetX = (windowW - LOGICAL_WIDTH * scale) / 2;
      const offsetY = (windowH - LOGICAL_HEIGHT * scale) / 2;
      return { scale, offsetX, offsetY };
    }

    function toLogical(clientX: number, clientY: number, vp: { scale: number; offsetX: number; offsetY: number }) {
      return {
        x: (clientX - vp.offsetX) / vp.scale,
        y: (clientY - vp.offsetY) / vp.scale
      };
    }

    function toScreen(logicX: number, logicY: number, vp: { scale: number; offsetX: number; offsetY: number }) {
      return {
        x: logicX * vp.scale + vp.offsetX,
        y: logicY * vp.scale + vp.offsetY
      };
    }

    it('calcula factores de escala y letterbox correctos en los 5 viewports de compatibilidad', () => {
      // 1. 1920x1080 (16:9 exacto)
      const vp1920 = computeViewport(1920, 1080);
      assert.equal(vp1920.scale, 1.0);
      assert.equal(vp1920.offsetX, 0);
      assert.equal(vp1920.offsetY, 0);

      // 2. 1280x720 (16:9 escalado 0.6667)
      const vp1280 = computeViewport(1280, 720);
      assert.equal(Math.round(vp1280.scale * 1000) / 1000, 0.667);
      assert.equal(vp1280.offsetX, 0);
      assert.equal(vp1280.offsetY, 0);

      // 3. 1440x900 (16:10, requiere letterbox arriba/abajo)
      const vp1440 = computeViewport(1440, 900);
      assert.equal(vp1440.scale, 1440 / 1920); // 0.75
      assert.equal(vp1440.offsetX, 0);
      assert.ok(vp1440.offsetY > 0, 'Debe tener offsetY positivo por letterbox');
      assert.equal(vp1440.offsetY, (900 - 1080 * 0.75) / 2); // 45px

      // 4. 1366x768 (casi 16:9, pillarbox leve)
      const vp1366 = computeViewport(1366, 768);
      assert.ok(vp1366.scale > 0.7 && vp1366.scale < 0.72);

      // 5. 2560x1440 (16:9 QHD, escalado 1.333)
      const vp2560 = computeViewport(2560, 1440);
      assert.equal(vp2560.scale, 2560 / 1920);
      assert.equal(vp2560.offsetX, 0);
      assert.equal(vp2560.offsetY, 0);
    });

    it('la transformación lógica <-> pantalla es 100% reversible sin deriva', () => {
      const vp = computeViewport(1440, 900);
      const originalLogic = { x: 960, y: 540 }; // Centro de la pantalla lógica

      const screenPoint = toScreen(originalLogic.x, originalLogic.y, vp);
      const recoveredLogic = toLogical(screenPoint.x, screenPoint.y, vp);

      assert.equal(Math.round(recoveredLogic.x), originalLogic.x);
      assert.equal(Math.round(recoveredLogic.y), originalLogic.y);
    });

    it('verifica que la zona segura canónica (1440x900) quepa holgadamente en el lienzo 1920x1080', () => {
      assert.ok(SAFE_WIDTH < LOGICAL_WIDTH);
      assert.ok(SAFE_HEIGHT < LOGICAL_HEIGHT);
      const marginX = (LOGICAL_WIDTH - SAFE_WIDTH) / 2;
      const marginY = (LOGICAL_HEIGHT - SAFE_HEIGHT) / 2;
      assert.equal(marginX, 240);
      assert.equal(marginY, 90);
    });
  });

  describe('3. Grafo Espacial de Teclado y Ciclo Tab', () => {
    it('SPATIAL_TAB_ORDER contiene exactamente los 11 hotspots sin duplicados', () => {
      assert.equal(SPATIAL_TAB_ORDER.length, 11);
      const unique = new Set(SPATIAL_TAB_ORDER);
      assert.equal(unique.size, 11);
    });

    it('getNextTabHotspot recorre secuencialmente hacia adelante y en reversa cíclica', () => {
      const first = SPATIAL_TAB_ORDER[0];
      const second = SPATIAL_TAB_ORDER[1];
      const last = SPATIAL_TAB_ORDER[SPATIAL_TAB_ORDER.length - 1];

      assert.equal(getNextTabHotspot(first, false), second);
      assert.equal(getNextTabHotspot(first, true), last);
      assert.equal(getNextTabHotspot(last, false), first);
    });

    it('getNextSpatialHotspot navega coherentemente en las cuatro direcciones', () => {
      // Desde el espejo: arriba va al cáliz, abajo a papeles, izquierda a vela
      assert.equal(getNextSpatialHotspot('hotspot_mirror', 'up'), 'hotspot_chalice');
      assert.equal(getNextSpatialHotspot('hotspot_mirror', 'down'), 'hotspot_identity_papers');
      assert.equal(getNextSpatialHotspot('hotspot_mirror', 'left'), 'hotspot_candle');

      // Desde el corcho: izquierda va al cáliz
      assert.equal(getNextSpatialHotspot('hotspot_corkboard', 'left'), 'hotspot_chalice');

      // Desde el cáliz: abajo va al espejo
      assert.equal(getNextSpatialHotspot('hotspot_chalice', 'down'), 'hotspot_mirror');
    });

    it('todos los vecinos del grafo de adyacencia son IDs de hotspots canónicos válidos', () => {
      for (const [sourceId, directions] of Object.entries(SPATIAL_ADJACENCY_GRAPH)) {
        assert.ok(sourceId in CANONICAL_HOTSPOTS, `Fuente desconocida: ${sourceId}`);
        for (const [dir, targetId] of Object.entries(directions)) {
          assert.ok(
            targetId in CANONICAL_HOTSPOTS,
            `Destino desconocido ${targetId} en dirección ${dir} desde ${sourceId}`
          );
        }
      }
    });
  });

  describe('4. Auditoría Constitucional de Hotspots (Ley de Prosa y Accesibilidad)', () => {
    it('todos los 11 hotspots cumplen con restingLabel <= 7 palabras', () => {
      for (const [id, hotspot] of Object.entries(CANONICAL_HOTSPOTS)) {
        const words = hotspot.restingLabel.trim().split(/\s+/);
        assert.ok(
          words.length <= 7,
          `Hotspot ${id} viola límite de 7 palabras: "${hotspot.restingLabel}" (${words.length} palabras)`
        );
      }
    });

    it('cero términos mecánicos o números de sistema en etiquetas de reposo', () => {
      const mechanicalPatterns = [
        /\bhp\b/i,
        /\bsp\b/i,
        /\bap\b/i,
        /\bsanidad\s*:\s*\d+/i,
        /\bcorrupci[oó]n\s*:\s*\d+/i,
        /\bruina\s*:\s*\d+/i,
        /\+\d+/,
        /-\d+/,
        /\d+%/
      ];

      for (const [id, hotspot] of Object.entries(CANONICAL_HOTSPOTS)) {
        for (const pattern of mechanicalPatterns) {
          assert.equal(
            pattern.test(hotspot.restingLabel),
            false,
            `Hotspot ${id} contiene patrón mecánico prohibido "${pattern}": ${hotspot.restingLabel}`
          );
        }
      }
    });

    it('todos los hotspots tienen dimensiones válidas para hit area (width >= 44, height >= 44)', () => {
      for (const [id, hotspot] of Object.entries(CANONICAL_HOTSPOTS)) {
        assert.ok(
          hotspot.bounds.width >= 44,
          `Hotspot ${id} width ${hotspot.bounds.width} < 44px`
        );
        assert.ok(
          hotspot.bounds.height >= 44,
          `Hotspot ${id} height ${hotspot.bounds.height} < 44px`
        );
      }
    });

    it('todos los presets de cámara asignados existen en CAMERA_PRESETS', () => {
      for (const [id, hotspot] of Object.entries(CANONICAL_HOTSPOTS)) {
        assert.ok(
          hotspot.cameraPreset in CAMERA_PRESETS,
          `Hotspot ${id} referencia un cameraPreset desconocido: ${hotspot.cameraPreset}`
        );
      }
    });
  });

});

