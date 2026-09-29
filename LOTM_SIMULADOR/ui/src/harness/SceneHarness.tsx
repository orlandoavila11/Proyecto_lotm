/**
 * HARNESS DE PRUEBAS DE ESCENA — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 * Entorno de pruebas determinista para validar cámara, hotspots, coordenadas, teclado y viewports.
 */

import React, { useState } from 'react';
import { useNavigation } from '../scene/navigation/NavigationContext';
import { useViewport } from '../scene/SceneViewport';
import { 
  CAMERA_PRESETS, 
  CANONICAL_HOTSPOTS, 
  type CameraPresetId, 
  type HotspotId 
} from '../scene/types';

export const FOOL_SEER_FIXTURE = {
  id: 'char_fixture_fool_01',
  name: 'Adrian Vance',
  pathwayId: 'FOOL',
  pathwayName: 'The Fool',
  sequence: 9,
  sequenceTitle: 'Vidente',
  originId: 'NOTARY_CLERK',
  originTitle: 'Escribiente Notarial',
  district: 'North Borough',
  profession: 'Escribiente Notarial en Hillston',
  walletText: '12 £, 14 s',
  actingCoherence: 'COHERENTE' as const,
  actingFeedback: 'Tus interpretaciones guardan prudente correspondencia con el misterio.',
  actingDiary: [
    {
      id: 'diary_init_01',
      day: 2,
      principle: 'El Vidente interpreta el destino, pero no interviene en sus hilos.',
      choiceTaken: 'Mantuviste el velo y evitaste advertir de la ruina inminente.',
      narrativeOutcome: 'La poción asimiló parte de los principios arcanos.'
    }
  ],
  initialBurden: {
    type: 'DEUDA' as const,
    description: 'Pagaré por la fianza de los estudios notariales.',
    details: '28 libras adeudadas a la casa prestamista de Hillston.'
  },
  somatics: {
    sanityTier: 'BRILLANTE' as const,
    corruptionTier: 'AZOGUE_LIMPIO' as const,
    ruinaTier: 'INTEGRO' as const,
    candleDescription: 'Llama viva y clara sobre peltre.',
    mirrorDescription: 'El azogue refleja tu semblante humano.',
    woodDescription: 'Hendidura oscura tallada en la esquina.'
  },
  anchors: [
    { id: 'anchor_1', tipo: 'rutina' as const, nombre: 'El reloj de plata de mi abuelo', descripcion: 'Objeto de familia que marca las campanadas de Hillston.', fuerza: 'FIRME' as const },
    { id: 'anchor_2', tipo: 'persona' as const, nombre: 'Correspondencia con la Srta. Wendy', descripcion: 'Misivas dominicales que mantienen viva tu empatía civil.', fuerza: 'FIRME' as const },
    { id: 'anchor_3', tipo: 'rol' as const, nombre: 'El libro de cuentas de la notaría', descripcion: 'Asientos contables y sellos notariales de la vida diaria.', fuerza: 'TENUE' as const }
  ],
  policeSuspicionText: 'Sin sospechas policiales en tu vecindario.',
  churchSuspicionText: 'Los clérigos de la Iglesia de la Medianoche no han posado sus ojos en ti.'
};

export const VISIONARY_SPECTATOR_FIXTURE = {
  id: 'char_fixture_visionary_01',
  name: 'Audrey Hall-Smith',
  pathwayId: 'VISIONARY',
  pathwayName: 'Visionary',
  sequence: 9,
  sequenceTitle: 'Espectador',
  originId: 'MEDICINE_STUDENT',
  originTitle: 'Estudiante de Medicina',
  district: 'Cherwood Borough',
  profession: 'Practicante en el Hospital de Caridad',
  walletText: '8 £, 10 s',
  actingCoherence: 'TENSO' as const,
  actingFeedback: 'Observas con atención, pero las emociones ajenas turban tu compostura.',
  actingDiary: [],
  initialBurden: {
    type: 'SECRETO' as const,
    description: 'Cadáver desaparecido de la sala de disección del hospital.',
    details: 'Podrías ser expulsado del cuerpo médico si se descubre tu silencio.'
  },
  somatics: {
    sanityTier: 'VACILANTE' as const,
    corruptionTier: 'VAHO_TENUE' as const,
    ruinaTier: 'MARCADO' as const,
    candleDescription: 'La llama oscila inquieta contra sombras.',
    mirrorDescription: 'Sombras tenues flotan tras tu reflejo.',
    woodDescription: 'Hendidura oscura tallada en la esquina.'
  },
  anchors: [
    { id: 'anchor_1', tipo: 'rutina' as const, nombre: 'El maletín de anatomía', descripcion: 'Instrumental quirúrgico que evoca el deber civil de sanar.', fuerza: 'FIRME' as const },
    { id: 'anchor_2', tipo: 'rol' as const, nombre: 'La libreta de observaciones clínicas', descripcion: 'Anotaciones metódicas sobre pacientes de Cherwood.', fuerza: 'TENUE' as const },
    { id: 'anchor_3', tipo: 'persona' as const, nombre: 'El hermano menor en Backlund', descripcion: 'Vínculo fraternal que te ancla a la realidad humana.', fuerza: 'QUEBRADIZA' as const }
  ],
  policeSuspicionText: 'Patrullas nocturnas observan los alrededores del hospital.',
  churchSuspicionText: 'Un sacerdote de la Iglesia de la Tormenta visita con frecuencia la sala de guardia.'
};

