/**
 * EXPEDIENTE NOTARIAL DE IDENTIDAD Y ANCLAS — PATH TO GODHOOD (BRIEF-10.VISUAL-R4)
 * Despliegue documental diegético a 1920x1080 sobre mesa de caoba.
 * Pliegos sellados del Reino de Loen, las 3 anclas de origen y eventos de identidad civil.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Feather, AlertTriangle, Users, Compass, Landmark, CheckCircle2 } from 'lucide-react';
import type { CharacterDiegetic } from '../types';
import { apiClient, type SanitizedIdentityEvent } from '../../services/apiClient';

// Mapeo canónico de viñetas de oficio (Plan de Producción Gráfica GFX36A-F)
const ORIGIN_VIGNETTES: Record<string, { image: string; alt: string }> = {
  'Escribiente Notarial': { image: '/art/GFX36A_origin_clerk.jpg', alt: 'Mesa notarial con pliego, tintero y pluma' },
  'Estudiante de Medicina': { image: '/art/GFX36B_origin_medical_student.jpg', alt: 'Cuaderno anatómico, vendas e instrumental' },
  'Corresponsal de Sucesos': { image: '/art/GFX36C_origin_reporter.jpg', alt: 'Libreta de notas, lápiz y recortes de prensa' },
  'Espiritista de Salón': { image: '/art/GFX36D_origin_medium.jpg', alt: 'Péndulo de cuarzo y velo de terciopelo' },
  'Estibador de Muelles': { image: '/art/GFX36E_origin_dockworker.jpg', alt: 'Gancho de estiba y cuerda alquitranada' },
  'Detective Privado': { image: '/art/GFX36F_origin_detective.jpg', alt: 'Lupa victoriana, pipa y libreta de campo' },
};

interface IdentityDossierViewProps {
  character: CharacterDiegetic;
  onBackToDesk: () => void;
  onRefreshCharacter?: () => void;
}

export const IdentityDossierView: React.FC<IdentityDossierViewProps> = ({
  character,
  onBackToDesk,
  onRefreshCharacter
}) => {
  const [activeEvent, setActiveEvent] = useState<SanitizedIdentityEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resolving, setResolving] = useState<boolean>(false);
  const [eventOutcome, setEventOutcome] = useState<string | null>(null);

  // Fallbacks seguros contra fixtures o personajes incompletos
  const burden = character.initialBurden || {
    type: 'DEUDA' as const,
    description: 'Obligaciones notariales y créditos contraídos en Hillston.',
    details: '28 libras adeudadas a la casa prestamista.'
  };
  const policeSuspicion = character.policeSuspicionText || 'Sin sospechas policiales aparentes.';
  const churchSuspicion = character.churchSuspicionText || 'Los rezos nocturnos apaciguan las miradas del clero.';
  const anchors = (character.anchors && character.anchors.length > 0)
    ? character.anchors
    : [
        { id: 'anc_1', tipo: 'persona' as const, nombre: 'Srta. Wendy', descripcion: 'Correspondencia epistolar dominical que afianza tu cordura.', fuerza: 'FIRME' as const },
        { id: 'anc_2', tipo: 'rutina' as const, nombre: 'Café matutino en Hillston', descripcion: 'Lectura del Backlund Gazette.', fuerza: 'FIRME' as const },
        { id: 'anc_3', tipo: 'rol' as const, nombre: 'Escribiente en la Notaría', descripcion: 'Registro minucioso de testamentos y actas.', fuerza: 'TENUE' as const }
      ];

  const originVignette = ORIGIN_VIGNETTES[character.originTitle] || ORIGIN_VIGNETTES['Escribiente Notarial'];

  // Escuchar tecla Escape para volver al desván
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

  // Consultar si hay un evento de identidad civil pendiente
  useEffect(() => {
    let isMounted = true;
    const checkIdentityEvent = async () => {
      if (!character?.id) return;
      setLoadingEvent(true);
      try {
        const ev = await apiClient.rollIdentityEvent(character.id);
        if (isMounted) {
          setActiveEvent(ev);
        }
      } catch (err) {
        console.warn('Sin evento civil disponible:', err);
      } finally {
        if (isMounted) setLoadingEvent(false);
      }
    };

    checkIdentityEvent();
    return () => { isMounted = false; };
  }, [character?.id]);

  const handleResolveEvent = async () => {
    if (!character?.id || !activeEvent || selectedOption === null || resolving) return;
    setResolving(true);
    try {
      const res = await apiClient.resolveIdentityEvent(character.id, activeEvent.id, selectedOption);
      setEventOutcome(res.narrativeOutcome);
      setActiveEvent(null);
      setSelectedOption(null);
      if (onRefreshCharacter) {
        onRefreshCharacter();
      }
    } catch (err) {
      console.error('Error resolviendo dilema civil:', err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div 
      className="identity-screen p-8 flex flex-col justify-between select-none relative overflow-hidden" 
      style={{ 
        width: '1920px', 
        height: '1080px', 
        position: 'relative', 
        background: '#120f0c',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(30, 24, 18, 0.9) 0%, rgba(10, 8, 6, 0.98) 100%)'
      }}
    >
      {/* Cabecera Notarial */}
      <header className="flex justify-between items-center pb-4 border-b border-[#3d3122] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            type="button"
            className="px-4 py-2 bg-[#1b1712] border border-[#4a3b29] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all lotm-focus-ring"
          >
            <ArrowLeft size={16} />
            Regresar al Buró (Esc)
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
              EXPEDIENTE DE IDENTIDAD CIVIL Y ANCLAS
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Tribunal Notarial del Reino de Loen · Distrito de {character.district}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#181410] px-4 py-2 rounded border border-[#3d3122]">
          <Landmark size={16} className="text-[#8c733e]" />
          <span className="text-xs font-serif text-[#c4b59a] uppercase tracking-wider">
            Registro Oficial: {character.originTitle}
          </span>
        </div>
      </header>

      {/* Cuerpo Principal del Expediente (2 Columnas) */}
      {/* Cuerpo Principal del Expediente (2 Columnas a h-[880px]) */}
      <div className="grid grid-cols-12 gap-8 flex-1 h-[880px] mb-4 overflow-hidden">
        
        {/* Columna Izquierda: Los Pliegos de Identidad y Carga */}
        <div className="col-span-5 flex flex-col gap-6 h-full overflow-y-auto pr-2">
          
          {/* Pliego Principal */}
          <div 
            className="parchment-sheet p-7 rounded-xl shadow-2xl text-[#1a1612] relative border-2 border-[#bba582]"
            style={{
              backgroundColor: '#ebdcc4',
              backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(246, 237, 217, 0.92) 0%, rgba(225, 206, 178, 0.95) 100%), url('/art/GFX30_flat_paper.jpg')",
              backgroundSize: '100% 100%, 160% 160%',
              backgroundPosition: 'center, center',
              backgroundRepeat: 'no-repeat, no-repeat',
              boxShadow: '0 10px 30px rgba(0,0,0,0.85), inset 0 0 30px rgba(140,115,62,0.15)'
            }}
          >
            {/* Sello de Lacre Real de Loen (GFX31 recortado sin bordes grises) */}
            <div className="absolute top-4 right-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-xl border-2 border-[#8c733e] flex items-center justify-center bg-[#5c1818]">
                <img 
                  src="/art/GFX31_wax_seal.jpg" 
                  alt="Sello de Lacre Real de Loen" 
                  className="w-full h-full object-cover scale-[1.65]" 
                />
              </div>
              <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#786447] mt-1">
                Reino de Loen
              </span>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[#786447] block mb-1 font-serif">
              Cédula de Vecindad y Oficio
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#1f1a14] mb-3" style={{ fontFamily: 'Cinzel' }}>
              {character.name}
            </h2>

            {/* Viñeta de Oficio Canónico (GFX36A-F) */}
            <div className="my-3 p-3 bg-[#dfd0b7]/90 rounded-lg border border-[#b8a484] flex items-center gap-4 shadow-inner">
              <img 
                src={originVignette.image} 
                alt={originVignette.alt} 
                className="w-24 h-20 object-cover rounded-lg border-2 border-[#8c733e]/80 shadow-md" 
              />
              <div className="flex-1 text-xs font-serif">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5843] block">
                  Enseres del Oficio Civil
                </span>
                <span className="text-[#1a1612] italic font-bold text-sm block">
                  {character.profession}
                </span>
                <span className="text-xs text-[#5c4a35]">
                  Distrito de {character.district}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-serif border-t border-[#cbbca0] pt-3 text-[#2d2419]">
              <div className="flex justify-between">
                <span className="text-[#6b5843]">Profesión declarada:</span>
                <strong className="text-[#1a1612]">{character.profession}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b5843]">Distrito de residencia:</span>
                <strong className="text-[#1a1612]">{character.district}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b5843]">Patrimonio en faltriquera:</span>
                <strong className="text-[#1a1612]">{character.walletText}</strong>
              </div>
            </div>

            {/* Carga Inicial */}
            <div className="mt-4 p-3 bg-[#e4d8c2]/95 rounded-lg border border-[#bdae93] text-xs font-serif shadow-sm">
              <span className="font-bold text-[#851c22] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                Carga Civil: {burden.type}
              </span>
              <p className="italic text-[#382b1d] leading-relaxed">
                "{burden.description} — {burden.details}"
              </p>
            </div>
          </div>

          {/* Vigilancia y Presión Social (Sin números) */}
          <div 
            className="p-6 rounded-xl flex-1 flex flex-col justify-between"
            style={{
              backgroundColor: '#16130f',
              border: '2px solid #3d2f21',
              boxShadow: '0 10px 30px rgba(0,0,0,0.85)'
            }}
          >
            <div>
              <span className="text-xs font-serif uppercase tracking-widest text-[#d4af37] font-bold block mb-4 flex items-center gap-2">
                <Shield size={16} />
                Vigilancia Institucional en Backlund
              </span>

              <div className="space-y-3">
                <div className="p-4 bg-[#1c1813] rounded-lg border border-[#3d2e1d]">
                  <span className="text-[#968c7e] block text-[10px] uppercase font-serif tracking-wider">Policía Civil de Loen:</span>
                  <p className="text-[#f5ebd9] font-serif italic mt-1 leading-relaxed text-xs">
                    {policeSuspicion}
                  </p>
                </div>

                <div className="p-4 bg-[#1c1813] rounded-lg border border-[#3d2e1d]">
                  <span className="text-[#968c7e] block text-[10px] uppercase font-serif tracking-wider">Halcones Nocturnos (Iglesia de la Medianoche):</span>
                  <p className="text-[#f5ebd9] font-serif italic mt-1 leading-relaxed text-xs">
                    {churchSuspicion}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#6b5843] italic font-serif mt-4 border-t border-[#2d2419] pt-3">
              "Todo habitante de Backlund deja huellas bajo la niebla; algunas interesan a la ley, otras al clero."
            </div>
          </div>
        </div>

        {/* Columna Derecha: Las 3 Anclas de Origen y Dilemas Civiles */}
        <div className="col-span-7 flex flex-col gap-6 h-full overflow-y-auto pr-2">
          
          {/* Las Tres Anclas Humanas */}
          <div 
            className="p-6 rounded-xl"
            style={{
              backgroundColor: '#16130f',
              border: '2px solid #3d2f21',
              boxShadow: '0 10px 30px rgba(0,0,0,0.85)'
            }}
          >
            <div className="flex items-center justify-between border-b-2 border-[#3d2f21] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#d4af37]" />
                <h3 className="font-serif font-bold text-base text-[#f5ebd9]" style={{ fontFamily: 'Cinzel' }}>
                  Las Anclas de Humanidad
                </h3>
              </div>
              <span className="text-xs text-[#968c7e] italic font-serif">
                Lo que te sujeta al mundo consciente
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {anchors.map((anchor) => {
                const isFirm = anchor.fuerza === 'FIRME';
                const isFrail = anchor.fuerza === 'QUEBRADIZA';
                return (
                  <div 
                    key={anchor.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isFirm 
                        ? 'bg-[#1c1712] border-[#4a3b29]' 
                        : isFrail 
                        ? 'bg-[#241315] border-[#7a282c]' 
                        : 'bg-[#181410] border-[#383024]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif font-bold text-sm text-[#f5ebd9] flex items-center gap-2">
                        <Feather size={14} className="text-[#8c733e]" />
                        {anchor.nombre}
                      </span>
                      <span className={`text-[11px] font-serif uppercase tracking-wider px-2.5 py-1 rounded font-bold ${
                        isFirm 
                          ? 'bg-[#2e2316] text-[#d4af37] border border-[#8c733e]' 
                          : isFrail 
                          ? 'bg-[#3d181c] text-[#e06666] border border-[#a83232]' 
                          : 'bg-[#221c15] text-[#c4b59a] border border-[#4a3b29]'
                      }`}>
                        Vínculo {anchor.fuerza}
                      </span>
                    </div>
                    <p className="text-xs text-[#b8ab96] italic font-serif leading-relaxed">
                      "{anchor.descripcion}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dilema Civil de Doble Vida (Si existe) */}
          <div 
            className="p-6 rounded-xl flex-1 min-h-[420px] flex flex-col justify-between"
            style={{
              backgroundColor: '#1b1612',
              border: '2px solid #423220',
              boxShadow: '0 12px 35px rgba(0,0,0,0.85)'
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#3d2f21] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Compass size={18} className="text-[#d4af37]" />
                  <h3 className="font-serif font-bold text-base text-[#f5ebd9]" style={{ fontFamily: 'Cinzel' }}>
                    Fricciones de la Doble Vida
                  </h3>
                </div>
                <span className="text-xs text-[#968c7e] italic font-serif">
                  Exigencias del entorno cotidiano
                </span>
              </div>

              {eventOutcome && (
                <div className="mb-4 p-4 bg-[#1e231b] border border-[#3e5635] text-[#b4d4a8] rounded-xl text-xs font-serif leading-relaxed shadow-sm">
                  <span className="font-bold block mb-1 text-[#8bc34a] flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Consecuencia Civil:
                  </span>
                  "{eventOutcome}"
                </div>
              )}

              {loadingEvent ? (
                <p className="text-xs text-[#968c7e] italic font-serif">
                  Consultando registros civiles y misivas de vecinos...
                </p>
              ) : activeEvent ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#1c1813] rounded-xl border border-[#3d2e1d]">
                    <span className="text-xs font-serif font-bold text-[#d4af37] block mb-1">
                      {activeEvent.title}
                    </span>
                    <p className="text-xs text-[#f5ebd9] font-serif leading-relaxed">
                      {activeEvent.situation}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[11px] font-serif uppercase tracking-wider text-[#8c733e] block font-bold">
                      Elige cómo responder ante la sociedad:
                    </span>
                    {activeEvent.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 text-xs font-serif transition-all lotm-focus-ring ${
                          selectedOption === idx 
                            ? 'bg-[#2b2014] border-[#d4af37] text-[#f5ebd9] shadow-lg' 
                            : 'bg-[#14110e] border-[#33281c] text-[#c4b59a] hover:bg-[#1f1913] hover:border-[#8c733e]'
                        }`}
                      >
                        <strong className="block text-[#f5ebd9] mb-1 font-serif text-sm">{opt.label}</strong>
                        <span className="text-[#a89b88] italic block leading-relaxed">{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#786c5e] italic font-serif">
                  Por ahora no hay reclamos civiles urgentes. Tus vecinos continúan con sus rutinas y tu tapadera se sostiene sin sospechas alarmantes.
                </p>
              )}
            </div>

            {activeEvent && selectedOption !== null && (
              <div className="pt-4 border-t border-[#3d2f21] flex justify-end">
                <button
                  type="button"
                  disabled={resolving}
                  onClick={handleResolveEvent}
                  className="px-8 py-3 bg-[#8c733e] hover:bg-[#a6894a] text-[#120f0c] font-serif font-bold text-xs uppercase tracking-widest rounded-xl transition-all lotm-focus-ring shadow-xl border border-[#d4af37]"
                >
                  {resolving ? 'Atendiendo...' : 'Firmar Respuesta'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Pie Diegético */}
      <footer className="text-center text-[11px] text-[#6b5843] italic border-t border-[#261e14] pt-3">
        "El Beyonder que descuida su nombre civil despierta un día siendo solo el monstruo de su poción."
      </footer>
    </div>
  );
};
