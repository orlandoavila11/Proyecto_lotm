/**
 * ESCENA DE INVESTIGACIÓN Y LUGAR DE PESQUISA (V03) — PATH TO GODHOOD (PROMPT P08)
 * Ubicación: Mansión Sterling & Orfanato San Dionisio (Cherwood)
 * Separa Scene Location ID (SCENE_STERLING_MANSION) de District ID (DIST_CHERWOOD).
 * 4 puntos de interacción canónicos (mundanos y esotéricos por vía).
 * Los indicios se descubren autoritativamente en SQLite mediante /api/investigation/clue/visit-source.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, CheckCircle, Lock, AlertTriangle, Eye, BookOpen, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface ClueSourcePoint {
  id: string;
  name: string;
  clueId: string;
  sourceName: string;
  sourceIndex: number;
  methodType: 'MUNDANE' | 'FOOL_PATHWAY' | 'VISIONARY_PATHWAY';
  requiredPathway?: 'FOOL' | 'VISIONARY';
  restingDescription: string;
  imageUrl?: string;
}

const AUTHORIZED_INTERACTION_POINTS: ClueSourcePoint[] = [
  {
    id: 'point_chimney',
    name: 'Cenicero de la Chimenea Exterior',
    clueId: 'CLUE_BURNED_TOYS',
    sourceName: 'CENIZAS_CHIMENEA_EXTERIOR_MANSION',
    sourceIndex: 0,
    methodType: 'MUNDANE',
    restingDescription: 'Tiro exterior de chimenea con cenizas húmedas, astillas de pino quemadas y hollín reciente.',
    imageUrl: '/art/GFX35A_clue_burned_toys.jpg'
  },
  {
    id: 'point_study',
    name: 'Despacho Privado de Sterling',
    clueId: 'CLUE_WILL_DRAFT',
    sourceName: 'DESPACHO_PRIVADO_MANSION_STERLING',
    sourceIndex: 0,
    methodType: 'MUNDANE',
    restingDescription: 'Mesa de caoba con plumas desgastadas, borradores notariales y correspondencia confidencial.',
    imageUrl: '/art/GFX35B_clue_will_draft.jpg'
  },
  {
    id: 'point_orphanage_attic',
    name: 'Marcas del Desván del Orfanato',
    clueId: 'CLUE_ASTROLOGY_RECORD',
    sourceName: 'MARCAS_TIZA_DESVAN_ORFANATO_SAN_DIONISIO',
    sourceIndex: 0,
    methodType: 'FOOL_PATHWAY',
    requiredPathway: 'FOOL',
    restingDescription: 'Vigas polvorientas del dormitorio común donde los niños duermen sin soñar. Resonancias astrales.',
    imageUrl: '/art/GFX35D_clue_astrology_record.jpg'
  },
  {
    id: 'point_boudoir',
    name: 'Tocador de Evangeline Sterling',
    clueId: 'CLUE_MIND_TRACES',
    sourceName: 'DIARIO_INTIMO_TOCADOR_EVANGELINE',
    sourceIndex: 0,
    methodType: 'VISIONARY_PATHWAY',
    requiredPathway: 'VISIONARY',
    restingDescription: 'Frascos de esencias sedantes, polvos y notas precipitadas que revelan tensión emocional extrema.',
    imageUrl: '/art/GFX35C_clue_mind_traces.jpg'
  }
];

interface DiscoveredClueState {
  id: string;
  nombre: string;
  descripcion: string;
  sourceVisited: string;
}

interface InvestigationLocationViewProps {
  onBackToDesk: () => void;
  onBackToTravel: () => void;
  onOpenCorkboard: () => void;
  characterId: string;
  characterPathway?: string;
}

export const InvestigationLocationView: React.FC<InvestigationLocationViewProps> = ({
  onBackToDesk,
  onBackToTravel,
  onOpenCorkboard,
  characterId,
  characterPathway = 'FOOL'
}) => {
  const [caseInstanceId, setCaseInstanceId] = useState<string | null>(null);
  const [discoveredClues, setDiscoveredClues] = useState<Record<string, DiscoveredClueState>>({});
  const [loadingPointId, setLoadingPointId] = useState<string | null>(null);
  const [blockedReasons, setBlockedReasons] = useState<Record<string, string>>({});
  const [inspectingClue, setInspectingClue] = useState<DiscoveredClueState | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Escuchar Escape para volver
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBackToTravel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToTravel]);

  // Cargar caso activo en SQLite
  useEffect(() => {
    apiClient.getActiveInvestigationCase(characterId)
      .then(res => {
        if (res?.caseState) {
          setCaseInstanceId(res.caseState.id);
          const clueMap: Record<string, DiscoveredClueState> = {};
          (res.caseState.discoveredClues || []).forEach((c: any) => {
            clueMap[c.id] = {
              id: c.id,
              nombre: c.nombre || c.id,
              descripcion: c.descripcion || '',
              sourceVisited: c.sourceVisited || ''
            };
          });
          setDiscoveredClues(clueMap);
        } else {
          apiClient.activateInvestigationCase(characterId, 'CASE_CHERWOOD_HEIRLOOM')
            .then(actRes => {
              if (actRes?.caseState) {
                setCaseInstanceId(actRes.caseState.id);
              }
            })
            .catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Error al activar caso de investigación:', err);
      });
  }, [characterId]);

  const handleInspectPoint = async (point: ClueSourcePoint) => {
    if (loadingPointId) return;
    setErrorNotice(null);

    // Si ya fue descubierta, abrir inspección directa sin coste ni doble guardado
    if (discoveredClues[point.clueId]) {
      setInspectingClue(discoveredClues[point.clueId]);
      return;
    }

    let targetCaseId = caseInstanceId;
    if (!targetCaseId) {
      // Activar el caso canónico si no está cargado
      try {
        const activated = await apiClient.activateInvestigationCase(characterId, 'CASE_CHERWOOD_HEIRLOOM');
        if (activated?.caseState) {
          targetCaseId = activated.caseState.id;
          setCaseInstanceId(targetCaseId);
        }
      } catch (err: any) {
        setErrorNotice('No se ha podido sincronizar el expediente del caso en el Desván.');
        return;
      }
    }

    if (!targetCaseId) {
      setErrorNotice('No se ha podido sincronizar el expediente del caso en el Desván.');
      return;
    }

    setLoadingPointId(point.id);

    try {
      const commandId = `cmd_clue_${Date.now()}_${point.clueId}`;
      const res = await apiClient.visitClueSource({
        instanceId: targetCaseId,
        clueId: point.clueId,
        sourceIndex: point.sourceIndex,
        commandId
      });

      if (res?.success && res.clue) {
        const newlyDiscovered: DiscoveredClueState = {
          id: res.clue.id,
          nombre: res.clue.nombre || res.clue.id,
          descripcion: res.clue.descripcion || '',
          sourceVisited: res.sourceVisited || point.sourceName
        };

        setDiscoveredClues(prev => ({
          ...prev,
          [point.clueId]: newlyDiscovered
        }));

        setInspectingClue(newlyDiscovered);
      } else if (!res?.success) {
        setBlockedReasons(prev => ({
          ...prev,
          [point.id]: res.reason || res.message || 'La percepción de esta pista no está disponible para tu condición actual.'
        }));
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Fallo de conexión al inspeccionar la fuente de pista.');
    } finally {
      setLoadingPointId(null);
    }
  };

  return (
    <div 
      className="p-8 flex flex-col justify-between select-none relative overflow-hidden text-[#e5ded2]"
      style={{
        width: '1920px',
        height: '1080px',
        backgroundColor: '#0c0a08',
        backgroundImage: 'linear-gradient(180deg, rgba(12, 10, 8, 0.88) 0%, rgba(12, 10, 8, 0.96) 100%), url(/art/GFX47_prologue_hallway.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Cabecera Superior */}
      <header className="flex justify-between items-center border-b-2 border-[#3d2f21] pb-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToTravel}
            type="button"
            className="px-4 py-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            Regresar al Carruaje (Esc)
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
              ESCENA DEL CRIMEN: CHERWOOD (V03)
            </h1>
            <p className="text-xs text-[#968c7e] italic font-serif">
              Mansión Sterling & Orfanato San Dionisio · Percepción sintonizada a Vía {characterPathway === 'FOOL' ? 'del Vidente' : 'del Espectador'}
            </p>
          </div>
        </div>

        {/* Acciones de Navegación */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenCorkboard}
            className="px-4 py-2 bg-[#1a140e] border border-[#8c733e] text-[#d4af37] hover:bg-[#2b1f14] rounded text-xs font-serif flex items-center gap-2 cursor-pointer transition-colors"
          >
            <BookOpen size={14} />
            Consultar Tablero de Corcho
          </button>
          <button
            type="button"
            onClick={onBackToDesk}
            className="px-4 py-2 bg-[#171410] border border-[#4a3b29] text-[#9c8e7b] hover:text-[#e5ded2] rounded text-xs font-serif transition-colors cursor-pointer"
          >
            Volver al Desván
          </button>
        </div>
      </header>

      {/* Mensaje de Error si ocurre */}
      {errorNotice && (
        <div className="z-10 p-3 rounded-lg border border-[#782823] bg-[#241210] text-xs text-[#fca5a5] font-serif flex items-center gap-2">
          <AlertTriangle size={15} className="text-[#f87171]" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Contenido Central: 4 Puntos de Interacción Canónicos */}
      <div className="grid grid-cols-12 gap-6 my-auto z-10">
        
        {/* Lista de Puntos de Inspección (7 de 12) */}
        <div className="col-span-7 flex flex-col gap-4">
          <div className="border-b border-[#3d2f21] pb-2 flex justify-between items-center">
            <h2 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest font-serif flex items-center gap-2">
              <Search size={14} />
              Fuentes Materiales e Indicios Visibles
            </h2>
            <span className="text-[11px] text-[#968c7e] italic font-serif">
              Inspección forense y percepción según afinidad de Vía
            </span>
          </div>

          <div className="space-y-3">
            {AUTHORIZED_INTERACTION_POINTS.map((point) => {
              const isDiscovered = Boolean(discoveredClues[point.clueId]);
              const isLoading = loadingPointId === point.id;
              const blockedReason = blockedReasons[point.id];

              return (
                <div
                  key={point.id}
                  className={`p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                    isDiscovered
                      ? 'bg-[#152011]/90 border-[#4a7238]'
                      : blockedReason
                      ? 'bg-[#1e1310]/90 border-[#5e2b26]'
                      : 'bg-[#16120e]/95 border-[#382b1d] hover:border-[#8c733e]'
                  }`}
                >
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-sm text-[#f5ebd9]" style={{ fontFamily: 'Cinzel' }}>
                        {point.name}
                      </h3>
                      {isDiscovered && (
                        <span className="text-[10px] bg-[#27381d] text-[#8bc34a] px-2 py-0.5 rounded font-serif flex items-center gap-1">
                          <CheckCircle size={10} />
                          REGISTRADA
                        </span>
                      )}
                      {blockedReason && (
                        <span className="text-[10px] bg-[#381a17] text-[#f87171] px-2 py-0.5 rounded font-serif flex items-center gap-1">
                          <Lock size={10} />
                          BLOQUEADA
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#b8a68d] leading-relaxed mb-1.5 font-serif">
                      {isDiscovered
                        ? `"${discoveredClues[point.clueId].descripcion}"`
                        : point.restingDescription}
                    </p>

                    <div className="text-[11px] text-[#8c7a65] font-serif flex items-center gap-3">
                      <span>Método: {point.methodType === 'MUNDANE' ? 'Inspección Cotidiana' : point.methodType === 'FOOL_PATHWAY' ? 'Afinidad Vidente (Fool)' : 'Afinidad Espectador (Visionary)'}</span>
                      {blockedReason && (
                        <span className="text-[#fca5a5] italic leading-tight">
                          * {blockedReason}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleInspectPoint(point)}
                      className={`px-4 py-2 rounded text-xs font-serif uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        isDiscovered
                          ? 'bg-[#212f18] border border-[#4a7238] text-[#8bc34a] hover:bg-[#2b3d1f]'
                          : blockedReason
                          ? 'bg-[#2b1715] border border-[#5e2b26] text-[#fca5a5] hover:bg-[#381e1a]'
                          : 'crimson-btn'
                      }`}
                    >
                      {isLoading ? 'Inspeccionando...' : isDiscovered ? 'Reexaminar' : 'Inspeccionar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Lateral: Detalle de Indicio Descubierto (5 de 12) */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="border-b border-[#3d2f21] pb-2">
            <h2 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest font-serif flex items-center gap-2">
              <Eye size={14} />
              Examen Detallado de la Evidencia
            </h2>
          </div>

          {inspectingClue ? (
            <div 
              className="p-6 rounded-xl border-2 border-[#8c733e] shadow-2xl flex flex-col justify-between"
              style={{ backgroundColor: '#18130e' }}
            >
              <div>
                <span className="text-[10px] text-[#a89885] uppercase tracking-widest font-serif block mb-1">
                  Pista Incorporada al Expediente
                </span>
                <h3 className="text-base font-bold text-[#f5ebd9] mb-3 font-serif" style={{ fontFamily: 'Cinzel' }}>
                  {inspectingClue.nombre}
                </h3>

                <div className="p-4 bg-[#110e0b] rounded border border-[#332617] mb-4 text-xs font-serif italic text-[#ded5c5] leading-relaxed">
                  "{inspectingClue.descripcion}"
                </div>

                <div className="border-t border-[#2e2317] pt-2 text-[11px] text-[#8c7a65] font-serif space-y-1">
                  <div><strong>Fuente verificada:</strong> {inspectingClue.sourceVisited}</div>
                  <div><strong>Estado de expediente:</strong> Anotada en el Cuaderno de Pesquisas.</div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectingClue(null)}
                  className="px-4 py-1.5 rounded border border-[#4a3b29] text-[#9c8e7b] hover:text-[#e5ded2] text-xs font-serif transition-colors cursor-pointer"
                >
                  Cerrar Examen
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="p-8 rounded-xl border border-[#332617] text-center flex flex-col items-center justify-center h-64"
              style={{ backgroundColor: '#120e0a' }}
            >
              <Sparkles size={26} className="text-[#5e4326] mb-3" />
              <p className="text-xs text-[#786a58] italic font-serif leading-relaxed max-w-xs">
                Selecciona una fuente en el escenario para examinar indicios. Las observaciones se registrarán en tu tablero de corcho en el Desván.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pie de Página */}
      <footer className="text-center text-[11px] text-[#6b583f] italic font-serif z-10 border-t border-[#261d14] pt-3">
        "El Dr. Sterling guarda silencio en su celda; cada juguete y cada trazo de tiza hablan por él."
      </footer>
    </div>
  );
};