export const SceneHarness: React.FC = () => {
  const { state, setCameraPreset, toggleAttention, focusHotspot, openInspection } = useNavigation();
  const { scale, offsetX, offsetY, toLogicalCoords } = useViewport();

  const [mouseLogical, setMouseLogical] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeFixture, setActiveFixture] = useState<'FOOL' | 'VISIONARY'>('FOOL');

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = toLogicalCoords(e.clientX, e.clientY);
    setMouseLogical({
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    });
  };

  const currentFixture = activeFixture === 'FOOL' ? FOOL_SEER_FIXTURE : VISIONARY_SPECTATOR_FIXTURE;

  return (
    <div 
      style={{ 
        position: 'absolute',
        top: '16px',
        left: '16px',
        width: '320px',
        backgroundColor: 'rgba(18, 14, 11, 0.96)',
        border: '2px solid #8c733e',
        borderRadius: '6px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.9)',
        padding: '12px',
        color: '#ede4d1',
        fontFamily: 'EB Garamond, Georgia, serif',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100, 
        pointerEvents: 'auto' 
      }}
      className="pointer-events-auto"
      onMouseMove={handleMouseMove}
    >
      <div className="flex items-center justify-between border-b border-[#8c733e]/50 pb-2">
        <span className="font-bold cinzel text-[#d4af37] text-sm">Harness de Escena (R2)</span>
        <span className="text-[10px] text-[#8c7d6b]">Fixtures Deterministas</span>
      </div>

      {/* Selector de Fixture Canónico */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold text-[#d4af37]">Personaje Fixture:</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveFixture('FOOL')}
            className={`px-2 py-1 rounded border text-[11px] ${
              activeFixture === 'FOOL'
                ? 'bg-[#1e293b] text-[#38bdf8] border-[#38bdf8]'
                : 'bg-[#1c1813] text-[#968c7e] border-[#383024]'
            }`}
          >
            Fool (Vidente)
          </button>
          <button
            type="button"
            onClick={() => setActiveFixture('VISIONARY')}
            className={`px-2 py-1 rounded border text-[11px] ${
              activeFixture === 'VISIONARY'
                ? 'bg-[#2e1065] text-[#c084fc] border-[#c084fc]'
                : 'bg-[#1c1813] text-[#968c7e] border-[#383024]'
            }`}
          >
            Visionary (Espectador)
          </button>
        </div>
        <span className="text-[10px] italic text-[#a3947f]">
          {currentFixture.name} · {currentFixture.profession}
        </span>
      </div>

      {/* Presets de Cámara 2.5D */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold text-[#d4af37]">Cámara 2.5D (Preset):</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((presetId) => (
            <button
              key={presetId}
              id={`btn-preset-${presetId}`}
              type="button"
              onClick={() => setCameraPreset(presetId)}
              className={`px-2 py-1 rounded border text-[10px] font-mono truncate ${
                state.activeCameraPreset === presetId
                  ? 'bg-[#d4af37] text-[#090807] font-bold border-[#d4af37]'
                  : 'bg-[#1c1813] text-[#a89b88] border-[#383024] hover:border-[#8c733e]'
              }`}
            >
              {presetId.replace('FOCUS_', '').replace('WIDE_', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Modos y Estados de Escena */}
      <div className="flex flex-col gap-1 border-t border-[#8c733e]/30 pt-2">
        <div className="flex justify-between items-center">
          <span>Modo Atención (Tecla A):</span>
          <button
            type="button"
            onClick={toggleAttention}
            className={`px-2 py-0.5 rounded text-[10px] border ${
              state.isAttentionModeActive 
                ? 'bg-[#851c22] text-[#fff] border-[#d4af37]' 
                : 'bg-[#241e17] text-[#968c7e] border-[#383024]'
            }`}
          >
            {state.isAttentionModeActive ? 'ACTIVO' : 'REPOSO'}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span>Vista Actual:</span>
          <span className="font-mono text-[#d4af37]">{state.currentView}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Foco Teclado:</span>
          <span className="font-mono text-[#a89b88] truncate max-w-[140px]">
            {state.focusedHotspotId ?? 'ninguno'}
          </span>
        </div>
      </div>

      {/* Inspector de Coordenadas Lógicas */}
      <div className="border-t border-[#8c733e]/30 pt-2 flex flex-col gap-0.5 text-[10px] font-mono text-[#8c7d6b]">
        <div>Escala Viewport: {scale.toFixed(4)}x</div>
        <div>Offset: ({Math.round(offsetX)}px, {Math.round(offsetY)}px)</div>
        <div className="text-[#d4af37]">
          Cursor Lógico: ({mouseLogical.x}, {mouseLogical.y}) / 1920x1080
        </div>
      </div>

      {/* Lista Rápida de Hotspots para Prueba */}
      <div className="border-t border-[#8c733e]/30 pt-2 flex flex-col gap-1">
        <label className="text-[10px] font-bold text-[#d4af37]">Foco directo a Hotspot:</label>
        <select
          aria-label="Seleccionar Hotspot para probar foco"
          value={state.focusedHotspotId ?? ''}
          onChange={(e) => {
            const id = e.target.value as HotspotId;
            focusHotspot(id);
            openInspection(id);
          }}
          className="bg-[#1a1612] text-[#ede4d1] border border-[#523d24] text-[10px] p-1 rounded"
        >
          <option value="">-- Seleccionar Hotspot --</option>
          {Object.values(CANONICAL_HOTSPOTS).map((h) => (
            <option key={h.id} value={h.id}>
              {h.accessibleName} ({h.bounds.x}, {h.bounds.y})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
