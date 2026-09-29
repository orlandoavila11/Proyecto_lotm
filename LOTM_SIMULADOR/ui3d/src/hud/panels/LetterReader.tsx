import type { ReactNode } from 'react';
import { Gilt } from '../kit/Gilt';

/**
 * Pliego de papel verjurado sobre la escena. Se usa para la carta del Benefactor, desenlaces y
 * cualquier texto ceremonial largo (MOMENTO = PROSA).
 */
export function LetterReader({ children, footer, signature, width = 760, left = 150 }: {
  children: ReactNode;
  footer?: ReactNode;
  signature?: string;
  width?: number;
  left?: number;
}) {
  return (
    <article
      className="letter fade-in"
      style={{ position: 'absolute', left, top: 90, width, maxHeight: 'calc(100% - 200px)' }}
    >
      <div className="letter__sheet scroll">
        {children}
        {signature && <p className="letter__signature">{signature}</p>}
        <svg className="letter__seal" viewBox="0 0 80 80" aria-hidden="true">
          <defs>
            <radialGradient id="wax" cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#c0474a" />
              <stop offset="0.55" stopColor="#8a2226" />
              <stop offset="1" stopColor="#4e1014" />
            </radialGradient>
          </defs>
          <path d="M40 4c7 3 13 1 18 6s3 11 8 16 6 9 4 15-7 8-8 14-6 12-12 13-10 5-16 4-11-5-16-8-9-8-10-14-5-10-3-16 6-9 8-14 7-10 13-12 7-2 14-4z" fill="url(#wax)" />
          <circle cx="40" cy="40" r="18" fill="none" stroke="#5a1418" strokeWidth="2" opacity="0.7" />
          <path d="M40 27v26M28 40h24M31.5 31.5l17 17M48.5 31.5l-17 17" stroke="#5a1418" strokeWidth="1.6" opacity="0.6" />
        </svg>
      </div>
      {footer}
    </article>
  );
}

export function LetterText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{1,2}/).filter(Boolean).map((para, i) => (
        <p key={i} className={i === 0 && para.trim().endsWith(':') ? 'letter__salutation' : undefined}>{para}</p>
      ))}
    </>
  );
}

export function LetterFrame() {
  return <Gilt variant="hairline" tone="bronze" />;
}
