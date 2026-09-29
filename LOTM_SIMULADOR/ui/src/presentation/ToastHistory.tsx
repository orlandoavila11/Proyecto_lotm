/**
 * TOAST & HISTORY — ANUNCIOS Y BITÁCORA DIEGÉTICA (PROMPT P04)
 * Notificaciones efímeras accesibles (aria-live="polite") y registro histórico de eventos civiles y ocultistas.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, History, X } from 'lucide-react';

export type ToastType = 'info' | 'warning' | 'error' | 'success';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  timestamp: string;
}

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  toasts: ToastItem[];
  history: ToastItem[];
  dismissToast: (id: string) => void;
  clearHistory: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [history, setHistory] = useState<ToastItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    const newItem: ToastItem = {
      id: `toast_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setToasts((prev) => [...prev.slice(-3), newItem]);
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newItem.id));
    }, 4500);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const typeConfig: Record<ToastType, { icon: React.ReactNode; border: string; bg: string; text: string }> = {
    info: {
      icon: <Info size={16} className="text-[#d4af37]" />,
      border: 'border-[#8c733e]',
      bg: 'bg-[#1a140f]',
      text: 'text-[#ede4d1]'
    },
    warning: {
      icon: <AlertTriangle size={16} className="text-amber-400" />,
      border: 'border-amber-600',
      bg: 'bg-[#241708]',
      text: 'text-amber-200'
    },
    error: {
      icon: <AlertCircle size={16} className="text-red-400" />,
      border: 'border-red-700',
      bg: 'bg-[#260a0d]',
      text: 'text-red-200'
    },
    success: {
      icon: <CheckCircle2 size={16} className="text-emerald-400" />,
      border: 'border-emerald-700',
      bg: 'bg-[#091a10]',
      text: 'text-emerald-200'
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, toasts, history, dismissToast, clearHistory }}>
      {children}

      {/* Región ARIA Live para Lectores de Pantalla y Contenedor de Toasts */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const cfg = typeConfig[toast.type];
          return (
            <div
              key={toast.id}
              className={[
                'pointer-events-auto flex items-start gap-3 p-3.5 rounded border-2 shadow-2xl transition-all duration-200 select-none',
                cfg.bg,
                cfg.border,
                cfg.text
              ].join(' ')}
            >
              <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
              <div className="flex-1 space-y-0.5">
                <p className="text-xs font-serif font-bold cinzel">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs font-serif text-[#a89f91]">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-zinc-400 hover:text-[#ede4d1] p-1 cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Cajón de Bitácora / Historial */}
      {isHistoryOpen && (
        <div
          role="dialog"
          aria-label="Historial de Notificaciones y Acontecimientos"
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs select-none"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[#18110b] border-l-2 border-[#8c733e] p-6 text-[#ede4d1] flex flex-col justify-between shadow-2xl"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#8c733e]/40 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-[#d4af37]" />
                  <h3 className="font-serif font-bold text-lg text-[#d4af37] cinzel">
                    Bitácora de Sucesos
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1 hover:bg-[#2b1f16] rounded text-[#ede4d1]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-xs italic text-[#a89f91] py-8 text-center">
                    Sin acontecimientos recientes registrados.
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#120d08] border border-[#8c733e]/30 rounded space-y-1"
                    >
                      <div className="flex justify-between items-center text-[10px] text-[#8c733e]">
                        <span className="uppercase font-semibold">{item.type}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="text-xs font-serif font-bold text-[#ede4d1]">{item.title}</p>
                      {item.message && (
                        <p className="text-xs font-serif text-[#a89f91]">{item.message}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#8c733e]/30 flex justify-between">
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-zinc-400 hover:text-red-400 underline cursor-pointer"
              >
                Vaciar bitácora
              </button>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-3 py-1 text-xs bg-[#2b1f16] border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#3d2c20]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

