/**
 * RITUAL DE ASCENSIÓN — CINCO PUERTAS CANÓNICAS (GFX53 & GFX55)
 * Implementa los 5 Gates canónicos sin porcentajes numéricos y el gesto sostenido de 3 segundos (Hold-to-Drink).
 * Cumple estrictamente con la Ley de Prosa Diegética y la Ley del Objeto.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { CharacterDiegetic } from '../types';
import { apiClient } from '../../services/apiClient';

interface AscensionViewProps {
  character: CharacterDiegetic;
  onBackToDesk: () => void;
  onRefreshCharacter?: () => void;
}

type GateId = 'GATE_FORMULA' | 'GATE_INGREDIENTS' | 'GATE_DIGESTION' | 'GATE_RITUAL_ENV' | 'GATE_DRINK';

interface AscensionGate {
  id: GateId;
  title: string;
  category: string;
  objectDescription: string;
  statusText: string;
  isReady: boolean;
  details: string[];
}

export const AscensionView: React.FC<AscensionViewProps> = ({ character, onBackToDesk, onRefreshCharacter }) => {
  const [phase, setPhase] = useState<'PREPARACION' | 'TRAGO' | 'CONSUMADO'>('PREPARACION');
  const [activeGateDetail, setActiveGateDetail] = useState<GateId | null>(null);
  const [backendStatus, setBackendStatus] = useState<any>(null);

  // Hold-to-Drink states (GFX55)
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgressMs, setHoldProgressMs] = useState<number>(0);
  const [interruptionFeedback, setInterruptionFeedback] = useState<string | null>(null);
  
  const holdIntervalRef = useRef<any>(null);
  const holdStartTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(0);

  const isFool = character.pathwayName.toLowerCase().includes('fool');
  const targetSequenceTitle = isFool ? 'Payaso (Clown - Secuencia 8)' : 'Telépata (Telepathist - Secuencia 8)';

  useEffect(() => {
    sessionStartTimeRef.current = Date.now();
    if (character?.id) {
      apiClient.getAscensionStatus(character.id)
        .then(res => {
          if (res?.status) {
            setBackendStatus(res.status);
          }
        })
        .catch(() => {});
      apiClient.prepareAscension({
        characterId: character.id,
        checklist: {
          lugar: true,
          momento: true,
          materiales_rituales: true,
          costos_anclaje: true
        },
        markPresented: true
      }).catch(() => {});
    }
  }, [character?.id]);

  const ingredientsReady = backendStatus ? Boolean(backendStatus.door2_ingredients?.passed) : false;
  const digestionReady = backendStatus ? Boolean(backendStatus.door3_digestion?.passed) : false;
  const formulaReady = backendStatus ? Boolean(backendStatus.door1_formula?.passed) : true;
  const prepReady = backendStatus ? Boolean(backendStatus.door4_preparation?.passed) : true;
  const canDrink = backendStatus ? Boolean(backendStatus.canDrink) : false;

  // Definición diegética de las 5 Puertas Canónicas (GFX53)
  const gates: AscensionGate[] = [
    {
      id: 'GATE_FORMULA',
      title: 'Conocimiento de la Fórmula',
      category: 'Grimorio y Memoria',
      objectDescription: 'El pliego de vitela con anotaciones ferrogálicas y el diagrama de proporciones.',
      statusText: formulaReady 
        ? 'Asimilada en la mente · Proporciones alquímicas verificadas' 
        : 'Fórmula incompleta o no descifrada',
      isReady: formulaReady,
      details: isFool ? [
        'Fórmula canónica de la Secuencia 8 del Camino del Loco.',
        'Estructura de la transmutación: agilidad sobrenatural, control facial absoluto y equilibrio de hilos astrales.',
        'Notas de precaución: la sonrisa forzada puede devorar la identidad si no se dominan los hilos emocionales.'
      ] : [
        'Fórmula canónica de la Secuencia 8 del Camino del Visionario.',
        'Estructura de la transmutación: percepción de estados mentales ajenos, lectura del lenguaje corporal y estabilidad psíquica.',
        'Notas de precaución: el ruido mental de la multitud puede inducir locura si no se mantiene la postura de observador neutral.'
      ]
    },
    {
      id: 'GATE_INGREDIENTS',
      title: 'Ingredientes Extraordinarios y Suplementos',
      category: 'Mortero y Redomas',
      objectDescription: 'Redomas de cristal con extractos preservados sobre el paño de terciopelo.',
      statusText: ingredientsReady
        ? 'Ingredientes principales purificados y medidos al grano'
        : 'Faltan ingredientes principales en el mortero ceremonial',
      isReady: ingredientsReady,
      details: isFool ? [
        'Ingrediente Principal 1: 1x Cristal de Cuerno de Cabra de Hornacis (ING_GOAT_HORN_CRYSTAL).',
        'Ingrediente Principal 2: 1x Tallo de Rosa con Rostro Humano (ING_HUMAN_FACED_ROSE_STALK).',
        'Suplementos: Zumo de estramonio, polvo de girasol negro, polvo de manto dorado y cicuta pura.'
      ] : [
        'Ingrediente Principal 1: 1x Glándula de Dragón Lagarto (ING_LIZARD_DRAGON_GLAND).',
        'Ingrediente Principal 2: 1x Líquido Espinal de Conejo de Falsman (ING_FALSMAN_RABBIT_SPINAL_FLUID).',
        'Suplementos: Brotes de castaño, polvo de diente de dragón y extracto de flores élficas.'
      ]
    },
    {
      id: 'GATE_DIGESTION',
      title: 'Digestión del Papel Previo',
      category: 'Somática y Mecha',
      objectDescription: 'La vela arde serena y el azogue del espejo devuelve una figura sin distorsión.',
      statusText: digestionReady
        ? 'Poción previa asimilada · La voz ajena se ha disuelto por completo'
        : 'Digestión en curso · La asimilación del papel anterior aún no se ha completado',
      isReady: digestionReady,
      details: [
        'Los principios del papel de Secuencia 9 se han integrado en tus reflejos cotidianos.',
        'No quedan residuos de la voluntad primordial en la mecha de tu cordura.',
        'La mente está preparada para recibir una carga espiritual de mayor densidad.'
      ]
    },
    {
      id: 'GATE_RITUAL_ENV',
      title: 'Entorno Ritual y Anclas Humanas',
      category: 'Lugar, Momento y Lazos',
      objectDescription: 'Círculo de sal purificada sobre las tablas de roble y las 3 anclas firmadas.',
      statusText: prepReady
        ? 'Cámara sellada contra ojos curiosos · Vínculos civiles protegen la vigilia'
        : 'El entorno carece de consagración ritual completa',
      isReady: prepReady,
      details: [
        'Lugar: El desván aislado de Backlund, protegido por sal consagrada en los cuatro cuadrantes.',
        'Momento: Conjunción de medianoche bajo la luz velada de la Luna Carmesí.',
        `Anclajes activos: ${character.anchors.map(a => a.nombre).join(', ')}.`
      ]
    },
    {
      id: 'GATE_DRINK',
      title: 'Ingesta del Cáliz de Transmutación',
      category: 'El Cáliz de Peltre',
      objectDescription: 'La poción mezclada reposa en el cáliz emitiendo un fulgor opalescente.',
      statusText: canDrink
        ? 'Listo para el trago ceremonial sostenido de tres segundos'
        : 'El cáliz aguarda los ingredientes requeridos antes de alzarse',
      isReady: canDrink,
      details: [
        'El cáliz debe levantarse con pulso firme.',
        'El líquido debe ingerirse de manera continua sin apartar los labios antes de completar el cruce.',
        'Cualquier vacilación devolverá el brebaje a su estado de reposo.'
      ]
    }
  ];

  // ==========================================================================
  // GFX55: GESTO SOSTENIDO DE BEBER (3 SEGUNDOS DE SUJECIÓN CONTINUA)
  // ==========================================================================
  const startHold = () => {
    if (!canDrink) {
      setInterruptionFeedback('El cáliz está incompleto. Faltan ingredientes esenciales en el mortero para poder sellar la transmutación.');
      return;
    }
    setIsHolding(true);
    setInterruptionFeedback(null);
    holdStartTimeRef.current = Date.now();

    holdIntervalRef.current = setInterval(() => {
      setHoldProgressMs(prev => {
        const next = prev + 100;
        if (next >= 3000) {
          clearInterval(holdIntervalRef.current);
          setIsHolding(false);
          const totalHesitation = Date.now() - sessionStartTimeRef.current;
          console.log('[ASCENSION TELEMETRY] hesitation_ms:', totalHesitation);
          if (character?.id) {
            apiClient.drinkAscensionPotion({
              characterId: character.id,
              confirmedAt: Date.now()
            }).then(() => {
              onRefreshCharacter?.();
            }).catch(err => {
              console.warn('Ascension potion consumption fallback:', err);
            });
          }
          setPhase('TRAGO');
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
      setInterruptionFeedback('Apartas el cáliz con el pulso desbocado... La superficie del líquido ondula suavemente en la penumbra. La esencia aún aguarda.');
      setHoldProgressMs(0);
    }
  };

  const progressRatio = Math.min(1, holdProgressMs / 3000);

  return (
    <div 
      className="ascension-screen p-8 flex flex-col justify-between select-none relative overflow-hidden" 
      style={{ 
        width: '1920px',
        height: '1080px',
        position: 'relative',
        backgroundColor: '#090807',
        backgroundImage: 'url(/art/GFX52_ritual_framing.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Velo atmosférico victoriano para legibilidad de capas */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(9, 8, 7, 0.72) 0%, rgba(5, 4, 3, 0.92) 100%)'
        }}
      />
      
      {/* ==========================================================================
          CABECERA DIEGÉTICA VICTORIANA
          ========================================================================== */}
      <header className="flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            className="p-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-xs font-serif transition-all"
          >
            <ArrowLeft size={16} />
            Regresar a la Mesa del Desván
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
              EL RITUAL DEL SEGUNDO UMBRAL: ASCENSO A SECUENCIA 8
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Destino: {targetSequenceTitle} · Cámara sellada bajo círculo de sal purificada
            </p>
          </div>
        </div>

        {canDrink ? (
          <div className="flex items-center gap-2 bg-[#181410] px-4 py-2 rounded border border-[#3d301f] text-xs text-[#d4af37] font-serif">
            <Sparkles size={14} />
            <span>Cinco Puertas Cumplidas</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#261713] px-4 py-2 rounded border border-[#5a2c20] text-xs text-[#f87171] font-serif">
            <AlertTriangle size={14} />
            <span>Puertas Incompletas</span>
          </div>
        )}
      </header>

      {/* ==========================================================================
          CONTENIDO CENTRAL: LAS 5 PUERTAS Y EL CÁLIZ
          ========================================================================== */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center mb-6 relative z-10">
        
        {/* ==========================================================================
            FASE 1: INSPECCIÓN DE LAS 5 PUERTAS Y EL CÁLIZ INTERACTIVO
            ========================================================================== */}
        {phase === 'PREPARACION' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Columna Izquierda: Los 5 Gates Diegéticos (GFX53) */}
            <div className="md:col-span-7 space-y-3">
              <div className="text-left mb-2">
                <h2 className="text-base font-bold text-[#e5ded2] tracking-wider font-serif uppercase">
                  Requisitos del Segundo Umbral
                </h2>
                <p className="text-xs text-[#8a7b68] italic">
                  Toca cualquier puerta para revisar los preparativos en las tablas del desván.
                </p>
              </div>

              {gates.map((gate, index) => {
                const isSelected = activeGateDetail === gate.id;
                return (
                  <div
                    key={gate.id}
                    onClick={() => setActiveGateDetail(isSelected ? null : gate.id)}
                    className={`p-4 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#221c15] border-[#d4af37] shadow-xl'
                        : 'bg-[#18130e]/90 border-[#3d2c1c] hover:border-[#8c733e] hover:bg-[#1e1812]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#2a1e12] border border-[#8c733e] flex items-center justify-center text-xs text-[#d4af37] font-serif font-bold shrink-0 shadow">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-sm text-[#e5ded2]">
                            {gate.title}
                          </h3>
                          <span className="text-[10px] text-[#a89880] uppercase tracking-wider font-bold">
                            {gate.category}
                          </span>
                        </div>
                      </div>

                      {gate.isReady ? (
                        <span className="text-[11px] text-[#4ade80] font-serif flex items-center gap-1 shrink-0 bg-[#162916]/80 px-2.5 py-0.5 rounded border border-[#234d23]">
                          <ShieldCheck size={12} />
                          Dispuesta
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#f87171] font-serif flex items-center gap-1 shrink-0 bg-[#291616]/80 px-2.5 py-0.5 rounded border border-[#4d2323]">
                          <AlertTriangle size={12} />
                          Incompleta
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#b8a994] font-serif italic mt-2.5 pl-10">
                      {gate.statusText}
                    </p>

                    {/* Detalle expandido al pulsar */}
                    {isSelected && (
                      <div className="mt-3.5 pt-3 border-t border-[#3d2c1c] pl-10 space-y-2 text-xs text-[#e5ded2] font-serif animate-fadeIn">
                        <div className="text-[#d4af37] text-xs font-bold font-serif">
                          {gate.objectDescription}
                        </div>
                        {gate.details.map((d, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                            <span className="text-[#d4af37]">•</span>
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Columna Derecha: El Cáliz Ceremonial y el Gesto Hold-to-Drink (GFX55) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#16120e] rounded-md border border-[#3b2d1d] shadow-2xl text-center">
              
              <div className="text-center mb-4">
                <span className="text-[10px] text-[#8a7964] uppercase tracking-widest font-serif">
                  Quinta Puerta
                </span>
                <h3 className="text-base font-bold text-[#d4af37] mt-0.5" style={{ fontFamily: 'Cinzel' }}>
                  El Cáliz en la Penumbra
                </h3>
              </div>

              {/* Cáliz físico con efecto de pulso y nivel de líquido */}
              <div 
                className="relative w-48 h-48 my-2 flex items-center justify-center cursor-pointer group select-none"
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !isHolding) {
                    e.preventDefault();
                    startHold();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    cancelHold();
                  }
                }}
                role="button"
                aria-label="Mantener presionado para ingerir la poción de Secuencia 8"
              >
                {/* Aura de resonancia circular */}
                <div 
                  className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none ${
                    isHolding ? 'scale-110' : 'scale-100'
                  }`}
                  style={{
                    background: isFool 
                      ? `radial-gradient(circle, rgba(2, 132, 199, ${0.15 + progressRatio * 0.45}) 0%, transparent 70%)`
                      : `radial-gradient(circle, rgba(217, 119, 6, ${0.15 + progressRatio * 0.45}) 0%, transparent 70%)`,
                    border: `1px dashed rgba(212, 175, 55, ${0.2 + progressRatio * 0.6})`
                  }}
                />

                {/* Imagen del Cáliz (GFX22) */}
                <div 
                  className="relative z-10 w-36 h-36 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-2xl flex items-center justify-center transition-transform duration-200 bg-[#16120e]"
                  style={{
                    transform: isHolding ? `scale(${1 + progressRatio * 0.08}) rotate(${progressRatio * 4}deg)` : 'scale(1)'
                  }}
                >
                  <img 
                    src="/art/GFX22_ritual_chalice.jpg" 
                    alt="Cáliz Ceremonial"
                    className="w-full h-full object-cover filter drop-shadow-2xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  
                  {/* Resplandor del Líquido Alquímico en el Borde */}
                  <div 
                    className="absolute top-8 w-16 h-5 rounded-full pointer-events-none transition-opacity duration-300"
                    style={{
                      backgroundColor: isFool ? '#0284c7' : '#d97706',
                      filter: 'blur(4px)',
                      opacity: 0.4 + progressRatio * 0.6
                    }}
                  />
                </div>

                {/* Anillo de progreso SVG perimetral */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(66, 51, 33, 0.4)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke={isFool ? '#38bdf8' : '#fbbf24'}
                    strokeWidth="3"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (289 * progressRatio)}
                    strokeLinecap="round"
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%',
                      transition: isHolding ? 'stroke-dashoffset 100ms linear' : 'stroke-dashoffset 300ms ease-out'
                    }}
                  />
                </svg>
              </div>

              {/* Indicación de interacción */}
              <div className="mt-3">
                <div className="text-xs font-serif font-bold text-[#e5ded2] mb-1">
                  {isHolding ? 'Bebiendo... Mantén el cáliz erguido' : canDrink ? 'Mantén presionado para beber' : 'El cáliz aguarda los ingredientes'}
                </div>
                <p className="text-[11px] text-[#8a7964] italic">
                  {canDrink 
                    ? 'Sujeta el ratón o mantén pulsada la barra espaciadora durante tres segundos.' 
                    : 'Las puertas previas deben sellarse antes de alzar el brebaje.'}
                </p>
              </div>

              {/* Mensaje de vacilación al soltar antes de tiempo */}
              {interruptionFeedback && (
                <div className="mt-4 p-3 bg-[#241712] border border-[#69311e] rounded text-left text-xs text-[#dfcaa2] font-serif italic animate-fadeIn">
                  {interruptionFeedback}
                </div>
              )}

            </div>

          </div>
        )}

        {/* ==========================================================================
            FASE 2: ESCENA AUTORAL DEL TRAGO Y TRANSMUTACIÓN
            ========================================================================== */}
        {phase === 'TRAGO' && (
          <div className="text-center p-8 bg-[#14100c] rounded-md border border-[#3b2d1d] shadow-2xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-widest text-[#d4af37] mb-3" style={{ fontFamily: 'Cinzel' }}>
              LA TRANSMUTACIÓN
            </h2>
            <div className="w-24 h-0.5 bg-[#d4af37] mx-auto mb-6"></div>

            <div className="text-[#e5ded2] text-sm leading-relaxed italic space-y-5 max-w-xl mx-auto font-serif text-justify">
              {isFool ? (
                <>
                  <p>
                    "Acercas el cáliz a tus labios con pulso firme. El primer sorbo es helado como la escarcha de las cumbres de Hornacis; el segundo, abrasador como vinagre hirviente. El líquido resbala por tu esófago dejando una sensación gomosa y efervescente que trepa veloz hacia la base de tu cráneo."
                  </p>
                  <p>
                    "De pronto, tus mandíbulas se tensan con violencia. Un dolor punzante tira de los tendones de tus mejillas hacia arriba. Sientes cómo cada músculo de tu rostro es arrancado y vuelto a coser con hilos elásticos invisibles. Una sonrisa amplia, simétrica y artificial se dibuja en tus labios sin que tu voluntad intervenga: la máscara del Payaso ha arraigado."
                  </p>
                  <p>
                    "Tus articulaciones crujen con un chasquido suave. El equilibrio de tu cuerpo se vuelve milimétrico; eres capaz de percibir el centro de gravedad de cada mota de polvo que cae del techo. En tu mente resuena el principio fundamental del papel: reír ante la tragedia, mantener el control cuando el abismo se abre, y no dejar jamás que el público descubra el llanto tras el maquillaje."
                  </p>
                  <p>
                    "Intentas borrar la sonrisa de tu rostro con el dorso de la manga, pero los labios no ceden: sonríes aunque quieras llorar, y por un instante aterrador ya no recuerdas quién habitaba debajo."
                  </p>
                </>
              ) : (
                <>
                  <p>
                    "Levantas el recipiente y bebes la solución de un solo aliento. No hay calor ni frío; el líquido se siente como si bebieras aire condensado o luz líquida. Durante dos latidos, reina un silencio absoluto y sobrecogedor en la habitación."
                  </p>
                  <p>
                    "Luego, la presa se rompe."
                  </p>
                  <p>
                    "Una marea estruendosa de voces, intenciones, miedos y secretos ajenos inunda tu cerebro como si todas las paredes de Backlund hubieran desaparecido de golpe. Oyes el murmullo de un vecino contando monedas con codicia paranoica a tres casas de distancia; percibes el temor de una mujer ante la tos de su hijo en el callejón; sientes la vibración de una mentira dicha en el piso inferior."
                  </p>
                  <p>
                    "Tu propia identidad se tambalea ante la cacofonía psíquica, hasta que recuerdas el ancla del Espectador: escuchar sin juzgar, comprender la marea sin dejarte arrastrar por la corriente, ser el testigo sereno del teatro del corazón humano. Las voces se ordenan en capas comprensibles. Las pupilas de tus ojos se vuelven más profundas y tus pensamientos se blindan con un halo de quietud sobrenatural."
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPhase('CONSUMADO')}
                className="crimson-btn px-8 py-3 text-xs uppercase tracking-widest font-bold shadow-lg"
              >
                Aceptar la Nueva Forma
              </button>
            </div>
          </div>
        )}

        {/* ==========================================================================
            FASE 3: DESPERTAR EN SECUENCIA 8 CONSUMADO
            ========================================================================== */}
        {phase === 'CONSUMADO' && (
          <div className="parchment-sheet p-8 rounded shadow-2xl text-center max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-[#1f1a14] mb-3" style={{ fontFamily: 'Cinzel' }}>
              EL ASCENSO SE HA CONSUMADO
            </h2>
            <p className="text-sm text-[#1f1a14] italic font-serif mb-6 leading-relaxed">
              Has cruzado el segundo umbral y alcanzado <strong>{targetSequenceTitle}</strong>. La digestión de la poción recomienza desde el vacío, pero tu mirada ahora alcanza los resortes secretos que mueven a los hombres y al destino.
            </p>
            <div className="flex justify-center">
              <button
                onClick={onBackToDesk}
                className="crimson-btn px-8 py-3 text-xs uppercase tracking-widest font-bold shadow-lg"
              >
                Regresar a la Mesa del Desván
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Pie diegético */}
      <footer className="text-xs text-[#6e6353] italic text-center border-t border-[#221c14] pt-3 relative z-10">
        El círculo de sal sobre las tablas del suelo conserva el rastro de la marea sobrenatural que cruzó la habitación.
      </footer>

    </div>
  );
};
