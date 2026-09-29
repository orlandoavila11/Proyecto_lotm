import { FogBank, LampHalo, RainSheet } from '../../engine/effects';
import type { PlaceSpec } from '../../engine/PlaceSpec';
import { Region } from '../../engine/types';

/**
 * V02 · Cherwood — elegir una ruta. Arquitectura, escala humana y recorrido por destinos.
 * Los letreros y el plano no establecen geografía canónica: los destinos son del contrato de juego.
 */
const LAMPS: [number, number, number][] = [
  [620, 432, 70], [712, 545, 46], [1035, 512, 52], [1447, 212, 92], [918, 598, 28], [800, 618, 22], [868, 628, 18],
  [80, 380, 40], [165, 452, 44], [272, 572, 56], [1428, 612, 30]
];

export const cherwoodSpec: PlaceSpec = {
  key: 'cherwood',
  plate: { clean: 'plates/plate_v02_cherwood.webp', atlas: 'plates/atlas_v02.webp', depth: 'plates/depth_v02_cherwood.png' },
  rain: 1,
  lightning: true,
  compactView: { cx: 960, cy: 560, zoom: 1 },
  lights: [
    { at: [620, 440], radius: 420, color: [1, 0.66, 0.32], intensity: 0.12, flicker: 0.5 },
    { at: [1447, 215], radius: 520, color: [1, 0.66, 0.32], intensity: 0.12, flicker: 0.45 },
    { at: [1035, 515], radius: 300, color: [1, 0.66, 0.32], intensity: 0.1, flicker: 0.5 },
    { at: [200, 480], radius: 460, color: [1, 0.7, 0.36], intensity: 0.08, flicker: 0.3 },
    { at: [900, 690], radius: 160, color: [1, 0.4, 0.2], intensity: 0.12, flicker: 0.6 }
  ],
  regions: [
    { region: Region.puddle, shape: [[0, 905], [430, 872], [760, 790], [1000, 760], [1250, 764], [1300, 900], [1250, 1080], [0, 1080]] }
  ],
  hotspots: [
    { id: 'pension', label: 'La pensión', quiet: true, shape: [[440, 280], [720, 300], [730, 770], [440, 770]], anchor: [563, 520] },
    { id: 'orfanato', label: 'El orfanato', quiet: true, shape: [[1000, 410], [1270, 420], [1270, 760], [1000, 760]], anchor: [1071, 458] },
    { id: 'bazar', label: 'El bazar', quiet: true, shape: [[1290, 470], [1500, 470], [1500, 760], [1290, 760]], anchor: [1336, 582] },
    { id: 'mansion', label: 'La mansión Sterling', quiet: true, shape: [[1060, 120], [1290, 150], [1290, 410], [1060, 400]], anchor: [1124, 300] },
    {
      id: 'carruaje',
      label: 'Carruaje de alquiler',
      glow: false,
      shape: [[790, 612], [805, 600], [835, 602], [842, 634], [958, 634], [962, 700], [955, 780], [925, 782], [900, 740], [850, 745], [835, 785], [800, 785], [776, 745], [782, 660]],
      anchor: [868, 600]
    }
  ],
  ambient: () => [
    ...LAMPS.map(([x, y, r], i) => new LampHalo([x, y], r, [1, 0.66, 0.3], 0.45, 10 + i)),
    new LampHalo([850, 690], 16, [1, 0.35, 0.15], 0.8, 30),
    new LampHalo([953, 686], 16, [1, 0.35, 0.15], 0.8, 31),
    new FogBank([520, 520, 900, 300], [0.42, 0.5, 0.66], 0.2, 0.012),
    new FogBank([0, 760, 1920, 320], [0.34, 0.4, 0.55], 0.12, 0.02),
    new RainSheet({ rect: [0, 0, 1920, 1080], density: 1, strength: 0.26, slant: 0.1 })
  ]
};

/** Destinos de V02: dónde se clava cada rombo y qué recorte de la lámina sirve de vista previa. */
export interface Destination {
  id: 'pension' | 'orfanato' | 'bazar' | 'mansion' | 'carruaje' | 'callejon';
  label: string;
  title: string;
  line: string;
  pin: readonly [number, number];
  /** recorte [x, y, w, h] de la lámina para la vista previa si falta el arte dedicado */
  crop: readonly [number, number, number, number];
  art: string;
}

