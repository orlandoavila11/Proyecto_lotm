import type { ReactNode } from 'react';
import { Divider, Gilt } from './Gilt';

/**
 * Panel de V07/V08: cabecera de ébano con título espaciado y un pliego de pergamino debajo, con hojas
 * manuscritas asomando por detrás y, opcionalmente, una etiqueta clavada en la esquina.
 */
export function StackedSheet({ title, subtitle, tag, children, footer, style, headerSize = 30, spaced = true, loose = true }: {
  title: string;
  subtitle?: string;
  tag?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  style?: React.CSSProperties;
  headerSize?: number;
  spaced?: boolean;
  /** hojas sueltas asomando por detrás */
  loose?: boolean;
}) {
  return (
    <section className="stacked slide-in-right" style={style} aria-label={title}>
      {loose && <div className="stacked__under stacked__under--a" aria-hidden="true" />}
      {loose && <div className="stacked__under stacked__under--b" aria-hidden="true" />}
      <div className="stacked__body">
        <Gilt variant="panel" />
        <header className="stacked__header">
          <h2 className="t-display" style={{ margin: 0, fontSize: headerSize, letterSpacing: spaced ? '0.16em' : '0.04em', fontWeight: 500 }}>
            {title}
          </h2>
          <Divider width="88%" style={{ margin: '12px auto 0' }} />
          {subtitle && <p className="t-body" style={{ margin: '12px 0 0', fontSize: 25 }}>{subtitle}</p>}
        </header>
        <div className="stacked__sheet">
          {tag && <div className="stacked__tag">{tag}</div>}
          <div className="stacked__content scroll">{children}</div>
          {footer && <div className="stacked__footer">{footer}</div>}
        </div>
      </div>
    </section>
  );
}
