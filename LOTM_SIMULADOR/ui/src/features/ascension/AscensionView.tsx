import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import type { CharacterDiegetic } from '../types';

interface AscensionViewProps {
  character: CharacterDiegetic;
  onBackToDesk: () => void;
}

export const AscensionView: React.FC<AscensionViewProps> = ({ character, onBackToDesk }) => {
  const [phase, setPhase] = useState<'PREPARACION' | 'TRAGO' | 'CONSUMADO'>('PREPARACION');
  const startTime = useRef<number>(0);

  const isFool = character.pathwayName.toLowerCase().includes('fool');
  const targetSequenceTitle = isFool ? 'Payaso (Clown - Secuencia 8)' : 'Telépata (Telepathist - Secuencia 8)';

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const handleDrinkPotion = () => {
    const elapsed = Date.now() - startTime.current;
    console.log('[ASCENSION TELEMETRY] hesitation_ms:', elapsed);
    setPhase('TRAGO');
  };

  return (
    <div className="ascension-screen min-h-screen p-6 flex flex-col justify-between select-none" style={{ background: '#0a0908' }}>
      
      {/* Cabecera */}
      <header className="flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            className="p-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all"
          >
            <ArrowLeft size={16} />
            Regresar al Desván
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

        <div className="flex items-center gap-2 bg-[#181410] px-4 py-2 rounded border border-[#3d301f] text-xs text-[#d4af37] font-serif">
          <Sparkles size={14} />
          <span>Fórmula Alquímica Mezclada y Reposada</span>
        </div>
      </header>

      {/* Contenido Central */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center mb-6">
        
        {/* Fase 1: Checklist en Prosa y Evaluación de Riesgo Sentido */}
        {phase === 'PREPARACION' && (
          <div className="parchment-sheet p-8 rounded shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1f1a14] mb-2" style={{ fontFamily: 'Cinzel' }}>
                EL CÁLIZ SOBRE EL SALARIO DE MADERA
              </h2>
              <p className="text-xs text-[#6b583f] italic">
                Ningún Beyonder cruza este umbral sin exponer el alma al peligro del colapso.
              </p>
            </div>

            {/* Checklist Solemne en Prosa */}
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-[#e8deca] rounded border border-[#c4b59a] flex items-start gap-3">
                <CheckCircle size={18} className="text-[#15803d] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1f1a14] mb-0.5">
                    Digestión del Papel Previo
                  </h4>
                  <p className="text-xs text-[#453725] leading-relaxed italic">
                    La voz ajena en tu cabeza se ha disuelto casi por completo. Las normas del papel de Secuencia 9 han dejado de ser mandatos externos para convertirse en reflejos instintivos de tu conducta.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#e8deca] rounded border border-[#c4b59a] flex items-start gap-3">
                <CheckCircle size={18} className="text-[#15803d] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1f1a14] mb-0.5">
                    Estabilidad de la Llama Somática
                  </h4>
                  <p className="text-xs text-[#453725] leading-relaxed italic">
                    La mecha de tu cordura arde sin crepitar; los susurros de la oscuridad no han fracturado tu comprensión de la vigilia.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#e8deca] rounded border border-[#c4b59a] flex items-start gap-3">
                <CheckCircle size={18} className="text-[#15803d] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1f1a14] mb-0.5">
                    Vínculo con las Anclas de Humanidad
                  </h4>
                  <p className="text-xs text-[#453725] leading-relaxed italic">
                    Tus afectos, tu empleo profano y los recuerdos de tu vida civil te sujetan a la costa de la realidad material frente a la tempestad astral que se aproxima.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#ebd2ce] rounded border border-[#dc2626]/40 flex items-start gap-3">
                <AlertTriangle size={18} className="text-[#b91c1c] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#7f1d1d] mb-0.5">
                    El Riesgo Sentido de la Transmutación
                  </h4>
                  <p className="text-xs text-[#450a0a] leading-relaxed italic">
                    Si el alma no está templada, la característica extraordinaria se rebelará en tus entrañas, provocando una deformación monstruosa de la carne y una amnesia lacerante que te arrojará indefenso a la noche.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleDrinkPotion}
                className="crimson-btn px-10 py-3.5 text-sm uppercase tracking-widest font-bold shadow-lg"
              >
                Beber la Poción
              </button>
            </div>
          </div>
        )}

        {/* Fase 2: Escena Autoral del Trago (de HUMAN_REVIEW_08.md) */}
        {phase === 'TRAGO' && (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold tracking-widest text-[#d4af37] mb-4" style={{ fontFamily: 'Cinzel' }}>
              LA TRANSMUTACIÓN
            </h2>
            <div className="w-24 h-0.5 bg-[#d4af37] mx-auto mb-6"></div>

            <div className="text-[#e5ded2] text-sm leading-relaxed italic space-y-5 max-w-xl mx-auto font-serif text-justify">
              {isFool ? (
                <>
                  <p>
                    "Acercas el cuenco a tus labios temblorosos. El primer sorbo es helado como la nieve de las cumbres de Hornacis; el segundo, abrasador como vinagre hirviente. El líquido resbala por tu esófago dejando una sensación gomosa y efervescente que trepa veloz hacia la base de tu cráneo."
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

            <div className="mt-8">
              <button
                onClick={() => setPhase('CONSUMADO')}
                className="crimson-btn px-8 py-3 text-sm uppercase tracking-wider font-bold"
              >
                Aceptar la Nueva Forma
              </button>
            </div>
          </div>
        )}

        {/* Fase 3: Despertar en Secuencia 8 */}
        {phase === 'CONSUMADO' && (
          <div className="parchment-sheet p-8 rounded shadow-2xl text-center">
            <h2 className="text-xl font-bold text-[#1f1a14] mb-3" style={{ fontFamily: 'Cinzel' }}>
              EL ASCENSO SE HA CONSUMADO
            </h2>
            <p className="text-sm text-[#1f1a14] italic font-serif mb-6 leading-relaxed">
              Has ascendido a <strong>{targetSequenceTitle}</strong>. La digestión de la poción recomienza desde el vacío, pero tu mirada ahora alcanza los resortes secretos que mueven a los hombres y al destino.
            </p>
            <div className="flex justify-center">
              <button
                onClick={onBackToDesk}
                className="crimson-btn px-8 py-3 text-sm uppercase tracking-wider font-bold"
              >
                Regresar a la Mesa del Desván
              </button>
            </div>
          </div>
        )}

      </div>

      <footer className="text-xs text-[#6e6353] italic text-center border-t border-[#221c14] pt-3">
        El círculo de sal sobre las tablas del suelo conserva el rastro de la marea sobrenatural que cruzó la habitación.
      </footer>

    </div>
  );
};
