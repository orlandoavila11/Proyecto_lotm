import React, { useState, useEffect } from 'react';
import { 
  Feather, MapPin, Compass, 
  Volume2, VolumeX, Save, FolderOpen, Briefcase, ShoppingBag, 
  FileText, Crosshair, Users, BookOpen, Flame, Crown, Calendar,
  Sparkles, Coins, User, Scroll, Shield, Globe
} from 'lucide-react';

import { OccultDesk } from './components/desk/OccultDesk';
import { PersonaDossierView } from './components/desk/PersonaDossierView';
import { ActiveActingStage } from './components/desk/ActiveActingStage';
import { LivingCity } from './components/city/LivingCity';
import { TacticalCombatTheater } from './components/combat/TacticalCombatTheater';
import { MysticalMarketStall } from './components/market/MysticalMarketStall';
import { CanonicalGrimoire } from './components/grimoire/CanonicalGrimoire';
import { DetectiveCorkboard } from './components/conspiracy/DetectiveCorkboard';
import { TarotGatheringView } from './components/tarot/TarotGatheringView';
import { PathwayCeremony } from './components/ceremony/PathwayCeremony';
import { OrganizationView } from './components/organizations/OrganizationView';
import { QuestJournalView } from './components/quests/QuestJournalView';
import { ContinentalPoliticsView } from './components/politics/ContinentalPoliticsView';
import { ApotheosisTempleView } from './components/apotheosis/ApotheosisTempleView';
import { ApocalypseCosmicView } from './components/apocalypse/ApocalypseCosmicView';
import { DreamscapeView } from './components/dreamscape/DreamscapeView';
import { OccultAudioManager } from './audio/OccultAudioManager';

export interface Snapshot {
  isGameStarted: boolean;
  inGameDate: string;
  currentDay: number;
  currentLocation: string;
  activePersona: {
    name: string;
    profession: string;
    socialClass: string;
    policeSuspicion: string;
    churchSuspicion: string;
    suspicionTier: string;
  };
  wallet: { pounds: number; soli: number; pence: number };
  pathwayInfo: {
    pathway: string;
    sequence: number;
    sequenceName: string;
    digestionTier: string;
    digestionNarrative: string;
    digestionPercentage: number;
    actingPrinciple?: string;
  };
  somatics: {
    sanityTier: string;
    sanityPercentage: number;
    corruptionTier: string;
    corruptionNarrative: string;
    corruptionPercentage: number;
    anchorsTier: string;
    anchorsNarrative: string;
    anchorsPercentage: number;
    spirituality?: { current: number; max: number };
  };
  leadChest: {
    containedTreatisesCount: number;
    uncontainedStrain: number;
  };
  personalDiaryRecent: Array<{
    date: string;
    title: string;
    narrative: string;
    category: string;
  }>;
  pathwayJournalFormula: any;
  conspiracySummary: {
    discoveredNodesCount: number;
    totalEdgesCount: number;
  };
  tarotClub: {
    sessionCounter: number;
    isGatheringDay: boolean;
    activePetitionsCount: number;
    rosellePagesReadCount: number;
    membersSummary: Array<{ title: string; sequence: number; status: string; favorPoints: number }>;
  };
  atsStatus: {
    isRevealed: boolean;
    tierName: string;
    description: string;
  };
  newspaperArticles?: Array<{
    id: string;
    headline: string;
    subtitle: string;
    body: string;
    column: string;
    date: string;
  }>;
  continentalPolitics?: any;
  cosmicThreat?: {
    gazeIndex: number;
    status: string;
    activeIncursionsCount: number;
  };
  mythicalForm?: {
    unlocked: boolean;
    isActive: boolean;
    formName: string;
    description: string;
  };
}

