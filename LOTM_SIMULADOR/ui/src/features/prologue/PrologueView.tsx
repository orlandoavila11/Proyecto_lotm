import { useState, useEffect, useRef } from 'react';
import type { CharacterDiegetic } from '../types';

interface OriginTemplate {
  id: string;
  name: string;
  profession: string;
  district: string;
  salaryDesc: string;
  burden: { type: 'DEUDA' | 'SECRETO'; description: string };
  anchors: string[];
  flavorText: string;
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
    flavorText: 'Copias escrituras y firmas con tinta ferrogálica mientras el polvo de papel carcome tus pulmones.'
  },
  {
    id: 'ORIGIN_MEDICAL_STUDENT',
    name: 'Estudiante de Medicina',
    profession: 'Practicante de Anatomía y Cirugía',
    district: 'Borough de Backlund',
    salaryDesc: '1 libra, 15 chelines semanales',
    burden: { type: 'SECRETO', description: 'Tráfico de cadáveres no reclamados para el anfiteatro de disección' },
    anchors: ['Bisturí con el blasón de la Facultad', 'Doctor Watson (Tutor de patología)', 'El Anfiteatro de Disección a medianoche'],
    flavorText: 'Tus manos huelen a fenol y formol. Conoces los órganos por su textura y el frío de la muerte.'
  },
  {
    id: 'ORIGIN_REPORTER',
    name: 'Corresponsal de Sucesos',
    profession: 'Cronista Policial de Diario',
    district: 'Cherwood',
    salaryDesc: '2 libras semanales',
    burden: { type: 'SECRETO', description: 'Cuaderno con nombres de confidentes policiales sobornados' },
    anchors: ['La Máquina de Escribir Remington', 'Subinspector Lestrade (Enlace policial)', 'La Redacción de The Daily Observer'],
    flavorText: 'La tinta fresca en tus dedos y el fango en las suelas de tus botas persiguen el hedor de los crímenes de Backlund.'
  },
  {
    id: 'ORIGIN_FRAUDULENT_MEDIUM',
    name: 'Espiritista de Salón',
    profession: 'Adivina y Guía Espiritual de Salón',
    district: 'Distrito Oeste',
    salaryDesc: '3 libras semanales de honorarios volátiles',
    burden: { type: 'DEUDA', description: 'Deuda usurera de 45 libras con un prestamista del Distrito Este' },
    anchors: ['Péndulo de cuarzo tallado', 'Madame Vivienne (Mecenas de la alta sociedad)', 'El Salón de Terciopelo Negro'],
    flavorText: 'Haces tintinear campanillas ocultas bajo la mesa para señoras de luto, fingiendo hablar con los difuntos.'
  },
  {
    id: 'ORIGIN_DOCKWORKER',
    name: 'Estibador de Muelles',
    profession: 'Capataz de Carga Fluvial',
    district: 'Distrito Este',
    salaryDesc: '1 libra, 2 chelines semanales',
    burden: { type: 'DEUDA', description: 'Deuda por multa de huelga portuaria no autorizada' },
    anchors: ['Gancho de hierro forjado de carga', 'Old Barnaby (Patrón de chalana)', 'La Taberna del Marinero Ahogado'],
    flavorText: 'Tus hombros conocen el peso de los fardos de ultramar y el alquitrán del río Tussock.'
  },
  {
    id: 'ORIGIN_PRIVATE_INVESTIGATOR',
    name: 'Detective Privado',
    profession: 'Investigador de Averías y Desapariciones',
    district: 'Cherwood',
    salaryDesc: 'Honorarios según encargos (promedio 2 libras)',
    burden: { type: 'DEUDA', description: 'Alquiler acumulado de tres meses del despacho en Minsk Street' },
    anchors: ['Lupa de latón con mango de ébano', 'Sra. Higgins (Casera enérgica)', 'La Oficina de Minsk Street'],
    flavorText: 'Los pasos en la escalera de madera siempre anuncian clientes deseperados o acreedores pacientes.'
  }
];

interface PrologueViewProps {
  onCompletePrologue: (character: CharacterDiegetic) => void;
}

