import { CandleFlame, Embers, LampHalo, Motes, RainSheet } from '../../engine/effects';
import type { PlaceSpec } from '../../engine/PlaceSpec';
import { Region, ellipse } from '../../engine/types';

/**
 * V07 · Regreso — identidad y actuación. Espejo con el retrato civil, diario abierto, correspondencia.
 * También sirve de escena para elegir el origen: el espejo muestra a quién vas a ser.
 */
export const JOURNAL_MIRROR = { center: [479, 327] as const, rx: 158, ry: 222 };

export const journalSpec: PlaceSpec = {
  key: 'journal',
  plate: { clean: 'plates/plate_v07_diario.webp', atlas: 'plates/atlas_v07.webp', depth: 'plates/depth_v07_diario.png' },
  rain: 0.8,
  compactView: { cx: 520, cy: 520, zoom: 1 },
  haze: [{ at: [178, 225], width: 34, height: 95 }],
  lights: [
    { at: [178, 300], radius: 700, color: [1, 0.64, 0.34], intensity: 0.22, flicker: 1 },
    { at: [349, 400], radius: 90, color: [1, 0.68, 0.36], intensity: 0.3, flicker: 1 }
  ],
  regions: [
    { region: Region.mirror, shape: ellipse(479, 327, 160, 226) },
    { region: Region.glass, shape: [[1050, 0], [1335, 0], [1335, 232], [1050, 222]] }
  ],
  hotspots: [
    { id: 'mirror', label: 'El espejo', shape: ellipse(479, 327, 196, 258), anchor: [479, 120] },
    { id: 'diary', label: 'El diario de actuación', shape: [[150, 690], [560, 610], [700, 590], [940, 548], [1160, 700], [1160, 790], [760, 850], [400, 940], [180, 905]], anchor: [640, 640] },
    { id: 'letters', label: 'Correspondencia sin abrir', shape: [[955, 548], [1180, 512], [1262, 560], [1262, 660], [1080, 660], [960, 610]], anchor: [1110, 560] },
    { id: 'candle', label: 'La vela', shape: [[140, 250], [215, 250], [215, 480], [250, 560], [240, 660], [60, 660], [110, 560], [140, 480]], anchor: [178, 420] }
  ],
  ambient: ({ provisional }) => [
    new CandleFlame({ at: [178, 344], height: provisional ? 76 : 90 }),
    new Motes([40, 150, 520, 520], 70),
    new LampHalo([349, 405], 26, [1, 0.7, 0.36], 0.6, 3),
    new RainSheet({ rect: [1050, 0, 290, 232], density: 0.8, strength: 0.18 })
  ]
};

/**
 * V08 · Ascensión — una decisión consciente. Cáliz de plata con líquido vivo, espejo, fórmula.
 * También es la buhardilla de la Cruz de Hierro en el prólogo (los dos frascos).
 */
export const ASCENSION_MIRROR = { center: [390, 360] as const, rx: 126, ry: 172 };

