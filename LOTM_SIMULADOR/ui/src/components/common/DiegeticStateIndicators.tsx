/**
 * GFX58 — ESTADOS DIEGÉTICOS DE CARGA, VACÍO, ERROR Y DESCONEXIÓN
 * Recursos discretos con metáfora victoriana / ocultista, texto vivo y accesibilidad total.
 * Reutiliza papel, luz de vela y latón; respeta prefers-reduced-motion y anuncios ARIA.
 */

import React from 'react';
import { VictorianIconCandle, VictorianIconReturn, VictorianIconHelp } from './VictorianIcons';
import { RefreshCw, AlertCircle, FileText, WifiOff } from 'lucide-react';

/* ==========================================================================
   1. ESTADO DE CARGA DIEGÉTICA (Sintonizando resonancia espiritual)
   ========================================================================== */
interface DiegeticLoadingProps {
  message?: string;
}

export const DiegeticLoading: React.FC<DiegeticLoadingProps> = ({
  message = 'El velo parpadea... sintonizando la resonancia espiritual.'
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-8 text-center select-none"
      role="status"
      aria-live="polite"
    >
      {/* Silueta de vela y llama oscilante */}
      <div className="relative mb-4 flex items-center justify-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center border border-[#8c733e]/40 bg-[#17130e]"
          style={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' }}
        >
          <VictorianIconCandle size={28} color="#d4af37" className="animate-pulse" />
        </div>
      </div>

      <p className="text-sm text-[#dfcaa2] font-serif italic max-w-sm leading-relaxed" style={{ fontFamily: 'Cinzel' }}>
        {message}
      </p>
      <span className="text-[11px] text-[#8a7b68] mt-1 font-serif">
        Aguardando a que la niebla disipe sus sombras...
      </span>
    </div>
  );
};

/* ==========================================================================
   2. ESTADO VACÍO DIEGÉTICO (Papel en blanco sin inscripciones)
   ========================================================================== */
interface DiegeticEmptyProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const DiegeticEmpty: React.FC<DiegeticEmptyProps> = ({
  title = 'Pliego en Blanco',
  description = 'Ningún rastro de tinta ferrogálica ha tocado aún esta superficie.',
  actionText,
  onAction
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-8 text-center rounded border border-[#3d3224] bg-[#14100c] text-[#dfcaa2] select-none max-w-md mx-auto"
      role="region"
      aria-label={title}
    >
      <div className="w-12 h-12 mb-3 rounded-full bg-[#241c14] border border-[#544129] flex items-center justify-center text-[#d4af37]">
        <FileText size={22} />
      </div>

      <h3 className="text-base font-bold text-[#d4af37] mb-1" style={{ fontFamily: 'Cinzel' }}>
        {title}
      </h3>
      <p className="text-xs text-[#a39480] font-serif italic mb-4 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-1.5 bg-[#261e14] hover:bg-[#382b1c] border border-[#8c733e] text-[#d4af37] text-xs font-serif rounded transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   3. ESTADO DE ERROR RECUPERABLE (Resonancia interrumpida con reintento)
   ========================================================================== */
interface DiegeticErrorProps {
  title?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const DiegeticError: React.FC<DiegeticErrorProps> = ({
  title = 'Resonancia Interrumpida',
  errorMessage = 'La resonancia astral se ha disipado temporalmente. Comprueba el canal y reintenta.',
  onRetry,
  onBack
}) => {
  return (
    <div 
      className="p-6 rounded-md border border-[#851c22]/60 bg-[#1c1010] text-[#eed8d8] shadow-2xl max-w-lg mx-auto select-none"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3.5 mb-4">
        <div className="p-2 rounded bg-[#381414] border border-[#b91c1c] text-[#f87171] shrink-0 mt-0.5">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 className="font-serif font-bold text-sm text-[#fca5a5]" style={{ fontFamily: 'Cinzel' }}>
            {title}
          </h3>
          <p className="text-xs text-[#d1b0b0] font-serif italic mt-1 leading-relaxed">
            {errorMessage}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-[#4a1c1c] pt-3">
        {onBack && (
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 border border-[#6b2b2b] text-[#dfaaaa] hover:text-[#ffffff] rounded text-xs font-serif flex items-center gap-1.5 transition-colors"
          >
            <VictorianIconReturn size={14} />
            <span>Regresar</span>
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="crimson-btn px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Restablecer Vínculo</span>
          </button>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   4. ESTADO DE DESCONEXIÓN / SIN RED (Aislamiento de la niebla)
   ========================================================================== */
interface DiegeticOfflineProps {
  onReconnect?: () => void;
}

export const DiegeticOffline: React.FC<DiegeticOfflineProps> = ({
  onReconnect
}) => {
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 p-4 rounded-md border border-[#8c733e] bg-[#17130e] text-[#dfcaa2] shadow-2xl flex items-center gap-3 select-none"
      role="status"
    >
      <WifiOff size={18} className="text-[#f59e0b] shrink-0" />
      <div>
        <h4 className="font-serif font-bold text-xs text-[#d4af37]">
          Niebla Aislante
        </h4>
        <p className="text-[11px] text-[#9c8e7b] italic font-serif">
          El canal espiritual no responde.
        </p>
      </div>
      {onReconnect && (
        <button
          onClick={onReconnect}
          className="ml-2 px-2.5 py-1 bg-[#2b2014] hover:bg-[#40301d] border border-[#d4af37] text-[#ffd700] rounded text-[11px] font-serif transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   5. FALLBACK ACCESIBLE PARA FALLOS DE IMAGEN
   ========================================================================== */
interface DiegeticImageFallbackProps {
  altText: string;
  aspectRatio?: string;
}

export const DiegeticImageFallback: React.FC<DiegeticImageFallbackProps> = ({
  altText,
  aspectRatio = '1 / 1'
}) => {
  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#171410] border border-[#4a3b29] rounded text-center"
      style={{ aspectRatio }}
      role="img"
      aria-label={altText}
    >
      <VictorianIconHelp size={20} color="#8c733e" className="mb-1 opacity-70" />
      <span className="text-[11px] text-[#9c8e7b] font-serif italic">
        {altText}
      </span>
    </div>
  );
};

