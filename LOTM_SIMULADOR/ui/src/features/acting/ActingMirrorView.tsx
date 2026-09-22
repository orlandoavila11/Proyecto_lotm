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

      {/* Grimorio Abierto a Dos Páginas (1920x1080) */}
      <div className="grid grid-cols-12 gap-8 flex-1 mb-6 overflow-hidden">
        
        {/* Página Izquierda: Principios, Asimilación y Bitácora */}
        <div className="col-span-5 bg-[#15120e] p-6 rounded-lg border border-[#2d2419] flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-[#2d2419] pb-3">
              <BookOpen size={18} className="text-[#d4af37]" />
              <h2 className="font-serif font-bold text-base text-[#e5ded2]" style={{ fontFamily: 'Cinzel' }}>
                Preceptos de la Secuencia
              </h2>
            </div>

            {/* Veredicto Somático de la Poción */}
            <div className="parchment-sheet p-5 rounded text-[#1f1a14] mb-5 shadow border border-[#c4b59a]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#786447] block mb-1 font-serif">
                Veredicto Somático de la Poción
              </span>
              <p className="text-sm leading-relaxed italic font-serif">
                "{character.actingFeedback}"
              </p>
            </div>

            <div className="space-y-3 text-xs text-[#c4b59a] leading-relaxed font-serif">
              <p className="flex items-start gap-2">
                <Feather size={14} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span>
                  <strong>La Ley del Papel:</strong> Una poción no se domina con la fuerza de la voluntad bruta; se digiere convirtiendo los principios místicos en tu segunda naturaleza.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <AlertCircle size={14} className="text-[#851c22] shrink-0 mt-0.5" />
                <span>
                  <strong>El Peligro de la Fractura:</strong> Violar reiteradamente el papel despierta la voluntad latente en la característica extraordinaria, precipitando la locura.
                </span>
              </p>
            </div>

            {/* Bitácora de Resoluciones Pasadas */}
            <div className="mt-6 border-t border-[#261e14] pt-4">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#8c733e] block mb-3">
                Bitácora de Interpretaciones Anteriores
              </span>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {diaryEntries.length > 0 ? (
                  diaryEntries.map((entry) => (
                    <div key={entry.id} className="p-3 bg-[#1b1712] rounded border border-[#2e251a] text-xs font-serif">
                      <div className="flex justify-between items-center text-[#8c733e] mb-1">
                        <span>Día {entry.day}</span>
                        <strong className="text-[#e5ded2]">{entry.choiceTaken}</strong>
                      </div>
                      {entry.principle && (
                        <span className="text-[10px] text-[#8c733e] block mb-1">
                          Principio: {entry.principle}
                        </span>
                      )}
                      <p className="text-[#968c7e] italic text-[11px] leading-relaxed">
                        "{entry.narrativeOutcome}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-[#6b5843] italic font-serif">
                    Las páginas iniciales aguardan tu primera interpretación ceremonial.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6e6353] border-t border-[#261e14] pt-3 italic font-serif">
            "Recuerda: solo estás actuando."
          </div>
        </div>

        {/* Página Derecha: Dilema Canónico de Actuación (Tier G) */}
        <div className="col-span-7 bg-[#15120e] p-6 rounded-lg border border-[#2d2419] flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b border-[#2d2419] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#d4af37]" />
                <h2 className="font-serif font-bold text-base text-[#e5ded2]" style={{ fontFamily: 'Cinzel' }}>
                  Dilema Moral y Actuación Canónica
                </h2>
              </div>
              <span className="text-xs text-[#968c7e] italic font-serif">
                Prueba de Digestión
              </span>
            </div>

            {resolutionOutcome && (
              <div className="mb-4 p-4 bg-[#1a2416] border border-[#3e6b2e] text-[#d6ecd0] rounded text-xs font-serif leading-relaxed">
                <span className="font-bold block mb-1 text-[#8bc34a] flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  Resultado de la Interpretación:
                </span>
                "{resolutionOutcome}"
              </div>
            )}

            {loadingDilemma ? (
              <p className="text-xs text-[#968c7e] italic font-serif">
                Consultando los susurros de la característica extraordinaria...
              </p>
            ) : dilemma ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#1f1a14] rounded border border-[#3d3122]">
                  <span className="text-xs font-serif font-bold text-[#d4af37] block mb-1">
                    {dilemma.title}
                  </span>
                  <p className="text-xs text-[#e5ded2] font-serif leading-relaxed">
                    {dilemma.description}
                  </p>
                  {dilemma.corePrinciple && (
                    <blockquote className="mt-3 text-[11px] text-[#8c733e] italic border-l-2 border-[#8c733e] pl-3 py-0.5">
                      Principio subyacente: "{dilemma.corePrinciple}"
                    </blockquote>
                  )}
                </div>

                <div className="space-y-2.5">
                  <span className="text-[11px] font-serif uppercase tracking-wider text-[#968c7e] block">
                    Elige cómo interpretar tu papel:
                  </span>
                  {dilemma.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => setSelectedChoiceId(choice.id)}
                        className={`w-full text-left p-4 rounded border text-xs font-serif transition-all lotm-focus-ring ${
                          isSelected 
                            ? 'bg-[#2b2216] border-[#d4af37] text-[#f5ebd9] shadow-md' 
                            : 'bg-[#181410] border-[#383024] text-[#c4b59a] hover:border-[#8c733e]'
                        }`}
                      >
                        <strong className="block text-[#e5ded2] mb-1 text-sm font-serif">
                          {choice.label}
                        </strong>
                        <span className="text-[#968c7e] italic leading-relaxed block">
                          {choice.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#16130f] rounded border border-[#2e261b] text-center space-y-2">
                <p className="text-xs text-[#c4b59a] font-serif italic">
                  Tu asimilación actual se encuentra en calma. Has interpretado las facetas principales de este ciclo; la característica extraordinaria no formula preguntas inmediatas.
                </p>
                <p className="text-[11px] text-[#786c5e] italic font-serif">
                  Regresa al anochecer o tras experimentar sucesos notables en Backlund.
                </p>
              </div>
            )}
          </div>

          {dilemma && selectedChoiceId && (
            <div className="pt-4 border-t border-[#2d2419] flex justify-end">
              <button
                type="button"
                disabled={resolving}
                onClick={handleResolve}
                className="px-6 py-2.5 bg-[#8c733e] hover:bg-[#a6894a] text-[#120f0c] font-serif font-bold text-xs uppercase tracking-widest rounded transition-all lotm-focus-ring shadow-lg"
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
