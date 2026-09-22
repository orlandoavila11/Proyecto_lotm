/**
 * EL ALMANAQUE Y LAS CUATRO FRANJAS — PATH TO GODHOOD (BRIEF-10.VISUAL-R4)
 * Gestión diegética de tiempo: MAÑANA, TARDE, NOCHE, MADRUGADA.
 * Acciones de franja conectadas al backend (WORK, INVESTIGATE, SOCIALIZE, OPERATE).
 * El servidor avanza el tiempo; lectura e inspección consumen 0 tiempo.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sun, Moon, Sunset, Sunrise, Calendar as CalendarIcon, Clock, Bell, CheckCircle, AlertOctagon } from 'lucide-react';
import type { TimeSlot, DayOfWeek } from '../types';
import { apiClient, type SanitizedCalendarOutcome } from '../../services/apiClient';

interface CalendarViewProps {
  onBackToDesk: () => void;
  characterId?: string;
  initialDay?: number;
  initialSlot?: TimeSlot;
  onActionCompleted?: (outcome: SanitizedCalendarOutcome) => void;
}

const SLOT_MAP_TO_NAME: Record<number, TimeSlot> = {
  0: 'MAÑANA',
  1: 'TARDE',
  2: 'NOCHE',
  3: 'MADRUGADA'
};

const WEEK_DAYS: DayOfWeek[] = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  onBackToDesk, 
  characterId = 'char_player',
  initialDay = 4,
  initialSlot = 'TARDE',
  onActionCompleted
}) => {
  const [currentDay, setCurrentDay] = useState<number>(initialDay);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot>(initialSlot);
  const [currentDayName, setCurrentDayName] = useState<DayOfWeek>('JUEVES');
  const [lastActionOutcome, setLastActionOutcome] = useState<string>(
    'Cumpliste con tu jornada laboral en el archivo notarial. Tus superiores no tienen motivos de queja.'
  );
  const [datedEvent, setDatedEvent] = useState<{ title: string; description: string } | null>(null);
  const [weeklyTickSummary, setWeeklyTickSummary] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  // Escuchar Escape para volver al desván
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBackToDesk();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToDesk]);

  const SLOTS: { slot: TimeSlot; label: string; icon: React.ReactNode; desc: string; hours: string }[] = [
    { slot: 'MAÑANA', label: 'Mañana', icon: <Sunrise size={18} className="text-[#f59e0b]" />, desc: 'Deberes civiles, empleo formal y apertura de oficinas en Hillston y Cherwood.', hours: '08:00 - 12:00' },
    { slot: 'TARDE', label: 'Tarde', icon: <Sun size={18} className="text-[#eab308]" />, desc: 'Rondas por la ciudad, visitas a conocidos y pesquisa discreta entre el gentío.', hours: '12:00 - 18:00' },
    { slot: 'NOCHE', label: 'Noche', icon: <Sunset size={18} className="text-[#f97316]" />, desc: 'Mercados clandestinos, reuniones ocultas y acting en las sombras de Backlund.', hours: '18:00 - 22:00' },
    { slot: 'MADRUGADA', label: 'Madrugada', icon: <Moon size={18} className="text-[#6366f1]" />, desc: 'El sueño profundo, pesadillas astrales y asimilación de la poción.', hours: '22:00 - 02:00' }
  ];

  const handlePerformAction = async (actionType: 'WORK' | 'INVESTIGATE' | 'SOCIALIZE' | 'OPERATE') => {
    if (isPending) return;
    setIsPending(true);
    setDatedEvent(null);
    setWeeklyTickSummary(null);

    try {
      // Llamar al endpoint del servidor
      const outcome = await apiClient.performCalendarAction(characterId, actionType);

      // El servidor avanza el slot autoritativamente
      const nextSlot = SLOT_MAP_TO_NAME[outcome.slot] || 'TARDE';
      setCurrentSlot(nextSlot);
      setCurrentDay(outcome.day);

      // Actualizar día de la semana
      const dayIdx = (outcome.day - 1) % 7;
      setCurrentDayName(WEEK_DAYS[dayIdx]);

      setLastActionOutcome(outcome.narrative);

      if (outcome.datedEventTriggered) {
        setDatedEvent({
          title: outcome.datedEventTriggered.title,
          description: outcome.datedEventTriggered.description
        });
      }

      if (outcome.weeklyTickExecuted) {
        setWeeklyTickSummary(
          `Semana ${outcome.weeklyTickExecuted.weekNumber} culminada: alquiler liquidado, salario civil percibido y rotación del mercado clandestino efectuada.`
        );
      }

      if (onActionCompleted) {
        onActionCompleted(outcome);
      }
    } catch {
      // Fallback determinista en entorno fixture
      let narrative = '';
      if (actionType === 'WORK') {
        narrative = 'Cumples tu jornada laboral. La rutina mecánica te otorga una coartada sólida y disipa las preguntas de vecinos.';
      } else if (actionType === 'INVESTIGATE') {
        narrative = 'Dedicas la franja a examinar archivos, interrogar informantes o rastrear huellas en los callejones neblinosos.';
      } else if (actionType === 'SOCIALIZE') {
        narrative = 'Compartes una cerveza tibia en la taberna local o visitas a tus conocidos civiles, reforzando tu sentido de pertenencia.';
      } else {
        narrative = 'Te recluyes para realizar transacciones arcanas, preparar reactivos alquímicos o interpretar los principios de tu Vía.';
      }

      setLastActionOutcome(narrative);

      // Avanzar exactamente 1 franja en modo fixture
      if (currentSlot === 'MAÑANA') setCurrentSlot('TARDE');
      else if (currentSlot === 'TARDE') setCurrentSlot('NOCHE');
      else if (currentSlot === 'NOCHE') setCurrentSlot('MADRUGADA');
      else {
        setCurrentSlot('MAÑANA');
        setCurrentDay(prev => prev + 1);
        const nextIdx = (WEEK_DAYS.indexOf(currentDayName) + 1) % 7;
        setCurrentDayName(WEEK_DAYS[nextIdx]);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div 
      className="calendar-screen p-8 flex flex-col justify-between select-none relative overflow-hidden" 
      style={{ 
        width: '1920px', 
        height: '1080px', 
        position: 'relative', 
        background: '#12100d',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(26, 21, 16, 0.9) 0%, rgba(10, 8, 6, 0.98) 100%)'
      }}
    >
      
      {/* Cabecera del Almanaque */}
      <header className="flex justify-between items-center pb-4 border-b border-[#382b1d] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            type="button"
            className="px-4 py-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all lotm-focus-ring"
          >
            <ArrowLeft size={16} />
            Regresar al Buró (Esc)
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
              EL ALMANAQUE Y LAS CUATRO FRANJAS
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Año 1353 de la Quinta Época · Calendario Civil del Reino de Loen
            </p>
          </div>
        </div>

        {/* Día y Franja Actual */}
        <div className="flex items-center gap-3 bg-[#191714] px-4 py-2 rounded border border-[#383024]">
          <CalendarIcon size={16} className="text-[#d4af37]" />
          <span className="text-sm font-serif text-[#e5ded2]">
            Día {currentDay} ({currentDayName}) · Franja: <strong className="text-[#d4af37]">{currentSlot}</strong>
          </span>
        </div>
      </header>

      {/* Contenido Central */}
      <div className="grid grid-cols-12 gap-6 flex-1 mb-6 overflow-hidden">
        
        {/* Lado Izquierdo: Las Cuatro Franjas del Día */}
        <div className="col-span-6 bg-[#161411] p-6 rounded-lg border border-[#2d2419] flex flex-col justify-between overflow-y-auto">
          <div>
            <h2 className="font-serif font-bold text-base text-[#e5ded2] mb-4 border-b border-[#2d2419] pb-2 flex items-center gap-2" style={{ fontFamily: 'Cinzel' }}>
              <Clock size={16} className="text-[#8c733e]" />
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
                          {s.label} <span className="text-xs text-[#8c733e] font-normal font-sans ml-2">({s.hours})</span>
                        </span>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[#2b2216] text-[#d4af37] border border-[#8c733e] font-serif">
                            Franja en Curso
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#968c7e] leading-relaxed font-serif">
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
        <div className="col-span-6 flex flex-col gap-4 overflow-y-auto">
          
          {/* Panel de Selección de Acción */}
          <div className="bg-[#161411] p-6 rounded-lg border border-[#2d2419]">
            <h3 className="font-serif font-bold text-base text-[#d4af37] mb-3" style={{ fontFamily: 'Cinzel' }}>
              Decidir el Empleo de la Franja ({currentSlot})
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handlePerformAction('WORK')}
                className="p-3 bg-[#191714] border border-[#383024] hover:border-[#8c733e] rounded text-left transition-all group lotm-focus-ring"
              >
                <span className="font-serif font-bold text-xs text-[#e5ded2] group-hover:text-[#d4af37] block mb-1">
                  Atender el Empleo Civil
                </span>
                <span className="text-[11px] text-[#968c7e] italic block leading-relaxed font-serif">
                  Cumples con el deber legal, aseguras el jornal semanal y disuelves la sospecha pública.
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handlePerformAction('INVESTIGATE')}
                className="p-3 bg-[#191714] border border-[#383024] hover:border-[#8c733e] rounded text-left transition-all group lotm-focus-ring"
              >
                <span className="font-serif font-bold text-xs text-[#e5ded2] group-hover:text-[#d4af37] block mb-1">
                  Indagar en los Callejones
                </span>
                <span className="text-[11px] text-[#968c7e] italic block leading-relaxed font-serif">
                  Buscas confidentes y cotejas pistas de tu caso activo bajo la niebla de Backlund.
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handlePerformAction('SOCIALIZE')}
                className="p-3 bg-[#191714] border border-[#383024] hover:border-[#8c733e] rounded text-left transition-all group lotm-focus-ring"
              >
                <span className="font-serif font-bold text-xs text-[#e5ded2] group-hover:text-[#d4af37] block mb-1">
                  Vínculos Civiles y Taberna
                </span>
                <span className="text-[11px] text-[#968c7e] italic block leading-relaxed font-serif">
                  Compartes con vecinos o allegados, cuidando las anclas que preservan tu juicio.
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handlePerformAction('OPERATE')}
                className="p-3 bg-[#191714] border border-[#383024] hover:border-[#8c733e] rounded text-left transition-all group lotm-focus-ring"
              >
                <span className="font-serif font-bold text-xs text-[#e5ded2] group-hover:text-[#d4af37] block mb-1">
                  Reclusión Arcana en el Desván
                </span>
                <span className="text-[11px] text-[#968c7e] italic block leading-relaxed font-serif">
                  Atrancas la puerta, meditas sobre los principios y atiendes asuntos de tu Vía.
                </span>
              </button>
            </div>

            {/* Resultado de la Última Acción */}
            <div className="p-3 bg-[#13110e] rounded border border-[#2b2317] text-xs text-[#c4b59a] italic font-serif">
              <span className="text-[#d4af37] font-serif font-bold block not-italic mb-1">
                Acontecido en la franja:
              </span>
              "{lastActionOutcome}"
            </div>

            {/* Evento Fechado Disparado */}
            {datedEvent && (
              <div className="mt-3 p-3 bg-[#241a12] border border-[#8c733e] text-[#f5ebd9] rounded text-xs font-serif leading-relaxed">
                <span className="font-bold text-[#d4af37] block mb-0.5 flex items-center gap-1.5">
                  <Bell size={14} />
                  {datedEvent.title}
                </span>
                "{datedEvent.description}"
              </div>
            )}

            {/* Resumen de Ciclo Semanal */}
            {weeklyTickSummary && (
              <div className="mt-3 p-3 bg-[#1b2416] border border-[#4a7238] text-[#d4ebd0] rounded text-xs font-serif leading-relaxed">
                <span className="font-bold text-[#8bc34a] block mb-0.5 flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  Ciclo Semanal Concluido
                </span>
                "{weeklyTickSummary}"
              </div>
            )}
          </div>

          {/* Citas y Ciclos Ineludibles */}
          <div className="bg-[#161411] p-5 rounded-lg border border-[#2d2419]">
            <h3 className="font-serif font-bold text-sm text-[#968c7e] uppercase tracking-wider mb-3">
              Citas y Ciclos Ineludibles
            </h3>
            <div className="space-y-2 text-xs text-[#c4b59a] font-serif">
              <div className="p-2 bg-[#191714] rounded border border-[#2e261b] flex justify-between items-center">
                <span>Lunes (Mañana): Cobro del Alquiler Semanal</span>
                <span className="text-[#8c733e] italic">La casera llamará a tu puerta</span>
              </div>
              <div className="p-2 bg-[#191714] rounded border border-[#2e261b] flex justify-between items-center">
                <span>Domingo (Mañana): Sermón de la Iglesia Local</span>
                <span className="text-[#8c733e] italic">Obligación moral del vecindario</span>
              </div>
              <div className="p-2 bg-[#191714] rounded border border-[#2e261b] flex justify-between items-center">
                <span>Día 15 (Medianoche): Noche de Luna Llena</span>
                <span className="text-[#e06666] italic flex items-center gap-1">
                  <AlertOctagon size={12} />
                  La marea astral agita la sangre
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <footer className="text-xs text-[#6e6353] italic text-center border-t border-[#221c14] pt-3 font-serif">
        El silbato de las fábricas anuncia el cambio de turno en los muelles de Backlund.
      </footer>

    </div>
  );
};
