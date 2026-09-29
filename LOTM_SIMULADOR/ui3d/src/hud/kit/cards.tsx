import type { ReactNode } from 'react';
import { Anchored } from '../../engine/react';
import type { Vec2 } from '../../engine/types';
import { Panel, PanelTitle } from './components';
import { IconClose } from './icons';

/** Tarjeta de objetivo (V01, arriba a la derecha): título en versalitas + acción con icono circular. */
export function ObjectiveCard({ title, action, icon, onClick }: { title: string; action: string; icon: ReactNode; onClick?: () => void }) {
  return (
    <Panel className="slide-in-right" style={{ right: 27, top: 205, width: 388, minHeight: 160, padding: '26px 30px 24px' }} label="Objetivo">
      <PanelTitle size={21} align="left" dividerWidth="100%">{title}</PanelTitle>
      <button type="button" className="objective-action" onClick={onClick} disabled={!onClick}>
        <span className="objective-action__icon">{icon}</span>
        <span>{action}</span>
      </button>
    </Panel>
  );
}

/** Panel lateral de lectura para objetos de la mesa (ébano) o evidencias (pergamino). */
export function SidePanel({ title, children, onClose, width = 430, top = 205, parchment, footer }: {
  title: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  width?: number;
  top?: number;
  parchment?: boolean;
  footer?: ReactNode;
}) {
  return (
    <Panel
      parchment={parchment}
      className="slide-in-right"
      style={{ right: 27, top, width, maxHeight: `calc(100% - ${top + 140}px)`, padding: '30px 32px 28px', display: 'flex', flexDirection: 'column' }}
      label={typeof title === 'string' ? title : undefined}
    >
      {onClose && (
        <button type="button" className="panel-close" onClick={onClose} aria-label="Cerrar">
          <IconClose size={20} />
        </button>
      )}
      <PanelTitle size={26} tone={parchment ? 'bronze' : 'gold'}>{title}</PanelTitle>
      <div className="scroll" style={{ marginTop: 18, flex: 1, minHeight: 0, paddingRight: 4 }}>{children}</div>
      {footer && <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>{footer}</div>}
    </Panel>
  );
}

/** Etiqueta flotante sobre un objeto de la lámina al pasar el puntero. */
export function HoverTag({ at, label }: { at: Vec2; label: string }) {
  return (
    <Anchored at={at} offset={[0, -18]} className="passthrough">
      <div className="hover-tag">{label}</div>
    </Anchored>
  );
}

export function Prose({ children, size = 21, dim }: { children: ReactNode; size?: number; dim?: boolean }) {
  return (
    <p className="t-body" style={{ margin: '0 0 14px', fontSize: size, lineHeight: 1.42, color: dim ? 'var(--ivory-dim)' : undefined }}>
      {children}
    </p>
  );
}
