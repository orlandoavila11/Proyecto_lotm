import type { CSSProperties, ReactNode } from 'react';
import { Divider, Gilt, type GiltVariant } from './Gilt';
import { IconBook, IconCity, IconGear, IconQuill } from './icons';

/* ════════════════════════════════════════════════════════════════════════ cartela de lugar */

/** Cartela superior izquierda: "EL DESVÁN" + subtítulo (distrito · hora). Medidas de V01. */
export function Cartouche({ title, subtitle, subtitleInside, width }: { title: string; subtitle?: string; subtitleInside?: boolean; width?: number }) {
  return (
    <header className="fade-in" style={{ position: 'absolute', left: 25, top: 18 }}>
      <div
        style={{
          position: 'relative',
          minWidth: width ?? 233,
          padding: subtitleInside ? '12px 34px 13px' : '14px 34px 15px',
          background: 'linear-gradient(180deg, rgba(20,16,12,0.78), rgba(14,11,9,0.84))',
          textAlign: 'center'
        }}
      >
        <Gilt variant="cartouche" diamondTop diamondBottom />
        <h1 className="t-display" style={{ margin: 0, fontSize: 27, fontWeight: 500, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          {title}
        </h1>
        {subtitle && subtitleInside && (
          <>
            <Divider width="78%" style={{ margin: '6px auto 5px' }} />
            <p className="t-body" style={{ margin: 0, fontSize: 20, color: 'var(--ivory)' }}>{subtitle}</p>
          </>
        )}
      </div>
      {subtitle && !subtitleInside && (
        <p className="t-body" style={{ margin: '8px 0 0', fontSize: 20, textAlign: 'center', color: 'var(--ivory)', textShadow: '0 1px 3px #000' }}>
          {subtitle}
        </p>
      )}
    </header>
  );
}

/* ════════════════════════════════════════════════════════════════════════ panel */

interface PanelProps {
  children: ReactNode;
  style?: CSSProperties;
  parchment?: boolean;
  className?: string;
  label?: string;
  variant?: GiltVariant;
}

export function Panel({ children, style, parchment, className = '', label, variant = 'panel' }: PanelProps) {
  return (
    <section
      aria-label={label}
      className={`panel ${parchment ? 'panel--parchment' : ''} ${className}`}
      style={style}
    >
      <Gilt variant={variant} tone={parchment ? 'bronze' : 'gold'} />
      {children}
    </section>
  );
}

/** Título de panel en versalitas (Cinzel) con filete y rombo. */
export function PanelTitle({ children, size = 40, align = 'center', dividerWidth = '88%', tone = 'gold' }: {
  children: ReactNode;
  size?: number;
  align?: 'center' | 'left';
  dividerWidth?: string;
  tone?: 'gold' | 'bronze';
}) {
  return (
    <div style={{ textAlign: align }}>
      <h2 className="t-display" style={{ margin: 0, fontSize: size, fontWeight: 500, letterSpacing: '0.035em' }}>
        {children}
      </h2>
      <Divider width={dividerWidth} tone={tone} style={{ margin: align === 'center' ? '10px auto 0' : '10px 0 0' }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ botón */

interface GoldButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  busy?: boolean;
  style?: CSSProperties;
  title?: string;
  align?: 'center' | 'start';
  variant?: GiltVariant;
  ariaPressed?: boolean;
}

export function GoldButton({ children, icon, onClick, primary, disabled, busy, style, title, align = 'center', variant = 'button', ariaPressed }: GoldButtonProps) {
  return (
    <button
      type="button"
      className={`gbtn ${primary ? 'gbtn--primary' : ''}`}
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      aria-pressed={ariaPressed}
      title={title}
      style={{ justifyContent: align === 'start' ? 'flex-start' : 'center', ...style }}
    >
      <Gilt variant={variant} />
      {icon && <span className="gbtn__icon">{icon}</span>}
      <span style={{ position: 'relative' }}>{busy ? <BusyDots /> : children}</span>
    </button>
  );
}

function BusyDots() {
  return (
    <span aria-label="Procesando" style={{ letterSpacing: '0.3em' }}>
      <span className="busy-dot">·</span>
      <span className="busy-dot" style={{ animationDelay: '160ms' }}>·</span>
      <span className="busy-dot" style={{ animationDelay: '320ms' }}>·</span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════════ navegación inferior (V01) */

export function BottomNav({ onDiary, onCity, onSettings, active }: {
  onDiary: () => void;
  onCity: () => void;
  onSettings: () => void;
  active?: 'diary' | 'city' | 'settings' | null;
}) {
  return (
    <nav aria-label="Navegación" className="fade-in" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, pointerEvents: 'none' }}>
      {/* filete largo con rombos terminales (todo referido al centro de la pantalla) */}
      <div className="nav-line nav-line--l" />
      <div className="nav-line nav-line--r" />

      {/* cuerpo hexagonal */}
      <div style={{ position: 'absolute', left: 'calc(50% - 320px)', top: 33, width: 645, height: 60, pointerEvents: 'auto' }}>
        <svg className="gilt" width="645" height="60" viewBox="0 0 645 60" aria-hidden="true" style={{ overflow: 'visible' }}>
          <path d="M-8 30 l6 -6 6 6 -6 6z M651 30 l6 -6 6 6 -6 6z" fill="var(--ebony)" stroke="var(--gold-hi)" strokeWidth="1.2" />
          <path d="M28 1 H617 L644 30 L617 59 H28 L1 30 Z" fill="rgba(14,11,9,0.86)" stroke="var(--gold)" strokeWidth="1.3" />
          <path d="M218 30 l5 -5 5 5 -5 5z M417 30 l5 -5 5 5 -5 5z" fill="none" stroke="var(--gold-hi)" strokeWidth="1.1" />
        </svg>
        <NavItem x={62} width={150} label="Diario" icon={<IconBook size={34} />} onClick={onDiary} active={active === 'diary'} />
        <NavItem x={456} width={150} label="Ajustes" icon={<IconGear size={30} />} onClick={onSettings} active={active === 'settings'} />
      </div>

      {/* medallón central */}
      <button
        type="button"
        onClick={onCity}
        aria-pressed={active === 'city'}
        className="nav-medallion"
        style={{ position: 'absolute', left: 'calc(50% - 46px)', top: 10, width: 92, height: 98, pointerEvents: 'auto' }}
      >
        <svg className="gilt" width="92" height="98" viewBox="0 0 92 98" aria-hidden="true">
          <path d="M46 1 l3 5 -3 3 -3 -3z" fill="var(--gold-hi)" />
          <circle cx="46" cy="52" r="43" fill="rgba(14,11,9,0.92)" stroke="var(--gold)" strokeWidth="1.4" />
          <circle cx="46" cy="52" r="38.5" fill="none" stroke="var(--gold)" strokeWidth="0.7" opacity="0.6" />
        </svg>
        <span style={{ position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', justifyContent: 'center', color: 'var(--gold-hi)' }}>
          <IconCity size={40} />
        </span>
        <span className="t-body" style={{ position: 'absolute', left: 0, right: 0, top: 62, fontSize: 19, textAlign: 'center' }}>Ciudad</span>
      </button>
    </nav>
  );
}

function NavItem({ x, width, label, icon, onClick, active }: { x: number; width: number; label: string; icon: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="nav-item"
      style={{ position: 'absolute', left: x, top: 8, width, height: 44 }}
    >
      <span style={{ color: 'var(--gold-hi)', display: 'flex' }}>{icon}</span>
      <span className="t-body" style={{ fontSize: 21 }}>{label}</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════ sello de guardado */

export function SaveBadge({ savedAt }: { savedAt: number | null }) {
  // el estado vive en SQLite: la partida siempre está guardada; el sello destella al confirmar un comando
  return (
    <div
      role="status"
      aria-live="polite"
      key={savedAt ?? 0}
      className={`fade-in save-badge ${savedAt ? 'save-badge--flash' : ''}`}
      style={{
        position: 'absolute', left: 28, bottom: 34, height: 50, padding: '0 16px 0 12px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(14,11,9,0.82)', border: '1px solid var(--gold-line)', borderRadius: 6
      }}
    >
      <span style={{ color: 'var(--gold-hi)', display: 'flex' }}><IconQuill size={30} /></span>
      <span className="t-body" style={{ fontSize: 17 }}>Partida guardada</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ botón "volver" de esquina */

export function CornerBack({ label, onClick, icon }: { label: string; onClick: () => void; icon: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="corner-back fade-in">
      <Gilt variant="hairline" />
      <span style={{ color: 'var(--gold-hi)', display: 'flex' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
