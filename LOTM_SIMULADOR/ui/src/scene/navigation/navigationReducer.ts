/**
 * MÁQUINA DE NAVEGACIÓN CENTRAL — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 * Reducer puro determinista con guardias de transición e historial de foco.
 */

import type {
  SceneNavigationState,
  NavigationAction,
  NavigationState
} from '../types';

export const INITIAL_NAVIGATION_STATE: SceneNavigationState = {
  currentView: 'DESK_WIDE',
  activeCameraPreset: 'WIDE_OVERVIEW',
  activeHotspotId: null,
  focusedHotspotId: 'hotspot_mirror',
  inspectedData: null,
  isAttentionModeActive: false,
  isSpiritVisionActive: false,
  isPendingOperation: false,
  focusHistory: []
};

/**
 * Matriz de Transiciones Válidas de la Máquina de Estados
 */
const VALID_TRANSITIONS: Record<NavigationState, NavigationState[]> = {
  DESK_WIDE: ['DESK_FOCUS', 'INSPECTION_LAYER', 'CORKBOARD_STAGE', 'COMBAT_STAGE', 'CEREMONY_STAGE', 'CALENDAR_STAGE', 'MARKET_STAGE', 'ACTING_STAGE'],
  DESK_FOCUS: ['DESK_WIDE', 'INSPECTION_LAYER', 'CORKBOARD_STAGE', 'COMBAT_STAGE', 'CEREMONY_STAGE', 'CALENDAR_STAGE', 'MARKET_STAGE', 'ACTING_STAGE'],
  INSPECTION_LAYER: ['DESK_WIDE', 'DESK_FOCUS'],
  CORKBOARD_STAGE: ['DESK_WIDE', 'DESK_FOCUS'],
  COMBAT_STAGE: ['DESK_WIDE', 'DESK_FOCUS'],
  CEREMONY_STAGE: ['DESK_WIDE', 'DESK_FOCUS'],
  CALENDAR_STAGE: ['DESK_WIDE', 'DESK_FOCUS'],
  MARKET_STAGE: ['DESK_WIDE', 'DESK_FOCUS'],
  ACTING_STAGE: ['DESK_WIDE', 'DESK_FOCUS']
};

export function isValidTransition(from: NavigationState, to: NavigationState): boolean {
  if (from === to) return true;
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function sceneNavigationReducer(
  state: SceneNavigationState,
  action: NavigationAction
): SceneNavigationState {
  // Guardia contra doble despacho durante operaciones asíncronas pendientes
  if (state.isPendingOperation && action.type !== 'SET_OPERATION_PENDING') {
    return state;
  }

  switch (action.type) {
    case 'SET_CAMERA_PRESET': {
      return {
        ...state,
        activeCameraPreset: action.preset
      };
    }

    case 'FOCUS_HOTSPOT': {
      return {
        ...state,
        focusedHotspotId: action.hotspotId
      };
    }

    case 'NAVIGATE_TO': {
      if (!isValidTransition(state.currentView, action.view)) {
        console.warn(`[Navigation] Transición inválida rechazada: ${state.currentView} -> ${action.view}`);
        return state;
      }

      const nextHistory = state.activeHotspotId
        ? [...state.focusHistory, state.activeHotspotId]
        : state.focusHistory;

      return {
        ...state,
        currentView: action.view,
        activeCameraPreset: action.cameraPreset ?? state.activeCameraPreset,
        activeHotspotId: action.hotspotId ?? state.activeHotspotId,
        focusedHotspotId: action.hotspotId ?? state.focusedHotspotId,
        inspectedData: action.inspectedData ?? null,
        focusHistory: nextHistory
      };
    }

    case 'OPEN_INSPECTION': {
      if (!isValidTransition(state.currentView, 'INSPECTION_LAYER')) {
        console.warn(`[Navigation] No se puede abrir inspección desde: ${state.currentView}`);
        return state;
      }

      const nextHistory = [...state.focusHistory, action.hotspotId];

      return {
        ...state,
        currentView: 'INSPECTION_LAYER',
        activeHotspotId: action.hotspotId,
        focusedHotspotId: action.hotspotId,
        inspectedData: action.data ?? null,
        focusHistory: nextHistory
      };
    }

    case 'CLOSE_INSPECTION': {
      if (state.currentView !== 'INSPECTION_LAYER') {
        return state;
      }

      const historyCopy = [...state.focusHistory];
      const previousHotspot = historyCopy.pop() ?? null;

      return {
        ...state,
        currentView: 'DESK_WIDE',
        activeCameraPreset: 'WIDE_OVERVIEW',
        activeHotspotId: null,
        focusedHotspotId: previousHotspot ?? state.focusedHotspotId,
        inspectedData: null,
        focusHistory: historyCopy
      };
    }

    case 'BACK_TO_DESK': {
      const historyCopy = [...state.focusHistory];
      const restoredHotspot = historyCopy.pop() ?? null;

      return {
        ...state,
        currentView: 'DESK_WIDE',
        activeCameraPreset: 'WIDE_OVERVIEW',
        activeHotspotId: null,
        focusedHotspotId: restoredHotspot ?? state.focusedHotspotId,
        inspectedData: null,
        focusHistory: historyCopy
      };
    }

    case 'TOGGLE_ATTENTION': {
      return {
        ...state,
        isAttentionModeActive: !state.isAttentionModeActive
      };
    }

    case 'SET_ATTENTION': {
      return {
        ...state,
        isAttentionModeActive: action.active
      };
    }

    case 'TOGGLE_SPIRIT_VISION': {
      return {
        ...state,
        isSpiritVisionActive: !state.isSpiritVisionActive
      };
    }

    case 'SET_OPERATION_PENDING': {
      return {
        ...state,
        isPendingOperation: action.pending
      };
    }

    default:
      return state;
  }
}
