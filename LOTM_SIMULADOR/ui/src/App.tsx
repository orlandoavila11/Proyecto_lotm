import React, { Component, useState, useEffect } from 'react';
import {
  Compass, Eye, BookOpen, Coins, MapPin, Swords,
  ScrollText, CheckCircle2, Clock, Shield,
  Flame, Sparkles, Dices, Lock, Coffee
} from 'lucide-react';

// Error Boundary para evitar pantallas negras en React
export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Critical UI Boundary Catch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090807', color: '#e5ded2', padding: '20px' }}>
          <div className="parchment-sheet" style={{ maxWidth: '600px', padding: '30px', textAlign: 'center' }}>
            <h2 style={{ color: '#851c22', marginBottom: '10px', fontFamily: 'Cinzel' }}>Disonancia Astral Detectada</h2>
            <p style={{ color: '#555', marginBottom: '15px' }}>Se ha producido una perturbación en el flujo del Velo Ocultista:</p>
            <pre style={{ background: '#191714', color: '#ef4444', padding: '10px', borderRadius: '4px', textAlign: 'left', fontSize: '0.8rem', overflowX: 'auto', marginBottom: '20px' }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button onClick={() => window.location.reload()} className="crimson-btn" style={{ padding: '8px 20px', cursor: 'pointer' }}>
              Reanudar la Conexión con Backlund
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 22 Vías Canónicas Normalizadas con Susurros del Velo
const ALL_PATHWAYS = [
  { id: 'FOOL', name: 'The Fool (El Loco)', s9: 'Adivino (Diviner)', whisper: 'Interpreta el destino sin someterte a él. La verdad no requiere adornos.' },
  { id: 'DOOR', name: 'Door (La Puerta)', s9: 'Aprendiz (Apprentice)', whisper: 'El espacio es una ilusión para quien comprende los pasajes ocultos.' },
  { id: 'ERROR', name: 'Error (El Error)', s9: 'Merodeador (Marauder)', whisper: 'Toda ley humana o mística tiene un punto ciego que aguarda ser explotado.' },
  { id: 'VISIONARY', name: 'Visionary (Visionario)', s9: 'Espectador (Spectator)', whisper: 'Observa la mente humana como un actor observa a la multitud desde las sombras.' },
  { id: 'SUN', name: 'Sun (El Sol)', s9: 'Bardo (Bard)', whisper: 'La luz purifica la corrupción y disuelve las sombras de la herejía.' },
  { id: 'TYRANT', name: 'Tyrant (El Tirano)', s9: 'Marinero (Sailor)', whisper: 'La furia de la tormenta no negocia; somete el abismo con poderío indomable.' },
  { id: 'WHITE_TOWER', name: 'White Tower (Torre Blanca)', s9: 'Lector (Reader)', whisper: 'El conocimiento es la única armadura verdadera ante la locura del cosmos.' },
  { id: 'HANGED_MAN', name: 'Hanged Man (El Colgado)', s9: 'Suplicante de Secretos', whisper: 'Soporta el tormento del abismo; el sacrificio forja la divinidad.' },
  { id: 'DARKNESS', name: 'Darkness (La Oscuridad)', s9: 'Insomne (Sleepless)', whisper: 'Alabada sea la Diosa. En la noche más profunda velamos el descanso de los mortales.' },
  { id: 'DEATH', name: 'Death (La Muerte)', s9: 'Recolector de Cadáveres', whisper: 'Los muertos conservan secretos que los vivos nunca se atreverían a pronunciar.' },
  { id: 'TWILIGHT_GIANT', name: 'Twilight Giant (Gigante)', s9: 'Guerrero (Warrior)', whisper: 'La templanza de la espada y el escudo desafían la decadencia del crepúsculo.' },
  { id: 'RED_PRIEST', name: 'Red Priest (Sacerdote Rojo)', s9: 'Cazador (Hunter)', whisper: 'La guerra es un fuego devorador; provocar y cazar son caras de la misma moneda.' },
  { id: 'DEMONESS', name: 'Demoness (La Demonia)', s9: 'Asesino (Assassin)', whisper: 'La sutileza de la seda y el frío del veneno deciden los imperios.' },
  { id: 'BLACK_EMPEROR', name: 'Black Emperor (Emperador)', s9: 'Abogado (Lawyer)', whisper: 'El orden se doblega ante quien domina los resquicios del estatuto civil.' },
  { id: 'JUSTICIAR', name: 'Justiciar (El Justiciar)', s9: 'Árbitro (Arbiter)', whisper: 'El orden debe ser preservado; el castigo cae implacable sobre el transgresor.' },
  { id: 'CHAINED', name: 'Chained (El Encadenado)', s9: 'Prisionero (Prisoner)', whisper: 'Las pasiones y la carne son cadenas; somete tus instintos o la bestia despertará.' },
  { id: 'ABYSS', name: 'Abyss (El Abismo)', s9: 'Criminal', whisper: 'La malevolencia es un instinto puro en un mundo hipócrita.' },
  { id: 'MOON', name: 'Moon (La Luna)', s9: 'Boticario (Apothecary)', whisper: 'Las hierbas de luna y la sangre de bestia curan lo que la medicina profana ignora.' },
  { id: 'MOTHER', name: 'Mother (La Madre)', s9: 'Sembrador (Planter)', whisper: 'La vida florece en la podredumbre; nutre la semilla para cosechar milagros.' },
  { id: 'PARAGON', name: 'Paragon (El Sabio)', s9: 'Sabio (Savant)', whisper: 'El vapor, los engranajes y la alquimia reconfiguran el orden material.' },
  { id: 'HERMIT', name: 'Hermit (El Ermitaño)', s9: 'Oteador de Misterios', whisper: 'Las constelaciones susurran profecías; decodifica el Velo con paciencia.' },
  { id: 'WHEEL_OF_FORTUNE', name: 'Wheel of Fortune (Rueda)', s9: 'Monstruo (Monster)', whisper: 'La suerte oscila eternamente. Quien ve el caos comprende el destino.' }
];

export function App() {
  // Estado del Personaje
  const [character, setCharacter] = useState<any>(null);
  const [activePersona, setActivePersona] = useState<any>(null);
  const [somatics, setSomatics] = useState<any>(null);
  const [wallet, setWallet] = useState<{ pounds: number; soli: number; pence: number }>({ pounds: 30, soli: 10, pence: 0 });
  const [anchors, setAnchors] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  // Estado de Investigación
  const [cases, setCases] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any>(null);
  
  // Estado de Combate
  const [inCombat, setInCombat] = useState<boolean>(false);
  const [combatState, setCombatState] = useState<any>(null);
  
  // Estado de Dilemas
  const [dilemma, setDilemma] = useState<any>(null);
  const [divinationResult, setDivinationResult] = useState<string | null>(null);
  
  // Log narrativo
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: string }>>([
    { id: 'init-1', time: '08:00', text: 'Has despertado en tu refugio de Backlund. Las campanas de la Catedral de San Samuel resuenan entre el smog de carbón.', type: 'SYSTEM' }
  ]);

  // Modales y Creación
  const [isCreating, setIsCreating] = useState<boolean>(true);
  const [newCharName, setNewCharName] = useState<string>('Sherlock Moriarty');
  const [selectedPathway, setSelectedPathway] = useState<string>('DEMONESS');
  const [newCharProfession, setNewCharProfession] = useState<string>('Boticario');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Backlund - Distrito de Cherwood');

  const addLog = (text: string, type: 'ACTING' | 'INVESTIGATION' | 'COMBAT' | 'CITY' | 'SYSTEM' = 'SYSTEM') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [{ id: `log_${Date.now()}_${Math.random()}`, time, text, type }, ...(prev || []).slice(0, 49)]);
  };

  // Cargar distritos al montar
  useEffect(() => {
    fetch('/api/city/districts')
      .then(res => res.json())
      .then(data => {
        if (data?.districts) setDistricts(data.districts);
      })
      .catch(() => {});
  }, []);

  const refreshCharacter = async (charId: string) => {
    try {
      const res = await fetch(`/api/character/${charId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      if (data.activePersona) setActivePersona(data.activePersona);
      if (data.somatics) setSomatics(data.somatics);
      if (data.wallet) setWallet(data.wallet);
      setAnchors(Array.isArray(data.anchors) ? data.anchors : []);
      setInventory(Array.isArray(data.inventory) ? data.inventory : []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDilemma = async (charId: string) => {
    try {
      const res = await fetch(`/api/acting/dilemma/${charId}`);
      if (res.ok) {
        const data = await res.json();
        setDilemma(data?.dilemma || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCases = async (charId: string) => {
    try {
      const res = await fetch(`/api/investigation/cases/${charId}`);
      if (res.ok) {
        const data = await res.json();
        const safeCasesList = Array.isArray(data?.cases) ? data.cases : [];
        setCases(safeCasesList);
        if (safeCasesList.length > 0) {
          setActiveCase(safeCasesList[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Crear Personaje
  const handleCreateCharacter = async () => {
    try {
      const res = await fetch('/api/character/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCharName,
          pathway: selectedPathway,
          startingCity: selectedDistrict,
          background: newCharProfession,
          socialClass: 'MIDDLE_CLASS'
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(`Error al crear personaje: ${errData.error || res.statusText}`);
        return;
      }

      const data = await res.json();
      setCharacter(data.character);
      setActivePersona(data.activePersona || null);
      setSomatics(data.somatics || null);
      setWallet(data.wallet || { pounds: 30, soli: 0, pence: 0 });
      setAnchors(Array.isArray(data.anchors) ? data.anchors : []);
      setInventory(Array.isArray(data.inventory) ? data.inventory : []);
      setIsCreating(false);

      addLog(`Has consumido la poción canónica de [${data.sequenceName}] de la vía [${data.character.pathway}]. Tu cuerpo astral ha despertado.`, 'ACTING');
      
      await refreshCharacter(data.character.id);
      await loadDilemma(data.character.id);
      await loadCases(data.character.id);
    } catch (err: any) {
      alert(`Fallo de conexión o ejecución: ${err.message}`);
    }
  };

  // 2. Resolver Dilema
  const handleResolveDilemma = async (choiceId: string) => {
    if (!character || !dilemma) return;
    try {
      const res = await fetch('/api/acting/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          dilemmaId: dilemma.id,
          choiceId
        })
      });

      if (!res.ok) return;
      const data = await res.json();
      addLog(`[ACTUACIÓN]: ${data.message} (Digestión: ${data.digestionProgress?.toFixed(1)}%)`, 'ACTING');
      await refreshCharacter(character.id);
      await loadDilemma(character.id);
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Tirada de Adivinación Espiritual (Disco Elysium Style)
  const handlePerformDivination = () => {
    if (!dilemma) return;
    const rolls = [
      'Las cartas del tarot revelan la Emperatriz invertida: una elección precipitada aumentará la sospecha policial.',
      'El péndulo de topacio oscila en sentido horario: la opción alineada con la vía armonizará tu espiritualidad.',
      'El espejo de agua susurra: el peligro de herejía ronda en este distrito; actúa con extrema cautela.',
      'La llama de la vela mística titila en púrpura: la poción responde favorablemente al principio fundamental.'
    ];
    const picked = rolls[Math.floor(Math.random() * rolls.length)];
    setDivinationResult(picked);
    addLog(`[ADIVINACIÓN]: ${picked}`, 'ACTING');
  };

  // 4. Viajar de Distrito
  const handleTravel = async (destDistrict: string) => {
    if (!character || !destDistrict) return;
    try {
      const res = await fetch('/api/city/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          destinationDistrict: destDistrict
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      addLog(`Has tomado un carruaje de alquiler hacia [${destDistrict}]. (Tarifa: 2s) ${data.encounter || ''}`, 'CITY');
      await refreshCharacter(character.id);
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Interactuar con Ancla de Humanidad (Aliviar Cordura)
  const handleSootheAnchor = async () => {
    if (!character) return;
    try {
      const res = await fetch('/api/character/advance-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: character.id, days: 1 })
      });
      if (!res.ok) return;
      addLog('Has dedicado la tarde a tu rutina civil y tomado té calmante de menta. La humanidad de tu ancla estabiliza tus pensamientos.', 'SYSTEM');
      await refreshCharacter(character.id);
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Generar Caso Procedural
  const handleGenerateCase = async () => {
    if (!character) return;
    try {
      const res = await fetch('/api/investigation/case/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: character.id })
      });
      if (!res.ok) return;
      const data = await res.json();
      addLog(`Nuevo expediente de Scotland Yard abierto: [${data.case?.title}] en ${data.case?.district}.`, 'INVESTIGATION');
      await loadCases(character.id);
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Investigar Pista
  const handleInvestigateClue = async (clueId: string, method: string) => {
    if (!character || !activeCase) return;
    try {
      const res = await fetch('/api/investigation/clue/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          caseId: activeCase.id,
          clueId,
          method
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      addLog(`[EVIDENCIA REVELADA]: ${data.message} (+${data.digestionBonus}% digestión)`, 'INVESTIGATION');
      await loadCases(character.id);
      await refreshCharacter(character.id);
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Veredicto del Caso
  const handleVerdict = async (action: string) => {
    if (!character || !activeCase) return;
    try {
      const res = await fetch('/api/investigation/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          caseId: activeCase.id,
          action
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      addLog(`[RESOLUCIÓN DEL EXPEDIENTE]: ${data.verdictMessage}`, 'INVESTIGATION');
      await loadCases(character.id);
      await refreshCharacter(character.id);
    } catch (e) {
      console.error(e);
    }
  };

  // 9. Iniciar Combate Táctico
  const handleStartCombat = async () => {
    if (!character) return;
    try {
      const res = await fetch('/api/combat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          enemyName: 'Espectro de la Niebla de Cherwood',
          enemyHp: 80
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      setInCombat(true);
      setCombatState(data);
      addLog(`¡Confrontación mística iniciada contra [${data.enemy?.name}]!`, 'COMBAT');
    } catch (e) {
      console.error(e);
    }
  };

  // 10. Acción de Combate
  const handleCombatAction = async (skillId?: string) => {
    if (!character) return;
    try {
      const res = await fetch('/api/combat/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          skillId
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.playerTurn?.message || data.playerResult?.message) {
        addLog(data.playerTurn?.message || data.playerResult?.message, 'COMBAT');
      }
      
      if (data.battleOver || data.isCombatOver) {
        setInCombat(false);
        setCombatState(null);
        addLog(data.combatOverMessage || data.message || 'El combate ha concluido.', 'COMBAT');
      } else {
        if (data.enemyTurn?.message || data.enemyResult?.message) {
          addLog(data.enemyTurn?.message || data.enemyResult?.message, 'COMBAT');
        }
        setCombatState((prev: any) => ({
          ...prev,
          availableSkills: data.availableSkills || prev?.availableSkills || [],
          player: data.playerState || data.player,
          enemy: data.enemyState || data.enemy
        }));
      }
      await refreshCharacter(character.id);
    } catch (e) {
      console.error(e);
    }
  };

  // 11. Avanzar Secuencia Canónica
  const handleAdvanceSequence = async () => {
    if (!character) return;
    if (character.sequence <= 7) {
      alert('Límite del Velo Mortal alcanzado (Secuencia 7). Las Secuencias Medias 6 a 0 están estrictamente congeladas.');
      return;
    }
    try {
      const res = await fetch('/api/character/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: character.id })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'No se puede avanzar la secuencia');
        return;
      }
      const data = await res.json();
      addLog(`¡RITUAL COMPLETADO! Has consumido la fórmula de [${data.sequenceName}] y ascendido a Secuencia ${data.newSequence}.`, 'ACTING');
      await refreshCharacter(character.id);
      await loadDilemma(character.id);
    } catch (e) {
      console.error(e);
    }
  };

  // PANTALLA DE CREACIÓN DE PERSONAJE
  if (isCreating || !character) {
    const activePathwayInfo = ALL_PATHWAYS.find(p => p.id === selectedPathway) || ALL_PATHWAYS[0];

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'radial-gradient(circle at 50% 30%, #1a1510 0%, #080706 90%)' }}>
        <div className="leather-desk-mat" style={{ maxWidth: '720px', width: '100%', padding: '36px', border: '2px solid #5a4529' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px double #3d301f', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="wax-seal">⚜️</div>
              <h1 className="cinzel" style={{ fontSize: '2.1rem', color: 'var(--gold)', letterSpacing: '2px', margin: 0 }}>
                LORD OF THE MYSTERIES
              </h1>
              <div className="wax-seal">⚜️</div>
            </div>
            <p style={{ fontSize: '1rem', color: '#a89a85', fontStyle: 'italic' }}>
              The Living Cosmos Engine — Inmersión Victoriana Canónica (Secuencias 9 a 7)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '12px' }}>
              <span className="gold-badge"><CheckCircle2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Backlund · Quinta Época</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '6px', fontSize: '0.95rem' }}>
                Nombre del Iniciado (Identidad Civil en Loen):
              </label>
              <input
                type="text"
                value={newCharName}
                onChange={e => setNewCharName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#120f0c', border: '1px solid #4a3a28', color: '#f3ecd8', borderRadius: '4px', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '6px', fontSize: '0.95rem' }}>
                Vía Canónica del Destino (22 Vías Normalizadas S9-S7):
              </label>
              <select
                value={selectedPathway}
                onChange={e => setSelectedPathway(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#120f0c', border: '1px solid #4a3a28', color: '#f3ecd8', borderRadius: '4px', fontSize: '0.95rem' }}
              >
                {ALL_PATHWAYS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Secuencia 9: {p.s9}
                  </option>
                ))}
              </select>
            </div>

            {/* Susurro del Velo Canónico */}
            <div className="whisper-bubble">
              <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Susurro del Velo: </span>
              "{activePathwayInfo.whisper}"
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '6px', fontSize: '0.95rem' }}>
                  Oficio o Coartada Civil:
                </label>
                <input
                  type="text"
                  value={newCharProfession}
                  onChange={e => setNewCharProfession(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: '#120f0c', border: '1px solid #4a3a28', color: '#f3ecd8', borderRadius: '4px', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '6px', fontSize: '0.95rem' }}>
                  Distrito Inicial en Backlund:
                </label>
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: '#120f0c', border: '1px solid #4a3a28', color: '#f3ecd8', borderRadius: '4px', fontSize: '0.95rem' }}
                >
                  <option value="Distrito de Cherwood (Clase Media & Detectives)">Distrito de Cherwood (Clase Media & Detectives)</option>
                  <option value="Barrio Este (Bajos Fondos & Pobreza)">Barrio Este (Bajos Fondos & Pobreza)</option>
                  <option value="Área del Puente de Backlund (Comercio & Niebla)">Área del Puente de Backlund (Comercio & Niebla)</option>
                  <option value="Distrito de la Reina (Palacios & Aristocracia)">Distrito de la Reina (Palacios & Aristocracia)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateCharacter}
              className="crimson-btn"
              style={{ marginTop: '10px', width: '100%', fontSize: '1.1rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <Flame size={20} />
              Consumir la Poción y Despertar en Backlund
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VARIABLES DEFENSIVAS CONTRA UNDEFINED EN RENDER
  const safeAnchors = Array.isArray(anchors) ? anchors : [];
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeDistricts = Array.isArray(districts) ? districts : [];
  const safeCases = Array.isArray(cases) ? cases : [];
  const safeClues = Array.isArray(activeCase?.clues) ? activeCase.clues : [];
  const safeChoices = Array.isArray(dilemma?.choices) ? dilemma.choices : [];
  const safeSkills = Array.isArray(combatState?.availableSkills) ? combatState.availableSkills : [];
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeWallet = wallet || { pounds: 30, soli: 10, pence: 0 };
  const safePersona = activePersona || { profession: 'Civil de Loen', social_class: 'MIDDLE_CLASS', police_suspicion: 5, church_suspicion: 5 };
  const isSanityLow = (character?.sanity ?? 100) < 50;
  const isSequenceMax = (character?.sequence ?? 9) <= 7;

  // Render Principal Diegético
  return (
    <div className={isSanityLow ? 'sanity-vignette-danger' : ''} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-void)' }}>
      
      {/* HEADER VICTORIANO DE ALTA INMERSIÓN */}
      <header style={{
        padding: '8px 20px',
        background: 'linear-gradient(180deg, #18130e 0%, #0f0c09 100%)',
        borderBottom: '1px solid #4a3924',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-light)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
      }}>
        {/* Identidad del Beyonder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brass-dial" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={20} color="var(--gold)" />
          </div>
          <div>
            <span className="cinzel" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--gold)' }}>
              {character?.name || 'Iniciado'}
            </span>
            <span style={{ marginLeft: '12px', fontSize: '0.88rem', color: '#c7bca9', background: '#221a14', padding: '2px 8px', borderRadius: '3px', border: '1px solid #443423' }}>
              Secuencia {character?.sequence || 9} · {character?.pathway || ''}
            </span>
          </div>
        </div>

        {/* Economía Victoriana, Tiempo & Vigilancia */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          
          {/* Monedero de Cuero (£ / s / d) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#19130d', padding: '5px 12px', borderRadius: '4px', border: '1px solid #453521' }}>
            <Coins size={16} color="var(--gold)" />
            <span style={{ fontSize: '0.92rem', color: '#f5edd9' }}>
              <strong>£{safeWallet.pounds}</strong> libras, <strong>{safeWallet.soli}</strong>s, <strong>{safeWallet.pence}</strong>d
            </span>
          </div>

          {/* Calendario de Loen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#b5a691' }}>
            <Clock size={15} color="#b5a691" />
            <span>Jornada {character?.current_day || 1} · Año 1349</span>
          </div>

          {/* Alerta de la Iglesia de la Noche */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={15} color={safePersona.church_suspicion > 50 ? '#ef4444' : 'var(--gold)'} />
            <span className="gold-badge" style={{ fontSize: '0.75rem', borderColor: safePersona.church_suspicion > 50 ? '#ef4444' : 'var(--gold)', color: safePersona.church_suspicion > 50 ? '#ef4444' : 'var(--gold)' }}>
              {safePersona.church_suspicion > 50 ? 'ALERTA INQUISITORIAL' : 'VIGILANCIA NOCTURNA: CALMA'}
            </span>
          </div>
        </div>
      </header>

      {/* REJILLA DE 4 CUADRANTES DIEGÉTICOS */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '12px',
        padding: '12px',
        overflow: 'hidden'
      }}>
        
        {/* ========================================================================= */}
        {/* CUADRANTE 1: EL ESCRITORIO DEL BEYONDER & SOMÁTICA (TOP-LEFT)              */}
        {/* ========================================================================= */}
        <section className="card-frame" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3d3122', paddingBottom: '6px' }}>
            <h3 className="cinzel" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', margin: 0 }}>
              <Eye size={17} /> I. El Escritorio & Espejo Somático
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#9e8d78' }}>
              📍 {character?.current_location || 'Backlund'}
            </span>
          </div>

          {/* Indicadores Somáticos de Sanidad y Corrupción */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            
            {/* Sanidad Mental */}
            <div style={{ background: '#19140f', padding: '8px 12px', borderRadius: '4px', border: '1px solid #382c1e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#aaa' }}>Estabilidad Mental (Sanidad):</span>
                <span style={{ fontWeight: 'bold', color: (character?.sanity ?? 100) > 50 ? '#22c55e' : '#ef4444' }}>
                  {character?.sanity ?? 100}% [{somatics?.sanityTier || 'LUCID'}]
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', marginTop: '5px' }}>
                <div style={{ width: `${character?.sanity ?? 100}%`, height: '100%', background: (character?.sanity ?? 100) > 50 ? '#22c55e' : '#ef4444', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* Corrupción Astral */}
            <div style={{ background: '#19140f', padding: '8px 12px', borderRadius: '4px', border: '1px solid #382c1e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#aaa' }}>Corrupción Astral:</span>
                <span style={{ fontWeight: 'bold', color: (character?.corruption ?? 0) > 20 ? '#dc2626' : '#9b6fe0' }}>
                  {character?.corruption ?? 0}% [{somatics?.corruptionTier || 'PRISTINE'}]
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', marginTop: '5px' }}>
                <div style={{ width: `${character?.corruption ?? 0}%`, height: '100%', background: '#9b6fe0', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
            </div>
          </div>

          {/* Digestión de la Poción & Bloqueo del Velo Mortal */}
          <div style={{ background: '#19140f', padding: '10px 12px', borderRadius: '4px', border: '1px solid #382c1e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Digestión de la Poción (Método de Actuación):</span>
              <span style={{ fontWeight: 'bold', color: '#f3ebd8' }}>{(character?.digestion_progress ?? 0).toFixed(1)}% / 100%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${character?.digestion_progress ?? 0}%`, height: '100%', background: 'linear-gradient(90deg, #d4af37, #f59e0b)', transition: 'width 0.3s' }} />
            </div>

            {/* Condición de Ascenso o Sello del Velo Mortal */}
            {(character?.digestion_progress ?? 0) >= 100.0 && (
              isSequenceMax ? (
                <div className="mortal-veil-seal" style={{ marginTop: '10px' }}>
                  <div style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Lock size={15} /> Tope Canónico del Velo Mortal Alcanzado (Secuencia 7)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a89c89', marginTop: '3px' }}>
                    Las Secuencias Medias 6 a 0 están selladas. Has alcanzado el pináculo de la supervivencia mortal en Backlund.
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAdvanceSequence}
                  className="crimson-btn"
                  style={{ marginTop: '10px', width: '100%', fontSize: '0.88rem', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Sparkles size={16} /> ¡Poción Digerida! Consumir Fórmula y Ascender a Secuencia {(character?.sequence ?? 9) - 1}
                </button>
              )
            )}
          </div>

          {/* Doble Vida & Anclas de Humanidad Táctiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
            
            {/* Persona Civil */}
            <div style={{ background: '#16120e', padding: '8px 10px', borderRadius: '4px', border: '1px solid #302518' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Identidad Civil (Doble Vida):
              </span>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div><strong>Oficio:</strong> {safePersona.profession}</div>
                <div><strong>Clase:</strong> {safePersona.social_class}</div>
                <div><strong>Sospecha Policial:</strong> <span style={{ color: safePersona.police_suspicion > 40 ? '#ef4444' : '#22c55e' }}>{safePersona.police_suspicion}%</span></div>
                <div><strong>Sospecha Eclesiástica:</strong> <span style={{ color: safePersona.church_suspicion > 40 ? '#ef4444' : '#22c55e' }}>{safePersona.church_suspicion}%</span></div>
              </div>
            </div>

            {/* Anclas de Humanidad */}
            <div style={{ background: '#16120e', padding: '8px 10px', borderRadius: '4px', border: '1px solid #302518', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                  Anclas de Humanidad:
                </span>
                <button onClick={handleSootheAnchor} title="Tomar té y escribir en el diario para calmar pensamientos" style={{ background: '#241a12', border: '1px solid #55412a', color: '#ddd', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Coffee size={11} /> Descanso Civil
                </button>
              </div>
              
              <div style={{ maxHeight: '70px', overflowY: 'auto', fontSize: '0.78rem' }}>
                {safeAnchors.length > 0 ? safeAnchors.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #333', padding: '2px 0' }}>
                    <span style={{ color: '#d8cfbf' }}>{a.title}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>+{a.strength} pts</span>
                  </div>
                )) : (
                  <span style={{ color: '#666', fontStyle: 'italic' }}>Sin anclas vinculadas.</span>
                )}
              </div>
            </div>
          </div>

          {/* Maletín de Viaje e Inventario */}
          {safeInventory.length > 0 && (
            <div style={{ background: '#16120e', padding: '8px 10px', borderRadius: '4px', border: '1px solid #302518' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Bolsa de Viaje & Pertenencias ({safeInventory.length} objetos):
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {safeInventory.map((item: any) => (
                  <span key={item.id} className="gold-badge" style={{ fontSize: '0.74rem' }}>
                    {item.name} (x{item.quantity})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* CUADRANTE 2: CARTOGRAFÍA DE BACKLUND (TOP-RIGHT)                          */}
        {/* ========================================================================= */}
        <section className="card-frame" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3d3122', paddingBottom: '6px' }}>
            <h3 className="cinzel" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', margin: 0 }}>
              <MapPin size={17} /> II. Cartografía de Backlund & Red Clandestina
            </h3>
            <span className="gold-badge" style={{ fontSize: '0.72rem' }}>Smog de Carbón Activo</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
            {safeDistricts.map(d => {
              const districtName = d.name || d.district_name || 'Distrito de Backlund';
              const isCurrent = character?.current_location?.includes(districtName) || districtName.includes(character?.current_location);
              
              return (
                <div
                  key={d.id || districtName}
                  className="occult-card"
                  style={{
                    padding: '10px 14px',
                    borderLeft: isCurrent ? '4px solid var(--gold)' : '4px solid #4a3a28',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: isCurrent ? 'var(--gold)' : '#f3ebd8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {districtName} {isCurrent && <span style={{ fontSize: '0.72rem', color: '#22c55e', border: '1px solid #22c55e', padding: '1px 5px', borderRadius: '3px' }}>📍 Refugio Actual</span>}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#b5a691', marginTop: '2px' }}>
                      {d.description || 'Calles adoquinadas envueltas en la penumbra de las farolas de gas.'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8c7d6b', marginTop: '3px', display: 'flex', gap: '10px' }}>
                      <span>🏛️ Punto: <strong>{d.landmark || 'Comisaría'}</strong></span>
                      <span>🌫️ Smog: <strong>{d.smog_level || 'Medio'}</strong></span>
                      <span>⚖️ Tensión: <strong>{d.danger_rank || 'Baja'}</strong></span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleTravel(districtName)}
                      className="crimson-btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      Tomar Carruaje (2s)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CUADRANTE 3: EL VELO OCULTISTA: EXPEDIENTES & COMBATE (BOTTOM-LEFT)       */}
        {/* ========================================================================= */}
        <section className="card-frame" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3d3122', paddingBottom: '6px' }}>
            <h3 className="cinzel" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', margin: 0 }}>
              {inCombat ? <Swords size={17} color="#ef4444" /> : <BookOpen size={17} />}
              III. El Velo Ocultista: {inCombat ? 'Combate Táctico' : `Expedientes (${safeCases.length})`}
            </h3>

            {!inCombat ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleGenerateCase} style={{ background: '#241a12', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.74rem' }}>
                  + Generar Caso
                </button>
                <button onClick={handleStartCombat} className="crimson-btn" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                  ⚔️ Confrontar Hereje
                </button>
              </div>
            ) : (
              <span className="gold-badge" style={{ borderColor: '#ef4444', color: '#ef4444' }}>CONFRONTACIÓN ACTIVA</span>
            )}
          </div>

          {/* MODO COMBATE TÁCTICO */}
          {inCombat && combatState ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              
              {/* Tarjetas de Contendientes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                
                {/* Jugador */}
                <div style={{ background: '#1c1512', padding: '10px', borderRadius: '4px', border: '1px solid #4a3424' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--gold)', fontSize: '0.9rem' }}>{character?.name} (Tú)</div>
                  <div style={{ fontSize: '0.78rem', color: '#ddd', marginTop: '3px' }}>
                    HP: <strong>{combatState.player?.currentHp ?? combatState.player?.hp ?? character?.current_health}</strong> / {combatState.player?.maxHp ?? 100}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                    Espiritualidad: <strong>{combatState.player?.currentSpirituality ?? combatState.player?.spirituality ?? character?.current_spirituality}</strong> / {combatState.player?.maxSpirituality ?? 100}
                  </div>
                </div>

                {/* Enemigo */}
                <div style={{ background: '#201212', padding: '10px', borderRadius: '4px', border: '1px solid #5a2424', textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '0.9rem' }}>{combatState.enemy?.name || 'Monstruo Astral'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#ddd', marginTop: '3px' }}>
                    HP: <strong>{combatState.enemy?.currentHp ?? combatState.enemy?.hp ?? 80}</strong> / {combatState.enemy?.maxHp ?? 80}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#f87171' }}>
                    Peligro: MEDIO (Herejía)
                  </div>
                </div>
              </div>

              {/* Habilidades Canónicas */}
              <div>
                <span style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Habilidades Místicas Disponibles:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button onClick={() => handleCombatAction()} className="combat-skill-card" style={{ flex: '1 1 45%' }}>
                    <div style={{ fontWeight: 'bold' }}>Ataque Físico / Disparo de Revólver</div>
                    <div style={{ fontSize: '0.7rem', color: '#aaa' }}>Daño físico convencional sin coste de espiritualidad.</div>
                  </button>

                  {safeSkills.map((sk: any) => (
                    <button
                      key={sk.id}
                      onClick={() => handleCombatAction(sk.id)}
                      className="combat-skill-card"
                      style={{ flex: '1 1 45%', borderColor: 'var(--gold)' }}
                    >
                      <div style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{sk.name} ({sk.spiritualityCost} SP)</div>
                      <div style={{ fontSize: '0.7rem', color: '#c4b5fd' }}>{sk.description || 'Poder místico canónico de la vía.'}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* MODO INVESTIGACIÓN PROCEDURAL */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
              
              {/* Selector de Casos */}
              {safeCases.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {safeCases.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCase(c)}
                      style={{
                        background: activeCase?.id === c.id ? '#332b20' : '#171410',
                        border: activeCase?.id === c.id ? '1px solid var(--gold)' : '1px solid #332b20',
                        color: activeCase?.id === c.id ? 'var(--gold)' : '#aaa',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {c.title?.substring(0, 18)}... [{c.status}]
                    </button>
                  ))}
                </div>
              )}

              {activeCase ? (
                <div>
                  {/* Encabezado del Dossier */}
                  <div style={{ background: '#19140f', padding: '10px 12px', borderRadius: '4px', marginBottom: '8px', border: '1px solid #3a2e1f' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--gold)', fontSize: '0.94rem' }}>{activeCase.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>
                      Sospechoso: <strong style={{ color: '#ddd' }}>{activeCase.culprit_name}</strong> · Distrito: <strong style={{ color: '#ddd' }}>{activeCase.district}</strong>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: activeCase.status === 'READY_FOR_DEDUCTION' ? '#22c55e' : 'var(--gold)', marginTop: '2px' }}>
                      Estado del Expediente: {activeCase.status}
                    </div>
                  </div>

                  {/* Pistas */}
                  <span style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>Evidencias y Pistas Ocultas:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {safeClues.map((c: any) => (
                      <div key={c.id} className="occult-card" style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: c.is_discovered ? '#22c55e' : '#e5ded2' }}>
                            {c.is_discovered ? '🔍 ' : '🔒 '} {c.title}
                          </span>
                          {!c.is_discovered && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button onClick={() => handleInvestigateClue(c.id, 'SPIRITUAL_DIVINATION')} style={{ fontSize: '0.7rem', background: '#241a12', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '2px 8px', borderRadius: '3px', cursor: 'pointer' }}>
                                Adivinación
                              </button>
                              <button onClick={() => handleInvestigateClue(c.id, 'FORENSIC_TRACKING')} style={{ fontSize: '0.7rem', background: '#1c1512', border: '1px solid #5a4529', color: '#ddd', padding: '2px 8px', borderRadius: '3px', cursor: 'pointer' }}>
                                Rastro Forense
                              </button>
                            </div>
                          )}
                        </div>
                        {c.is_discovered ? (
                          <div style={{ fontSize: '0.75rem', color: '#baa993', marginTop: '3px' }}>{c.description}</div>
                        ) : (
                          <div style={{ fontSize: '0.73rem', color: '#776c5e', fontStyle: 'italic', marginTop: '2px' }}>Pista oculta en el escenario del crimen.</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Veredicto */}
                  {activeCase.status === 'READY_FOR_DEDUCTION' && (
                    <div style={{ marginTop: '10px', background: '#221912', padding: '10px', borderRadius: '4px', border: '1px solid var(--gold)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                        ⚖️ Deducción Completa — Emitir Veredicto de Backlund:
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <button onClick={() => handleVerdict('SCOTLAND_YARD')} style={{ background: '#16110d', border: '1px solid #555', color: '#fff', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.74rem' }}>
                          Entregar a Scotland Yard
                        </button>
                        <button onClick={() => handleVerdict('EXTORT_BLACKMAIL')} style={{ background: '#16110d', border: '1px solid #f59e0b', color: '#f59e0b', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.74rem' }}>
                          Chantaje Clandestino (+Oro)
                        </button>
                        <button onClick={() => handleVerdict('EXECUTE_SHADOWS')} style={{ background: '#16110d', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.74rem' }}>
                          Ejecutar en las Sombras
                        </button>
                        <button onClick={() => handleVerdict('COVER_UP_ALLIANCE')} style={{ background: '#16110d', border: '1px solid #22c55e', color: '#22c55e', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.74rem' }}>
                          Pacto & Encubrimiento (Nueva Ancla)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#887b6a', fontStyle: 'italic' }}>
                  No hay expedientes activos. Haz clic en "+ Generar Caso" para comenzar a investigar.
                </div>
              )}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* CUADRANTE 4: CRÓNICA DEL DESTINO & DILEMAS DE ACTUACIÓN (BOTTOM-RIGHT)   */}
        {/* ========================================================================= */}
        <section className="card-frame" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3d3122', paddingBottom: '6px' }}>
            <h3 className="cinzel" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', margin: 0 }}>
              <ScrollText size={17} /> IV. Crónica del Destino & Actuación
            </h3>
            <button onClick={handlePerformDivination} style={{ background: '#241a12', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '2px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Dices size={13} /> Tirada de Adivinación
            </button>
          </div>

          {/* Resultado de Tirada Espiritual */}
          {divinationResult && (
            <div className="whisper-bubble" style={{ borderLeftColor: '#9b6fe0', color: '#e9d5ff', fontSize: '0.78rem' }}>
              {divinationResult}
            </div>
          )}

          {/* Dilema de Actuación Canónico */}
          {dilemma ? (
            <div style={{ background: '#19140f', padding: '10px 12px', borderRadius: '4px', border: '1px solid #382c1e' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                {dilemma.title || dilemma.sequenceName} ({dilemma.pathway} · S{dilemma.sequence})
              </div>
              <div style={{ fontSize: '0.8rem', color: '#d1c5b4', margin: '4px 0', lineHeight: '1.4' }}>
                {dilemma.situation || dilemma.description}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#f59e0b', fontStyle: 'italic', marginBottom: '8px' }}>
                Ley de la Vía: "{dilemma.principleText || dilemma.corePrinciple}"
              </div>

              {/* Opciones de Actuación */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {safeChoices.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => handleResolveDilemma(c.id)}
                    className={c.isAlignedWithPrinciple ? 'choice-card-aligned' : 'choice-card-conflict'}
                  >
                    <div style={{ fontWeight: 'bold', color: c.isAlignedWithPrinciple ? '#4ade80' : '#f87171', fontSize: '0.84rem' }}>
                      {c.label || c.text}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#ccc', marginTop: '2px' }}>
                      {c.description}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '3px' }}>
                      Digestión: +{c.digestionGain}% · Sanidad: {c.sanityDelta >= 0 ? `+${c.sanityDelta}` : c.sanityDelta} · Sospecha: +{c.policeSuspicionDelta}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#887b6a', fontStyle: 'italic' }}>
              No hay dilemas activos en este momento.
            </div>
          )}

          {/* Registro Narrativo Histórico */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 'bold', marginBottom: '4px' }}>
              Registro Histórico de la Simulación:
            </span>
            <div style={{ flex: 1, background: '#0a0806', padding: '8px', borderRadius: '4px', border: '1px solid #221a14', overflowY: 'auto', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {safeLogs.map(l => (
                <div key={l.id} style={{ display: 'flex', gap: '6px', lineHeight: '1.35' }}>
                  <span style={{ color: '#6e6150', minWidth: '38px' }}>[{l.time}]</span>
                  <span style={{ color: l.type === 'ACTING' ? '#22c55e' : l.type === 'COMBAT' ? '#ef4444' : l.type === 'INVESTIGATION' ? '#f59e0b' : l.type === 'CITY' ? '#38bdf8' : '#aaa' }}>
                    {l.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
