/**
 * GFX46 — RESOLUCIÓN DIEGÉTICA DE COMBATE (BRIEF-10.VISUAL)
 * 
 * Capa de resolución sin puntuaciones ni números explícitos:
 * 1. VICTORIA: El adversario retrocede sangrando o huye hacia las alcantarillas de Backlund.
 * 2. HUIDA: Ruptura de contacto exitosa hacia la bruma de Minsk Street.
 * 3. DERROTA_INCONSCIENTE: Colapso físico en los adoquines; rescate o despertar con marca somática.
 * 4. PERDIDA_DE_CONTROL: La espiritualidad se desborda, los hilos se quiebran en la oscuridad.
 */

import React from 'react';
import { ShieldCheck, Wind, AlertTriangle, Skull } from 'lucide-react';

export type CombatOutcomeType = 
  | 'VICTORIA' 
  | 'HUIDA' 
  | 'DERROTA_INCONSCIENTE' 
  | 'PERDIDA_DE_CONTROL';

interface TacticalResolutionOverlayProps {
  outcome: CombatOutcomeType;
  onConfirm: () => void;
  narrativeDetail?: string;
}

export const TacticalResolutionOverlay: React.FC<TacticalResolutionOverlayProps> = ({
  outcome,
  onConfirm,
  narrativeDetail
}) => {
  const getConfig = () => {
    switch (outcome) {
      case 'VICTORIA':
        return {
          title: 'EL FIN DE LA DISPUTA',
          subtitle: 'El adversario se retira en la niebla',
          icon: <ShieldCheck size={32} className="text-[#22c55e]" />,
          defaultProse: 'El sonido de pasos apresurados y gotas pesadas cayendo sobre el lodo marca la retirada del enemigo. La callejuela vuelve a sumirse en el silencio de carbón y gas. Tus manos bajan lentamente el arma.',
          consequenceText: 'Has preservado tu integridad y tus anclas civiles permanecen a salvo por esta noche.',
          btnLabel: 'Regresar al Desván',
          borderColor: '#22c55e',
          bannerBg: 'bg-[#0f2415]/95'
        };
      case 'HUIDA':
        return {
          title: 'RUPTURA DE CONTACTO',
          subtitle: 'Desenganche exitoso en la penumbra',
          icon: <Wind size={32} className="text-[#38bdf8]" />,
          defaultProse: 'Te deslizas por un recodo estrecho entre dos almacenes de ladrillo. El perseguidor pierde tu rastro entre las sombras y el hedor a alquitrán del río Tussock. El corazón late desbocado pero la amenaza ha quedado atrás.',
          consequenceText: 'Tu coartada sigue en pie, aunque la sombra recordará tus rasgos si vuelves a cruzarte con ella.',
          btnLabel: 'Buscar Refugio en el Desván',
          borderColor: '#38bdf8',
          bannerBg: 'bg-[#0c1f2e]/95'
        };
      case 'DERROTA_INCONSCIENTE':
        return {
          title: 'COLAPSO EN EL FANGO',
          subtitle: 'Pérdida de consciencia en Backlund',
          icon: <AlertTriangle size={32} className="text-[#f59e0b]" />,
          defaultProse: 'Un golpe sordo quiebra tu postura. El frío empedrado de Backlund recibe tu caída y la visión se nubla en un torbellino de luces púrpuras. Horas más tarde, el silbato de un sereno lejano te despierta en un portal oscuro, dolorido y con los bolsillos revueltos.',
          consequenceText: 'Has sufrido un trauma físico severo. La vela de tu desván arderá vacilante hasta que reposes.',
          btnLabel: 'Arrastrarte hasta el Escritorio',
          borderColor: '#f59e0b',
          bannerBg: 'bg-[#291807]/95'
        };
      case 'PERDIDA_DE_CONTROL':
        return {
          title: 'DESBORDE ESPIRITUAL',
          subtitle: 'El abismo reclama el recipiente',
          icon: <Skull size={32} className="text-[#ef4444]" />,
          defaultProse: 'La barrera entre tu mente y la locura cósmica se fractura. Susurros ininteligibles desgarran tu raciocinio y tu carne amenaza con mutar en formas monstruosas. Solo un destello lejano de tus anclas humanas te arrastra agónicamente de regreso al borde del abismo.',
          consequenceText: 'Tu humanidad ha sufrido una fractura indeleble. El espejo de azogue se ha oscurecido.',
          btnLabel: 'Aferrarte a la Razón',
          borderColor: '#ef4444',
          bannerBg: 'bg-[#29080c]/95'
        };
    }
  };

  const config = getConfig();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#070605]/85 backdrop-blur-sm animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolutionTitle"
    >
      <div 
        className={`w-full max-w-xl p-8 rounded-lg border shadow-2xl ${config.bannerBg} font-serif text-[#e5ded2]`}
        style={{ borderColor: config.borderColor }}
      >
        <div className="flex items-center gap-4 mb-4 pb-3 border-b border-[#3d2a1a]">
          {config.icon}
          <div>
            <h2 id="resolutionTitle" className="text-xl font-bold tracking-widest" style={{ fontFamily: 'Cinzel', color: config.borderColor }}>
              {config.title}
            </h2>
            <p className="text-xs text-[#a89f91] italic">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6 leading-relaxed text-sm text-[#ded5c5]">
          <p className="italic font-serif">
            "{narrativeDetail || config.defaultProse}"
          </p>
          <div className="p-3 bg-[#0a0807]/80 rounded border border-[#3d2a1a] text-xs text-[#c4b59a]">
            <strong>Consecuencia Diegética:</strong> {config.consequenceText}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#3d2a1a]">
          <button
            onClick={onConfirm}
            className="crimson-btn px-6 py-2.5 text-xs font-serif font-bold uppercase tracking-wider transition-all"
          >
            {config.btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

