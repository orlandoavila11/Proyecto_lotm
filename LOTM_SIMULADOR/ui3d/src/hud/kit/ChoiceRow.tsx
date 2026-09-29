import type { ReactNode } from 'react';
import { IconCheck, IconChevronRight } from './icons';

/**
 * Fila de requisito/elección de V08: miniatura a la izquierda, rótulo, sello circular (vacío o
 * cumplido) y chevron. Toda la fila es un botón.
 */
export function ChoiceRow({ thumb, label, detail, done, selected, onClick, compact }: {
  thumb?: ReactNode;
  /** columna de miniatura estrecha (letra o sello en lugar de imagen) */
  compact?: boolean;
  label: string;
  detail?: string;
  done?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" className={`choice-row ${compact ? 'choice-row--compact' : ''}`} aria-pressed={selected} onClick={onClick}>
      <span className="choice-row__thumb">{thumb}</span>
      <span className="choice-row__text">
        <span className="choice-row__label">{label}</span>
        {detail && <span className="choice-row__detail">{detail}</span>}
      </span>
      <span className={`choice-row__seal ${done ? 'is-done' : ''}`} aria-label={done ? 'Cumplido' : 'Pendiente'}>
        {done && <IconCheck size={22} />}
      </span>
      <span className="choice-row__chev"><IconChevronRight size={22} /></span>
    </button>
  );
}
