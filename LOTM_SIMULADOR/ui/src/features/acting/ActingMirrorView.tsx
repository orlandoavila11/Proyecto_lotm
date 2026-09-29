/**
 * CUADERNO DE ACTUACIÓN EN PIEL — PATH TO GODHOOD (BRIEF-10.VISUAL-R4)
 * Registro de principios de la Vía, asimilación de la poción y resolución de dilemas.
 * Cero metadatos matemáticos expuestos (anti-alignment, anti-digestion numbers).
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Feather, Sparkles, BookOpen, AlertCircle, CheckCircle2, Flame } from 'lucide-react';
import type { CharacterDiegetic } from '../types';
import { apiClient, type SanitizedActingDilemma } from '../../services/apiClient';

interface ActingMirrorViewProps {
  character: CharacterDiegetic;
  onBackToDesk: () => void;
  onRefreshCharacter?: () => void;
}

export const ActingMirrorView: React.FC<ActingMirrorViewProps> = ({ 
  character, 
  onBackToDesk,
  onRefreshCharacter 
}) => {
  const [dilemma, setDilemma] = useState<SanitizedActingDilemma | null>(null);
  const [loadingDilemma, setLoadingDilemma] = useState<boolean>(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [resolving, setResolving] = useState<boolean>(false);
  const [resolutionOutcome, setResolutionOutcome] = useState<string | null>(null);
  const [diaryEntries, setDiaryEntries] = useState(character.actingDiary || []);

  // Escuchar tecla Escape para volver
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

  // Cargar dilema canónico desde el backend
  useEffect(() => {
    let isMounted = true;
    const loadDilemma = async () => {
      if (!character?.id) return;
      setLoadingDilemma(true);
      try {
        const data = await apiClient.getActingDilemma(character.id);
        if (isMounted) {
          setDilemma(data);
        }
      } catch (err) {
        console.warn('Sin conexión a dilemas backend, usando plantilla de Vía:', err);
      } finally {
        if (isMounted) setLoadingDilemma(false);
      }
    };

    loadDilemma();
    return () => { isMounted = false; };
  }, [character?.id]);

  const handleResolve = async () => {
    if (!character?.id || !dilemma || !selectedChoiceId || resolving) return;
    setResolving(true);
    try {
      const res = await apiClient.resolveActingDilemma(character.id, dilemma.id, selectedChoiceId);
      setResolutionOutcome(res.message);

      // Añadir registro a la bitácora
      const chosen = dilemma.choices.find(c => c.id === selectedChoiceId);
      const newEntry = {
        id: `diary_${Date.now()}`,
        day: 4,
        principle: dilemma.corePrinciple,
        choiceTaken: chosen?.label || 'Elección efectuada',
        narrativeOutcome: res.message
      };

      setDiaryEntries(prev => [newEntry, ...prev]);
      setSelectedChoiceId(null);
      setDilemma(null);

      if (onRefreshCharacter) {
        onRefreshCharacter();
      }
    } catch (err) {
      console.error('Error al resolver actuación:', err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div 
      className="acting-screen p-8 flex flex-col justify-between select-none relative overflow-hidden" 
      style={{ 
        width: '1920px', 
        height: '1080px', 
        position: 'relative', 
        background: '#100e0b',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(28, 22, 17, 0.9) 0%, rgba(9, 7, 5, 0.98) 100%)'
      }}
    >
      
      {/* Cabecera del Cuaderno */}
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
              EL CUADERNO DE ACTUACIÓN EN PIEL
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Vía {character.pathwayName} · {character.sequenceTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#181410] px-4 py-2 rounded border border-[#383024]">
          <Sparkles size={16} className="text-[#d4af37]" />
          <span className="text-xs font-serif text-[#e5ded2]">
            Coherencia de la Máscara: <strong className="text-[#d4af37]">{character.actingCoherence}</strong>
          </span>
        </div>
      </header>

      {/* Grimorio Abierto a Dos Páginas (Plan de Producción Gráfica GFX15 + GFX30 a h-[880px]) */}
      <div className="open-grimoire-spread grid grid-cols-12 gap-0 flex-1 h-[880px] mb-4 overflow-hidden rounded-2xl border-4 border-[#2d1b0f] shadow-[0_20px_50px_rgba(0,0,0,0.95)] bg-[#100c08] relative">
        
        {/* Lomo / Pliegue central del libro con sombra profunda */}
        <div 
          className="absolute top-0 bottom-0 left-[41.666%] w-6 -ml-3 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(18,10,6,0.95) 50%, rgba(0,0,0,0.55) 100%)',
            boxShadow: '0 0 15px rgba(0,0,0,0.75)'
          }}
        />

        {/* Página Izquierda: Principios, Asimilación y Bitácora (Parchment GFX30 a 160%) */}
        <div 
          className="col-span-5 p-8 flex flex-col justify-between overflow-y-auto relative border-r-2 border-[#3d2817]"
          style={{
            backgroundColor: '#ebdcc4',
            backgroundImage: "radial-gradient(ellipse at 70% 50%, rgba(246, 237, 217, 0.92) 0%, rgba(220, 201, 172, 0.95) 100%), url('/art/GFX30_flat_paper.jpg')",
            backgroundSize: '100% 100%, 160% 160%',
            backgroundPosition: 'center, center',
            backgroundRepeat: 'no-repeat, no-repeat',
            boxShadow: 'inset -25px 0 35px rgba(0,0,0,0.2)'
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4 border-b-2 border-[#8c733e]/50 pb-3">
              <BookOpen size={20} className="text-[#694e22]" />
              <h2 className="font-serif font-bold text-lg text-[#241a12]" style={{ fontFamily: 'Cinzel' }}>
                Preceptos de la Secuencia
              </h2>
            </div>

            {/* Veredicto Somático de la Poción */}
            <div className="p-4 rounded-xl bg-[#dfceb3] text-[#1f1a14] mb-5 shadow-sm border border-[#a69273]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5028] block mb-1 font-serif">
                Veredicto Somático de la Poción
              </span>
              <p className="text-sm leading-relaxed italic font-serif text-[#291e14]">
                "{character.actingFeedback}"
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-[#302316] leading-relaxed font-serif">
              <p className="flex items-start gap-2.5">
                <Feather size={16} className="text-[#8c7038] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#1a1612]">La Ley del Papel:</strong> Una poción no se domina con la fuerza de la voluntad bruta; se digiere convirtiendo los principios místicos en tu segunda naturaleza.
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-[#851c22] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#591419]">El Peligro de la Fractura:</strong> Violar reiteradamente el papel despierta la voluntad latente en la característica extraordinaria, precipitando la locura.
                </span>
              </p>
            </div>

            {/* Bitácora de Resoluciones Pasadas */}
            <div className="mt-6 border-t-2 border-[#8c733e]/30 pt-4">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#694e22] block mb-3">
                Bitácora de Interpretaciones Anteriores
              </span>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {diaryEntries.length > 0 ? (
                  diaryEntries.map((entry) => (
                    <div key={entry.id} className="p-3.5 bg-[#e4d6bf] rounded-xl border border-[#b8a486] text-xs font-serif shadow-xs">
                      <div className="flex justify-between items-center text-[#5c4424] mb-1">
                        <span className="font-bold">Día {entry.day}</span>
                        <strong className="text-[#1f170f]">{entry.choiceTaken}</strong>
                      </div>
                      {entry.principle && (
                        <span className="text-[10px] text-[#6b522b] block mb-1 font-semibold">
                          Principio: {entry.principle}
                        </span>
                      )}
                      <p className="text-[#3b2b1b] italic text-[11px] leading-relaxed">
                        "{entry.narrativeOutcome}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-[#735d43] italic font-serif">
                    Las páginas iniciales aguardan tu primera interpretación ceremonial.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6b563c] border-t border-[#8c733e]/30 pt-3 italic font-serif">
            "Recuerda: solo estás actuando."
          </div>
        </div>

        {/* Página Derecha: Dilema Canónico de Actuación (Parchment GFX30 a 160%) */}
        <div 
          className="col-span-7 p-8 flex flex-col justify-between overflow-y-auto relative"
          style={{
            backgroundColor: '#ebdcc4',
            backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(246, 237, 217, 0.92) 0%, rgba(220, 201, 172, 0.95) 100%), url('/art/GFX30_flat_paper.jpg')",
            backgroundSize: '100% 100%, 160% 160%',
            backgroundPosition: 'center, center',
            backgroundRepeat: 'no-repeat, no-repeat',
            boxShadow: 'inset 25px 0 35px rgba(0,0,0,0.2)'
          }}
        >
          <div>
            <div className="flex items-center justify-between border-b-2 border-[#8c733e]/50 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-[#8c7038]" />
                <h2 className="font-serif font-bold text-lg text-[#241a12]" style={{ fontFamily: 'Cinzel' }}>
                  Dilema Moral y Actuación Canónica
                </h2>
              </div>
              <span className="text-xs text-[#694e22] italic font-serif font-semibold">
                Prueba de Digestión
              </span>
            </div>

            {resolutionOutcome && (
              <div className="mb-4 p-4 bg-[#d8ebd2] border-2 border-[#528743] text-[#1c3814] rounded-xl text-xs font-serif leading-relaxed shadow-sm">
                <span className="font-bold block mb-1 text-[#2d5c1f] flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  Resultado de la Interpretación:
                </span>
                "{resolutionOutcome}"
              </div>
            )}

            {loadingDilemma ? (
              <p className="text-xs text-[#6b563c] italic font-serif">
                Consultando los susurros de la característica extraordinaria...
              </p>
            ) : dilemma ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#dfd0b7] rounded-xl border border-[#a89372] shadow-sm">
                  <span className="text-sm font-serif font-bold text-[#5c3e1b] block mb-1" style={{ fontFamily: 'Cinzel' }}>
                    {dilemma.title}
                  </span>
                  <p className="text-xs text-[#1f170f] font-serif leading-relaxed">
                    {dilemma.description}
                  </p>
                  {dilemma.corePrinciple && (
                    <blockquote className="mt-3 text-[11px] text-[#6b4c22] italic border-l-2 border-[#8c7038] pl-3 py-0.5 font-semibold">
                      Principio subyacente: "{dilemma.corePrinciple}"
                    </blockquote>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-serif uppercase tracking-wider text-[#5c472c] block font-bold">
                    Elige cómo interpretar tu papel:
                  </span>
                  {dilemma.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => setSelectedChoiceId(choice.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 text-xs font-serif transition-all lotm-focus-ring ${
                          isSelected 
                            ? 'bg-[#281b10] border-[#d4af37] text-[#f5ebd9] shadow-xl' 
                            : 'bg-[#f5ede0] border-[#ba9e74] text-[#1c140c] hover:bg-[#ede0ce] hover:border-[#8c733e] shadow-sm'
                        }`}
                      >
                        <strong className={`block mb-1 text-sm font-serif ${isSelected ? 'text-[#f0d48d]' : 'text-[#1c140c]'}`}>
                          {choice.label}
                        </strong>
                        <span className={`italic leading-relaxed block ${isSelected ? 'text-[#d8cdbd]' : 'text-[#473623]'}`}>
                          {choice.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#dfd3bc]/80 rounded-xl border border-[#a89576] text-center space-y-2">
                <p className="text-xs text-[#2b2014] font-serif italic">
                  Tu asimilación actual se encuentra en calma. Has interpretado las facetas principales de este ciclo; la característica extraordinaria no formula preguntas inmediatas.
                </p>
                <p className="text-[11px] text-[#6b583f] italic font-serif">
                  Regresa al anochecer o tras experimentar sucesos notables en Backlund.
                </p>
              </div>
            )}
          </div>

          {dilemma && selectedChoiceId && (
            <div className="pt-4 border-t-2 border-[#8c733e]/40 flex justify-end">
              <button
                type="button"
                disabled={resolving}
                onClick={handleResolve}
                className="px-8 py-3 bg-[#8c733e] hover:bg-[#a6894a] text-[#120f0c] font-serif font-bold text-xs uppercase tracking-widest rounded-xl transition-all lotm-focus-ring shadow-xl border border-[#d4af37]"
              >
                {resolving ? 'Interpretando...' : 'Interpretar el Rol'}
              </button>
            </div>
          )}
        </div>

      </div>

      <footer className="text-center text-[11px] text-[#6b5843] italic border-t border-[#261e14] pt-3 font-serif">
        "Cada interpretación fiel disipa la locura de la poción; cada transgresión convoca a la bestia interior."
      </footer>

    </div>
  );
};
