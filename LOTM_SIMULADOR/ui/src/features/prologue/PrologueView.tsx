import { useState, useEffect, useRef } from 'react';
import type { CharacterDiegetic } from '../types';
import { LetterUnfoldModal } from '../../components/common/LetterUnfoldModal';

interface OriginTemplate {
  id: string;
  name: string;
  profession: string;
  district: string;
  salaryDesc: string;
  burden: { type: 'DEUDA' | 'SECRETO'; description: string };
  anchors: string[];
  flavorText: string;
  imageUrl?: string;
}

const CANONICAL_ORIGINS: OriginTemplate[] = [
  {
    id: 'ORIGIN_CLERK',
    name: 'Escribiente Notarial',
    profession: 'Oficial de Actas y Archivo Notarial',
    district: 'Hillston',
    salaryDesc: '2 libras, 5 chelines semanales',
    burden: { type: 'DEUDA', description: 'Pagaré hipotecario de 30 libras con la firma de un fiador fallecido' },
    anchors: ['El Libro Matriz de Actas Notariales', 'Sr. Kenneth (Notario titular)', 'El Café de la Esquina de Saint Jude'],
    flavorText: 'Copias escrituras y firmas con tinta ferrogálica mientras el polvo de papel carcome tus pulmones.',
    imageUrl: '/art/GFX36A_origin_clerk.jpg'
  },
  {
    id: 'ORIGIN_MEDICAL_STUDENT',
    name: 'Estudiante de Medicina',
    profession: 'Practicante de Anatomía y Cirugía',
    district: 'Borough de Backlund',
    salaryDesc: '1 libra, 15 chelines semanales',
    burden: { type: 'SECRETO', description: 'Tráfico de cadáveres no reclamados para el anfiteatro de disección' },
    anchors: ['Bisturí con el blasón de la Facultad', 'Doctor Watson (Tutor de patología)', 'El Anfiteatro de Disección a medianoche'],
    flavorText: 'Tus manos huelen a fenol y formol. Conoces los órganos por su textura y el frío de la muerte.',
    imageUrl: '/art/GFX36B_origin_medical_student.jpg'
  },
  {
    id: 'ORIGIN_REPORTER',
    name: 'Corresponsal de Sucesos',
    profession: 'Cronista Policial de Diario',
    district: 'Cherwood',
    salaryDesc: '2 libras semanales',
    burden: { type: 'SECRETO', description: 'Cuaderno con nombres de confidentes policiales sobornados' },
    anchors: ['La Máquina de Escribir Remington', 'Subinspector Lestrade (Enlace policial)', 'La Redacción de The Daily Observer'],
    flavorText: 'La tinta fresca en tus dedos y el fango en las suelas de tus botas persiguen el hedor de los crímenes de Backlund.',
    imageUrl: '/art/GFX36C_origin_reporter.jpg'
  },
  {
    id: 'ORIGIN_FRAUDULENT_MEDIUM',
    name: 'Espiritista de Salón',
    profession: 'Adivina y Guía Espiritual de Salón',
    district: 'Distrito Oeste',
    salaryDesc: '3 libras semanales de honorarios volátiles',
    burden: { type: 'DEUDA', description: 'Deuda usurera de 45 libras con un prestamista del Distrito Este' },
    anchors: ['Péndulo de cuarzo tallado', 'Madame Vivienne (Mecenas de la alta sociedad)', 'El Salón de Terciopelo Negro'],
    flavorText: 'Haces tintinear campanillas ocultas bajo la mesa para señoras de luto, fingiendo hablar con los difuntos.',
    imageUrl: '/art/GFX36D_origin_medium.jpg'
  },
  {
    id: 'ORIGIN_DOCKWORKER',
    name: 'Estibador de Muelles',
    profession: 'Capataz de Carga Fluvial',
    district: 'Distrito Este',
    salaryDesc: '1 libra, 2 chelines semanales',
    burden: { type: 'DEUDA', description: 'Deuda por multa de huelga portuaria no autorizada' },
    anchors: ['Gancho de hierro forjado de carga', 'Old Barnaby (Patrón de chalana)', 'La Taberna del Marinero Ahogado'],
    flavorText: 'Tus hombros conocen el peso de los fardos de ultramar y el alquitrán del río Tussock.',
    imageUrl: '/art/GFX36E_origin_dockworker.jpg'
  },
  {
    id: 'ORIGIN_PRIVATE_INVESTIGATOR',
    name: 'Detective Privado',
    profession: 'Investigador de Averías y Desapariciones',
    district: 'Cherwood',
    salaryDesc: 'Honorarios según encargos (promedio 2 libras)',
    burden: { type: 'DEUDA', description: 'Alquiler acumulado de tres meses del despacho en Minsk Street' },
    anchors: ['Lupa de latón con mango de ébano', 'Sra. Higgins (Casera enérgica)', 'La Oficina de Minsk Street'],
    flavorText: 'Los pasos en la escalera de madera siempre anuncian clientes deseperados o acreedores pacientes.',
    imageUrl: '/art/GFX36F_origin_detective.jpg'
  }
];

