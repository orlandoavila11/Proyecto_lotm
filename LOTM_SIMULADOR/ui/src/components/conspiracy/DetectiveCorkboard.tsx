import React, { useState } from 'react';
import { 
  Network, 
  FileSearch, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  User, 
  Building2, 
  Award, 
  HelpCircle,
  FolderOpen,
  Eye,
  Search,
  MessageSquare,
  ShieldAlert,
  DollarSign,
  Skull,
  Handshake,
  Newspaper
} from 'lucide-react';

export type InvestigationActionType = 'FORENSIC_INSPECTION' | 'SPIRIT_VISION' | 'INTERROGATE_WITNESS';

export type VerdictActionChoice = 
  | 'HAND_OVER_TO_AUTHORITIES'
  | 'BLACKMAIL_CULPRIT'
  | 'EXECUTE_IN_SHADOWS'
  | 'COVER_UP_ALLIANCE';

export interface ConspiracyNode {
  id: string;
  name: string;
  type: string;
  alignment: string;
  influence: number;
  hiddenAgenda?: string;
}

export interface ConspiracyEdge {
  from: string;
  to: string;
  type: string;
}

export interface CaseSuspect {
  id: string;
  name: string;
  role: string;
  pathwayAffinity?: string;
  apparentSequence?: number;
  suspicionLevel: number;
  isGuilty: boolean;
  isInterrogated: boolean;
  alibi: string;
  motive: string;
}

export interface InvestigationClue {
  id: string;
  title: string;
  description: string;
  methodRequired: InvestigationActionType;
  discovered: boolean;
  implicatesSuspectId?: string;
  sanityCost: number;
}

export interface CaseHypothesis {
  id: string;
  title: string;
  narrative: string;
  requiredClueIds: string[];
  targetSuspectId: string;
  isFormulated: boolean;
  isCorrect: boolean;
}

export interface InvestigationCase {
  id: string;
  title: string;
  location: string;
  difficulty: string;
  status: 'RUMOR' | 'UNLOCKED' | 'INVESTIGATING' | 'READY_FOR_DEDUCTION' | 'RESOLVED' | 'FAILED';
  synopsis: string;
  clues: InvestigationClue[];
  suspects?: CaseSuspect[];
  hypotheses?: CaseHypothesis[];
  requiredCluesCount: number;
  relatedFaction: string;
  rewards: {
    pounds: number;
    digestionBonus: number;
    sanityBonus: number;
    unlockedKnowledgeId?: string;
  };
  verdictChosen?: VerdictActionChoice;
  resolvedSuspectId?: string;
  conclusionNarrative: string;
  newspaperHeadline?: string;
}

interface DetectiveCorkboardProps {
  nodes: ConspiracyNode[];
  edges?: ConspiracyEdge[];
  cases?: InvestigationCase[];
  onStartCase?: (caseId: string) => Promise<any>;
  onSearchClue?: (caseId: string) => Promise<any>;
  onSolveCase?: (caseId: string) => Promise<any>;
  onFormulateHypothesis?: (nodeId: string) => void;
  // Phase 2 full cycle handlers
  onInvestigationAction?: (caseId: string, actionType: InvestigationActionType) => Promise<any>;
  onLinkHypothesis?: (caseId: string, hypothesisId: string) => Promise<any>;
  onDeliverVerdict?: (caseId: string, hypothesisId: string, verdictChoice: VerdictActionChoice) => Promise<any>;
}

