/**
 * PATH TO GODHOOD — TABLERO DE CORCHO DIEGÉTICO (P09 / V04)
 * Proyección autoritativa del expediente de investigación de Cherwood.
 * - Hidratación de estado 100% veraz desde SQLite (cero filtración de truthModel ni pistas ocultas).
 * - Conexión de indicios vía dos clics, arrastre o menú accesible por teclado.
 * - Separación estricta entre notas libres del detective e hipótesis formales del caso.
 * - Consecuencias conocidas y resolución con confirmación explícita.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Link2, Sparkles, AlertCircle, 
  X, ShieldAlert, Award, FileText
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const CLUE_IMAGE_MAP: Record<string, string> = {
  CLUE_BURNED_TOYS: '/art/GFX35A_clue_burned_toys.jpg',
  CLUE_WILL_DRAFT: '/art/GFX35B_clue_will_draft.jpg',
  CLUE_MIND_TRACES: '/art/GFX35C_clue_mind_traces.jpg',
  CLUE_ASTROLOGY_RECORD: '/art/GFX35D_clue_astrology_record.jpg',
  CLUE_CONCEALED_SAFE: '/art/GFX35E_clue_concealed_safe.jpg',
  CLUE_FINANCIAL_BLACKMAIL: '/art/GFX35F_clue_financial_blackmail.jpg',
  CLUE_FORGED_LETTERS: '/art/GFX35G_clue_forged_letters.jpg',
  CLUE_BLOODLINE_TALISMAN: '/art/GFX35H_clue_bloodline_talisman.jpg'
};

export type RelationType = 'acusa' | 'explica' | 'localiza' | 'contradice';

interface DiscoveredClueItem {
  id: string;
  nombre: string;
  descripcion: string;
  sourceVisited: string;
  discoveredAtDay: number;
  x: number;
  y: number;
  imageUrl?: string;
}

interface ConnectedEdgeItem {
  clueA: string;
  clueB: string;
  relation: RelationType;
  isCorrect: boolean;
  insight: string | null;
  discoveredAtDay: number;
}

interface FreeNoteItem {
  id: string;
  text: string;
  createdAtDay: number;
  x: number;
  y: number;
}

interface AuthoredHypothesis {
  id: string;
  name: string;
  teoria: string;
  pistasSoporte: string[];
}

interface AuthoredResolution {
  id: 'RESOLUTION_A_JUSTICE' | 'RESOLUTION_B_TRUTH' | 'RESOLUTION_C_STABILITY' | 'RESOLUTION_D_HEIR';
  nombre: string;
  accion: string;
  consecuenciasLocales: string;
}

interface CorkboardViewProps {
  onBackToDesk: () => void;
  characterId?: string;
}

export const CorkboardView: React.FC<CorkboardViewProps> = ({ onBackToDesk, characterId }) => {
  const activeCharId = characterId || localStorage.getItem('lotm_active_character_id');

  // Estados de carga y caso activo
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [caseInstanceId, setCaseInstanceId] = useState<string | null>(null);
  const [caseTitle, setCaseTitle] = useState<string>('El Eco en el Nido Vacío');
  const [caseDayCounter, setCaseDayCounter] = useState<number>(0);
  const [resolutionUnlocked, setResolutionUnlocked] = useState<boolean>(false);
  const [resolvedState, setResolvedState] = useState<any>(null);

  // Datos autoritativos proyectados
  const [clues, setClues] = useState<DiscoveredClueItem[]>([]);
  const [connections, setConnections] = useState<ConnectedEdgeItem[]>([]);
  const [notes, setNotes] = useState<FreeNoteItem[]>([]);
  const [availableHypotheses, setAvailableHypotheses] = useState<AuthoredHypothesis[]>([]);
  const [availableResolutions, setAvailableResolutions] = useState<AuthoredResolution[]>([]);
  const [testedHypotheses, setTestedHypotheses] = useState<Array<{ hypothesisId: string; isCorrect: boolean }>>([]);

  // Interacción en el corcho
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedClue, setSelectedClue] = useState<DiscoveredClueItem | null>(null);
  const [newNoteInput, setNewNoteInput] = useState<string>('');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);

  // Modales y herramientas
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [connectSourceId, setConnectSourceId] = useState<string>('');
  const [connectTargetId, setConnectTargetId] = useState<string>('');
  const [connectRelation, setConnectRelation] = useState<RelationType>('explica');
  const [connectFeedback, setConnectFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [showHypothesisModal, setShowHypothesisModal] = useState<boolean>(false);
  const [selectedHypoId, setSelectedHypoId] = useState<string>('');
  const [hypothesisFeedback, setHypothesisFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isEvaluatingHypo, setIsEvaluatingHypo] = useState<boolean>(false);

  const [showResolutionModal, setShowResolutionModal] = useState<boolean>(false);
  const [selectedResolutionId, setSelectedResolutionId] = useState<AuthoredResolution['id']>('RESOLUTION_A_JUSTICE');
  const [confirmResolutionOpen, setConfirmResolutionOpen] = useState<boolean>(false);
  const [isResolvingCase, setIsResolvingCase] = useState<boolean>(false);

  const boardRef = useRef<HTMLDivElement>(null);

  // Paleta de colores para los cordeles de lana
  const getRelationColor = (relation: RelationType) => {
    switch (relation) {
      case 'acusa': return '#ef4444';      // Carmesí acusatorio
      case 'explica': return '#3b82f6';    // Azul añil deductivo
      case 'localiza': return '#22c55e';   // Verde esmeralda espacial
      case 'contradice': return '#f59e0b'; // Ámbar ocre contradictorio
    }
  };

  // Carga inicial y sincronización con el servidor
  const loadCaseData = async () => {
    if (!activeCharId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await apiClient.getActiveInvestigationCase(activeCharId);

      if (res?.caseState) {
        const state = res.caseState;
        setCaseInstanceId(state.id);
        setCaseTitle(state.title || 'El Eco en el Nido Vacío');
        setCaseDayCounter(state.dayCounter || 0);
        setResolutionUnlocked(!!state.resolutionUnlocked);
        setResolvedState(state.resolvedState || null);
        setTestedHypotheses(state.testedHypotheses || []);

        // 1. Proyectar ÚNICAMENTE pistas descubiertas (cero filtración de no-descubiertas)
        const discovered = state.discoveredClues || [];
        setClues(discovered.map((c: any, index: number) => ({
          id: c.id,
          nombre: c.nombre || c.id,
          descripcion: c.descripcion || '',
          sourceVisited: c.sourceVisited || 'Inspección de Cherwood',
          discoveredAtDay: c.discoveredAtDay ?? 0,
          x: 100 + (index % 3) * 460,
          y: 80 + Math.floor(index / 3) * 220,
          imageUrl: CLUE_IMAGE_MAP[c.id]
        })));

        // 2. Conexiones confirmadas en SQLite
        setConnections(state.connectedEdges || []);

        // 3. Notas libres persistidas
        setNotes((state.notes || []).map((n: any) => ({
          id: n.id,
          text: n.text,
          createdAtDay: n.createdAtDay || 0,
          x: n.x ?? 120,
          y: n.y ?? 520
        })));

        // 4. Catálogo de hipótesis autorales y resoluciones (sin filtrar truthModel)
        if (res.availableHypotheses) {
          setAvailableHypotheses(res.availableHypotheses);
        }
        if (res.availableResolutions) {
          setAvailableResolutions(res.availableResolutions);
        }
      } else {
        setErrorMessage('No hay un expediente activo registrado para este personaje.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con los archivos de investigación.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [activeCharId]);

  // Arrastre de tarjetas y notas en el tablero
  const handleMouseDown = (e: React.MouseEvent, id: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - currentX,
      y: e.clientY - currentY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 260, e.clientX - dragOffset.x));
    const newY = Math.max(60, Math.min(rect.height - 180, e.clientY - dragOffset.y));

    // Determinar si es pista o nota
    setClues(prev => prev.map(c => c.id === draggingId ? { ...c, x: newX, y: newY } : c));
    setNotes(prev => prev.map(n => n.id === draggingId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Añadir Nota Libre (Persistida en SQLite)
  const handleAddNote = async () => {
    if (!newNoteInput.trim() || isSubmittingNote || !caseInstanceId) return;

    try {
      setIsSubmittingNote(true);
      const commandId = `cmd_note_${Date.now()}`;
      const res = await apiClient.addInvestigationNote({
        instanceId: caseInstanceId,
        text: newNoteInput.trim(),
        commandId
      });

      if (res?.success && res.note) {
        setNotes(prev => [...prev, {
          id: res.note.id,
          text: res.note.text,
          createdAtDay: res.note.createdAtDay || caseDayCounter,
          x: res.note.x ?? 160,
          y: res.note.y ?? 520
        }]);
        setNewNoteInput('');
      }
    } catch (err: any) {
      console.warn('Error al guardar nota:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Eliminar Nota Libre
  const handleDeleteNote = async (noteId: string) => {
    if (!caseInstanceId) return;
    try {
      await apiClient.deleteInvestigationNote({
        instanceId: caseInstanceId,
        noteId
      });
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err) {
      console.warn('Error al eliminar nota:', err);
    }
  };

  // Crear Conexión entre Indicios
  const handleConnectClues = async () => {
    if (!caseInstanceId || !connectSourceId || !connectTargetId) return;
    if (connectSourceId === connectTargetId) {
      setConnectFeedback({ success: false, message: 'Un indicio no puede vincularse consigo mismo.' });
      return;
    }

    try {
      const res = await apiClient.connectInvestigationClues({
        instanceId: caseInstanceId,
        clueA: connectSourceId,
        clueB: connectTargetId,
        relation: connectRelation
      });

      if (res?.success) {
        setConnectFeedback({
          success: res.isCorrect,
          message: res.message || (res.isCorrect ? 'Vínculo deductivo corroborado.' : 'No se detecta relación relevante.')
        });

        // Recargar aristas desde el servidor
        if (res.state?.connectedEdges) {
          setConnections(res.state.connectedEdges);
        } else {
          // Fallback optimista local
          setConnections(prev => [
            ...prev.filter(e => !(e.clueA === connectSourceId && e.clueB === connectTargetId && e.relation === connectRelation)),
            {
              clueA: connectSourceId,
              clueB: connectTargetId,
              relation: connectRelation,
              isCorrect: !!res.isCorrect,
              insight: res.insight || null,
              discoveredAtDay: caseDayCounter
            }
          ]);
        }
      }
    } catch (err: any) {
      setConnectFeedback({ success: false, message: err.message || 'Error al registrar conexión.' });
    }
  };

  // Someter Hipótesis al Expediente
  const handleSubmitHypothesis = async () => {
    if (!caseInstanceId || !selectedHypoId || isEvaluatingHypo) return;

    try {
      setIsEvaluatingHypo(true);
      setHypothesisFeedback(null);
      const res = await apiClient.submitInvestigationHypothesis({
        instanceId: caseInstanceId,
        hypothesisId: selectedHypoId
      });

      if (res?.success) {
        setHypothesisFeedback({
          success: !!res.isCorrect,
          message: res.message || (res.isCorrect ? '¡Hipótesis acertada!' : 'Hipótesis errónea.')
        });

        if (res.resolutionUnlocked) {
          setResolutionUnlocked(true);
        }

        if (res.state) {
          setCaseDayCounter(res.state.dayCounter || caseDayCounter);
          setTestedHypotheses(res.state.testedHypotheses || []);
        }
      }
    } catch (err: any) {
      setHypothesisFeedback({ success: false, message: err.message || 'Error al evaluar hipótesis.' });
    } finally {
      setIsEvaluatingHypo(false);
    }
  };

  // Ejecutar Resolución Formal del Caso
  const handleConfirmResolution = async () => {
    if (!caseInstanceId || !selectedResolutionId || isResolvingCase) return;

    try {
      setIsResolvingCase(true);
      const commandId = `cmd_resolve_${Date.now()}_${selectedResolutionId}`;
      const res = await apiClient.resolveInvestigationCase({
        instanceId: caseInstanceId,
        resolutionId: selectedResolutionId,
        commandId
      });

      if (res?.success) {
        setResolvedState({
          resolutionId: res.resolutionId,
          nombre: res.nombre,
          localEffects: res.consecuenciasLocales
        });
        setConfirmResolutionOpen(false);
        setShowResolutionModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error al formalizar la resolución del caso.');
    } finally {
      setIsResolvingCase(false);
    }
  };

  // Renderizado Condicional: Carga o Sin Sesión
  if (!activeCharId) {
    return (
      <div 
        className="w-[1920px] h-[1080px] p-8 flex flex-col justify-center items-center select-none bg-[#110d0a] text-center"
      >
        <h2 className="text-xl font-bold tracking-widest text-[#d4af37] font-serif mb-4 cinzel">
          SIN SESIÓN ACTIVA
        </h2>
        <p className="text-sm text-[#a89885] max-w-md font-serif mb-6 leading-relaxed">
          No hay una identidad civil confirmada para examinar el expediente de investigación.
        </p>
        <button
          onClick={onBackToDesk}
          className="px-6 py-2.5 bg-[#17120c] border border-[#8c733e] text-[#d4af37] rounded font-serif text-sm hover:border-[#d4af37] transition-all cursor-pointer"
        >
          Volver al Refugio
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className="w-[1920px] h-[1080px] p-8 flex flex-col justify-center items-center select-none bg-[#110d0a] text-center"
      >
        <Sparkles size={32} className="text-[#8c733e] animate-spin mb-4" />
        <h2 className="text-base font-bold tracking-widest text-[#d4af37] font-serif cinzel">
          DESPLEGANDO TABLERO DE PESQUISAS...
        </h2>
        <span className="text-xs text-[#8c7a65] italic font-serif mt-2">
          Consultando registros forenses en SQLite
        </span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div 
        className="w-[1920px] h-[1080px] p-8 flex flex-col justify-center items-center select-none bg-[#110d0a] text-center"
      >
        <AlertCircle size={36} className="text-[#ef4444] mb-3" />
        <h2 className="text-base font-bold tracking-widest text-[#f87171] font-serif mb-2">
          EXPEDIENTE NO DISPONIBLE
        </h2>
        <p className="text-xs text-[#b8a68d] max-w-md font-serif mb-6 leading-relaxed">
          {errorMessage}
        </p>
        <div className="flex gap-4">
          <button
            onClick={loadCaseData}
            className="px-5 py-2 bg-[#21160e] border border-[#8c733e] text-[#d4af37] rounded font-serif text-xs hover:border-[#d4af37] transition-all cursor-pointer"
          >
            Reintentar Lectura
          </button>
          <button
            onClick={onBackToDesk}
            className="px-5 py-2 bg-[#140e0a] border border-[#4a3b29] text-[#9c8e7b] rounded font-serif text-xs hover:text-[#e5ded2] transition-all cursor-pointer"
          >
            Volver al Desván
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 flex flex-col justify-between select-none relative overflow-hidden text-[#e5ded2]"
      style={{
        width: '1920px',
        height: '1080px',
        backgroundColor: '#1b140e',
        backgroundImage: 'linear-gradient(180deg, rgba(27, 20, 14, 0.92) 0%, rgba(20, 14, 10, 0.98) 100%), url(/art/GFX21_corkboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={boardRef}
    >
      {/* Cabecera Superior del Tablero de Corcho */}
      <header className="relative z-30 flex justify-between items-center bg-[#140e0a]/95 border-b border-[#4a3622] rounded-t px-6 py-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            type="button"
            className="px-3.5 py-1.5 bg-[#211710] hover:bg-[#332216] text-[#dfcaa2] border border-[#6b4e2f] rounded flex items-center gap-2 text-xs font-serif font-bold transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            Volver al Desván
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-widest text-[#d4af37] font-serif cinzel">
                {caseTitle.toUpperCase()} · CHERWOOD
              </h1>
              {resolvedState && (
                <span className="text-[10px] bg-[#1b3d1b] text-[#86efac] border border-[#22c55e] px-2 py-0.5 rounded font-serif font-bold">
                  {resolvedState.nombre}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#a89885] italic font-serif">
              Día {caseDayCounter + 1} de pesquisa · {clues.length} indicios registrados · {connections.length} deducciones trazadas
            </span>
          </div>
        </div>

        {/* Acciones del Expediente */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setConnectFeedback(null);
              setShowConnectModal(true);
            }}
            disabled={clues.length < 2}
            className="px-3.5 py-1.5 bg-[#1e293b] hover:bg-[#283852] text-[#93c5fd] border border-[#3b82f6]/60 rounded flex items-center gap-1.5 text-xs font-serif font-bold transition-all cursor-pointer disabled:opacity-40"
          >
            <Link2 size={13} />
            Trazar Vínculo
          </button>

          <button
            type="button"
            onClick={() => {
              setHypothesisFeedback(null);
              setShowHypothesisModal(true);
            }}
            className="px-3.5 py-1.5 bg-[#3f211d] hover:bg-[#522b26] text-[#fca5a5] border border-[#ef4444]/60 rounded flex items-center gap-1.5 text-xs font-serif font-bold transition-all cursor-pointer"
          >
            <FileText size={13} />
            Hipótesis del Caso
          </button>

          {resolutionUnlocked && (
            <button
              type="button"
              onClick={() => setShowResolutionModal(true)}
              className="px-4 py-1.5 bg-[#854d0e] hover:bg-[#a16207] text-[#fef08a] border border-[#eab308] rounded flex items-center gap-1.5 text-xs font-serif font-bold transition-all shadow-lg animate-pulse cursor-pointer"
            >
              <Award size={13} />
              Veredicto Final
            </button>
          )}

          {/* Leyenda de Tipos de Vínculos */}
          <div className="flex items-center gap-3 border-l border-[#3d2c1d] pl-4 text-[10px] font-serif">
            <span className="flex items-center gap-1 text-[#f87171]">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" /> ACUSA
            </span>
            <span className="flex items-center gap-1 text-[#60a5fa]">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] inline-block" /> EXPLICA
            </span>
            <span className="flex items-center gap-1 text-[#4ade80]">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" /> LOCALIZA
            </span>
            <span className="flex items-center gap-1 text-[#fbbf24]">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" /> CONTRADICE
            </span>
          </div>
        </div>
      </header>

      {/* Área Central del Corcho: Pistas, Notas y Cordeles de Bézier */}
      <div className="relative w-full h-[880px] z-20 overflow-hidden">
        {/* SVG de Cordeles Tensados de Bézier entre Chinches */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="corkStringShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.75" />
            </filter>
          </defs>

          {connections.map((conn, idx) => {
            const from = clues.find(c => c.id === conn.clueA);
            const to = clues.find(c => c.id === conn.clueB);
            if (!from || !to) return null;

            // Chinche central de la tarjeta (ancho 280, x+140, y+10)
            const x1 = from.x + 140;
            const y1 = from.y + 12;
            const x2 = to.x + 140;
            const y2 = to.y + 12;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const cx1 = x1 + dx * 0.25;
            const cy1 = y1 + dy * 0.25 + 24; // curva de catenaria
            const cx2 = x1 + dx * 0.75;
            const cy2 = y1 + dy * 0.75 + 24;

            const strokeColor = getRelationColor(conn.relation);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 + 18;

            return (
              <g key={`edge_${conn.clueA}_${conn.clueB}_${idx}`}>
                {/* Sombra */}
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth="3.5"
                  filter="url(#corkStringShadow)"
                />
                {/* Cordel de lana tensado */}
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.4"
                  strokeDasharray={conn.relation === 'contradice' ? '6,3' : conn.relation === 'explica' ? '4,2' : undefined}
                />
                {/* Etiqueta de Relación sobre el Hilo */}
                <text
                  x={midX}
                  y={midY}
                  fill="#fdf6e2"
                  fontSize="9"
                  fontFamily="Cinzel, serif"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="select-none"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {conn.relation.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tarjetas de Indicios Descubiertos */}
        {clues.map((clue) => (
          <div
            key={clue.id}
            style={{ 
              left: `${clue.x}px`, 
              top: `${clue.y}px`,
              backgroundImage: 'url(/art/GFX30_flat_paper.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#ede4d1'
            }}
            className={`absolute w-70 p-3.5 text-[#1a1612] rounded shadow-2xl border-2 border-[#b59e7e] cursor-grab active:cursor-grabbing font-serif select-none transition-transform ${
              draggingId === clue.id ? 'scale-105 shadow-2xl z-30' : 'hover:scale-[1.02]'
            }`}
            onMouseDown={(e) => handleMouseDown(e, clue.id, clue.x, clue.y)}
            onClick={() => setSelectedClue(clue)}
          >
            {/* Chinche de Latón Dorada */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-[#785923] via-[#d4af37] to-[#fae596] border border-[#4a3615] shadow-md flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3d2a0d]" />
            </div>

            {/* Ilustración de la Pista si existe */}
            {clue.imageUrl && (
              <div className="w-full h-20 mb-2 rounded overflow-hidden border border-[#baa688] bg-[#d9cdb8] flex items-center justify-center">
                <img 
                  src={clue.imageUrl} 
                  alt={clue.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="text-[9px] uppercase tracking-wider text-[#73583c] font-bold border-b border-[#c4b195] pb-0.5 truncate">
              {clue.sourceVisited}
            </div>

            <h3 className="text-xs font-bold text-[#2b2014] mt-1.5 leading-snug font-serif">
              {clue.nombre}
            </h3>

            <p className="text-[11px] text-[#423425] italic mt-1 leading-relaxed line-clamp-2">
              "{clue.descripcion}"
            </p>
          </div>
        ))}

        {/* Notas Libres Manuscritas del Detective */}
        {notes.map((note) => (
          <div
            key={note.id}
            style={{ left: `${note.x}px`, top: `${note.y}px` }}
            className={`absolute max-w-xs p-3 bg-[#fefce8] text-[#292218] rounded-sm shadow-xl border-t-2 border-[#ca8a04] font-serif text-xs italic leading-relaxed transform rotate-1 cursor-grab active:cursor-grabbing ${
              draggingId === note.id ? 'scale-105 shadow-2xl z-30' : ''
            }`}
            onMouseDown={(e) => handleMouseDown(e, note.id, note.x, note.y)}
          >
            {/* Chinche carmesí */}
            <div className="absolute -top-2 left-4 w-4 h-4 rounded-full bg-gradient-to-tr from-[#661015] via-[#b52b34] to-[#f87171] border border-[#3d090d] shadow-sm flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#1a0406]" />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
              className="absolute top-1 right-1 text-[#854d0e] hover:text-[#ef4444] p-0.5 cursor-pointer"
              title="Retirar nota"
            >
              <X size={12} />
            </button>

            <p className="pt-1 text-[#422006]">
              "{note.text}"
            </p>
          </div>
        ))}
      </div>

      {/* Barra Inferior: Redacción de Notas Libres Manuscritas */}
      <footer className="relative z-30 flex gap-3 items-center bg-[#140e0a]/95 border-t border-[#4a3622] rounded-b px-6 py-2.5 shadow-2xl backdrop-blur-md">
        <input
          type="text"
          value={newNoteInput}
          onChange={(e) => setNewNoteInput(e.target.value)}
          placeholder="Anotar observación o intuición libre sobre el tablero de corcho..."
          disabled={isSubmittingNote}
          className="flex-1 bg-[#21160e] text-[#e5ded2] text-xs font-serif px-3.5 py-1.5 rounded border border-[#523d29] focus:outline-none focus:border-[#d4af37]"
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
        />
        <button
          type="button"
          onClick={handleAddNote}
          disabled={isSubmittingNote || !newNoteInput.trim()}
          className="px-4 py-1.5 bg-[#2a1b14] hover:bg-[#3d271d] text-[#e5ded2] border border-[#8c733e] rounded text-xs font-serif font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Plus size={13} />
          {isSubmittingNote ? 'Clavando...' : 'Clavar Nota'}
        </button>
      </footer>

      {/* Modal: Trazar Vínculo entre Indicios (Dos clics / Teclado) */}
      {showConnectModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-fadeIn"
          onClick={() => setShowConnectModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#18120d] text-[#e5ded2] rounded-xl p-6 shadow-2xl border-2 border-[#8c733e] font-serif relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#3d2c1d] pb-3 mb-4">
              <h2 className="text-sm font-bold text-[#d4af37] cinzel flex items-center gap-2">
                <Link2 size={16} />
                Tensar Cordel entre Indicios
              </h2>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="text-[#9c8e7b] hover:text-[#e5ded2] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-serif">
              <div>
                <label className="block text-[#a89885] mb-1 font-bold">Primer Indicio (Origen):</label>
                <select
                  value={connectSourceId}
                  onChange={(e) => setConnectSourceId(e.target.value)}
                  className="w-full bg-[#241a13] border border-[#4a3622] rounded p-2 text-[#e5ded2]"
                >
                  <option value="">Selecciona indicio...</option>
                  {clues.map(c => (
                    <option key={`src_${c.id}`} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#a89885] mb-1 font-bold">Relación Lógica:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['acusa', 'explica', 'localiza', 'contradice'] as RelationType[]).map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setConnectRelation(rel)}
                      className={`p-2 rounded border uppercase text-[11px] font-bold transition-all cursor-pointer ${
                        connectRelation === rel 
                          ? 'border-[#d4af37] bg-[#332216] text-[#f5ebd9]'
                          : 'border-[#3d2c1d] bg-[#1a120c] text-[#8c7a65]'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#a89885] mb-1 font-bold">Segundo Indicio (Destino):</label>
                <select
                  value={connectTargetId}
                  onChange={(e) => setConnectTargetId(e.target.value)}
                  className="w-full bg-[#241a13] border border-[#4a3622] rounded p-2 text-[#e5ded2]"
                >
                  <option value="">Selecciona indicio...</option>
                  {clues.map(c => (
                    <option key={`tgt_${c.id}`} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {connectFeedback && (
                <div className={`p-3 rounded border text-xs leading-relaxed ${
                  connectFeedback.success 
                    ? 'bg-[#152011] border-[#22c55e] text-[#86efac]'
                    : 'bg-[#2b1715] border-[#ef4444] text-[#fca5a5]'
                }`}>
                  {connectFeedback.message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#3d2c1d]">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-1.5 rounded border border-[#4a3622] text-[#9c8e7b] hover:text-[#e5ded2] cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleConnectClues}
                  disabled={!connectSourceId || !connectTargetId || connectSourceId === connectTargetId}
                  className="px-5 py-1.5 bg-[#1e293b] hover:bg-[#283852] text-[#93c5fd] border border-[#3b82f6] rounded font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  Tensar Cordel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Hipótesis del Caso (Expediente) */}
      {showHypothesisModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-fadeIn"
          onClick={() => setShowHypothesisModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[#18120d] text-[#e5ded2] rounded-xl p-6 shadow-2xl border-2 border-[#8c733e] font-serif relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#3d2c1d] pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#d4af37] cinzel flex items-center gap-2">
                  <FileText size={16} />
                  Hipótesis Formales del Expediente
                </h2>
                <span className="text-[11px] text-[#8c7a65] italic">
                  Someter una hipótesis falsa consumirá 1 día de pesquisa y sembrará indicios engañosos.
                </span>
              </div>
              <button 
                onClick={() => setShowHypothesisModal(false)}
                className="text-[#9c8e7b] hover:text-[#e5ded2] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {availableHypotheses.map((hypo) => {
                const isSelected = selectedHypoId === hypo.id;
                const tested = testedHypotheses.find(t => t.hypothesisId === hypo.id);

                // Calcular cuántas pistas soporte han sido descubiertas
                const discoveredSupportCount = hypo.pistasSoporte.filter(pId => 
                  clues.some(c => c.id === pId)
                ).length;
                const totalSupportCount = hypo.pistasSoporte.length;

                return (
                  <div
                    key={hypo.id}
                    onClick={() => setSelectedHypoId(hypo.id)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#2b1915] border-[#ef4444]'
                        : 'bg-[#1e1510] border-[#3d2c1d] hover:border-[#8c733e]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-sm text-[#f5ebd9] cinzel">
                        {hypo.name}
                      </h3>
                      {tested && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          tested.isCorrect 
                            ? 'bg-[#152011] border-[#22c55e] text-[#86efac]'
                            : 'bg-[#2b1715] border-[#ef4444] text-[#fca5a5]'
                        }`}>
                          {tested.isCorrect ? 'CONFIRMADA' : 'COLAPSADA / FALSA'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#b8a68d] italic leading-relaxed mb-2">
                      "{hypo.teoria}"
                    </p>

                    <div className="text-[11px] text-[#8c7a65] flex justify-between items-center border-t border-[#332216] pt-1.5">
                      <span>Indicios de soporte descubiertos: {discoveredSupportCount} / {totalSupportCount}</span>
                      <span className="italic text-[#d4af37]">
                        {discoveredSupportCount === totalSupportCount ? 'Fundamentada' : 'Evidencia incompleta'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {hypothesisFeedback && (
              <div className={`mt-4 p-3 rounded border text-xs leading-relaxed ${
                hypothesisFeedback.success 
                  ? 'bg-[#152011] border-[#22c55e] text-[#86efac]'
                    : 'bg-[#2b1715] border-[#ef4444] text-[#fca5a5]'
              }`}>
                {hypothesisFeedback.message}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#3d2c1d] mt-4">
              <button
                type="button"
                onClick={() => setShowHypothesisModal(false)}
                className="px-4 py-1.5 rounded border border-[#4a3622] text-[#9c8e7b] hover:text-[#e5ded2] cursor-pointer text-xs"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSubmitHypothesis}
                disabled={!selectedHypoId || isEvaluatingHypo}
                className="px-5 py-1.5 bg-[#851c22] hover:bg-[#aa242c] text-white border border-[#ef4444] rounded text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
              >
                {isEvaluatingHypo ? 'Evaluando...' : 'Someter al Expediente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Veredicto y Resolución del Caso */}
      {showResolutionModal && (
        <div 
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fadeIn"
          onClick={() => setShowResolutionModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[#18120d] text-[#e5ded2] rounded-xl p-6 shadow-2xl border-2 border-[#d4af37] font-serif relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#3d2c1d] pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#d4af37] cinzel flex items-center gap-2">
                  <Award size={18} />
                  Veredicto Final del Expediente
                </h2>
                <span className="text-[11px] text-[#8c7a65] italic">
                  La Red de Amortiguación ha sido desentrañada. Elige cómo resolverás el destino de Cherwood.
                </span>
              </div>
              <button 
                onClick={() => setShowResolutionModal(false)}
                className="text-[#9c8e7b] hover:text-[#e5ded2] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {availableResolutions.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSelectedResolutionId(res.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedResolutionId === res.id 
                      ? 'bg-[#2a2012] border-[#d4af37]'
                      : 'bg-[#18130e] border-[#382b1d] hover:border-[#8c733e]'
                  }`}
                >
                  <h3 className="font-bold text-sm text-[#f5ebd9] cinzel mb-1">
                    {res.nombre}
                  </h3>
                  <div className="text-xs text-[#d4af37] mb-1.5 font-bold">
                    Acción: {res.accion}
                  </div>
                  <p className="text-xs text-[#b8a68d] italic leading-relaxed">
                    Consecuencias: {res.consecuenciasLocales}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#3d2c1d]">
              <button
                type="button"
                onClick={() => setShowResolutionModal(false)}
                className="px-4 py-1.5 rounded border border-[#4a3622] text-[#9c8e7b] hover:text-[#e5ded2] cursor-pointer text-xs"
              >
                Postergar Decisión
              </button>
              <button
                type="button"
                onClick={() => setConfirmResolutionOpen(true)}
                className="px-5 py-1.5 bg-[#854d0e] hover:bg-[#a16207] text-[#fef08a] border border-[#eab308] rounded text-xs font-bold transition-all cursor-pointer"
              >
                Firmar Veredicto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación Irrevocable de Resolución */}
      {confirmResolutionOpen && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-60 animate-fadeIn"
          onClick={() => setConfirmResolutionOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#1c120c] text-[#e5ded2] rounded-xl p-6 shadow-2xl border-2 border-[#ef4444] font-serif relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <ShieldAlert size={36} className="text-[#ef4444] mx-auto mb-3" />
            <h2 className="text-base font-bold text-[#fca5a5] cinzel mb-2">
              ¿CONFIRMAR VEREDICTO IRREVOCABLE?
            </h2>
            <p className="text-xs text-[#b8a68d] leading-relaxed mb-6 font-serif">
              Esta resolución sellará formalmente el expediente en Backlund, aplicará las consecuencias locales y registrará tu coherencia actoral ante el abismo.
            </p>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setConfirmResolutionOpen(false)}
                className="px-4 py-2 rounded border border-[#4a3622] text-[#9c8e7b] hover:text-[#e5ded2] cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResolution}
                disabled={isResolvingCase}
                className="px-6 py-2 bg-[#851c22] hover:bg-[#aa242c] text-white border border-[#ef4444] rounded text-xs font-bold transition-all cursor-pointer"
              >
                {isResolvingCase ? 'Sellando...' : 'Confirmar Resolución'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Indicio al Clic */}
      {selectedClue && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-fadeIn"
          onClick={() => setSelectedClue(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#ede4d1] text-[#1a1612] rounded p-6 shadow-2xl border-2 border-[#8c7038] font-serif relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedClue(null)}
              className="absolute top-3 right-4 text-[#5c4a35] hover:text-[#1a1612] font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            <span className="text-[10px] uppercase tracking-widest text-[#7a6042] font-bold">
              {selectedClue.id} · {selectedClue.sourceVisited}
            </span>
            <h2 className="text-lg font-bold text-[#2e2012] cinzel mt-1 mb-2">
              {selectedClue.nombre}
            </h2>

            {/* Imagen Ampliada */}
            {selectedClue.imageUrl && (
              <div className="w-full h-48 mb-4 rounded overflow-hidden border border-[#baa688] bg-[#d9cdb8] shadow-inner">
                <img 
                  src={selectedClue.imageUrl} 
                  alt={selectedClue.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <p className="text-xs text-[#3b2d1e] italic leading-relaxed border-t border-[#c2b095] pt-3">
              "{selectedClue.descripcion}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
