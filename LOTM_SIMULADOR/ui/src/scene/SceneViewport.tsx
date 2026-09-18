/**
 * VIEWPORT DE ESCENA UNIFORME 1920x1080 — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 * Escala uniforme 16:9, letterbox/pillarbox, transformaciones de coordenadas y navegación por teclado.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from './navigation/NavigationContext';
import { 
  SPATIAL_TAB_ORDER, 
  getNextSpatialHotspot, 
  getNextTabHotspot 
} from './spatialNavigation';
import type { HotspotId } from './types';

export const LOGICAL_WIDTH = 1920;
export const LOGICAL_HEIGHT = 1080;
export const SAFE_WIDTH = 1440;
export const SAFE_HEIGHT = 900;

interface ViewportContextValue {
  scale: number;
  offsetX: number;
  offsetY: number;
  toLogicalCoords: (clientX: number, clientY: number) => { x: number; y: number };
  toScreenCoords: (logicX: number, logicY: number) => { x: number; y: number };
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

export function useViewport(): ViewportContextValue {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport debe usarse dentro de un SceneViewport');
  }
  return context;
}

interface SceneViewportProps {
  children: React.ReactNode;
  debugOverlay?: boolean;
}

export const SceneViewport: React.FC<SceneViewportProps> = ({
  children,
  debugOverlay = false
}) => {
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const { state, focusHotspot, openInspection, closeInspection, backToDesk, toggleAttention } = useNavigation();

  // Cálculo de Escala Uniforme y Letterboxing
  const updateDimensions = useCallback(() => {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    const s = Math.min(windowW / LOGICAL_WIDTH, windowH / LOGICAL_HEIGHT);
    const ox = (windowW - LOGICAL_WIDTH * s) / 2;
    const oy = (windowH - LOGICAL_HEIGHT * s) / 2;

    setScale(s);
    setOffsetX(ox);
    setOffsetY(oy);
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Transformaciones de Coordenadas
  const toLogicalCoords = useCallback((clientX: number, clientY: number) => {
    return {
      x: (clientX - offsetX) / scale,
      y: (clientY - offsetY) / scale
    };
  }, [offsetX, offsetY, scale]);

  const toScreenCoords = useCallback((logicX: number, logicY: number) => {
    return {
      x: logicX * scale + offsetX,
      y: logicY * scale + offsetY
    };
  }, [offsetX, offsetY, scale]);

  // Gestor Central de Teclado (Flechas, Tab, Escape, A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input o textarea
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      // Tecla A: Alternar Modo Atención
      if (e.key === 'a' || e.key === 'A') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          toggleAttention();
          return;
        }
      }

      // Tecla Escape: Cerrar o Volver
      if (e.key === 'Escape') {
        e.preventDefault();
        if (state.currentView === 'INSPECTION_LAYER') {
          closeInspection();
        } else if (state.currentView !== 'DESK_WIDE') {
          backToDesk();
        }
        return;
      }

      // Si estamos en un modal o etapa ajena al desván, dejar que el modal maneje el foco
      if (state.currentView === 'INSPECTION_LAYER') {
        return;
      }

      // Navegación Secuencial con Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        const nextId = getNextTabHotspot(state.focusedHotspotId, e.shiftKey);
        focusHotspot(nextId);
        const el = document.getElementById(nextId);
        el?.focus();
        return;
      }

      // Navegación Espacial con Flechas
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
        const currentId = state.focusedHotspotId ?? SPATIAL_TAB_ORDER[0];
        let direction: 'up' | 'down' | 'left' | 'right' = 'right';
        if (e.key === 'ArrowUp') direction = 'up';
        if (e.key === 'ArrowDown') direction = 'down';
        if (e.key === 'ArrowLeft') direction = 'left';
        if (e.key === 'ArrowRight') direction = 'right';

        const nextId = getNextSpatialHotspot(currentId as HotspotId, direction);
        if (nextId) {
          focusHotspot(nextId);
          const el = document.getElementById(nextId);
          el?.focus();
        }
        return;
      }

      // Activación con Enter o Espacio sobre el hotspot enfocado si no tiene el foco HTML
      if (e.key === 'Enter' || e.key === ' ') {
        if (state.focusedHotspotId && document.activeElement?.id !== state.focusedHotspotId) {
          e.preventDefault();
          openInspection(state.focusedHotspotId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.currentView, 
    state.focusedHotspotId, 
    focusHotspot, 
    openInspection, 
    closeInspection, 
    backToDesk, 
    toggleAttention
  ]);

  return (
    <ViewportContext.Provider value={{ scale, offsetX, offsetY, toLogicalCoords, toScreenCoords }}>
      <div
        ref={containerRef}
        className="relative w-screen h-screen overflow-hidden bg-[#090807] flex items-center justify-center select-none"
      >
        {/* Lienzo Lógico 1920x1080 Escalado Proporcionalmente */}
        <div
          id="scene-logical-canvas"
          className="relative overflow-hidden shadow-2xl bg-[#090807]"
          style={{
            width: `${LOGICAL_WIDTH}px`,
            height: `${LOGICAL_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            flexShrink: 0
          }}
        >
          {children}

          {/* Overlay de Debug / Guías de Safe Area */}
          {debugOverlay && (
            <div
              className="absolute pointer-events-none border border-dashed border-[#d4af37]/30 z-50 flex items-center justify-center text-[10px] text-[#d4af37]/50 font-serif"
              style={{
                left: `${(LOGICAL_WIDTH - SAFE_WIDTH) / 2}px`,
                top: `${(LOGICAL_HEIGHT - SAFE_HEIGHT) / 2}px`,
                width: `${SAFE_WIDTH}px`,
                height: `${SAFE_HEIGHT}px`
              }}
            >
              <div className="absolute top-2 left-2">Zona Segura Canónica (1440x900)</div>
              <div className="absolute bottom-2 right-2">Escala: {scale.toFixed(3)}x</div>
            </div>
          )}
        </div>
      </div>
    </ViewportContext.Provider>
  );
};