interface PrologueViewProps {
  onCompletePrologue: (character: CharacterDiegetic) => void;
}

export const PrologueView: React.FC<PrologueViewProps> = ({ onCompletePrologue }) => {
  const [step, setStep] = useState<'ORIGIN_SELECT' | 'LETTER' | 'DILEMMA' | 'POTION_CHOICE' | 'RITUAL_DARKEN' | 'HOLD_TO_DRINK' | 'DRINKING' | 'AWAKENING'>('ORIGIN_SELECT');
  const [selectedOrigin, setSelectedOrigin] = useState<OriginTemplate>(CANONICAL_ORIGINS[0]);
  const [characterName, setCharacterName] = useState<string>('Arthur Pendelton');
  
  // Decisión del dilema tutorial
  const [dilemmaChoice, setDilemmaChoice] = useState<'PRUDENCIA' | 'CURIOSIDAD' | null>(null);
  
  // Elección de frasco
  const [potionChoice, setPotionChoice] = useState<'COBALTO' | 'AMBAR' | null>(null);
  
  // Checklist de apagado de lámparas
  const [extinguishedLamps, setExtinguishedLamps] = useState<{ [key: string]: boolean }>({
    window_gas: false,
    shelf_oil: false,
    entry_candle: false
  });

  // Hold-to-Drink states
  const [holdProgressMs, setHoldProgressMs] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdInterruptedText, setHoldInterruptedText] = useState<string | null>(null);
  const holdIntervalRef = useRef<any>(null);
  const holdStartTimeRef = useRef<number>(0);
  
  // Telemetría de vacilación
  const drinkPromptTime = useRef<number>(0);

  useEffect(() => {
    if (step === 'POTION_CHOICE' || step === 'HOLD_TO_DRINK') {
      drinkPromptTime.current = Date.now();
    }
  }, [step]);

  // Manejo del Hold-to-Drink (3 segundos de sujeción física continua)
  const startHold = () => {
    setIsHolding(true);
    setHoldInterruptedText(null);
    holdStartTimeRef.current = Date.now();
    
    holdIntervalRef.current = setInterval(() => {
      setHoldProgressMs(prev => {
        const next = prev + 100;
        if (next >= 3000) {
          clearInterval(holdIntervalRef.current);
          setIsHolding(false);
          setStep('DRINKING');
          return 3000;
        }
        return next;
      });
    }, 100);
  };

  const cancelHold = () => {
    if (isHolding && holdProgressMs < 3000) {
      clearInterval(holdIntervalRef.current);
      setIsHolding(false);
      setHoldInterruptedText('Retiras la mano con el pulso desbocado... Tu respiración resuena en la oscuridad. La esencia aún aguarda.');
      setHoldProgressMs(0);
    }
  };

  const handleToggleLamp = (lampKey: string) => {
    const updated = { ...extinguishedLamps, [lampKey]: true };
    setExtinguishedLamps(updated);
    if (updated.window_gas && updated.shelf_oil && updated.entry_candle) {
      setTimeout(() => setStep('HOLD_TO_DRINK'), 600);
    }
  };

  const handleStartRitual = (choice: 'COBALTO' | 'AMBAR') => {
    const elapsed = Date.now() - drinkPromptTime.current;
    console.log('[PROLOGUE TELEMETRY] hesitation_ms:', elapsed);
    setPotionChoice(choice);
    setStep('RITUAL_DARKEN');
  };

  const handleFinishPrologue = async () => {
    const isFool = potionChoice === 'COBALTO';
    let charId = `char_${Date.now()}`;

    try {
      const res = await fetch('/api/character/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: characterName,
          pathway: isFool ? 'FOOL' : 'SPECTATOR',
          startingCity: selectedOrigin.district || 'Backlund - Distrito de Cherwood',
          background: selectedOrigin.profession || 'Detective Privado',
          socialClass: 'MIDDLE_CLASS'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.character?.id) {
          charId = data.character.id;
          localStorage.setItem('lotm_active_character_id', charId);
        }
      }
    } catch {
      // Fallback local en caso de desconexión
    }
    
    // Crear el personaje diegético completo con Ruina 5 (Marcado) y Corrupción limpia
    const newChar: CharacterDiegetic = {
      id: charId,
      name: characterName,
      profession: selectedOrigin.profession,
      originTitle: selectedOrigin.name,
      district: selectedOrigin.district,
      pathwayName: isFool ? 'The Fool' : 'Visionary',
      sequenceTitle: isFool ? 'Vidente (Secuencia 9)' : 'Espectador (Secuencia 9)',
      initialBurden: {
        type: selectedOrigin.burden.type,
        description: selectedOrigin.burden.description,
        details: 'Compromiso formal que pesa sobre tu rutina civil.'
      },
      somatics: {
        sanityTier: 'BRILLANTE',
        candleDescription: 'La llama arde erguida y clara sobre el candelero de peltre.',
        corruptionTier: 'AZOGUE_LIMPIO',
        mirrorDescription: 'El azogue refleja tu semblante humano sin sombras ajenas.',
        ruinaTier: 'MARCADO',
        woodDescription: 'Una grieta delgada y oscura en la esquina de la mesa: el primer trago ha dejado una huella indeleble en tu destino.'
      },
      walletText: '2 soberanos de oro, 8 chelines de plata y 4 peniques de cobre',
      actingCoherence: 'COHERENTE',
      actingFeedback: isFool 
        ? 'Interpretar el papel de adivino requiere contemplar el destino sin dejarse cegar por él.'
        : 'Observar a la multitud desde el silencio revela los engranajes secretos de la psique.',
      actingDiary: [
        {
          id: 'acting_tutorial_1',
          day: 1,
          principle: isFool ? 'El Vidente descifra los hilos del destino' : 'El Espectador atestigua sin intervenir',
          choiceTaken: dilemmaChoice === 'PRUDENCIA' ? 'Prudencia Civil' : 'Curiosidad del Sabueso',
          narrativeOutcome: dilemmaChoice === 'PRUDENCIA'
            ? 'Apartaste la mirada a tiempo, preservando tu tapadera civil y asegurando tu coartada.'
            : 'Rompiste el lacre examinando la cera, descubriendo el símbolo velado del Benefactor.'
        }
      ],
      anchors: selectedOrigin.anchors.map((anchorName, idx) => ({
        id: `anchor_origin_${idx}`,
        tipo: idx === 0 ? 'rol' : idx === 1 ? 'persona' : 'lugar',
        nombre: anchorName,
        descripcion: 'Un lazo que te recuerda quién eras antes de tocar lo oculto.',
        fuerza: 'FIRME'
      })),
      policeSuspicionText: 'La patrulla de ronda camina por la calzada sin detenerse ante tu zaguán.',
      churchSuspicionText: 'Las campanas de la parroquia doblan con normalidad; el clero ignora tu existencia.'
    };

    onCompletePrologue(newChar);
  };

  return (
    <div 
      className="prologue-screen w-[1920px] h-[1080px] w-full h-full flex items-center justify-center p-6 select-none relative overflow-hidden"
      style={{
        backgroundImage: 'url(/art/GFX47_prologue_hallway.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#090807'
      }}
    >
      {/* Velo atmosférico victoriano sobre el zaguán */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(9, 8, 7, 0.78) 0%, rgba(5, 4, 3, 0.94) 100%)'
        }}
      />
      
      {/* Paso 1: Selección de Origen Canónico */}
      {step === 'ORIGIN_SELECT' && (
        <div className="w-full max-w-4xl parchment-sheet p-8 rounded shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-widest text-[#1f1a14]" style={{ fontFamily: 'Cinzel' }}>
              IDENTIDAD Y ORIGEN EN BACKLUND
            </h1>
            <p className="text-sm text-[#554a3b] italic">
              Año 1353 de la Quinta Época · La niebla de carbón cubre la capital del Imperio de Loen
            </p>
          </div>

          <div className="mb-6 flex justify-center items-center gap-4">
            <label className="font-serif font-bold text-sm text-[#1f1a14]">Nombre Civil:</label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="px-3 py-1 bg-[#eae2cf] border border-[#c4b59a] text-[#1f1a14] rounded font-serif text-sm focus:outline-none focus:border-[#8c733e]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {CANONICAL_ORIGINS.map((origin) => {
              const isSelected = selectedOrigin.id === origin.id;
              return (
                <div
                  key={origin.id}
                  onClick={() => setSelectedOrigin(origin)}
                  className={`p-4 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-[#e4dac4] border-[#8c733e] shadow-md' 
                      : 'bg-[#ede5d3] border-[#d1c5ad] hover:bg-[#e6dcc6]'
                  }`}
                >
                  <div>
                    {/* Miniatura de Viñeta de Oficio GFX36A-F */}
                    {origin.imageUrl && (
                      <div style={{ width: '100%', height: '96px', overflow: 'hidden', borderRadius: '4px', marginBottom: '8px', border: '1px solid #c4b59a', backgroundColor: '#d9cdb8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={origin.imageUrl} 
                          alt={origin.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <h3 className="font-serif font-bold text-base text-[#1f1a14] mb-1" style={{ fontFamily: 'Cinzel' }}>
                      {origin.name}
                    </h3>
                    <p className="text-xs text-[#6b5f4f] mb-2 font-serif italic">
                      {origin.district} · {origin.salaryDesc}
                    </p>
                    <p className="text-xs text-[#2a241d] leading-relaxed mb-3">
                      {origin.flavorText}
                    </p>
                  </div>
                  <div className="border-t border-[#c7bba2] pt-2 text-[11px] text-[#524536]">
                    <strong>Carga:</strong> {origin.burden.description}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep('LETTER')}
              className="crimson-btn px-6 py-2 text-sm uppercase tracking-wider"
            >
              Comenzar la Vigilia
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: La Carta en Vitela del Benefactor (GFX48) */}
      {step === 'LETTER' && (
        <LetterUnfoldModal
          isOpen={true}
          onClose={() => setStep('ORIGIN_SELECT')}
          title="De un Benefactor Silencioso"
          senderName="Un Benefactor Silencioso"
          recipientName={characterName}
          paragraphs={[
            `Sé de tus noches en vela en el desván de ${selectedOrigin.district}. Sé de las cargas que arrastras y del peso silencioso de tu vida civil como ${selectedOrigin.profession}.`,
            "En el pequeño cofre de caoba sobre el escritorio hallarás dos frascos de vidrio soplado. Ninguno de ellos es veneno común; ambos te arrancarán del letargo de los ciegos.",
            "Una vez que bebas, no habrá retorno al sosiego profano. La niebla de Backlund te observará tanto como tú a ella."
          ]}
          postscript="El carmesí de la cera guarda el rastro de una mano que no vuelve a escribir dos veces."
          actionButtonText="Examinar la Carta y el Sello"
          onAcknowledge={() => setStep('DILEMMA')}
          waxSealDescription="Sello de lacre carmesí intacto con un grabado vertical arcaico"
          initialState="SEALED"
        />
      )}

      {/* Paso 3: Dilema de Iniciación Tutorial */}
      {step === 'DILEMMA' && (
        <div className="w-full max-w-2xl parchment-sheet p-8 rounded shadow-2xl">
          <h3 className="text-lg font-bold text-[#1f1a14] mb-3" style={{ fontFamily: 'Cinzel' }}>
            El Dilema del Zaguán
          </h3>
          <p className="text-sm text-[#3b3226] leading-relaxed mb-6 font-serif">
            Antes de tocar los frascos, el peso de tu vida anterior golpea tu pecho. La prudencia aconseja memorizar las palabras y quemar el papel de inmediato para no levantar sospechas; la curiosidad te insta a despegar la cera para estudiar la impronta secreta.
          </p>

          <div className="space-y-4 mb-6">
            <div
              onClick={() => setDilemmaChoice('PRUDENCIA')}
              className={`p-4 rounded border cursor-pointer transition-all ${
                dilemmaChoice === 'PRUDENCIA' 
                  ? 'bg-[#e0d5bd] border-[#8c733e]' 
                  : 'bg-[#eae0cb] border-[#cfc3aa] hover:bg-[#e4dac4]'
              }`}
            >
              <h4 className="font-bold text-sm text-[#1f1a14] mb-1 font-serif">
                Prudencia Civil: Destruir la vitela y asegurar la coartada
              </h4>
              <p className="text-xs text-[#594d3d]">
                Reduces cualquier rastro incriminatorio. Tus anclas con la vida ordinaria permanecen seguras.
              </p>
            </div>

            <div
              onClick={() => setDilemmaChoice('CURIOSIDAD')}
              className={`p-4 rounded border cursor-pointer transition-all ${
                dilemmaChoice === 'CURIOSIDAD' 
                  ? 'bg-[#e0d5bd] border-[#8c733e]' 
                  : 'bg-[#eae0cb] border-[#cfc3aa] hover:bg-[#e4dac4]'
              }`}
            >
              <h4 className="font-bold text-sm text-[#1f1a14] mb-1 font-serif">
                Curiosidad del Sabueso: Despegar con cautela el lacre intacto
              </h4>
              <p className="text-xs text-[#594d3d]">
                Obtienes una pista documental invaluable sobre el remitente antes de que la ceniza se lo lleve.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={!dilemmaChoice}
              onClick={() => setStep('POTION_CHOICE')}
              className="crimson-btn px-6 py-2 text-sm disabled:opacity-50"
            >
              Abrir el Cofre de los Frascos
            </button>
          </div>
        </div>
      )}

      {/* Paso 4: La Elección Críptica de Poción */}
      {step === 'POTION_CHOICE' && (
        <div className="w-full max-w-4xl parchment-sheet p-8 rounded shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#1f1a14]" style={{ fontFamily: 'Cinzel' }}>
              LOS DOS FRASCOS SOBRE EL TERCIOPELO
            </h2>
            <p className="text-sm text-[#554a3b] italic mt-1">
              Dos recipientes herméticos descansan en el fondo del cofre. No hay nombres ni fórmulas inscritas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            
            {/* Opción A: Frasco Cobalto (The Fool / Vidente) */}
            <div 
              className="p-5 rounded bg-[#ebe2ce] border border-[#bfae91] flex flex-col justify-between items-center text-center"
            >
              <div className="w-full flex flex-col items-center">
                <div className="w-32 h-44 mb-3 rounded overflow-hidden border border-[#94a3b8] bg-[#1e293b]/10 shadow-inner flex items-center justify-center">
                  <img 
                    src="/art/GFX50_potion_cobalt_eyes.jpg" 
                    alt="Poción Ojos de Cobalto"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-serif font-bold text-base text-[#1e293b] mb-1" style={{ fontFamily: 'Cinzel' }}>
                  Frasco de Vidrio Cobalto
                </h3>
                <p className="text-xs text-[#334155] leading-relaxed mb-3">
                  El líquido en su interior es de un azul nocturno profundo. Al mover el frasco suavemente, partículas plateadas giran como un torbellino estrellado y diminutos ojos dorados parecen abrirse y cerrarse.
                </p>
                <div className="text-xs text-[#475569] italic border-t border-[#d8ccb8] pt-2 w-full">
                  "El destino es un hilo invisible. Quien no teme la incertidumbre aprende a contemplar su tejido."
                </div>
              </div>

              <button
                onClick={() => handleStartRitual('COBALTO')}
                className="mt-6 w-full py-2.5 bg-[#1e293b] text-[#e2e8f0] font-serif font-bold text-xs uppercase tracking-wider rounded hover:bg-[#0f172a] transition-all shadow-md"
              >
                Elegir el Frasco Cobalto (Fool)
              </button>
            </div>

            {/* Opción B: Frasco Ámbar (Visionary / Espectador) */}
            <div 
              className="p-5 rounded bg-[#ebe2ce] border border-[#bfae91] flex flex-col justify-between items-center text-center"
            >
              <div className="w-full flex flex-col items-center">
                <div className="w-32 h-44 mb-3 rounded overflow-hidden border border-[#d97706]/40 bg-[#451a03]/10 shadow-inner flex items-center justify-center">
                  <img 
                    src="/art/GFX51_potion_amber_mirror.jpg" 
                    alt="Poción Espejo de Ámbar"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-serif font-bold text-base text-[#78350f] mb-1" style={{ fontFamily: 'Cinzel' }}>
                  Frasco de Vidrio Ámbar
                </h3>
                <p className="text-xs text-[#451a03] leading-relaxed mb-3">
                  Un líquido dorado y espeso descansa en quietud absoluta. La superficie es tan nítida como un espejo veneciano, reflejando el zaguán con una quietud perturbadora que apacigua el pulso.
                </p>
                <div className="text-xs text-[#78350f] italic border-t border-[#d8ccb8] pt-2 w-full">
                  "El mundo es un gran teatro. Quien renuncia a ser protagonista aprende a leer los pensamientos."
                </div>
              </div>

              <button
                onClick={() => handleStartRitual('AMBAR')}
                className="mt-6 w-full py-2.5 bg-[#78350f] text-[#fef3c7] font-serif font-bold text-xs uppercase tracking-wider rounded hover:bg-[#451a03] transition-all shadow-md"
              >
                Elegir el Frasco Ámbar (Visionary)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Paso 4.b: Escenificación del Ritual — Apagar las Lámparas una a una */}
      {step === 'RITUAL_DARKEN' && (
        <div className="w-full max-w-xl text-center p-8 bg-[#14110e]/95 border border-[#4a3622] rounded shadow-2xl z-30 font-serif relative">
          {/* Ilustración de la Lámpara GFX49 */}
          <div className="w-24 h-32 mx-auto mb-4 rounded overflow-hidden border border-[#5e4326] bg-[#0c0a08]">
            <img 
              src="/art/GFX49_gas_lamp.jpg" 
              alt="Lámpara de gas de Backlund"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-xl font-bold tracking-wider text-[#d4af37] cinzel mb-2">
            LA CLAUSURA DE LA LUZ
          </h2>
          <p className="text-xs text-[#b8a68d] italic mb-6">
            "Para escuchar la voz del abismo, ninguna llama mortal debe competir con la esencia."
          </p>

          <div className="space-y-3 max-w-md mx-auto mb-6 text-left">
            <button
              onClick={() => handleToggleLamp('window_gas')}
              disabled={extinguishedLamps.window_gas}
              className={`w-full p-3 rounded border text-xs flex justify-between items-center transition-all ${
                extinguishedLamps.window_gas
                  ? 'bg-[#0a0806] text-[#544432] border-[#241a10] line-through'
                  : 'bg-[#1f1912] text-[#dfcaa2] border-[#5e4326] hover:border-[#d4af37]'
              }`}
            >
              <span>1. Cerrar la llave de gas de la ventana exterior</span>
              <span>{extinguishedLamps.window_gas ? 'EXTINTA' : 'ENCENDIDA'}</span>
            </button>

            <button
              onClick={() => handleToggleLamp('shelf_oil')}
              disabled={extinguishedLamps.shelf_oil}
              className={`w-full p-3 rounded border text-xs flex justify-between items-center transition-all ${
                extinguishedLamps.shelf_oil
                  ? 'bg-[#0a0806] text-[#544432] border-[#241a10] line-through'
                  : 'bg-[#1f1912] text-[#dfcaa2] border-[#5e4326] hover:border-[#d4af37]'
              }`}
            >
              <span>2. Apagar el quinqué de queroseno de la estantería</span>
              <span>{extinguishedLamps.shelf_oil ? 'EXTINTA' : 'ENCENDIDA'}</span>
            </button>

            <button
              onClick={() => handleToggleLamp('entry_candle')}
              disabled={extinguishedLamps.entry_candle}
              className={`w-full p-3 rounded border text-xs flex justify-between items-center transition-all ${
                extinguishedLamps.entry_candle
                  ? 'bg-[#0a0806] text-[#544432] border-[#241a10] line-through'
                  : 'bg-[#1f1912] text-[#dfcaa2] border-[#5e4326] hover:border-[#d4af37]'
              }`}
            >
              <span>3. Apagar la vela de sebo del zaguán</span>
              <span>{extinguishedLamps.entry_candle ? 'EXTINTA' : 'ENCENDIDA'}</span>
            </button>
          </div>

          <p className="text-[11px] text-[#735e46] italic">
            Haz clic sobre cada foco de luz para extinguirlo.
          </p>
        </div>
      )}

      {/* Paso 4.c: Hold-to-Drink — Sujetar para Beber (Hesitación Física) */}
      {step === 'HOLD_TO_DRINK' && (
        <div className="w-full max-w-lg text-center p-8 bg-[#0a0806]/95 border border-[#382618] rounded shadow-2xl z-30 font-serif select-none">
          <h2 className="text-lg font-bold tracking-widest text-[#d4af37] cinzel mb-1">
            EL CÁLIZ EN LA OSCURIDAD
          </h2>
          <p className="text-xs text-[#8c7a65] italic mb-6">
            Mantén presionado para alzar la pócima y beber. Soltar antes retira la mano temblando.
          </p>

          {/* Animación del Frasco de Poción elevándose según progreso */}
          <div className="h-44 flex flex-col items-center justify-center relative mb-4">
            <div 
              className="transition-transform duration-100 ease-out"
              style={{
                transform: `translateY(-${(holdProgressMs / 3000) * 40}px) scale(${1 + (holdProgressMs / 3000) * 0.12})`
              }}
            >
              <div className="w-24 h-36 rounded overflow-hidden border-2 border-[#d4af37] shadow-2xl bg-[#120f0c]">
                <img 
                  src={potionChoice === 'COBALTO' ? '/art/GFX50_potion_cobalt_eyes.jpg' : '/art/GFX51_potion_amber_mirror.jpg'}
                  alt="Frasco de Poción"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Prosa Progresiva que aparece línea a línea al sostener */}
          <div className="h-20 flex items-center justify-center text-xs italic text-[#ded5c5] leading-relaxed mb-6 max-w-sm mx-auto">
            {holdProgressMs >= 2400 ? (
              <p className="text-[#facc15] font-semibold animate-fadeIn">
                "Tragas hasta la última gota. El abismo despierta en tu garganta."
              </p>
            ) : holdProgressMs >= 1400 ? (
              <p className="text-[#e2e8f0] animate-fadeIn">
                "El mundo físico se disuelve en una marea de silencio... el pulso cósmico se aproxima."
              </p>
            ) : holdProgressMs >= 400 ? (
              <p className="text-[#94a3b8] animate-fadeIn">
                "La frialdad del cristal quema tus labios temblorosos..."
              </p>
            ) : holdInterruptedText ? (
              <p className="text-[#f87171] animate-fadeIn">
                "{holdInterruptedText}"
              </p>
            ) : (
              <p className="text-[#64748b]">
                Sostén firmemente para apurar el trago.
              </p>
            )}
          </div>

          {/* Botón Físico de Hold */}
          <div className="flex justify-center">
            <button
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              className={`px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                isHolding 
                  ? 'bg-[#851c22] text-[#ffffff] border-[#d4af37] scale-95 shadow-[0_0_20px_rgba(212,175,55,0.5)]' 
                  : 'bg-[#1f1710] text-[#dfcaa2] border-[#5e4326] hover:border-[#d4af37]'
              }`}
            >
              {isHolding ? 'Bebiendo la Esencia...' : 'Mantener Pulsado para Beber'}
            </button>
          </div>

          {/* Barra de progreso de hesitación física */}
          <div className="w-48 h-1 bg-[#1a120b] rounded-full mx-auto mt-4 overflow-hidden border border-[#3d2715]">
            <div 
              className="h-full bg-[#d4af37] transition-all duration-100"
              style={{ width: `${(holdProgressMs / 3000) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Paso 5: El Trago Tipográfico Solemne */}
      {step === 'DRINKING' && (
        <div className="w-full max-w-2xl text-center p-8 select-none">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-widest text-[#d4af37] mb-4" style={{ fontFamily: 'Cinzel' }}>
              EL UMBRAL
            </h2>
            <div className="w-24 h-0.5 bg-[#d4af37] mx-auto mb-6"></div>
          </div>

          <div className="text-[#e5ded2] text-base leading-relaxed italic space-y-6 max-w-xl mx-auto font-serif">
            {potionChoice === 'COBALTO' ? (
              <>
                <p>
                  "La poción cobalto arde como licor de alcanfor en tu garganta y se hiela en tu estómago."
                </p>
                <p>
                  "El suelo del desván desaparece bajo tus pies y caes en un océano interminable de niebla gris ceniza. Sobre la niebla, una sombra colosal ataviada con una túnica de bufón mueve sus dedos con lentitud, manipulando hilos luminosos que conectan estrellas distantes."
                </p>
                <p>
                  "Tu mente se expande con vértigo y tus pupilas captan los matices del mundo espiritual."
                </p>
              </>
            ) : (
              <>
                <p>
                  "El líquido dorado fluye espeso y dulce, calmando los latidos de tu corazón hasta volverlos casi imperceptibles."
                </p>
                <p>
                  "Tus sentidos se desprenden de tu carne y te encuentras flotando sobre un mar profundo y oscuro de conciencia colectiva. En las profundidades del abismo mental, una pupila descomunal de dragón vertical se abre sin parpadear, observándote con infinita indiferencia."
                </p>
                <p>
                  "El mundo deja de ser una batalla de fuerzas y se convierte en una galería de máscaras y emociones transparentes."
                </p>
              </>
            )}
          </div>

          <div className="mt-10">
            <button
              onClick={() => setStep('AWAKENING')}
              className="crimson-btn px-8 py-3 text-sm tracking-widest uppercase font-bold"
            >
              Abrir los Ojos
            </button>
          </div>
        </div>
      )}

      {/* Paso 6: El Despertar S9 y Entrada al Desván */}
      {step === 'AWAKENING' && (
        <div className="w-full max-w-2xl parchment-sheet p-8 rounded shadow-2xl">
          <h2 className="text-xl font-bold text-[#1f1a14] mb-3 text-center" style={{ fontFamily: 'Cinzel' }}>
            EL DESPERTAR EN BACKLUND
          </h2>
          
          <div className="text-sm text-[#1f1a14] leading-relaxed font-serif space-y-4 mb-6 italic">
            {potionChoice === 'COBALTO' ? (
              <p>
                "Abres los ojos jadeando contra el suelo de madera húmeda. Las luces de gas del alumbrado público acaban de apagarse al amanecer. A través de la ventana, la gente camina hacia las fábricas, pero ahora distingues tenues halos de colores rodeando sus cabezas: auras de cansancio, miedo y deseo. Has cruzado el umbral: eres un Vidente de la Secuencia 9."
              </p>
            ) : (
              <p>
                "Despiertas con la respiración serena y las manos inmóviles sobre tu regazo. Afuera, un cochero insulta a un jornalero; puedes percibir con precisión quirúrgica que su ira nace del miedo a no pagar el forraje de sus caballos. El teatro humano se ha vuelto legible. Ya no eres un actor ingenuo: eres un Espectador de la Secuencia 9."
              </p>
            )}
            <p className="text-xs text-[#554a3b] border-t border-[#c4b59a] pt-3">
              * El primer trago ha dejado una cicatriz indeleble en tu destino. Tu humanidad está marcada, pero tu entendimiento de lo sobrenatural acaba de nacer.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleFinishPrologue}
              className="crimson-btn px-8 py-3 text-sm uppercase tracking-wider font-bold"
            >
              Tomar Asiento en el Escritorio
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
