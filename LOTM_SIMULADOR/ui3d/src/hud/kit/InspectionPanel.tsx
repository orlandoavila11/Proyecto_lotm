import type { ReactNode } from 'react';
import { Divider, Gilt } from './Gilt';

/**
 * Panel de V03/V05: marco de ébano con cabecera en versalitas y un pliego interior (pergamino o ébano)
 * donde vive la lectura amplia.
 */
export function InspectionPanel({ title, children, footer, parchment = true, style }: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  parchment?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <section className="inspection slide-in-right" style={style} aria-label={title}>
      <Gilt variant="panel" />
      <header className="inspection__header">
        <h2 className="t-display" style={{ margin: 0, fontSize: 38, fontWeight: 500, letterSpacing: '0.03em' }}>{title}</h2>
        <Divider width="86%" style={{ margin: '10px auto 0' }} />
      </header>
      <div className={`inspection__sheet ${parchment ? 'inspection__sheet--paper' : ''}`}>
        <Gilt variant="hairline" tone={parchment ? 'bronze' : 'gold'} />
        <div className="inspection__content scroll">{children}</div>
        {footer && <div className="inspection__footer">{footer}</div>}
      </div>
    </section>
  );
}

/** Fotografía enmarcada con escuadras en las esquinas (miniatura de evidencia o mercancía). */
export function FramedImage({ src, alt, fallback, aspect = 377 / 260 }: { src: string | null; alt: string; fallback?: React.CSSProperties; aspect?: number }) {
  return (
    <div className="framed-photo">
      {src ? <img src={src} alt={alt} style={{ aspectRatio: aspect }} /> : <div role="img" aria-label={alt} style={{ aspectRatio: aspect, ...fallback }} />}
      <svg className="framed-photo__corners" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 8 V0 H6 M94 0 H100 V8 M100 92 V100 H94 M6 100 H0 V92" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
