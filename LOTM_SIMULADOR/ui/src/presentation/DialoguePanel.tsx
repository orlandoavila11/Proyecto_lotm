/**
 * DIALOGUE PANEL — PANEL DIEGÉTICO DE DIÁLOGO NARRATIVO (PROMPT P04)
 * Estructura victoriana para conversaciones con NPCs, correspondencia y elecciones ramificadas.
 */

import React, { useEffect, useRef } from 'react';
import { ActionButton } from './ActionButton';

export interface DialogueChoice {
  id: string;
  text: string;
  disabledReason?: string;
  isDanger?: boolean;
}

export interface DialoguePanelProps {
  isOpen: boolean;
  speakerName: string;
  speakerTitle?: string;
  portraitUrl?: string;
  proseText: string;
  choices: DialogueChoice[];
  onSelectChoice: (choiceId: string) => void;
  onClose?: () => void;
}

export const DialoguePanel: React.FC<DialoguePanelProps> = ({
  isOpen,
  speakerName,
  speakerTitle,
  portraitUrl,
  proseText,
  choices,
  onSelectChoice,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstChoiceRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label={`Conversación con ${speakerName}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-8 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#1a140f] border-2 border-[#8c733e] rounded-md shadow-2xl p-6 text-[#ede4d1] flex flex-col md:flex-row gap-6 mb-4"
      >
        {/* Retrato o Emblema del Hablante */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-sm border-2 border-[#8c733e] overflow-hidden bg-[#120e0a] shadow-inner flex items-center justify-center">
            {portraitUrl ? (
              <img src={portraitUrl} alt={speakerName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-3xl text-[#d4af37]">§</span>
            )}
          </div>
          <span className="text-sm font-serif font-bold text-[#d4af37] mt-2 text-center cinzel">
            {speakerName}
          </span>
          {speakerTitle && (
            <span className="text-xs text-[#a89f91] text-center max-w-[130px]">
              {speakerTitle}
            </span>
          )}
        </div>

        {/* Contenido de la Conversación */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="bg-[#120e0a]/90 p-4 rounded border border-[#8c733e]/30 font-serif text-sm leading-relaxed text-[#ede4d1] min-h-[90px]">
            <p className="italic">"{proseText}"</p>
          </div>

          {/* Opciones de Respuesta Ramificada */}
          <div className="flex flex-col gap-2 pt-2">
            {choices.map((choice, index) => (
              <ActionButton
                key={choice.id}
                ref={index === 0 ? firstChoiceRef : undefined}
                variant={choice.isDanger ? 'danger' : 'brass'}
                size="md"
                disabledReason={choice.disabledReason}
                onClick={() => onSelectChoice(choice.id)}
                className="w-full justify-start text-left"
              >
                <span className="text-[#d4af37] font-serif mr-2 font-bold">{index + 1}.</span>
                {choice.text}
              </ActionButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