export const DetectiveCorkboard: React.FC<DetectiveCorkboardProps> = ({
  nodes,
  edges = [],
  cases = [],
  onStartCase,
  onSearchClue,
  onSolveCase,
  onFormulateHypothesis,
  onInvestigationAction,
  onLinkHypothesis,
  onDeliverVerdict
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'CASES' | 'GRAPH'>('CASES');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(cases[0]?.id || null);
  const [selectedNode, setSelectedNode] = useState<ConspiracyNode | null>(nodes[0] || null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);
  const [showVerdictModal, setShowVerdictModal] = useState<boolean>(false);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0] || null;

  const filteredNodes = filterType === 'ALL'
    ? nodes
    : nodes.filter(n => n.type === filterType);

  // Iniciar investigación
  const handleStartInvestigation = async (caseId: string) => {
    if (!onStartCase) return;
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const res = await onStartCase(caseId);
      if (res?.message) setActionFeedback(res.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Acción de investigación con método específico (Forense / Visión Espiritual / Interrogatorio)
  const handlePerformAction = async (actionType: InvestigationActionType) => {
    if (!activeCase) return;
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      if (onInvestigationAction) {
        const res = await onInvestigationAction(activeCase.id, actionType);
        if (res?.message) setActionFeedback(res.message);
      } else if (onSearchClue) {
        // Fallback backward compatible
        const res = await onSearchClue(activeCase.id);
        if (res?.message) setActionFeedback(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Vincular y formular hipótesis deductiva
  const handleLinkHypothesis = async (hypothesisId: string) => {
    if (!activeCase) return;
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      if (onLinkHypothesis) {
        const res = await onLinkHypothesis(activeCase.id, hypothesisId);
        if (res?.message) setActionFeedback(res.message);
        setSelectedHypothesisId(hypothesisId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Emitir veredicto
  const handleDeliverVerdict = async (verdictChoice: VerdictActionChoice) => {
    if (!activeCase) return;
    const hypId = selectedHypothesisId || activeCase.hypotheses?.find(h => h.isFormulated)?.id || activeCase.hypotheses?.[0]?.id;
    if (!hypId) return;

    setIsProcessing(true);
    setActionFeedback(null);
    setShowVerdictModal(false);
    try {
      if (onDeliverVerdict) {
        const res = await onDeliverVerdict(activeCase.id, hypId, verdictChoice);
        if (res?.message) setActionFeedback(res.message);
      } else if (onSolveCase) {
        // Fallback backward compatible
        const res = await onSolveCase(activeCase.id);
        if (res?.message) setActionFeedback(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Encontrar la hipótesis actualmente activa o formulada
  const activeHypothesis = activeCase?.hypotheses?.find(h => h.id === selectedHypothesisId) ||
    activeCase?.hypotheses?.find(h => h.isFormulated) ||
    activeCase?.hypotheses?.[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cabecera Principal de la Pizarra Detectivesca */}
      <div
        className="card-frame"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(180deg, #1b1612 0%, #100d0a 100%)',
          border: '1px solid var(--card-border-gold)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brass-dial" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSearch size={26} color="var(--gold)" />
          </div>
          <div>
            <h2 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.4rem' }}>
              TABLERO DE DEDUCCIÓN DE BACKLUND
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#a89c89' }}>
              Pizarra de investigación criminal & ocultista: métodos diferenciados, hipótesis deductivas y veredictos con repercusiones.
            </p>
          </div>
        </div>

        {/* Selector de Modo: Casos Policiales vs Red Social */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveSubTab('CASES')}
            className={`action-tab-btn ${activeSubTab === 'CASES' ? 'active' : ''}`}
            style={{ padding: '8px 16px' }}
          >
            <FolderOpen size={16} />
            <span>Expedientes ({cases.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('GRAPH')}
            className={`action-tab-btn ${activeSubTab === 'GRAPH' ? 'active' : ''}`}
            style={{ padding: '8px 16px' }}
          >
            <Network size={16} />
            <span>Red de Facciones ({nodes.length} / {edges.length} enlaces)</span>
          </button>
        </div>
      </div>

      {/* MODO 1: EXPEDIENTES Y CASOS DETECTIVESCOS */}
      {activeSubTab === 'CASES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
          {/* Lista Lateral de Expedientes */}
          <div className="card-frame" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '820px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Expedientes de Backlund
            </div>

            {cases.map((c) => {
              const isSelected = (activeCase?.id === c.id);
              const isResolved = c.status === 'RESOLVED';
              const isReady = c.status === 'READY_FOR_DEDUCTION';
              const isInvestigating = c.status === 'INVESTIGATING';

              return (
                <div
                  key={c.id}
                  onClick={() => { 
                    setSelectedCaseId(c.id); 
                    setActionFeedback(null);
                    setSelectedHypothesisId(null);
                    setShowVerdictModal(false);
                  }}
                  className="card-frame"
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    background: isSelected ? '#2a2219' : '#171411',
                    borderColor: isSelected ? 'var(--gold)' : (isResolved ? '#2b7a3d' : isReady ? 'var(--crimson)' : 'var(--card-border)'),
                    borderLeftWidth: isSelected ? '4px' : '1px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: isResolved ? '#1e3a24' : isReady ? '#451a1a' : isInvestigating ? '#3b291a' : '#26201b',
                        color: isResolved ? '#6ee7b7' : isReady ? '#fca5a5' : isInvestigating ? '#fcd34d' : '#9ca3af'
                      }}
                    >
                      {isReady ? 'LISTO P/ DEDUCCIÓN' : c.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#9e8c75' }}>
                      {c.difficulty}
                    </span>
                  </div>

                  <strong style={{ fontSize: '0.92rem', color: isSelected ? 'var(--gold)' : '#f3ebd8' }}>
                    {c.title}
                  </strong>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#9e8c75', marginTop: '4px' }}>
                    <MapPin size={12} />
                    <span>{c.location}</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#d4af37', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pistas: {c.clues.filter(k => k.discovered).length} / {c.clues.length}</span>
                    {c.suspects && <span>Sospechosos: {c.suspects.length}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Área Principal del Expediente Activo */}
          {activeCase ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Resumen del Caso & Métodos de Investigación */}
              <div className="card-frame" style={{ padding: '20px', borderTop: '3px solid var(--gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.25rem' }}>
                        {activeCase.title}
                      </h3>
                      <span className="gold-badge">{activeCase.difficulty}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#a89c89', marginTop: '2px' }}>
                      Jurisdicción: <strong>{activeCase.location}</strong> • Facción Involucrada: <strong>{activeCase.relatedFaction}</strong>
                    </div>
                  </div>

                  {/* Recompensas Estimadas */}
                  <div style={{ background: '#1c1712', border: '1px solid #4a3a28', padding: '8px 14px', borderRadius: '4px', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#9e8c75', textTransform: 'uppercase' }}>Honorarios & Digestión</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--gold)' }}>
                      £{activeCase.rewards.pounds} Libras • +{activeCase.rewards.digestionBonus}% Digestión • +{activeCase.rewards.sanityBonus} Sanidad
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#ded7cb', margin: '14px 0', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{activeCase.synopsis}"
                </p>

                {/* Métodos de Indagación Activos (Phase 2 Core) */}
                {(activeCase.status === 'RUMOR' || activeCase.status === 'UNLOCKED') && (
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={() => handleStartInvestigation(activeCase.id)}
                      disabled={isProcessing}
                      className="crimson-btn"
                      style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Sparkles size={16} />
                      <span>Abrir Expediente & Comenzar Investigación en la Escena</span>
                    </button>
                  </div>
                )}

                {(activeCase.status === 'INVESTIGATING' || activeCase.status === 'READY_FOR_DEDUCTION') && (
                  <div style={{ marginTop: '14px', borderTop: '1px solid #3d3124', paddingTop: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Métodos de Investigación en la Escena:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      {/* Método 1: Inspección Forense */}
                      <button
                        onClick={() => handlePerformAction('FORENSIC_INSPECTION')}
                        disabled={isProcessing}
                        className="action-tab-btn active"
                        style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                          <Search size={15} color="var(--gold)" />
                          <span>Inspección Forense</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#b5a995' }}>Rastros físicos, huellas, pólvora y diarios</span>
                      </button>

                      {/* Método 2: Visión Espiritual */}
                      <button
                        onClick={() => handlePerformAction('SPIRIT_VISION')}
                        disabled={isProcessing}
                        className="action-tab-btn active"
                        style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                          <Eye size={15} color="#60a5fa" />
                          <span>Visión Espiritual</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#b5a995' }}>Péndulo de topacio, auras astrales y residuos</span>
                      </button>

                      {/* Método 3: Interrogar Informantes */}
                      <button
                        onClick={() => handlePerformAction('INTERROGATE_WITNESS')}
                        disabled={isProcessing}
                        className="action-tab-btn active"
                        style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                          <MessageSquare size={15} color="#f59e0b" />
                          <span>Interrogar Testigos</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#b5a995' }}>Cuestionar sospechosos, coartadas y redes locales</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Banner de Feedback o Descubrimiento */}
                {actionFeedback && (
                  <div className="parchment-sheet" style={{ marginTop: '14px', padding: '12px 16px', borderLeft: '4px solid var(--gold)' }}>
                    <p style={{ fontSize: '0.85rem', color: '#2a2218', fontStyle: 'italic', margin: 0 }}>
                      {actionFeedback}
                    </p>
                  </div>
                )}
              </div>

              {/* DOSSIER DE SOSPECHOSOS (Phase 2 Suspects Grid) */}
              {activeCase.suspects && activeCase.suspects.length > 0 && (
                <div className="card-frame" style={{ padding: '16px', border: '1px solid #3d3124' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Expedientes de Sospechosos ({activeCase.suspects.length})
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#9e8c75' }}>
                      Interroga testigos para actualizar coartadas y niveles de sospecha
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    {activeCase.suspects.map((s) => {
                      const isInterrogated = s.isInterrogated;
                      const suspColor = s.suspicionLevel >= 70 ? '#ef4444' : s.suspicionLevel >= 40 ? '#f59e0b' : '#10b981';

                      return (
                        <div
                          key={s.id}
                          className="parchment-sheet"
                          style={{
                            padding: '12px',
                            border: `1px solid ${s.isGuilty && activeCase.status === 'RESOLVED' ? '#ef4444' : '#c4b59a'}`,
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <strong style={{ fontSize: '0.95rem', color: '#1a140e' }}>{s.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#685440' }}>{s.role}</div>
                            </div>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                color: suspColor,
                                background: 'rgba(0,0,0,0.06)',
                                padding: '2px 6px',
                                borderRadius: '3px'
                              }}
                            >
                              Sospecha: {s.suspicionLevel}%
                            </span>
                          </div>

                          {s.pathwayAffinity && (
                            <div style={{ fontSize: '0.72rem', color: '#851c22', fontWeight: 'bold', marginTop: '4px' }}>
                              Vía: {s.pathwayAffinity} (Secuencia {s.apparentSequence ?? '?'})
                            </div>
                          )}

                          <div style={{ fontSize: '0.75rem', color: '#3b2e22', marginTop: '6px', borderTop: '1px dotted #baa98f', paddingTop: '4px' }}>
                            <strong>Coartada:</strong> {s.alibi}
                          </div>

                          {isInterrogated && (
                            <div style={{ fontSize: '0.75rem', color: '#1f2937', marginTop: '4px' }}>
                              <strong>Motivo Oculto:</strong> {s.motive}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TABLERO DE CORCHO FÍSICO CON PISTAS E HILOS ROJOS (SVG Yarn) */}
              <div
                style={{
                  background: '#2b2118',
                  border: '8px solid #4a3825',
                  borderRadius: '8px',
                  boxShadow: 'inset 0 0 50px rgba(0,0,0,0.85), 0 12px 30px rgba(0,0,0,0.9)',
                  padding: '24px',
                  position: 'relative',
                  minHeight: '380px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--crimson)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#c4b59a', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Evidencias Clavadas ({activeCase.clues.filter(k => k.discovered).length} / {activeCase.clues.length})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#9e8c75' }}>
                    Hilos Rojos Conectados: {activeCase.clues.filter(k => k.discovered).length}
                  </span>
                </div>

                {/* Capa de Hilos Rojos Cinemáticos (SVG Yarn Threads) */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 5,
                    overflow: 'visible'
                  }}
                >
                  <defs>
                    <filter id="yarnShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.75" />
                    </filter>
                  </defs>
                  {activeCase.clues.map((clue, idx) => {
                    if (!clue.discovered || idx === 0) return null;
                    const startX = 140 + ((idx - 1) % 3) * 280;
                    const startY = 80 + Math.floor((idx - 1) / 3) * 140;
                    const endX = 140 + (idx % 3) * 280;
                    const endY = 80 + Math.floor(idx / 3) * 140;
                    const cpX = (startX + endX) / 2;
                    const cpY = (startY + endY) / 2 + 25;

                    return (
                      <g key={`thread_${idx}`}>
                        <path
                          d={`M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`}
                          fill="none"
                          stroke="#b91c1c"
                          strokeWidth="2.5"
                          filter="url(#yarnShadow)"
                          strokeLinecap="round"
                        />
                        <circle cx={startX} cy={startY} r="3.5" fill="#ef4444" />
                        <circle cx={endX} cy={endY} r="3.5" fill="#ef4444" />
                      </g>
                    );
                  })}
                </svg>

                {/* Cuadrícula de Notas y Pistas Clavadas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', position: 'relative', zIndex: 1 }}>
                  {activeCase.clues.map((clue, idx) => {
                    const isDiscovered = clue.discovered;
                    const methodLabel = clue.methodRequired === 'FORENSIC_INSPECTION' 
                      ? 'Inspección Forense' 
                      : clue.methodRequired === 'SPIRIT_VISION'
                      ? 'Visión Espiritual'
                      : 'Interrogar Testigos';

                    return (
                      <div
                        key={clue.id || idx}
                        className="parchment-sheet"
                        style={{
                          padding: '16px',
                          position: 'relative',
                          opacity: isDiscovered ? 1 : 0.45,
                          border: isDiscovered ? '1px solid #b8a990' : '1px dashed #706352',
                          boxShadow: isDiscovered ? '0 4px 15px rgba(0,0,0,0.5)' : 'none',
                          transform: isDiscovered ? (idx % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)') : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Chincheta Metálica Roja con Hilo */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '-7px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: isDiscovered ? 'var(--crimson)' : '#555',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px #fff',
                            border: '1px solid rgba(0,0,0,0.5)'
                          }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: isDiscovered ? 'var(--crimson)' : '#666', textTransform: 'uppercase' }}>
                            {clue.title || `Evidencia #${idx + 1}`}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#7a6855' }}>
                            {methodLabel}
                          </span>
                        </div>

                        {isDiscovered ? (
                          <>
                            <p style={{ fontSize: '0.85rem', color: '#251c14', lineHeight: 1.45, fontStyle: 'italic', margin: 0 }}>
                              "{clue.description}"
                            </p>
                            {clue.implicatesSuspectId && (
                              <div style={{ fontSize: '0.72rem', color: '#851c22', fontWeight: 'bold', marginTop: '6px' }}>
                                Implica a sospechoso #{clue.implicatesSuspectId}
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6e5f4d', fontSize: '0.8rem', padding: '10px 0' }}>
                            <HelpCircle size={16} />
                            <span>Pista oculta. Requiere [{methodLabel}].</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SÍNTESIS DEDUCTIVA & HIPÓTESIS FORMULABLES (Phase 2 Hypotheses) */}
              {activeCase.hypotheses && activeCase.hypotheses.length > 0 && activeCase.status !== 'RESOLVED' && (
                <div className="card-frame" style={{ padding: '20px', border: '1px solid var(--card-border-gold)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Síntesis Deductiva: Hipótesis de Caso
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeCase.hypotheses.map((hyp) => {
                      const discoveredCluesForHyp = activeCase.clues.filter(c => c.discovered && hyp.requiredClueIds.includes(c.id)).length;
                      const hasAllClues = discoveredCluesForHyp >= hyp.requiredClueIds.length;
                      const isFormulated = hyp.isFormulated;

                      return (
                        <div
                          key={hyp.id}
                          className="card-frame"
                          style={{
                            padding: '14px 18px',
                            background: isFormulated ? '#2a1e14' : '#171411',
                            border: `1px solid ${isFormulated ? 'var(--gold)' : '#4a3b2c'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: isFormulated ? 'var(--gold)' : '#ded7cb', fontSize: '0.98rem' }}>
                                {hyp.title}
                              </strong>
                              {isFormulated && (
                                <span className="gold-badge" style={{ fontSize: '0.7rem' }}>
                                  HIPÓTESIS VINCULADA
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#a89c89', margin: '4px 0 0 0' }}>
                              {hyp.narrative}
                            </p>
                            <div style={{ fontSize: '0.75rem', color: hasAllClues ? '#6ee7b7' : '#f59e0b', marginTop: '4px' }}>
                              Pistas Requeridas: {discoveredCluesForHyp} / {hyp.requiredClueIds.length}
                            </div>
                          </div>

                          <div>
                            {!isFormulated ? (
                              <button
                                onClick={() => handleLinkHypothesis(hyp.id)}
                                disabled={!hasAllClues || isProcessing}
                                className={hasAllClues ? 'crimson-btn' : 'action-tab-btn'}
                                style={{ padding: '8px 16px', fontSize: '0.82rem', opacity: hasAllClues ? 1 : 0.5 }}
                              >
                                Vincular Hilos & Formular
                              </button>
                            ) : (
                              <button
                                onClick={() => { setSelectedHypothesisId(hyp.id); setShowVerdictModal(true); }}
                                disabled={isProcessing}
                                className="crimson-btn"
                                style={{ padding: '8px 18px', fontSize: '0.85rem', boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}
                              >
                                <Award size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                Emitir Veredicto
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODAL O PANEL DE LOS 4 VEREDICTOS MORALES/TÁCTICOS (Phase 2 Core Verdict Choice) */}
              {showVerdictModal && activeHypothesis && (
                <div
                  className="card-frame"
                  style={{
                    padding: '24px',
                    border: '2px solid var(--gold)',
                    background: 'linear-gradient(180deg, #201712 0%, #120e0a 100%)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.9)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.2rem', margin: 0 }}>
                        EL JUICIO DEL BEYONDER: SELECCIONA EL DESTINO DEL CULPABLE
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#baa98f', margin: '4px 0 0 0' }}>
                        Toda decisión tiene un coste persistente en Backlund: sospecha de las iglesias, tensión distrital, convergencia y cordura.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowVerdictModal(false)}
                      className="action-tab-btn"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      Cancelar
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {/* Opción 1: Entregar a las Autoridades */}
                    <div
                      className="card-frame"
                      style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontWeight: 'bold' }}>
                          <ShieldAlert size={18} />
                          <span>Entregar a las Autoridades</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#c4b59a', marginTop: '6px' }}>
                          Notificar a Scotland Yard y a los Halcones Nocturnos con pruebas irrefutables.
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#9e8c75', marginTop: '8px' }}>
                          • Sospecha policial/eclesiástica: <strong>-10%</strong><br />
                          • Tensión distrital: <strong>-15%</strong><br />
                          • Prensa: <em>Titular oficial de arresto</em>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeliverVerdict('HAND_OVER_TO_AUTHORITIES')}
                        disabled={isProcessing}
                        className="action-tab-btn active"
                        style={{ width: '100%', padding: '8px' }}
                      >
                        Aplicar Justicia Formal
                      </button>
                    </div>

                    {/* Opción 2: Chantajear al Culpable */}
                    <div
                      className="card-frame"
                      style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontWeight: 'bold' }}>
                          <DollarSign size={18} />
                          <span>Chantajear & Extorsionar</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#c4b59a', marginTop: '6px' }}>
                          Exigir el doble de oro y fórmulas ocultas a cambio de silenciar el expediente.
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#9e8c75', marginTop: '8px' }}>
                          • Oro: <strong>Doble (£{activeCase.rewards.pounds * 2})</strong><br />
                          • Sospecha policial: <strong>+15%</strong><br />
                          • Convergencia causal: <strong>+8%</strong><br />
                          • Prensa: <em>Cortina de humo oficial</em>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeliverVerdict('BLACKMAIL_CULPRIT')}
                        disabled={isProcessing}
                        className="action-tab-btn active"
                        style={{ width: '100%', padding: '8px', borderColor: 'var(--gold)' }}
                      >
                        Exigir Pago Clandestino
                      </button>
                    </div>

                    {/* Opción 3: Ejecutar en las Sombras */}
                    <div
                      className="card-frame"
                      style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 'bold' }}>
                          <Skull size={18} />
                          <span>Ejecutar en las Sombras</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#c4b59a', marginTop: '6px' }}>
                          Eliminar al perpetrador en un callejón y cosechar su característica Beyonder.
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#9e8c75', marginTop: '8px' }}>
                          • Botín: <strong>Característica Beyonder</strong><br />
                          • Tensión distrital: <strong>+25% (Toque de queda)</strong><br />
                          • Convergencia: <strong>+15% (Atracción fatal)</strong><br />
                          • Prensa: <em>Pánico por asesinato oculto</em>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeliverVerdict('EXECUTE_IN_SHADOWS')}
                        disabled={isProcessing}
                        className="crimson-btn"
                        style={{ width: '100%', padding: '8px' }}
                      >
                        Sentenciar a Muerte
                      </button>
                    </div>

                    {/* Opción 4: Pacto Oculto & Encubrimiento */}
                    <div
                      className="card-frame"
                      style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 'bold' }}>
                          <Handshake size={18} />
                          <span>Pacto Oculto & Alianza</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#c4b59a', marginTop: '6px' }}>
                          Encubrir el caso y convertir al sospechoso en un aliado leal en la red social.
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#9e8c75', marginTop: '8px' }}>
                          • Red de Conspiración: <strong>Nuevo Aliado</strong><br />
                          • Ancla Humana: <strong>+15 Estabilidad</strong><br />
                          • Cordura: <strong>+25 Sanidad restaurada</strong><br />
                          • Prensa: <em>Caso archivado sin pistas</em>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeliverVerdict('COVER_UP_ALLIANCE')}
                        disabled={isProcessing}
                        className="action-tab-btn active"
                        style={{ width: '100%', padding: '8px', borderColor: '#38bdf8' }}
                      >
                        Sellar Alianza Secreta
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* RESOLUCIÓN FINAL & REPERCUSIONES PERSISTENTES (Caso Resuelto) */}
              {activeCase.status === 'RESOLVED' && (
                <div className="parchment-sheet" style={{ padding: '20px', borderLeft: '5px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={20} color="#10b981" />
                      <strong style={{ color: '#166534', fontSize: '1rem' }}>EXPEDIENTE ARCHIVADO & RESOLUCIÓN CUMPLIDA</strong>
                    </div>
                    {activeCase.verdictChosen && (
                      <span className="gold-badge" style={{ fontSize: '0.75rem' }}>
                        Veredicto: {activeCase.verdictChosen}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#1f2937', lineHeight: 1.5, margin: '12px 0 0 0' }}>
                    {activeCase.conclusionNarrative}
                  </p>

                  {/* Recorte de Periódico Reactivo Generado */}
                  {activeCase.newspaperHeadline && (
                    <div style={{ marginTop: '14px', background: '#f5f0e6', border: '1px solid #d4c5ad', padding: '12px 16px', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 'bold', color: '#851c22', textTransform: 'uppercase' }}>
                        <Newspaper size={14} />
                        <span>Titular Publicado en el Daily Observer de Backlund:</span>
                      </div>
                      <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block', marginTop: '4px' }}>
                        "{activeCase.newspaperHeadline}"
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card-frame" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#a89c89' }}>Selecciona un expediente de la columna izquierda para examinar sus evidencias.</p>
            </div>
          )}
        </div>
      )}

      {/* MODO 2: RED SOCIAL DE FACCIONES Y SOSPECHOSOS */}
      {activeSubTab === 'GRAPH' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Todos los Nodos' },
              { id: 'ORGANIZATION', label: 'Organizaciones' },
              { id: 'INDIVIDUAL', label: 'Sospechosos Clave' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterType(cat.id)}
                className={`action-tab-btn ${filterType === cat.id ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cuadrícula de Nodos de la Conspiración */}
          <div
            style={{
              background: '#2b2118',
              border: '8px solid #4a3825',
              borderRadius: '8px',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.85), 0 12px 30px rgba(0,0,0,0.9)',
              padding: '24px',
              position: 'relative',
              minHeight: '420px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHostile = node.alignment?.toLowerCase().includes('evil') || node.alignment?.toLowerCase().includes('hostil');
                const pinColor = isHostile ? '#ef4444' : node.type === 'ORGANIZATION' ? 'var(--gold)' : '#38bdf8';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="parchment-sheet"
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      border: isSelected ? '2px solid var(--crimson)' : '1px solid #c4b59a',
                      boxShadow: isSelected ? '0 0 20px rgba(133, 28, 34, 0.6)' : '0 4px 10px rgba(0,0,0,0.5)',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: pinColor,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.8), inset 0 1px 2px #fff',
                        border: '1px solid rgba(0,0,0,0.4)'
                      }}
                    />

                    <div style={{ fontSize: '0.68rem', color: '#851c22', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {node.type === 'ORGANIZATION' ? <Building2 size={12} /> : <User size={12} />}
                      <span>[{node.type || 'SOSPECHOSO'}]</span>
                    </div>

                    <h4 style={{ color: '#1a140e', fontSize: '1rem', fontWeight: 'bold' }}>
                      {node.name}
                    </h4>

                    <div style={{ fontSize: '0.75rem', color: '#594430', marginTop: '2px' }}>
                      Alineamiento: <strong>{node.alignment || 'Desconocido'}</strong>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#594430', marginTop: '2px' }}>
                      Influencia en Loen: <strong style={{ color: '#851c22' }}>{node.influence || 50}%</strong>
                    </div>

                    {node.hiddenAgenda && (
                      <p style={{ fontSize: '0.78rem', color: '#2a2016', fontStyle: 'italic', marginTop: '8px', borderTop: '1px dotted #baa98f', paddingTop: '6px' }}>
                        "{node.hiddenAgenda.substring(0, 90)}..."
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expediente del Nodo Seleccionado */}
          {selectedNode && (
            <div className="card-frame" style={{ padding: '20px', border: '1px solid var(--card-border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="gold-badge">{selectedNode.type}</span>
                  <h3 style={{ color: 'var(--gold)', fontSize: '1.3rem', margin: '6px 0 2px 0' }}>
                    {selectedNode.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#a89c89' }}>
                    Alineamiento: {selectedNode.alignment} • Nivel de Influencia: {selectedNode.influence}%
                  </div>
                </div>

                {onFormulateHypothesis && (
                  <button
                    onClick={() => onFormulateHypothesis(selectedNode.id)}
                    className="crimson-btn"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Formular Hipótesis de Caso
                  </button>
                )}
              </div>

              <div className="parchment-sheet" style={{ marginTop: '14px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#851c22', textTransform: 'uppercase', marginBottom: '4px' }}>
                  AGENDA CLANDESTINA & PERFIL:
                </div>
                <p style={{ fontSize: '0.85rem', color: '#1a140e', lineHeight: 1.45, margin: 0 }}>
                  {selectedNode.hiddenAgenda || 'Sus motivos exactos permanecen ocultos bajo la niebla de Backlund.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetectiveCorkboard;
