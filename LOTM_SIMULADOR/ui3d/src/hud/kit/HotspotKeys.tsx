import { useStage } from '../../engine/react';
import type { HotspotDef } from '../../engine/types';

/**
 * Los objetos de la lámina también existen para el teclado y los lectores de pantalla: botones invisibles
 * que, al recibir el foco, iluminan el objeto igual que el puntero.
 */
export function HotspotKeys({ spots, onOpen, label = 'Objetos de la escena' }: {
  spots: readonly HotspotDef[];
  onOpen: (id: string) => void;
  label?: string;
}) {
  const stage = useStage();
  return (
    <nav aria-label={label} className="hotspot-keys">
      {spots.filter((s) => !s.quiet).map((s) => (
        <button
          key={s.id}
          type="button"
          onFocus={() => stage?.setHover(s.id)}
          onBlur={() => stage?.setHover(null)}
          onClick={() => onOpen(s.id)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