export const ascensionSpec: PlaceSpec = {
  key: 'ascension',
  plate: { clean: 'plates/plate_v08_umbral.webp', atlas: 'plates/atlas_v08.webp', depth: 'plates/depth_v08_umbral.png' },
  rain: 0.85,
  compactView: { cx: 700, cy: 540, zoom: 1 },
  haze: [{ at: [140, 200], width: 40, height: 110 }],
  lights: [
    { at: [140, 300], radius: 760, color: [1, 0.64, 0.34], intensity: 0.24, flicker: 1 },
    { at: [703, 385], radius: 220, color: [0.55, 0.7, 1], intensity: 0.08, flicker: 0.2 }
  ],
  regions: [
    { region: Region.mirror, shape: ellipse(390, 362, 128, 176) },
    { region: Region.liquid, shape: ellipse(703, 384, 136, 22) },
    { region: Region.glass, shape: [[962, 0], [1300, 0], [1300, 282], [962, 272]] }
  ],
  hotspots: [
    {
      id: 'chalice',
      label: 'El cáliz',
      shape: [[548, 372], [562, 352], [700, 344], [846, 352], [860, 372], [850, 430], [830, 500], [795, 560], [760, 590], [735, 600], [730, 660], [740, 720], [790, 745], [830, 770], [825, 795], [700, 808], [580, 795], [575, 770], [615, 745], [668, 720], [678, 660], [672, 600], [645, 590], [608, 560], [575, 500], [556, 430]],
      anchor: [703, 470]
    },
    { id: 'formula', label: 'La fórmula manuscrita', shape: [[745, 720], [1080, 690], [1290, 830], [1180, 930], [880, 935], [760, 820]], anchor: [1010, 790] },
    { id: 'mirror', label: 'El espejo', shape: ellipse(390, 362, 160, 210), anchor: [390, 160] },
    { id: 'jars', label: 'Los ingredientes', shape: [[940, 505], [1085, 505], [1100, 690], [1222, 700], [1225, 760], [1120, 760], [940, 690]], anchor: [1070, 600] }
  ],
  ambient: ({ provisional }) => [
    new CandleFlame({ at: [140, 334], height: provisional ? 96 : 110 }),
    new Motes([20, 140, 520, 560], 80),
    new LampHalo([295, 440], 20, [1, 0.7, 0.36], 0.5, 4),
    new RainSheet({ rect: [962, 0, 340, 282], density: 0.9, strength: 0.2 })
  ]
};

/** Portada: el desván en penumbra, sin interacción. */
export const titleView = { cx: 960, cy: 560, zoom: 1.06 } as const;

/**
 * V03 · Una localización — encontrar evidencia. Despacho de la mansión Sterling.
 * Conservar: evidencia dentro del espacio y panel amplio de lectura.
 */
export const studySpec: PlaceSpec = {
  key: 'study',
  plate: { clean: 'plates/plate_v03_despacho.webp', atlas: 'plates/atlas_v03.webp', depth: 'plates/depth_v03_despacho.png' },
  rain: 0.9,
  embers: 1,
  compactView: { cx: 1100, cy: 600, zoom: 1 },
  haze: [{ at: [1160, 560], width: 150, height: 120 }, { at: [959, 45], width: 14, height: 40 }],
  lights: [
    { at: [146, 280], radius: 620, color: [1, 0.66, 0.34], intensity: 0.16, flicker: 0.45 },
    { at: [1160, 640], radius: 520, color: [1, 0.45, 0.18], intensity: 0.16, flicker: 0.9 },
    { at: [958, 70], radius: 180, color: [1, 0.68, 0.36], intensity: 0.18, flicker: 1 }
  ],
  regions: [
    { region: Region.glass, shape: [[342, 0], [632, 0], [632, 400], [342, 400]] },
    { region: Region.embers, shape: [[1040, 570], [1300, 560], [1310, 730], [1030, 730]] },
    { region: Region.embers, shape: [[1000, 720], [1225, 705], [1235, 800], [995, 805]] }
  ],
  hotspots: [
    { id: 'fireplace', label: 'Las cenizas de la chimenea', shape: [[1000, 740], [1090, 712], [1130, 730], [1200, 722], [1228, 760], [1210, 802], [1140, 806], [1010, 790], [984, 772]], anchor: [1188, 713] },
    { id: 'desk', label: 'El escritorio', shape: [[0, 400], [140, 440], [460, 450], [470, 490], [300, 520], [0, 520]], anchor: [300, 470] },
    { id: 'portrait', label: 'El retrato de familia', shape: [[828, 62], [906, 58], [910, 190], [832, 192]], anchor: [868, 125] }
  ],
  ambient: ({ provisional }) => [
    new LampHalo([146, 270], 110, [1, 0.68, 0.32], 0.55, 40),
    new CandleFlame({ at: [959, 94], height: provisional ? 30 : 36 }),
    new Embers([1170, 700], 180, 220, 36),
    new Motes([40, 120, 360, 380], 50),
    new LampHalo([1165, 650], 150, [1, 0.42, 0.14], 0.28, 41),
    new RainSheet({ rect: [342, 0, 290, 400], density: 0.9, strength: 0.2 })
  ]
};

