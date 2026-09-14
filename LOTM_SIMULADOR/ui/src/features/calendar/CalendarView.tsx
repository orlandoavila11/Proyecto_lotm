import React, { useState } from 'react';
import { ArrowLeft, Sun, Moon, Sunset, Sunrise, Calendar as CalendarIcon } from 'lucide-react';
import type { TimeSlot, DayOfWeek } from '../types';

interface CalendarViewProps {
  onBackToDesk: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onBackToDesk }) => {
  const [currentDay, setCurrentDay] = useState<number>(4);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot>('TARDE');
  const [currentDayName, setCurrentDayName] = useState<DayOfWeek>('JUEVES');
  const [lastActionOutcome, setLastActionOutcome] = useState<string>(
    'Cumpliste con tu jornada laboral de la mañana en el archivo notarial. Tus superiores no tienen motivos de queja.'
  );

  const SLOTS: { slot: TimeSlot; label: string; icon: React.ReactNode; desc: string }[] = [
    { slot: 'MAÑANA', label: 'Mañana', icon: <Sunrise size={18} className="text-[#f59e0b]" />, desc: 'Deberes civiles, empleo formal y apertura de oficinas.' },
    { slot: 'TARDE', label: 'Tarde', icon: <Sun size={18} className="text-[#eab308]" />, desc: 'Rondas por la ciudad, visitas sociales y pesquisa discreta.' },
    { slot: 'NOCHE', label: 'Noche', icon: <Sunset size={18} className="text-[#f97316]" />, desc: 'Mercados clandestinos, reuniones ocultas y acting en las sombras.' },
    { slot: 'MADRUGADA', label: 'Madrugada', icon: <Moon size={18} className="text-[#6366f1]" />, desc: 'El sueño profundo, pesadillas astrales y asimilación de la poción.' }
  ];

  const handleAdvanceSlot = (actionType: string) => {
    let outcome = '';
    switch (actionType) {
      case 'TRABAJO':
        outcome = 'Atendiste tus quehaceres civiles con diligencia. Tu tapadera social se mantiene intachable.';
        break;
      case 'INVESTIGAR':
        outcome = 'Recorriste los callejones de Backlund interrogando a tenderos y cocheros. El rastro sigue tibio.';
        break;
      case 'DESCANSO':
        outcome = 'Te resguardaste en el desván escuchando el goteo de la lluvia en el tejado de cinc. El pulso se serena.';
        break;
      case 'REUNION':
        outcome = 'Intercambiaste susurros en una taberna apartada. La niebla borró tus pasos de regreso.';
        break;
    }

    setLastActionOutcome(outcome);

    if (currentSlot === 'MAÑANA') setCurrentSlot('TARDE');
    else if (currentSlot === 'TARDE') setCurrentSlot('NOCHE');
    else if (currentSlot === 'NOCHE') setCurrentSlot('MADRUGADA');
    else {
      setCurrentSlot('MAÑANA');
      setCurrentDay(prev => prev + 1);
      // Avanzar día de la semana
      const weekDays: DayOfWeek[] = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
      const nextIdx = (weekDays.indexOf(currentDayName) + 1) % 7;
      setCurrentDayName(weekDays[nextIdx]);
    }
  };

  return (
    <div className="calendar-screen min-h-screen p-6 flex flex-col justify-between select-none" style={{ background: '#12100d' }}>
      
      {/* Cabecera */}
      <header className="flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            className="p-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all"
          >
            <ArrowLeft size={16} />
            Regresar al Buró
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
              EL ALMANAQUE Y LAS CUATRO FRANJAS
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Año 1353 de la Quinta Época · Calendario del Reino de Loen
            </p>
          </div>
        </div>

        {/* Día y Franja Actual */}
        <div className="flex items-center gap-3 bg-[#191714] px-4 py-2 rounded border border-[#383024]">
          <CalendarIcon size={16} className="text-[#d4af37]" />
          <span className="text-sm font-serif text-[#e5ded2]">
            Día {currentDay} ({currentDayName}) · Franja: <strong>{currentSlot}</strong>
          </span>
        </div>
      </header>

      {/* Contenido Central */}
      <div className="grid grid-cols-12 gap-6 flex-1 mb-6">
        
        {/* Lado Izquierdo: Las Cuatro Franjas del Día */}
        <div className="col-span-6 bg-[#161411] p-6 rounded-lg border border-[#2d2419] flex flex-col justify-between">
          <div>
            <h2 className="font-serif font-bold text-base text-[#e5ded2] mb-4 border-b border-[#2d2419] pb-2" style={{ fontFamily: 'Cinzel' }}>
              El Reloj Victoriano de la Jornada
            </h2>

            <div className="space-y-4 mb-6">
              {SLOTS.map((s) => {
                const isCurrent = s.slot === currentSlot;
                return (
                  <div
                    key={s.slot}
                    className={`p-4 rounded border transition-all flex items-start gap-4 ${
                      isCurrent 
                        ? 'bg-[#221c15] border-[#8c733e] shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                        : 'bg-[#14120f] border-[#262016] opacity-60'
                    }`}
                  >
                    <div className="mt-1">{s.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-serif font-bold text-sm text-[#e5ded2]">
                          {s.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[#2b2216] text-[#d4af37] border border-[#8c733e] font-serif">
                            Franja en Curso
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#968c7e] leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="parchment-sheet p-4 rounded text-[#1f1a14] shadow text-xs italic font-serif">
            "En Backlund, el tiempo no espera a los hombres ni a los monstruos. Cada hora consagrada a lo sobrenatural es una hora robada al deber civil."
          </div>
        </div>

        {/* Lado Derecho: Acciones de Coartada y Eventos Fechados */}
        <div className="col-span-6 flex flex-col gap-4">
          
          {/* Panel de Selección de Acción */}
          <div className="bg-[#161411] p-6 rounded-lg border border-[#2d2419]">
            <h3 className="font-serif font-bold text-base text-[#d4af37] mb-3" style={{ fontFamily: 'Cinzel' }}>
              Decidir el Empleo de la Franja ({currentSlot})
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleAdvanceSlot('TRABAJO')}
                className="p-3 bg-[#191714] border border-[#383024] hover:border-[#8c733e] rounded text-left transition-all group"
              >
                <span className="font-serif font-bold text-xs text-[#e5ded2] group-hover:text-[#d4af37] block mb-1">
                  Atender el Empleo Civil
                </span>
                <span className="text-[11px] text-[#968c7e] italic block leading-relaxed">
                  Cumples con el deber legal, aseguras el jornal semanal y disuelves la sospecha pública.
                </span>
              </button>

              <button
                onClick={() => handleAdvanceSlot('INVESTIGAR')}
                className="p-3 bg-[#191714] border border-[#383024] hover:border-[#8c733e] rounded text-left transition-all group"
              >
                <span className="font-serif font-bold text-xs text-[#e5ded2] group-hover:text-[#d4af37] block mb-1">
                  Indagar en los Callejones
                </span>
                <span className="text-[11px] text-[#968c7e] italic block leading-relaxed">
                  Buscas confidentes y cotejas pistas de tu caso activo bajo la lluvia sucia.
                </span>
              </button>

              <button
                onClick={() => handleAdvanceSlot('DESCANSO')}
                className="p-3 bg-[#191714] border border-[#383024] hover:border-[#8c733e] rounded text-left transition-all group"
              >
                <span className="font-serif font-bold text-xs text-[#e5ded2] group-hover:text-[#d4af37] block mb-1">
                  Sosiego y Meditación
                </span>
                <span className="text-[11px] text-[#968c7e] italic block leading-relaxed">
                  Atrancas la puerta del desván, atemperas los nervios y dejas que la cera selle la vela.
                </span>
              </button>

              <button
                onClick={() => handleAdvanceSlot('REUNION')}
                className="p-3 bg-[#191714] border border-[#383024] hover:border-[#8c733e] rounded text-left transition-all group"
              >
                <span className="font-serif font-bold text-xs text-[#e5ded2] group-hover:text-[#d4af37] block mb-1">
                  Cita Clandestina
                </span>
                <span className="text-[11px] text-[#968c7e] italic block leading-relaxed">
                  Asistes a un intercambio en una trastienda o cumples una rutina del papel que interpretas.
                </span>
              </button>
            </div>

            {/* Resultado de la Última Acción */}
            <div className="p-3 bg-[#13110e] rounded border border-[#2b2317] text-xs text-[#c4b59a] italic">
              <span className="text-[#d4af37] font-serif font-bold block not-italic mb-1">
                Acontecido en la franja anterior:
              </span>
              "{lastActionOutcome}"
            </div>
          </div>

          {/* Eventos Fechados del Calendario */}
          <div className="bg-[#161411] p-5 rounded-lg border border-[#2d2419]">
            <h3 className="font-serif font-bold text-sm text-[#968c7e] uppercase tracking-wider mb-3">
              Citas y Ciclos Ineludibles
            </h3>
            <div className="space-y-2 text-xs text-[#c4b59a]">
              <div className="p-2 bg-[#191714] rounded border border-[#2e261b] flex justify-between">
                <span>Lunes (Mañana): Cobro del Alquiler Semanal</span>
                <span className="text-[#8c733e] italic">La casera llamará a tu puerta</span>
              </div>
              <div className="p-2 bg-[#191714] rounded border border-[#2e261b] flex justify-between">
                <span>Domingo (Mañana): Sermón de la Iglesia Local</span>
                <span className="text-[#8c733e] italic">Obligación moral del vecindario</span>
              </div>
              <div className="p-2 bg-[#191714] rounded border border-[#2e261b] flex justify-between">
                <span>Día 15: Noche de Luna Llena</span>
                <span className="text-[#ef4444] italic">La marea astral agita la sangre</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <footer className="text-xs text-[#6e6353] italic text-center border-t border-[#221c14] pt-3">
        El silbato de las fábricas anuncia el cambio de turno en los muelles de Backlund.
      </footer>

    </div>
  );
};