export const PrologueView: React.FC<PrologueViewProps> = ({ onCompletePrologue }) => {
  const [step, setStep] = useState<'ORIGIN_SELECT' | 'LETTER' | 'DILEMMA' | 'POTION_CHOICE' | 'DRINKING' | 'AWAKENING'>('ORIGIN_SELECT');
  const [selectedOrigin, setSelectedOrigin] = useState<OriginTemplate>(CANONICAL_ORIGINS[0]);
  const [characterName, setCharacterName] = useState<string>('Arthur Pendelton');
  
  // Decisión del dilema tutorial
  const [dilemmaChoice, setDilemmaChoice] = useState<'PRUDENCIA' | 'CURIOSIDAD' | null>(null);
  
  // Elección de frasco
  const [potionChoice, setPotionChoice] = useState<'COBALTO' | 'AMBAR' | null>(null);
  
  // Telemetría de vacilación
  const drinkPromptTime = useRef<number>(0);

  useEffect(() => {
    if (step === 'POTION_CHOICE') {
      drinkPromptTime.current = Date.now();
    }
  }, [step]);

  const handleStartDrinking = (choice: 'COBALTO' | 'AMBAR') => {
    const elapsed = Date.now() - drinkPromptTime.current;
    console.log('[PROLOGUE TELEMETRY] hesitation_ms:', elapsed);
    setPotionChoice(choice);
    setStep('DRINKING');
  };

  const handleFinishPrologue = () => {
    const isFool = potionChoice === 'COBALTO';
    
    // Crear el personaje diegético completo con Ruina 5 (Marcado) y Corrupción limpia
    const newChar: CharacterDiegetic = {
      id: `char_${Date.now()}`,
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
    <div className="prologue-screen min-h-screen flex items-center justify-center p-6 select-none" style={{ background: '#090807' }}>
      
      {/* Paso 1: Selección de Origen Canónico */}
      {step === 'ORIGIN_SELECT' && (
        <div className="w-full max-w-4xl parchment-sheet p-8 rounded shadow-2xl">
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
                  className={`p-4 rounded border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#e4dac4] border-[#8c733e] shadow-md' 
                      : 'bg-[#ede5d3] border-[#d1c5ad] hover:bg-[#e6dcc6]'
                  }`}
                >
                  <h3 className="font-serif font-bold text-base text-[#1f1a14] mb-1" style={{ fontFamily: 'Cinzel' }}>
                    {origin.name}
                  </h3>
                  <p className="text-xs text-[#6b5f4f] mb-2 font-serif italic">
                    {origin.district} · {origin.salaryDesc}
                  </p>
                  <p className="text-xs text-[#2a241d] leading-relaxed mb-3">
                    {origin.flavorText}
                  </p>
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

      {/* Paso 2: La Carta en Vitela del Benefactor */}
      {step === 'LETTER' && (
        <div className="w-full max-w-2xl parchment-sheet p-8 rounded shadow-2xl relative">
          <div className="border-b border-[#c4b59a] pb-3 mb-6 text-center">
            <span className="text-xs text-[#736553] uppercase tracking-widest font-bold">
              Correspondencia Reservada
            </span>
            <h2 className="text-xl font-bold text-[#1f1a14] mt-1" style={{ fontFamily: 'Cinzel' }}>
              De un Benefactor Silencioso
            </h2>
          </div>

          <div className="text-sm text-[#1f1a14] leading-relaxed font-serif space-y-4 mb-8 italic">
            <p>
              "Estimado {characterName},"
            </p>
            <p>
              "Sé de tus noches en vela en el desván de {selectedOrigin.district}. Sé de las cargas que arrastras y del peso silencioso de tu vida civil como {selectedOrigin.profession}."
            </p>
            <p>
              "En el pequeño cofre de caoba sobre el escritorio hallarás dos frascos de vidrio soplado. Ninguno de ellos es veneno común; ambos te arrancarán del letargo de los ciegos."
            </p>
            <p>
              "Una vez que bebas, no habrá retorno al sosiego profano. La niebla de Backlund te observará tanto como tú a ella."
            </p>
          </div>

          <div className="flex justify-between items-center border-t border-[#c4b59a] pt-4">
            <span className="text-xs text-[#736553] italic">
              Sello de lacre rojo carmesí con un grabado vertical
            </span>
            <button
              onClick={() => setStep('DILEMMA')}
              className="crimson-btn px-6 py-2 text-sm"
            >
              Examinar la Carta y el Sello
            </button>
          </div>
        </div>
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
        <div className="w-full max-w-3xl parchment-sheet p-8 rounded shadow-2xl">
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
              className="p-5 rounded bg-[#ebe2ce] border border-[#bfae91] flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif font-bold text-base text-[#1e293b] mb-2" style={{ fontFamily: 'Cinzel' }}>
                  Frasco de Vidrio Cobalto
                </h3>
                <p className="text-xs text-[#334155] leading-relaxed mb-4">
                  El líquido en su interior es de un azul nocturno profundo, casi opaco. Al mover el frasco suavemente, partículas plateadas giran como un torbellino estrellado y diminutos ojos dorados parecen abrirse y cerrarse en la superficie.
                </p>
                <div className="text-xs text-[#475569] italic border-t border-[#d8ccb8] pt-2">
                  "El destino es un hilo invisible. Solo quien aprende a no temer la incertidumbre puede contemplar su tejido."
                </div>
              </div>

              <button
                onClick={() => handleStartDrinking('COBALTO')}
                className="mt-6 px-4 py-2 bg-[#1e293b] text-[#e2e8f0] font-serif font-bold text-xs rounded hover:bg-[#0f172a] transition-all"
              >
                Elegir el Frasco Cobalto
              </button>
            </div>

            {/* Opción B: Frasco Ámbar (Visionary / Espectador) */}
            <div 
              className="p-5 rounded bg-[#ebe2ce] border border-[#bfae91] flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif font-bold text-base text-[#78350f] mb-2" style={{ fontFamily: 'Cinzel' }}>
                  Frasco de Vidrio Ámbar
                </h3>
                <p className="text-xs text-[#451a03] leading-relaxed mb-4">
                  Un líquido dorado y espeso descansa en quietud absoluta. La superficie es tan nítida como un espejo veneciano, reflejando el zaguán con una quietud perturbadora que apacigua el pulso de quien lo contempla.
                </p>
                <div className="text-xs text-[#78350f] italic border-t border-[#d8ccb8] pt-2">
                  "El mundo es un gran teatro. Quien renuncia a ser protagonista aprende a leer los pensamientos en las sombras."
                </div>
              </div>

              <button
                onClick={() => handleStartDrinking('AMBAR')}
                className="mt-6 px-4 py-2 bg-[#78350f] text-[#fef3c7] font-serif font-bold text-xs rounded hover:bg-[#451a03] transition-all"
              >
                Elegir el Frasco Ámbar
              </button>
            </div>

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
