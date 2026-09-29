/**
 * INSPECTION PANEL — PANEL FOCAL DE INSPECCIÓN DIEGÉTICA (PROMPT P04)
 * Modal accesible de inspección con textura de pergamino/caoba, trampa de foco estricta,
 * cierre por Escape, restauración de foco al control iniciador y bloqueo de interacción trasera.
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface InspectionPanelProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  proseMoment?: string;
  onClose: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  theme?: 'parchment' | 'mahogany';
  maxWidth?: string;
}

export const InspectionPanel: React.FC<InspectionPanelProps> = ({
  isOpen,
  title,
  subtitle,
  proseMoment,
  onClose,
  children,
  actions,
  theme = 'mahogany',
  maxWidth = 'max-w-2xl'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  // Gestión de foco accesible y captura de tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;

    // Colocar el foco inicial en el botón de cerrar
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Trampa de foco (Tab / Shift+Tab)
      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      // Restauración de foco al cerrar
      if (previousFocusedElementRef.current && typeof previousFocusedElementRef.current.focus === 'function') {
        previousFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isParchment = theme === 'parchment';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspection-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090807]/85 backdrop-blur-xs p-4 sm:p-6 select-none"
      onClick={(e) => {
        // Clic en el telón de fondo cierra el modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={containerRef}
        className={[
          'relative w-full overflow-hidden rounded-md border-2 shadow-2xl transition-all',
          maxWidth,
          isParchment
            ? 'bg-[#ebdcc4] text-[#1a1612] border-[#8c733e]'
            : 'bg-[#1c140e] text-[#ede4d1] border-[#8c733e]'
        ].join(' ')}
        onClick={(e) => e.stopPropagation()} // Bloquear clics hacia el escenario de fondo
      >
        {/* Cabecera del Panel */}
        <div 
          className={[
            'flex items-start justify-between p-5 border-b',
            isParchment ? 'border-[#8c733e]/40' : 'border-[#8c733e]/50 bg-[#150f0a]'
          ].join(' ')}
        >
          <div>
            <h2 
              id="inspection-title" 
              className={[
                'text-xl font-bold font-serif cinzel tracking-wide',
                isParchment ? 'text-[#1a1612]' : 'text-[#d4af37]'
              ].join(' ')}
            >
              {title}
            </h2>
            {subtitle && (
              <p className={isParchment ? 'text-xs text-[#5a4834] mt-1' : 'text-xs text-[#a89f91] mt-1'}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de inspección (Escape)"
            className={[
              'p-1.5 rounded transition-colors lotm-focus-ring cursor-pointer',
              isParchment 
                ? 'text-[#3d3120] hover:text-[#851c22] hover:bg-[#dcd0b8]' 
                : 'text-[#ede4d1] hover:text-[#d4af37] hover:bg-[#2b1f16]'
            ].join(' ')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo / Contenido */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-serif text-sm leading-relaxed">
          {proseMoment && (
            <blockquote 
              className={[
                'italic border-l-3 pl-4 py-2 rounded-r',
                isParchment
                  ? 'border-[#8c733e] text-[#2d2215] bg-[#e6dac4]/50'
                  : 'border-[#d4af37] text-[#e0d6c5] bg-[#120e0a]/80'
              ].join(' ')}
            >
              "{proseMoment}"
            </blockquote>
          )}

          {children}
        </div>

        {/* Barra de Acciones (Pie) */}
        {actions && (
          <div 
            className={[
              'p-4 border-t flex items-center justify-end gap-3',
              isParchment ? 'border-[#8c733e]/30 bg-[#dfceb5]' : 'border-[#8c733e]/40 bg-[#120e0a]'
            ].join(' ')}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

