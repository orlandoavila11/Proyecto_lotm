/**
 * CONFIRMATION DIALOG — MODAL DE CONFIRMACIÓN CRÍTICA (PROMPT P04)
 * Para decisiones de alto impacto (gastos mayores, viajes, acusaciones, fórmulas de ascensión).
 * Soporta vista previa de consecuencias, trampa de foco y cancelación por Escape.
 */

import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ActionButton } from './ActionButton';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  consequencesPreview?: string[];
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  consequencesPreview = [],
  pending = false,
  onConfirm,
  onCancel
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusedElementRef.current && typeof previousFocusedElementRef.current.focus === 'function') {
        previousFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={[
          'w-full max-w-lg bg-[#1a120c] border-2 rounded-md shadow-2xl p-6 text-[#ede4d1] space-y-5',
          isDestructive ? 'border-[#b91c1c]' : 'border-[#8c733e]'
        ].join(' ')}
      >
        <div className="flex items-start gap-4">
          <div 
            className={[
              'p-2.5 rounded-full flex-shrink-0',
              isDestructive ? 'bg-[#2a0c0e] text-red-400 border border-[#b91c1c]' : 'bg-[#120e0a] text-[#d4af37] border border-[#8c733e]'
            ].join(' ')}
          >
            <AlertTriangle size={24} aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h2 id="confirm-dialog-title" className="text-lg font-serif font-bold text-[#ede4d1] cinzel">
              {title}
            </h2>
            <p id="confirm-dialog-desc" className="text-sm font-serif text-[#a89f91] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Vista previa de consecuencias conocidas */}
        {consequencesPreview.length > 0 && (
          <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-1.5">
            <span className="text-xs font-serif text-[#d4af37] font-semibold block">
              Consecuencias previstas:
            </span>
            <ul className="text-xs font-serif text-[#c5bcb0] space-y-1 list-disc pl-4">
              {consequencesPreview.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Botones de Confirmación / Cancelación */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <ActionButton
            ref={cancelButtonRef}
            variant="ghost"
            size="md"
            disabled={pending}
            onClick={onCancel}
          >
            {cancelLabel}
          </ActionButton>

          <ActionButton
            variant={isDestructive ? 'danger' : 'brass'}
            size="md"
            pending={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