export const DESTINATIONS: Destination[] = [
  { id: 'pension', label: 'Pensión', title: 'Pensión', line: 'Tu buhardilla, bajo la claraboya.', pin: [563, 520], crop: [430, 280, 320, 213], art: 'art/destinations/dest_pension.webp' },
  { id: 'orfanato', label: 'Orfanato', title: 'Orfanato', line: 'Una luz sigue encendida.', pin: [1071, 458], crop: [980, 380, 330, 220], art: 'art/destinations/dest_orfanato.webp' },
  { id: 'bazar', label: 'Bazar', title: 'Bazar', line: 'Bajo el toldo rojo nadie pregunta nombres.', pin: [1336, 582], crop: [1270, 450, 300, 200], art: 'art/destinations/dest_bazar.webp' },
  { id: 'mansion', label: 'Mansión Sterling', title: 'Mansión Sterling', line: 'Las cortinas del despacho, entreabiertas.', pin: [1124, 290], crop: [1030, 110, 300, 200], art: 'art/destinations/dest_mansion.webp' },
  { id: 'callejon', label: 'Callejón', title: 'Callejón del puente', line: 'Bajo el arco, alguien no se aparta.', pin: [842, 470], crop: [700, 300, 300, 200], art: 'art/destinations/dest_callejon.webp' },
  { id: 'carruaje', label: 'Carruaje', title: 'Carruaje de alquiler', line: 'El cochero no pregunta; sólo cobra.', pin: [868, 598], crop: [740, 560, 270, 180], art: 'art/destinations/dest_carriage.webp' }
];

/**
 * V06 · Combate — decidir sobre el terreno. La rejilla exacta 7×5 se reconstruye en código.
 * Esquinas del rectángulo lógico (0,0) (7,0) (7,5) (0,5) sobre el adoquín.
 */
export const GRID_CORNERS = [[330, 560], [1250, 300], [1700, 560], [700, 960]] as const;

export const alleySpec: PlaceSpec = {
  key: 'alley',
  plate: { clean: 'plates/plate_v06_callejon.webp', atlas: 'plates/atlas_v06.webp', depth: 'plates/depth_v06_callejon.png' },
  rain: 1,
  lightning: true,
  compactView: { cx: 900, cy: 600, zoom: 1 },
  lights: [
    { at: [110, 390], radius: 820, color: [1, 0.64, 0.3], intensity: 0.16, flicker: 0.5 },
    { at: [636, 70], radius: 420, color: [1, 0.66, 0.32], intensity: 0.12, flicker: 0.5 },
    { at: [1012, 40], radius: 300, color: [1, 0.66, 0.32], intensity: 0.1, flicker: 0.5 },
    { at: [1470, 30], radius: 280, color: [1, 0.66, 0.32], intensity: 0.1, flicker: 0.5 }
  ],
  regions: [
    { region: Region.puddle, shape: [[180, 640], [900, 300], [1300, 260], [1760, 560], [1760, 1080], [180, 1080]] }
  ],
  hotspots: [],
  ambient: () => [
    new LampHalo([112, 380], 150, [1, 0.62, 0.28], 0.6, 60),
    new LampHalo([637, 72], 70, [1, 0.66, 0.3], 0.55, 61),
    new LampHalo([1013, 38], 50, [1, 0.66, 0.3], 0.5, 62),
    new LampHalo([1472, 30], 44, [1, 0.66, 0.3], 0.5, 63),
    new LampHalo([380, 228], 26, [1, 0.66, 0.3], 0.5, 64),
    new FogBank([850, 60, 900, 360], [0.45, 0.55, 0.7], 0.26, 0.015),
    new FogBank([0, 820, 1920, 260], [0.3, 0.36, 0.5], 0.1, 0.02),
    new RainSheet({ rect: [0, 0, 1920, 1080], density: 1, strength: 0.24, slant: 0.08 })
  ]
};
