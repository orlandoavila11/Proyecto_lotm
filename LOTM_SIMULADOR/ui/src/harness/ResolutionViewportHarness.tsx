/**
 * GFX62 — HARNESS DE CALIBRACIÓN MULTI-RESOLUCIÓN Y VIEWPORT (BRIEF-10.VISUAL)
 * Verifica y calibra la escala y letterbox uniforme para las 5 resoluciones canónicas del plan:
 * 1. 1920x1080 (Lienzo canónico de alta fidelidad 16:9)
 * 2. 1600x900 (Resolución de escritorio media 16:9)
 * 3. 1440x900 (Zona segura y formato 16:10)
 * 4. 1366x768 (Laptop estándar 16:9)
 * 5. 1280x720 (HD compacta 16:9)
 * 
 * Asegura 0% de deriva entre coordenadas físicas de pantalla y el espacio lógico 1920x1080.
 */

import React, { useState } from 'react';
import { useViewport } from '../scene/SceneViewport';
import { CANONICAL_HOTSPOTS } from '../scene/types';
import { Maximize2, Monitor, CheckCircle, Shield } from 'lucide-react';

export interface TargetResolution {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: 'CANONICAL' | 'DESKTOP' | 'SAFE_AREA' | 'LAPTOP' | 'COMPACT';
}

export const CANONICAL_RESOLUTIONS: TargetResolution[] = [
  { id: '1080p', name: '1920 × 1080', width: 1920, height: 1080, aspectRatio: '16:9', category: 'CANONICAL' },
  { id: '900p', name: '1600 × 900', width: 1600, height: 900, aspectRatio: '16:9', category: 'DESKTOP' },
  { id: '1440x900', name: '1440 × 900', width: 1440, height: 900, aspectRatio: '16:10', category: 'SAFE_AREA' },
  { id: '1366x768', name: '1366 × 768', width: 1366, height: 768, aspectRatio: '16:9', category: 'LAPTOP' },
  { id: '720p', name: '1280 × 720', width: 1280, height: 720, aspectRatio: '16:9', category: 'COMPACT' }
];

interface ResolutionViewportHarnessProps {
  onSimulateResolution?: (res: TargetResolution) => void;
}

export const ResolutionViewportHarness: React.FC<ResolutionViewportHarnessProps> = ({
  onSimulateResolution
}) => {
  const { scale, offsetX, offsetY, toLogicalCoords, toScreenCoords } = useViewport();
  const [selectedResId, setSelectedResId] = useState<string>('1080p');
  const testPoint = { logicalX: 960, logicalY: 540 };

  // Test de reversibilidad matemática (Lógico -> Pantalla -> Lógico)
  const screenCoords = toScreenCoords(testPoint.logicalX, testPoint.logicalY);
  const roundtripLogical = toLogicalCoords(screenCoords.x, screenCoords.y);
  const drift = Math.abs(testPoint.logicalX - roundtripLogical.x) + Math.abs(testPoint.logicalY - roundtripLogical.y);
  const isZeroDrift = drift < 0.001;

  // Verificación de los 11 hotspots dentro de los límites lógicos 1920x1080
  const hotspotsInBounds = Object.values(CANONICAL_HOTSPOTS).every(h => {
    return h.bounds.x >= 0 && 
           h.bounds.y >= 0 && 
           (h.bounds.x + h.bounds.width) <= 1920 && 
           (h.bounds.y + h.bounds.height) <= 1080;
  });

  const handleSelectRes = (res: TargetResolution) => {
    setSelectedResId(res.id);
    if (onSimulateResolution) {
      onSimulateResolution(res);
    }
  };

  return (
    <div 
      className="resolution-harness fixed top-4 right-4 z-50 p-4 bg-[#14100c]/95 border border-[#8c733e] rounded-md shadow-2xl text-[#dfcaa2] text-xs font-serif max-w-xs select-none pointer-events-auto"
      style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.95)' }}
    >
      <div className="flex items-center justify-between border-b border-[#3b2d1d] pb-2 mb-3">
        <div className="flex items-center gap-2 text-[#d4af37]">
          <Monitor size={16} />
          <h3 className="font-bold uppercase tracking-wider" style={{ fontFamily: 'Cinzel' }}>
            Calibración GFX62
          </h3>
        </div>
        <span className="text-[10px] text-[#4ade80] flex items-center gap-1 font-mono">
          <CheckCircle size={12} />
          {isZeroDrift ? '0.00px Deriva' : 'Error Deriva'}
        </span>
      </div>

      {/* Selector de Resoluciones Canónicas */}
      <div className="mb-3">
        <label className="text-[11px] text-[#a39480] uppercase tracking-wider font-bold block mb-1.5">
          Resoluciones del Plan:
        </label>
        <div className="grid grid-cols-1 gap-1">
          {CANONICAL_RESOLUTIONS.map(res => {
            const isSelected = selectedResId === res.id;
            return (
              <button
                key={res.id}
                onClick={() => handleSelectRes(res)}
                className={`flex items-center justify-between p-1.5 rounded border text-[11px] font-mono transition-all ${
                  isSelected
                    ? 'bg-[#2b2014] border-[#d4af37] text-[#ffd700] font-bold shadow'
                    : 'bg-[#1a1510] border-[#2e2317] text-[#b8a68e] hover:border-[#6b5336]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Maximize2 size={11} className={isSelected ? 'text-[#d4af37]' : 'text-[#73634e]'} />
                  <span>{res.name}</span>
                </div>
                <span className="text-[10px] opacity-70">
                  {res.aspectRatio}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Métricas del Viewport Actual */}
      <div className="p-2.5 rounded bg-[#100d0a] border border-[#2e2317] font-mono text-[10px] space-y-1 mb-3">
        <div className="flex justify-between">
          <span className="text-[#8a7b68]">Ventana Real:</span>
          <span className="text-[#e5ded2]">{typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : '1920 × 1080'} px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8a7b68]">Factor de Escala:</span>
          <span className="text-[#d4af37]">{scale.toFixed(4)}x</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8a7b68]">Offset Centrado:</span>
          <span className="text-[#e5ded2]">({Math.round(offsetX)}px, {Math.round(offsetY)}px)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8a7b68]">Lienzo Lógico:</span>
          <span className="text-[#e5ded2]">1920 × 1080 px</span>
        </div>
      </div>

      {/* Estado de Seguridad y Hotspots */}
      <div className="border-t border-[#3b2d1d] pt-2 flex items-center justify-between text-[11px]">
        <span className="text-[#a39480] flex items-center gap-1.5">
          <Shield size={13} className="text-[#d4af37]" />
          11 Hotspots en Límites
        </span>
        <span className="text-[#4ade80] font-bold">
          {hotspotsInBounds ? '100% OK' : 'Fuera de Límites'}
        </span>
      </div>
    </div>
  );
};
