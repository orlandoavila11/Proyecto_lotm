/**
 * LOADING & ERROR SURFACES — SUPERFICIES DE CARGA Y RECUPERACIÓN DE ERROR (PROMPT P04)
 * Superficies diegéticas para transiciones asíncronas y estados de fallo recuperables.
 */

import React from 'react';
import { Loader2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { ActionButton } from './ActionButton';

export interface LoadingSurfaceProps {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
}

export const LoadingSurface: React.FC<LoadingSurfaceProps> = ({
  label = 'Invocando los arcanos...',
  sublabel = 'El velo entre Backlund y el mundo espiritual se afina.',
  fullScreen = false
}) => {
  const content = (
    <div 
      role="status" 
      aria-busy="true"
      className="flex flex-col items-center justify-center p-8 space-y-4 text-center select-none"
    >
      <div className="relative">
        <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" aria-hidden="true" />
        <span className="absolute inset-0 flex items-center justify-center font-serif text-xs text-[#d4af37]">
          §
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-base font-serif font-bold text-[#ede4d1] cinzel tracking-wide">
          {label}
        </p>
        {sublabel && (
          <p className="text-xs font-serif text-[#a89f91] max-w-sm italic">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090807]/90 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};

export interface ErrorSurfaceProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  retryLabel?: string;
  backLabel?: string;
  fullScreen?: boolean;
}

export const ErrorSurface: React.FC<ErrorSurfaceProps> = ({
  title = 'Perturbación en la Transmutación',
  message,
  onRetry,
  onBack,
  retryLabel = 'Reintentar Operación',
  backLabel = 'Regresar',
  fullScreen = false
}) => {
  const content = (
    <div 
      role="alert" 
      className="flex flex-col items-center justify-center p-8 space-y-5 text-center max-w-md bg-[#1f130d] border-2 border-[#b91c1c] rounded-md shadow-2xl select-none"
    >
      <div className="w-12 h-12 rounded-full bg-[#2d0f12] border border-[#ef4444] flex items-center justify-center text-red-400">
        <AlertCircle size={26} aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-serif font-bold text-red-200 cinzel">
          {title}
        </h3>
        <p className="text-xs font-serif text-[#d6c4b8] leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        {onBack && (
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={onBack}
            icon={<ArrowLeft size={14} />}
          >
            {backLabel}
          </ActionButton>
        )}

        {onRetry && (
          <ActionButton
            variant="brass"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw size={14} />}
          >
            {retryLabel}
          </ActionButton>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090807]/92 backdrop-blur-xs p-4">
        {content}
      </div>
    );
  }

  return content;
};

