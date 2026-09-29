/**
 * CONTEXTO DE NAVEGACIÓN DE ESCENA — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import type { 
  SceneNavigationState, 
  NavigationAction, 
  NavigationState, 
  HotspotId, 
  CameraPresetId 
} from '../types';
import { 
  sceneNavigationReducer, 
  INITIAL_NAVIGATION_STATE 
} from './navigationReducer';

interface NavigationContextValue {
  state: SceneNavigationState;
  dispatch: React.Dispatch<NavigationAction>;
  navigateTo: (view: NavigationState, cameraPreset?: CameraPresetId, hotspotId?: HotspotId, data?: unknown) => void;
  openInspection: (hotspotId: HotspotId, data?: unknown) => void;
  closeInspection: () => void;
  backToDesk: () => void;
  toggleAttention: () => void;
  setAttention: (active: boolean) => void;
  toggleSpiritVision: () => void;
  setPending: (pending: boolean) => void;
  setCameraPreset: (preset: CameraPresetId) => void;
  focusHotspot: (hotspotId: HotspotId | null) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export interface NavigationProviderProps {
  children: React.ReactNode;
  initialState?: Partial<SceneNavigationState>;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialState 
}) => {
  const [state, dispatch] = useReducer(
    sceneNavigationReducer,
    { ...INITIAL_NAVIGATION_STATE, ...initialState }
  );

  const navigateTo = useCallback((
    view: NavigationState, 
    cameraPreset?: CameraPresetId, 
    hotspotId?: HotspotId, 
    data?: unknown
  ) => {
    dispatch({ type: 'NAVIGATE_TO', view, cameraPreset, hotspotId, inspectedData: data });
  }, []);

  const openInspection = useCallback((hotspotId: HotspotId, data?: unknown) => {
    dispatch({ type: 'OPEN_INSPECTION', hotspotId, data });
  }, []);

  const closeInspection = useCallback(() => {
    dispatch({ type: 'CLOSE_INSPECTION' });
  }, []);

  const backToDesk = useCallback(() => {
    dispatch({ type: 'BACK_TO_DESK' });
  }, []);

  const toggleAttention = useCallback(() => {
    dispatch({ type: 'TOGGLE_ATTENTION' });
  }, []);

  const setAttention = useCallback((active: boolean) => {
    dispatch({ type: 'SET_ATTENTION', active });
  }, []);

  const toggleSpiritVision = useCallback(() => {
    dispatch({ type: 'TOGGLE_SPIRIT_VISION' });
  }, []);

  const setPending = useCallback((pending: boolean) => {
    dispatch({ type: 'SET_OPERATION_PENDING', pending });
  }, []);

  const setCameraPreset = useCallback((preset: CameraPresetId) => {
    dispatch({ type: 'SET_CAMERA_PRESET', preset });
  }, []);

  const focusHotspot = useCallback((hotspotId: HotspotId | null) => {
    dispatch({ type: 'FOCUS_HOTSPOT', hotspotId });
  }, []);

  const value = useMemo<NavigationContextValue>(() => ({
    state,
    dispatch,
    navigateTo,
    openInspection,
    closeInspection,
    backToDesk,
    toggleAttention,
    setAttention,
    toggleSpiritVision,
    setPending,
    setCameraPreset,
    focusHotspot
  }), [
    state, 
    navigateTo, 
    openInspection, 
    closeInspection, 
    backToDesk, 
    toggleAttention, 
    setAttention, 
    toggleSpiritVision, 
    setPending, 
    setCameraPreset, 
    focusHotspot
  ]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation debe ser utilizado dentro de un NavigationProvider');
  }
  return context;
}