export function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [activeTab, setActiveTab] = useState<string>('desk');
  const [deskSubTab, setDeskSubTab] = useState<'DESK' | 'INVENTORY' | 'DIARY'>('DESK');
  const [citySubTab, setCitySubTab] = useState<'DISTRICTS' | 'MARKET' | 'ATLAS'>('DISTRICTS');
  const [investigationSubTab, setInvestigationSubTab] = useState<'CORKBOARD' | 'CONTACTS'>('CORKBOARD');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Datos de los subsistemas visibles
  const [inventory, setInventory] = useState<any>({ items: [], currentWeight: 0, maxWeight: 200 });
  const [marketOffers, setMarketOffers] = useState<any[]>([]);
  const [quests, setQuests] = useState<any>({ availableQuests: [], activeQuests: [], completedQuestIds: [] });
  const [districts, setDistricts] = useState<any[]>([]);
  const [cityData, setCityData] = useState<any>(null);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [conspiracy, setConspiracy] = useState<any>({ nodes: [], edges: [], cases: [] });
  const [tarotData, setTarotData] = useState<any>({ sessionCounter: 1, members: [], petitions: [], rosellePages: [], trades: [] });
  const [combatMonster, setCombatMonster] = useState<any>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [conceptualSpells, setConceptualSpells] = useState<any[]>([]);

  // Diálogo diegético
  const [notice, setNotice] = useState<{ open: boolean; title: string; body: string } | null>(null);
  const [audioActive, setAudioActive] = useState<boolean>(false);

  // Creación de Personaje
  const [charName, setCharName] = useState<string>('Klein Moretti');
  const [selectedBg, setSelectedBg] = useState<string>('Detective Privado');
  const [selectedCity, setSelectedCity] = useState<string>('Backlund - Distrito de Cherwood');
  const [selectedPathway, setSelectedPathway] = useState<string>('FOOL');
  const [pathwayFilter, setPathwayFilter] = useState<string>('ALL');
  const [showAffinityModal, setShowAffinityModal] = useState<boolean>(false);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setSnapshot(data);
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubsystems = async () => {
    try {
      const [invRes, mktRes, qstRes, distRes, npcRes, conspRes, tarotRes, spellsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/market'),
        fetch('/api/quests'),
        fetch('/api/city/districts'),
        fetch('/api/npcs'),
        fetch('/api/conspiracy'),
        fetch('/api/tarot/data'),
        fetch('/api/combat/spells')
      ]);

      if (invRes.ok) setInventory(await invRes.json());
      if (mktRes.ok) setMarketOffers((await mktRes.json()).offers || []);
      if (qstRes.ok) setQuests(await qstRes.json());
      if (distRes.ok) {
        const dJson = await distRes.json();
        setDistricts(dJson.districts || []);
        setCityData(dJson);
      }
      if (npcRes.ok) setNpcs((await npcRes.json()).npcs || []);
      if (conspRes.ok) setConspiracy(await conspRes.json());
      if (tarotRes.ok) setTarotData(await tarotRes.json());
      if (spellsRes.ok) {
        const sJson = await spellsRes.json();
        setConceptualSpells(sJson.spells || []);
      }
    } catch (err) {
      console.error('Error fetching subsystems:', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  useEffect(() => {
    if (snapshot?.isGameStarted) {
      fetchSubsystems();
    }
  }, [snapshot?.isGameStarted, snapshot?.currentDay, snapshot?.currentLocation]);

  const openNotice = (title: string, body: string) => {
    setNotice({ open: true, title, body });
  };
  const closeNotice = () => {
    setNotice(null);
    fetchState();
    fetchSubsystems();
  };

  // Audio ambiental victoriano diegético
  const toggleAudio = () => {
    const audio = OccultAudioManager.getInstance();
    if (!audioActive) {
      audio.startAmbientRain();
      setAudioActive(true);
    } else {
      audio.stopAmbient();
      setAudioActive(false);
    }
  };

  // Acciones Principales
  const handlePassDay = async () => {
    const res = await fetch('/api/action/pass-day', { method: 'POST' });
    if (res.ok) {
      fetchState();
      fetchSubsystems();
    }
  };

  const handleConveneTarot = async () => {
    const res = await fetch('/api/action/convene-tarot', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setTarotData((prev: any) => ({
        ...prev,
        sessionCounter: data.sessionCounter,
        members: data.members,
        petitions: data.petitions,
        rosellePages: data.rosellePages
      }));
      openNotice('Asamblea en Sefirah', 'Los Ángeles y Santos del Club Tarot respondieron al llamado sobre la niebla gris. Se intercambiaron secretos continentales y el alma recobró su serenidad.');
      fetchState();
      fetchSubsystems();
    }
    return data;
  };

  const handleStartInvestigation = async (caseId: string) => {
    const res = await fetch('/api/investigation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId })
    });
    const data = await res.json();
    if (res.ok) {
      setConspiracy((prev: any) => ({ ...prev, cases: data.cases }));
      fetchState();
    }
    return data;
  };

  const handleSearchClue = async (caseId: string) => {
    const res = await fetch('/api/investigation/clue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId })
    });
    const data = await res.json();
    if (res.ok) {
      setConspiracy((prev: any) => ({ ...prev, cases: data.cases }));
      fetchState();
    }
    return data;
  };

  const handleSolveInvestigation = async (caseId: string) => {
    const res = await fetch('/api/investigation/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId })
    });
    const data = await res.json();
    if (res.ok) {
      setConspiracy((prev: any) => ({ ...prev, cases: data.cases }));
      if (data.wallet) setInventory((prev: any) => ({ ...prev, wallet: data.wallet }));
      if (data.inventory) setInventory((prev: any) => ({ ...prev, items: data.inventory }));
      openNotice('Misterio Resuelto', data.message);
      fetchState();
    }
    return data;
  };

  const handleInvestigationAction = async (caseId: string, actionType: string) => {
    const res = await fetch('/api/investigation/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId, actionType })
    });
    const data = await res.json();
    if (res.ok) {
      setConspiracy((prev: any) => ({ ...prev, cases: data.cases }));
      fetchState();
    }
    return data;
  };

  const handleLinkHypothesis = async (caseId: string, hypothesisId: string) => {
    const res = await fetch('/api/investigation/hypothesis/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId, hypothesisId })
    });
    const data = await res.json();
    if (res.ok) {
      setConspiracy((prev: any) => ({ ...prev, cases: data.cases }));
      fetchState();
    }
    return data;
  };

  const handleDeliverVerdict = async (caseId: string, hypothesisId: string, verdictChoice: string) => {
    const res = await fetch('/api/investigation/verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId, hypothesisId, verdictChoice })
    });
    const data = await res.json();
    if (res.ok) {
      setConspiracy((prev: any) => ({ ...prev, cases: data.cases }));
      if (data.wallet) setInventory((prev: any) => ({ ...prev, wallet: data.wallet }));
      if (data.inventory) setInventory((prev: any) => ({ ...prev, items: data.inventory }));
      openNotice('Resolución & Veredicto Oculto', data.message);
      fetchState();
      fetchSubsystems();
    }
    return data;
  };

  const handleReadRosellePage = async (pageId: string) => {
    const res = await fetch('/api/tarot/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'READ_ROSELLE_PAGE', pageId })
    });
    const data = await res.json();
    if (res.ok) {
      setTarotData((prev: any) => ({ ...prev, rosellePages: data.rosellePages }));
      fetchState();
    }
    return data;
  };

  const handleFulfillPetition = async (petitionId: string) => {
    const res = await fetch('/api/tarot/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'FULFILL_PETITION', petitionId })
    });
    const data = await res.json();
    if (res.ok) {
      setTarotData((prev: any) => ({ ...prev, petitions: data.petitions }));
      fetchState();
    }
    return data;
  };

  const handleBuyTarotTrade = async (tradeId: string) => {
    const res = await fetch('/api/tarot/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'BUY_TRADE', tradeId })
    });
    const data = await res.json();
    if (res.ok) {
      fetchState();
      fetchSubsystems();
    }
    return data;
  };

  const handleRequestFavor = async (actionId: string) => {
    const res = await fetch('/api/tarot/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REQUEST_FAVOR', actionId })
    });
    const data = await res.json();
    if (res.ok) {
      openNotice('Auxilio de Sefirah', data.message);
      fetchState();
      fetchSubsystems();
    } else {
      openNotice('Petición Denegada', data.message || 'No fue posible solicitar el auxilio.');
    }
    return data;
  };

  const handleSubmitRosellePage = async (pageId: string) => {
    const res = await fetch('/api/tarot/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SUBMIT_ROSELLE_PAGE', pageId })
    });
    const data = await res.json();
    if (res.ok) {
      setTarotData((prev: any) => ({ ...prev, rosellePages: data.rosellePages, members: data.members }));
      openNotice('Página Presentada a Sefirah', data.message);
      fetchState();
      fetchSubsystems();
    } else {
      openNotice('Fallo al Presentar', data.message);
    }
    return data;
  };

  const handleSave = async () => {
    const res = await fetch('/api/game/save', { method: 'POST' });
    const data = await res.json();
    openNotice('Crónica Preservada', data.message || 'Tu historia ha sido guardada en el archivo sagrado.');
  };

  const handleLoad = async () => {
    const res = await fetch('/api/game/load', { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.success) {
      openNotice('Crónica Restaurada', data.message);
    } else {
      openNotice('Aviso de Carga', data.message || 'No se encontró guardado previo.');
    }
  };

  const handleBuyItem = async (offerId: string) => {
    const res = await fetch('/api/market/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId })
    });
    const data = await res.json();
    openNotice('Transacción Comercial', data.message);
  };

  const handleExplore = async (districtId: string) => {
    const res = await fetch('/api/city/explore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ districtId })
    });
    const data = await res.json();
    if (data.type === 'COMBAT') {
      setCombatMonster(data.monster);
      setCombatLog([data.message]);
      setActiveTab('combat');
    } else {
      openNotice('Exploración Urbana', data.message);
    }
  };

  const handleCombatAction = async (action: string, skillName?: string, itemId?: string) => {
    if (action === 'ATTACK') {
      OccultAudioManager.getInstance().playGunshot();
    }
    const res = await fetch('/api/combat/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, skillName, itemId })
    });
    const data = await res.json();
    if (data.log) setCombatLog(prev => [...prev, ...data.log]);
    if (data.isCombatOver) {
      openNotice('Desenlace de Combate', data.message);
      setCombatMonster(null);
      setActiveTab('city');
    } else if (data.enemyHp !== undefined) {
      setCombatMonster((prev: any) => ({ ...prev, hp: data.enemyHp }));
    }
    fetchSubsystems();
    fetchState();
  };

  const handleTriggerCosmicRaid = async () => {
    const res = await fetch('/api/combat/cosmos/raid', { method: 'POST' });
    const data = await res.json();
    if (data.success && data.combatMonster) {
      setCombatMonster(data.combatMonster);
      setCombatLog([data.message]);
      setActiveTab('combat');
      openNotice('Incursión Cósmica', data.message);
    }
    fetchSubsystems();
    fetchState();
  };

  const handleTravel = async (destination: string, costPounds: number, daysRequired: number) => {
    const res = await fetch('/api/action/travel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, costPounds, daysRequired })
    });
    const data = await res.json();
    openNotice('Viaje de Ultramar', data.message || 'Has arribado a tu destino.');
  };

  const handleAdvanceSeq = async () => {
    const res = await fetch('/api/action/advance-seq', { method: 'POST' });
    const data = await res.json();
    openNotice('Apoteosis Divina', data.message || 'Has desafiado el destino.');
  };

  const handleBrewPotion = async (targetSeq: number, ingredientIds: string[]) => {
    const res = await fetch('/api/alchemy/brew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetSequence: targetSeq, ingredientIds })
    });
    const data = await res.json();
    openNotice(data.success ? 'Destilación Alquímica Exitosa' : 'Aviso Alquímico', data.message);
    fetchState();
    fetchSubsystems();
    return data;
  };

  // Creación de Nuevo Personaje
  const handleStartNewGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: charName,
      pathway: selectedPathway,
      background: selectedBg,
      startingCity: selectedCity
    };
    const res = await fetch('/api/game/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      fetchState();
      fetchSubsystems();
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--gold)' }}>
        <h2 className="cinzel">Cargando el Cosmos de Lord of the Mysteries...</h2>
      </div>
    );
  }

  // =========================================================================
  // VISTA 0: BIOMBO DEL DESTINO (CREACIÓN DE PERSONAJE & SELECCIÓN DE VÍA)
  // =========================================================================
  if (!snapshot?.isGameStarted) {
    const pathways = [
      { key: 'FOOL', name: 'El Loco', group: 'MYSTERY', quote: 'El Tonto que no pertenece a esta era.', style: 'Adivinación, hilos espirituales y marionetas.' },
      { key: 'DOOR', name: 'La Puerta', group: 'MYSTERY', quote: 'Sostiene la Llave de las Estrellas.', style: 'Tránsito espacial y viajes dimensionales.' },
      { key: 'ERROR', name: 'El Error', group: 'MYSTERY', quote: 'Gusano del Tiempo que roba el destino.', style: 'Hurto conceptual y parásitos temporales.' },
      { key: 'VISIONARY', name: 'El Visionario', group: 'MYSTERY', quote: 'Contempla el subconsciente colectivo.', style: 'Manipulación mental y escritura del destino.' },
      { key: 'SUN', name: 'El Sol', group: 'COMBAT', quote: 'La Luz Inmaculada que purifica el abismo.', style: 'Purificación sagrada y daño solar.' },
      { key: 'TYRANT', name: 'El Tirano', group: 'COMBAT', quote: 'Señor de las Tormentas y el océano.', style: 'Cólera acuática y rugido del relámpago.' },
      { key: 'TOWER', name: 'La Torre', group: 'SCHOLAR', quote: 'El conocimiento absoluto que desafía la locura.', style: 'Erudición y deducción de debilidades.' },
      { key: 'HANGED_MAN', name: 'El Ahorcado', group: 'MYSTERY', quote: 'El sacrificio sagrado de carne y sangre.', style: 'Resistencia al dolor y sombras.' },
      { key: 'RED_PRIEST', name: 'El Sacerdote Rojo', group: 'COMBAT', quote: 'El fuego de la guerra y la conquista.', style: 'Provocación letal y piromancia marcial.' },
      { key: 'DEMONESS', name: 'La Demoníaca', group: 'MYSTERY', quote: 'La belleza que atrae la catástrofe.', style: 'Magia de espejos, veneno y maldición.' },
      { key: 'DARKNESS', name: 'La Noche Eterna', group: 'LIFE', quote: 'Madre de la Noche y el sosiego.', style: 'Ocultamiento, pacificación y pesadillas.' },
      { key: 'DEATH', name: 'La Muerte', group: 'LIFE', quote: 'El Gobernante del Inframundo.', style: 'Nigromancia, frío cadavérico y espíritus.' },
      { key: 'TWILIGHT_GIANT', name: 'El Ocaso', group: 'COMBAT', quote: 'El honor sagrado en la batalla.', style: 'Defensa inexpugnable y fuerza colosal.' },
      { key: 'PARAGON', name: 'El Sabio / Vapor', group: 'SCHOLAR', quote: 'El artesano de la ciencia arcana.', style: 'Creación de artefactos y armas de fuego.' },
      { key: 'HERMIT', name: 'El Ermitaño', group: 'SCHOLAR', quote: 'Descifra los símbolos ocultos del cosmos.', style: 'Astrología y pergaminos rúnicos.' },
      { key: 'WHEEL_OF_FORTUNE', name: 'La Rueda', group: 'MYSTERY', quote: 'La danza entre el milagro y la tragedia.', style: 'Manipulación del azar y suerte.' },
      { key: 'MOON', name: 'La Luna', group: 'LIFE', quote: 'El linaje sagrado de la transmutación.', style: 'Regeneración vampírica y botánica oscura.' },
      { key: 'MOTHER', name: 'La Madre', group: 'LIFE', quote: 'La nutricia de todas las criaturas.', style: 'Sanación biológica y fertilidad.' },
      { key: 'JUSTICIAR', name: 'El Justiciar', group: 'COMBAT', quote: 'La ley imperativa inviolable.', style: 'Decretos restrictivos y orden.' },
      { key: 'BLACK_EMPEROR', name: 'Emperador Oscuro', group: 'COMBAT', quote: 'Pervierte las reglas y resucita.', style: 'Distorsión y soborno conceptual.' },
      { key: 'ABYSS', name: 'El Diablo', group: 'COMBAT', quote: 'La depravación corruptora del abismo.', style: 'Venenos corrosivos y crueldad sádica.' },
      { key: 'CHAINED', name: 'El Encadenado', group: 'MYSTERY', quote: 'Contiene los deseos más oscuros.', style: 'Metamorfosis y maldición de rencor.' }
    ];

    const filtered = pathways.filter(p => pathwayFilter === 'ALL' || p.group === pathwayFilter);

    return (
      <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card-frame" style={{ padding: '30px', border: '2px solid var(--gold)' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Crown size={28} color="var(--gold)" />
              <h1 className="cinzel" style={{ color: 'var(--gold)', fontSize: '2rem' }}>LORD OF THE MYSTERIES</h1>
            </div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '4px' }}>
              "El hombre no es más que una mota de polvo ante el despertar del cosmos primordial."
            </p>
          </div>

          {showAffinityModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
              <div className="card-frame" style={{ maxWidth: '640px', width: '90%', padding: '24px', border: '2px solid #9b6fe0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '14px' }}>
                  <h3 className="cinzel" style={{ color: '#d8bbf9' }}>Cuestionario de Afinidad Cósmica</h3>
                  <button type="button" onClick={() => setShowAffinityModal(false)} className="action-tab-btn" style={{ padding: '4px 10px' }}>✕</button>
                </div>
                <p style={{ color: '#ccc', fontSize: '0.88rem', marginBottom: '14px' }}>
                  ¿Qué llamado primordial resuena en las profundidades de tu alma astral?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'FOOL', title: 'Descifrar la niebla del tiempo y los secretos del destino', group: 'El Loco (Seer)' },
                    { key: 'DOOR', title: 'Recorrer el cosmos y atravesar las puertas dimensionales', group: 'La Puerta (Apprentice)' },
                    { key: 'ERROR', title: 'Explotar las reglas del mundo y tejer ardides temporales', group: 'El Error (Marauder)' },
                    { key: 'SUN', title: 'Portar la luz inmaculada que purifica la corrupción del abismo', group: 'El Sol (Bard)' },
                    { key: 'DARKNESS', title: 'Vigilar en silencio el reposo eterno bajo la noche', group: 'La Noche Eterna (Sleepless)' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setSelectedPathway(opt.key); setShowAffinityModal(false); }}
                      className="card-frame"
                      style={{ padding: '12px', textAlign: 'left', background: '#1c1724', borderColor: '#5e437c', cursor: 'pointer' }}
                    >
                      <strong style={{ color: '#d8bbf9', fontSize: '0.92rem' }}>{opt.group}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#bbb', marginTop: '2px' }}>"{opt.title}"</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleStartNewGame}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--gold)', fontWeight: 'bold', marginBottom: '6px' }}>
                1. IDENTIDAD CIVIL HUMANA:
              </label>
              <input 
                type="text" 
                value={charName} 
                onChange={e => setCharName(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#1a1815', border: '1px solid var(--card-border)', color: '#fff', borderRadius: '4px' }}
                required 
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--gold)', fontWeight: 'bold', marginBottom: '6px' }}>
                2. ANTECEDENTES Y OCUPACIÓN MATERIAL:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { bg: 'Detective Privado', city: 'Backlund - Distrito de Cherwood', desc: 'Arma reglamentaria y contactos con Scotland Yard.' },
                  { bg: 'Erudito de Historia', city: 'Tingen - Universidad de Khoy', desc: 'Estabilidad mental y lectura de lenguas arcanas.' },
                  { bg: 'Médico Cirujano', city: 'Backlund - Distrito de San Jorge', desc: 'Conocimiento botánico, farmacia y anatomía.' },
                  { bg: 'Marino y Aventurero', city: 'Bayam - Puerto de la Generosidad', desc: '£15 libras extra y temple marino.' }
                ].map(item => (
                  <div 
                    key={item.bg}
                    onClick={() => { setSelectedBg(item.bg); setSelectedCity(item.city); }}
                    className="card-frame"
                    style={{ 
                      padding: '10px', cursor: 'pointer',
                      borderColor: selectedBg === item.bg ? 'var(--gold)' : 'var(--card-border)',
                      background: selectedBg === item.bg ? '#2e261c' : '#1a1815'
                    }}
                  >
                    <strong>{item.bg}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '4px' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: 'var(--gold)', fontWeight: 'bold' }}>3. SELECCIONA TU SENDA DIVINA (SECUENCIA 9):</label>
                <button 
                  type="button" 
                  onClick={() => setShowAffinityModal(true)}
                  style={{ background: '#321c3d', border: '1px solid #9b6fe0', color: '#d8bbf9', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cuestionario de Afinidad Cósmica
                </button>
              </div>

              {/* Filtros de Vías */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {[
                  { id: 'ALL', label: 'Todas las Vías (22)' },
                  { id: 'MYSTERY', label: 'Misterio & Espiritualidad' },
                  { id: 'COMBAT', label: 'Combate & Guerra' },
                  { id: 'SCHOLAR', label: 'Sabiduría & Invención' },
                  { id: 'LIFE', label: 'Vida & Muerte' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPathwayFilter(cat.id)}
                    style={{
                      background: pathwayFilter === cat.id ? 'var(--gold)' : '#1f1b16',
                      color: pathwayFilter === cat.id ? '#000' : '#cfc6b8',
                      border: '1px solid var(--card-border)',
                      padding: '4px 10px', fontSize: '0.78rem', borderRadius: '3px', cursor: 'pointer'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Cuadrícula de Vías */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                {filtered.map(p => {
                  const isSel = selectedPathway === p.key;
                  return (
                    <div
                      key={p.key}
                      onClick={() => setSelectedPathway(p.key)}
                      className="card-frame"
                      style={{
                        padding: '10px', cursor: 'pointer',
                        borderColor: isSel ? 'var(--gold)' : 'var(--card-border)',
                        background: isSel ? '#2e261c' : '#141210'
                      }}
                    >
                      <strong style={{ color: isSel ? 'var(--gold)' : '#f3ebd8' }}>{p.name}</strong>
                      <p style={{ fontSize: '0.75rem', color: '#a89c89', margin: '4px 0', fontStyle: 'italic' }}>"{p.quote}"</p>
                      <div style={{ fontSize: '0.72rem', color: '#7a6f62' }}>{p.style}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ceremonia 3D Astral con React Three Fiber */}
            <div style={{ marginBottom: '20px' }}>
              <PathwayCeremony pathwayName={selectedPathway} sequenceName="Secuencia 9" />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button 
                type="submit" 
                className="crimson-btn" 
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', letterSpacing: '2px' }}
              >
                DESPERTAR EN EL MUNDO ASTRAL (INICIAR PARTIDA)
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // INTERFAZ DIEGÉTICA PRINCIPAL (CONSOLIDADA EN 5 PILARES VICTORIANOS)
  // =========================================================================
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: 'var(--text-light)', padding: '16px 24px' }}>
      
      {/* DIÁLOGO / NOTICIA DIEGÉTICA */}
      {notice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="parchment-sheet" style={{ maxWidth: '580px', width: '90%', padding: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-16px', right: '20px', width: '36px', height: '36px', background: 'var(--crimson)', borderRadius: '50%', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Sparkles size={18} />
            </div>
            <h3 className="cinzel" style={{ color: '#3d2b1d', borderBottom: '1px solid #c8b99d', paddingBottom: '6px', marginBottom: '10px' }}>
              {notice.title}
            </h3>
            <p style={{ color: '#251d16', lineHeight: 1.5, fontSize: '0.95rem', marginBottom: '18px' }}>
              {notice.body}
            </p>
            <div style={{ textAlign: 'right' }}>
              <button onClick={closeNotice} className="crimson-btn" style={{ padding: '6px 14px', fontSize: '0.88rem' }}>
                Firmar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENCABEZADO DIEGÉTICO PERSISTENTE (SIN EMOJIS) */}
      <div className="card-frame" style={{ padding: '12px 18px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={20} color="var(--gold)" />
            <h2 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.25rem' }}>
              LORD OF THE MYSTERIES — THE LIVING COSMOS
            </h2>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', marginTop: '4px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} color="var(--gold)" /> {snapshot.inGameDate}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} color="#38bdf8" /> {snapshot.currentLocation}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={13} color="#a855f7" /> {snapshot.activePersona.name} ({snapshot.activePersona.profession})</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="gold-badge" title="1 Libra (£) = 20 Chelines (s) = 240 Peniques (d)" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coins size={14} />
            <span>£{snapshot.wallet.pounds} {snapshot.wallet.soli}s {snapshot.wallet.pence}d</span>
          </div>
          <button onClick={handleSave} className="action-tab-btn" style={{ borderColor: '#2b7a3d', color: '#68db85' }} title="Guardar">
            <Save size={16} /> Guardar
          </button>
          <button onClick={handleLoad} className="action-tab-btn" title="Cargar">
            <FolderOpen size={16} /> Cargar
          </button>
          <button onClick={toggleAudio} className={`action-tab-btn ${audioActive ? 'active' : ''}`} title="Lluvia victoriana">
            {audioActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* BARRA DE NAVEGACIÓN DIEGÉTICA: 5 PILARES VICTORIANOS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {[
          { id: 'desk', label: 'Escritorio & Refugio', icon: Feather },
          { id: 'personas', label: 'Doble Vida & Identidades', icon: User },
          { id: 'acting', label: `Acting Activo (S-${snapshot.pathwayInfo.sequence})`, icon: Sparkles },
          { id: 'city', label: 'Ciudad & Ultramar', icon: MapPin },
          { id: 'quests', label: `Misiones & Deberes (${quests.availableQuests?.length || 0})`, icon: Scroll },
          { id: 'organizations', label: 'Facciones & Jerarquía', icon: Shield },
          { id: 'politics', label: `Guerra Continental (${snapshot.continentalPolitics?.warTensionIndex ?? 32}/100)`, icon: Globe },
          { id: 'investigation', label: `Investigación & Conspiración (${conspiracy.cases?.length || 0})`, icon: FileText },
          { id: 'tarot', label: `Castillo de Sefirah (#${tarotData.sessionCounter || 1})`, icon: Crown },
          { id: 'apotheosis', label: `Trono & Apoteosis (S-${snapshot.pathwayInfo.sequence})`, icon: Sparkles },
          { id: 'apocalypse', label: `Apocalipsis & Sefirot (1368)`, icon: Globe },
          { id: 'dreamscape', label: `El Sueño del Loco & Boons`, icon: Sparkles },
          { id: 'grimoire', label: `Grimorio Alquímico (S-${snapshot.pathwayInfo.sequence})`, icon: Flame }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`action-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}

        {combatMonster && (
          <button
            onClick={() => setActiveTab('combat')}
            className={`action-tab-btn active`}
            style={{ background: 'var(--crimson)', borderColor: '#ef4444', color: '#fff', padding: '8px 16px' }}
          >
            <Crosshair size={16} />
            <span>Combate Activo: {combatMonster.name}</span>
          </button>
        )}
      </div>

      {/* CONTENIDO DE LAS VISTAS */}
      <div style={{ flex: 1 }}>

        {/* 1. PILAR I: ESCRITORIO & REFUGIO */}
        {activeTab === 'desk' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Sub-pestañas del escritorio */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setDeskSubTab('DESK')}
                className={`action-tab-btn ${deskSubTab === 'DESK' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <Feather size={14} /> Escritorio Principal
              </button>
              <button
                onClick={() => setDeskSubTab('INVENTORY')}
                className={`action-tab-btn ${deskSubTab === 'INVENTORY' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <Briefcase size={14} /> Mochila Física ({inventory.items?.length || 0})
              </button>
              <button
                onClick={() => setDeskSubTab('DIARY')}
                className={`action-tab-btn ${deskSubTab === 'DIARY' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <BookOpen size={14} /> Crónica del Diario
              </button>
            </div>

            {deskSubTab === 'DESK' && (
              <OccultDesk
                snapshot={snapshot}
                inventory={inventory}
                quests={quests}
                onNavigateTab={(tab) => {
                  if (tab === 'inventory') setDeskSubTab('INVENTORY');
                  else if (tab === 'districts') { setActiveTab('city'); setCitySubTab('DISTRICTS'); }
                  else if (tab === 'quests' || tab === 'conspiracy') setActiveTab('investigation');
                  else if (tab === 'grimoire') setActiveTab('grimoire');
                  else setActiveTab(tab);
                }}
                onPassDay={handlePassDay}
                onConveneTarot={() => setActiveTab('tarot')}
                onRefreshState={() => { fetchState(); fetchSubsystems(); }}
                onOpenNotice={openNotice}
              />
            )}

            {deskSubTab === 'INVENTORY' && (
              <div className="card-frame" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '15px' }}>
                  <h3 className="cinzel" style={{ color: 'var(--gold)' }}>MOCHILA Y EQUIPAJE DEL BEYONDER</h3>
                  <div className="gold-badge">Peso: {inventory.currentWeight} / {inventory.maxWeight} lbs</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                  {inventory.items?.map((item: any, idx: number) => (
                    <div key={idx} className="card-frame" style={{ padding: '12px', background: '#1c1915' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ color: 'var(--gold)' }}>{item.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>x{item.quantity || 1}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#7c7365', marginTop: '2px' }}>Tipo: {item.type} | Peso: {item.weight || 1} lbs</div>
                      <p style={{ fontSize: '0.82rem', color: '#cfc6b8', marginTop: '6px' }}>{item.description || 'Objeto asegurado en la mochila.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deskSubTab === 'DIARY' && (
              <div className="card-frame" style={{ padding: '20px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
                <h3 className="cinzel" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '15px' }}>
                  CRÓNICA NOVELADA DEL BEYONDER (1ª PERSONA)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '70vh', overflowY: 'auto' }}>
                  {snapshot.personalDiaryRecent.map((entry, idx) => (
                    <div key={idx} className="parchment-sheet" style={{ padding: '14px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#7a5a12' }}>{entry.date} | Categoría: {entry.category}</div>
                      <strong style={{ fontSize: '1.05rem', color: '#2b2118' }}>{entry.title}</strong>
                      <p style={{ fontStyle: 'italic', marginTop: '6px', color: '#1a1510', lineHeight: 1.45 }}>"{entry.narrative}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FASE 3: PILAR DE IDENTIDADES & DOBLE VIDA */}
        {activeTab === 'personas' && (
          <PersonaDossierView
            onRefreshState={() => { fetchState(); fetchSubsystems(); }}
            onOpenNotice={openNotice}
          />
        )}

        {/* FASE 3: PILAR DE ACTING ACTIVO & DIGESTIÓN REAL */}
        {activeTab === 'acting' && (
          <ActiveActingStage
            snapshot={snapshot}
            onRefreshState={() => { fetchState(); fetchSubsystems(); }}
            onOpenNotice={openNotice}
          />
        )}

        {/* 2. PILAR II: CIUDAD & ULTRAMAR */}
        {activeTab === 'city' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCitySubTab('DISTRICTS')}
                className={`action-tab-btn ${citySubTab === 'DISTRICTS' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <MapPin size={14} /> Distritos Urbanos & Exploración
              </button>
              <button
                onClick={() => setCitySubTab('MARKET')}
                className={`action-tab-btn ${citySubTab === 'MARKET' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <ShoppingBag size={14} /> Mercado Clandestino
              </button>
              <button
                onClick={() => setCitySubTab('ATLAS')}
                className={`action-tab-btn ${citySubTab === 'ATLAS' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <Compass size={14} /> Rutas del Atlas Mundial
              </button>
            </div>

            {citySubTab === 'DISTRICTS' && (
              <LivingCity
                location={snapshot.currentLocation}
                cityTheme={cityData?.cityTheme}
                districts={districts}
                localRumors={cityData?.localRumors}
                onExploreDistrict={handleExplore}
                onTriggerCombat={(encounter) => {
                  if (encounter.monster) {
                    setCombatMonster(encounter.monster);
                    setCombatLog([encounter.message]);
                    setActiveTab('combat');
                  }
                }}
              />
            )}

            {citySubTab === 'MARKET' && (
              <MysticalMarketStall
                offers={marketOffers}
                walletPounds={snapshot.wallet.pounds}
                onBuyItem={handleBuyItem}
              />
            )}

            {citySubTab === 'ATLAS' && (
              <div className="card-frame" style={{ padding: '20px' }}>
                <h3 className="cinzel" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '15px' }}>
                  ATLAS MUNDIAL DE LA QUINTA ÉPOCA Y RUTAS DE TRANSPORTE
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                  {[
                    { dest: 'Backlund - Distrito de Cherwood', cost: 0, days: 0, title: 'Backlund (Cherwood)', desc: 'Regreso a tu pensión y despacho en la capital de Loen.' },
                    { dest: 'Puerto de Pritz (Loen)', cost: 1, days: 1, title: 'Puerto de Pritz', desc: 'Tren de vapor a la costa (£1 | 1 día de viaje).' },
                    { dest: 'Bayam (Archipiélago Rorsted)', cost: 8, days: 14, title: 'Bayam / Mar de Sonia', desc: 'Vapor transoceánico al archipiélago colonial (£8 | 14 días).' },
                    { dest: 'Trier (República de Intis)', cost: 6, days: 4, title: 'Trier (Intis)', desc: 'Ferrocarril internacional a la metrópolis del sol (£6 | 4 días).' }
                  ].map((route, idx) => (
                    <div key={idx} className="card-frame" style={{ padding: '16px' }}>
                      <strong style={{ color: 'var(--gold)', fontSize: '1rem' }}>{route.title}</strong>
                      <p style={{ fontSize: '0.82rem', color: '#cfc6b8', margin: '8px 0 14px 0' }}>{route.desc}</p>
                      <button onClick={() => handleTravel(route.dest, route.cost, route.days)} className="action-tab-btn" style={{ width: '100%', justifyContent: 'center' }}>
                        Contratar Pasaje
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. PILAR III: INVESTIGACIÓN & CONSPIRACIÓN */}
        {activeTab === 'investigation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setInvestigationSubTab('CORKBOARD')}
                className={`action-tab-btn ${investigationSubTab === 'CORKBOARD' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <FileText size={14} /> Pizarra de Evidencias & Casos
              </button>
              <button
                onClick={() => setInvestigationSubTab('CONTACTS')}
                className={`action-tab-btn ${investigationSubTab === 'CONTACTS' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <Users size={14} /> Contactos & Redes de Influencia ({npcs.length})
              </button>
            </div>

            {investigationSubTab === 'CORKBOARD' && (
              <DetectiveCorkboard
                nodes={conspiracy.nodes || []}
                edges={conspiracy.edges || []}
                cases={conspiracy.cases || []}
                onStartCase={handleStartInvestigation}
                onSearchClue={handleSearchClue}
                onSolveCase={handleSolveInvestigation}
                onInvestigationAction={handleInvestigationAction}
                onLinkHypothesis={handleLinkHypothesis}
                onDeliverVerdict={handleDeliverVerdict}
                onFormulateHypothesis={(nodeId) => {
                  const node = conspiracy.nodes?.find((n: any) => n.id === nodeId);
                  openNotice('Hipótesis de Indagación', `Has evaluado los movimientos de [${node?.name || nodeId}]. La investigación avanza con sigilo.`);
                }}
              />
            )}

            {investigationSubTab === 'CONTACTS' && (
              <div className="card-frame" style={{ padding: '20px' }}>
                <h3 className="cinzel" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '15px' }}>
                  CONTACTOS Y PERSONAJES DESTACADOS
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                  {npcs.map((npc: any) => (
                    <div key={npc.id} className="card-frame" style={{ padding: '16px' }}>
                      <strong style={{ color: 'var(--gold)', fontSize: '1.05rem' }}>{npc.name}</strong>
                      <div style={{ fontSize: '0.82rem', color: '#aaa' }}>{npc.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#7c7365', marginTop: '4px' }}>Afiliación: {npc.organization}</div>
                      <div style={{ marginTop: '10px', fontSize: '0.82rem' }}>
                        Confianza: <span className="gold-badge">{npc.trust}%</span> | Sospecha: <span className="gold-badge">{npc.suspicion}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. PILAR IV: CASTILLO DE SEFIRAH (CLUB TAROT) */}
        {activeTab === 'tarot' && (
          <TarotGatheringView
            sessionCounter={tarotData.sessionCounter || snapshot.tarotClub.sessionCounter}
            isGatheringDay={snapshot.tarotClub.isGatheringDay}
            members={tarotData.members || []}
            petitions={tarotData.petitions || []}
            rosellePages={tarotData.rosellePages || []}
            favorActions={tarotData.favorActions || []}
            trades={tarotData.trades || []}
            walletPounds={snapshot.wallet.pounds}
            onConveneGathering={handleConveneTarot}
            onReadRosellePage={handleReadRosellePage}
            onFulfillPetition={handleFulfillPetition}
            onBuyTrade={handleBuyTarotTrade}
            onRequestFavor={handleRequestFavor}
            onSubmitRosellePage={handleSubmitRosellePage}
          />
        )}

        {/* PILAR: GUERRA CONTINENTAL & POLÍTICA */}
        {activeTab === 'politics' && (
          <ContinentalPoliticsView
            walletPounds={snapshot.wallet.pounds}
            playerSpirituality={snapshot.somatics?.spirituality?.current ?? 100}
            onRefreshState={() => { fetchState(); fetchSubsystems(); }}
            onNotice={openNotice}
          />
        )}

        {/* PILAR: MISIONES & DEBERES SECUENCIALES */}
        {activeTab === 'quests' && (
          <QuestJournalView
            quests={quests}
            onRefreshQuests={fetchSubsystems}
            onNotice={openNotice}
          />
        )}

        {/* PILAR: ORGANIZACIONES & JERARQUÍA */}
        {activeTab === 'organizations' && (
          <OrganizationView
            playerSequence={snapshot.pathwayInfo.sequence}
            onRefreshState={() => { fetchState(); fetchSubsystems(); }}
            onNotice={openNotice}
          />
        )}

        {/* PILAR: TRONO DIVINO & APOTEOSIS */}
        {activeTab === 'apotheosis' && (
          <ApotheosisTempleView
            playerSequence={snapshot.pathwayInfo.sequence}
            playerPathway={snapshot.pathwayInfo.pathway}
            anchorStrength={snapshot.somatics.anchorsPercentage}
            digestion={snapshot.pathwayInfo.digestionPercentage}
            onRefreshState={() => { fetchState(); fetchSubsystems(); }}
            onOpenNotice={openNotice}
          />
        )}

        {/* FASE 7: MÁS ALLÁ DE LAS SECUENCIAS (ATS), APOCALIPSIS (1368) Y CONTINENTE OCCIDENTAL */}
        {activeTab === 'apocalypse' && (
          <ApocalypseCosmicView
            playerSequence={snapshot.pathwayInfo.sequence}
            playerPathway={snapshot.pathwayInfo.pathway}
            anchorStrength={snapshot.somatics.anchorsPercentage}
            onRefreshState={() => { fetchState(); fetchSubsystems(); }}
            onOpenNotice={openNotice}
          />
        )}

        {/* FASE 8: EL SUEÑO DEL LOCO, CONCESIONES EXTERIORES (BOONS) & ECOSISTEMA VIVO */}
        {activeTab === 'dreamscape' && (
          <DreamscapeView
            playerSequence={snapshot.pathwayInfo.sequence}
            playerPathway={snapshot.pathwayInfo.pathway}
            onRefreshState={() => { fetchState(); fetchSubsystems(); }}
            onOpenNotice={openNotice}
          />
        )}

        {/* 5. PILAR V: GRIMORIO ALQUÍMICO & APOTEOSIS */}
        {activeTab === 'grimoire' && (
          <CanonicalGrimoire
            pathwayName={snapshot.pathwayInfo.pathway}
            currentSequence={snapshot.pathwayInfo.sequence}
            digestionPercentage={snapshot.pathwayInfo.digestionPercentage}
            formula={snapshot.pathwayJournalFormula}
            inventoryItems={inventory.items || []}
            onAdvanceSequence={handleAdvanceSeq}
            onBrewPotion={handleBrewPotion}
          />
        )}

        {/* MODAL / VISTA DE COMBATE TÁCTICO */}
        {activeTab === 'combat' && (
          <TacticalCombatTheater
            monster={combatMonster}
            combatLog={combatLog}
            playerSanity={snapshot.somatics.sanityPercentage}
            playerSpirituality={snapshot.somatics?.spirituality?.current ?? 100}
            playerSequence={snapshot.pathwayInfo.sequence}
            mythicalState={snapshot.mythicalForm}
            conceptualSpells={conceptualSpells}
            cosmicGazeIndex={snapshot.cosmicThreat?.gazeIndex ?? 18}
            isSpiritVisionActive={false}
            inventoryItems={inventory.items || []}
            onCombatAction={handleCombatAction}
            onTriggerCosmicRaid={handleTriggerCosmicRaid}
            onReturnToExploration={() => setActiveTab('city')}
          />
        )}

      </div>
    </div>
  );
}

export default App;
