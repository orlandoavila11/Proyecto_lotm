/**
 * ACTION BUTTON — BOTÓN CANÓNICO DE ACCIÓN DIEGÉTICA (PROMPT P04)
 * Matriz de estados completa: idle, hover, focus, pressed, selected, disabled-with-reason, pending, error.
 * Soporta variantes: brass, parchment, danger, ghost.
 * Accesibilidad estricta: WCAG 2.1 AA, pistas no basadas únicamente en color, anillo de foco de alto contraste.
 */

import React, { forwardRef, useState } from 'react';
import { Loader2, AlertCircle, Lock, Check } from 'lucide-react';

export type ButtonVariant = 'brass' | 'parchment' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pending?: boolean;
  selected?: boolean;
  error?: boolean;
  disabledReason?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(({
  variant = 'brass',
  size = 'md',
  pending = false,
  selected = false,
  error = false,
  disabledReason,
  disabled = false,
  icon,
  children,
  className = '',
  onClick,
  ...rest
}, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isDisabled = disabled || Boolean(disabledReason) || pending;

  // Variantes de estilo base
  const variantStyles: Record<ButtonVariant, string> = {
    brass: [
      'bg-[#1c140e] text-[#ede4d1] border border-[#8c733e]/80',
      'hover:bg-[#2b1f16] hover:border-[#d4af37] hover:text-[#f7f2e7] hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]',
      'active:bg-[#120d09] active:translate-y-[1px]',
      selected ? 'border-[#d4af37] bg-[#2b1f16] shadow-[0_0_8px_rgba(212,175,55,0.3)] ring-1 ring-[#d4af37]' : ''
    ].join(' '),
    parchment: [
      'bg-[#ede4d1] text-[#1a1612] border border-[#8c733e]',
      'hover:bg-[#f6edd9] hover:border-[#5a4a2a] hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
      'active:bg-[#dcd0b8] active:translate-y-[1px]',
      selected ? 'border-[#1a1612] bg-[#dcd0b8] ring-1 ring-[#1a1612]' : ''
    ].join(' '),
    danger: [
      'bg-[#2a0c0e] text-[#fecaca] border border-[#b91c1c]',
      'hover:bg-[#3b1114] hover:border-[#ef4444] hover:text-white hover:shadow-[0_0_10px_rgba(185,28,28,0.4)]',
      'active:bg-[#1f090b] active:translate-y-[1px]',
      selected ? 'border-[#ef4444] bg-[#3b1114] ring-1 ring-[#ef4444]' : ''
    ].join(' '),
    ghost: [
      'bg-transparent text-[#ede4d1] border border-transparent',
      'hover:bg-[#8c733e]/15 hover:text-[#d4af37]',
      'active:bg-[#8c733e]/25 active:translate-y-[1px]',
      selected ? 'border-[#8c733e]/60 bg-[#8c733e]/20 text-[#d4af37]' : ''
    ].join(' ')
  };

  // Escala de tamaños
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 font-serif rounded-xs',
    md: 'px-4 py-2 text-sm gap-2 font-serif rounded-sm',
    lg: 'px-6 py-3 text-base gap-2.5 font-serif rounded-md'
  };

  // Estilos de estado deshabilitado / pending / error
  let stateStyles = '';
  if (isDisabled) {
    stateStyles = 'opacity-50 cursor-not-allowed pointer-events-auto filter grayscale-[30%]';
  }
  if (error) {
    stateStyles = 'border-red-500 text-red-300 bg-red-950/40';
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={pending}
        aria-pressed={selected}
        aria-describedby={disabledReason ? 'btn-disabled-reason' : undefined}
        onClick={handleClick}
        onMouseEnter={() => disabledReason && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => disabledReason && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={[
          'inline-flex items-center justify-center select-none transition-all duration-150',
          'lotm-focus-ring cursor-pointer outline-none',
          variantStyles[variant],
          sizeStyles[size],
          stateStyles,
          className
        ].join(' ')}
        {...rest}
      >
        {/* Indicador no basado únicamente en color */}
        {pending && <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" aria-hidden="true" />}
        {!pending && error && <AlertCircle className="w-4 h-4 text-red-400" aria-hidden="true" />}
        {!pending && !error && disabledReason && <Lock className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />}
        {!pending && !error && !disabledReason && selected && <Check className="w-3.5 h-3.5 text-[#d4af37]" aria-hidden="true" />}
        {!pending && !error && !disabledReason && !selected && icon}

        <span>{children}</span>
      </button>

      {/* Tooltip Diegético de Razón de Bloqueo */}
      {showTooltip && disabledReason && (
        <div
          id="btn-disabled-reason"
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-3 py-1.5 bg-[#120e0a] border border-[#8c733e] text-[#ede4d1] text-xs font-serif rounded shadow-xl whitespace-nowrap pointer-events-none"
        >
          <span className="text-[#d4af37] font-semibold mr-1">Impedido:</span>
          {disabledReason}
        </div>
      )}
    </div>
  );
});

ActionButton.displayName = 'ActionButton';