/**
 * V04 · Investigación — contrastar una hipótesis. El corcho del gabinete con las pistas reales.
 * Las esquinas del corcho alimentan la homografía de las tarjetas.
 */
export const BOARD_CORNERS = [[80, 112], [1322, 198], [1330, 736], [80, 694]] as const;

export const boardSpec: PlaceSpec = {
  key: 'board',
  plate: { clean: 'plates/plate_v04_tablero.webp', atlas: 'plates/atlas_v04.webp', depth: 'plates/depth_v04_tablero.png' },
  rain: 0.7,
  compactView: { cx: 700, cy: 420, zoom: 1 },
  haze: [{ at: [150, 470], width: 40, height: 105 }],
  lights: [
    { at: [150, 560], radius: 760, color: [1, 0.64, 0.34], intensity: 0.2, flicker: 1 },
    { at: [1890, 60], radius: 300, color: [1, 0.66, 0.34], intensity: 0.1, flicker: 0.4 }
  ],
  regions: [{ region: Region.glass, shape: [[1300, 0], [1545, 0], [1545, 225], [1300, 225]] }],
  hotspots: [],
  ambient: ({ provisional }) => [
    new CandleFlame({ at: [150, 600], height: provisional ? 96 : 112 }),
    new Motes([20, 330, 420, 400], 60),
    new LampHalo([1893, 62], 70, [1, 0.66, 0.3], 0.5, 50),
    new RainSheet({ rect: [1300, 0, 245, 225], density: 0.8, strength: 0.18 })
  ]
};

/** V05 · Bazar — preparar el siguiente riesgo. Tres puestos sobre el mostrador. */
export const COUNTER_SLOTS: { base: readonly [number, number]; height: number; hotspot: string }[] = [
  { base: [455, 752], height: 232, hotspot: 'slot1' },
  { base: [810, 742], height: 150, hotspot: 'slot2' },
  { base: [1175, 770], height: 170, hotspot: 'slot3' }
];

export const bazaarSpec: PlaceSpec = {
  key: 'bazaar',
  plate: { clean: 'plates/plate_v05_bazar.webp', atlas: 'plates/atlas_v05.webp', depth: 'plates/depth_v05_bazar.png' },
  rain: 0.7,
  compactView: { cx: 640, cy: 520, zoom: 1 },
  lights: [
    { at: [130, 205], radius: 820, color: [1, 0.64, 0.32], intensity: 0.18, flicker: 0.6 },
    { at: [880, 380], radius: 160, color: [1, 0.7, 0.4], intensity: 0.12, flicker: 0.8 }
  ],
  regions: [{ region: Region.glass, shape: [[1196, 0], [1392, 0], [1392, 276], [1196, 276]] }],
  hotspots: [
    { id: 'slot1', label: 'Primer puesto', shape: [[398, 520], [510, 520], [522, 720], [512, 758], [398, 758], [388, 720]], anchor: [455, 520] },
    { id: 'slot2', label: 'Segundo puesto', shape: [[690, 630], [900, 620], [935, 720], [900, 752], [700, 752], [680, 710]], anchor: [810, 620] },
    { id: 'slot3', label: 'Tercer puesto', shape: [[1025, 660], [1180, 610], [1330, 640], [1340, 745], [1250, 775], [1060, 760]], anchor: [1175, 620] }
  ],
  ambient: () => [
    new LampHalo([130, 205], 120, [1, 0.66, 0.3], 0.6, 70),
    new Motes([20, 80, 360, 420], 50),
    new LampHalo([880, 395], 34, [1, 0.72, 0.4], 0.5, 71),
    new RainSheet({ rect: [1196, 0, 196, 276], density: 0.8, strength: 0.18 })
  ]
};
