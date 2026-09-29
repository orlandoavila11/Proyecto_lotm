import { CandleFlame, LampHalo, LightBeam, Motes } from '../../engine/effects';
import type { PlaceSpec } from '../../engine/PlaceSpec';
import { Region, ellipse } from '../../engine/types';

/**
 * V01 · El Desván — "preparar la salida".
 * Conservar: profundidad, contraste cálido/frío y selección de la carta.
 * Coordenadas medidas sobre la lámina del Atlas a 1920×1080.
 */

export const DESVAN_CANDLE_WICK = [471, 512] as const;
export const DESVAN_CLOCK_CENTER = [1391, 589] as const;
export const DESVAN_CLOCK_RADIUS = 58;

export const desvanSpec: PlaceSpec = {
  key: 'desvan',
  plate: {
    clean: 'plates/plate_v01_desvan.webp',
    atlas: 'plates/atlas_v01.webp',
    depth: 'plates/depth_v01_desvan.png'
  },
  rain: 0.55,
  haze: [{ at: [471, 425], width: 26, height: 70 }],
  compactView: { cx: 1180, cy: 640, zoom: 1 },
  lights: [
    // 0 · la vela: su ganancia la gobierna la cordura
    { at: [471, 488], radius: 640, color: [1, 0.66, 0.36], intensity: 0.2, flicker: 1 },
    // 1 · quinqué de la escalera
    { at: [297, 128], radius: 380, color: [1, 0.7, 0.38], intensity: 0.12, flicker: 0.55 },
    // 2 · reflejo de la vela en el azogue
    { at: [612, 586], radius: 70, color: [1, 0.7, 0.4], intensity: 0.25, flicker: 1 }
  ],
  regions: [
    { region: Region.mirror, shape: ellipse(669, 580, 86, 124) },
    { region: Region.glass, shape: [[1218, 0], [1800, 0], [1772, 96], [1338, 196], [1282, 120]] }
  ],
  hotspots: [
    {
      id: 'letter',
      label: 'La carta lacrada',
      shape: [[1222, 806], [1452, 752], [1540, 786], [1586, 842], [1302, 890]],
      anchor: [1400, 812]
    },
    {
      id: 'candle',
      label: 'La vela de sebo',
      shape: [[450, 452], [494, 452], [500, 612], [522, 642], [506, 700], [542, 728], [528, 764], [408, 764], [394, 730], [430, 702], [444, 642], [440, 612]],
      anchor: [471, 600]
    },
    {
      id: 'mirror',
      label: 'El espejo de azogue',
      shape: ellipse(668, 580, 114, 152, 36),
      anchor: [668, 576]
    },
    {
      id: 'clock',
      label: 'El reloj de latón',
      shape: [[1178, 496], [1366, 488], [1372, 454], [1408, 454], [1412, 488], [1496, 492], [1502, 694], [1164, 698]],
      anchor: [1340, 580]
    },
    {
      id: 'journal',
      label: 'El diario encuadernado',
      shape: [[572, 760], [742, 736], [902, 788], [916, 862], [762, 894], [690, 888], [552, 842], [548, 800]],
      anchor: [735, 815]
    },
    {
      id: 'papers',
      label: 'Los pliegos de identidad',
      shape: [[868, 744], [958, 714], [1112, 712], [1262, 758], [1232, 806], [1112, 850], [990, 838], [880, 776]],
      anchor: [1065, 780]
    },
    {
      id: 'pouch',
      label: 'La bolsa de cuero',
      shape: [[1560, 668], [1622, 660], [1690, 700], [1714, 760], [1706, 814], [1608, 816], [1598, 790], [1518, 760], [1524, 718]],
      anchor: [1620, 740]
    },
    {
      id: 'chalice',
      label: 'El cáliz de la hornacina',
      shape: [[834, 358], [896, 358], [894, 420], [872, 460], [886, 498], [838, 498], [854, 460], [832, 420]],
      anchor: [864, 430]
    },
    {
      id: 'board',
      label: 'El tablero de corcho',
      glow: false,
      shape: [[1246, 298], [1500, 282], [1500, 368], [1862, 364], [1862, 592], [1500, 582], [1246, 562]],
      anchor: [1560, 470]
    },
    {
      id: 'stairs',
      label: 'La escalera a la calle',
      glow: false,
      shape: [[150, 40], [330, 160], [420, 320], [414, 470], [372, 520], [360, 700], [214, 760], [120, 700], [0, 560], [0, 110]],
      anchor: [236, 360]
    }
  ],
  ambient: ({ provisional }) => {
    const flame = new CandleFlame({ at: [471, 514], height: provisional ? 52 : 62 });
    return [
      flame,
      new Motes([300, 360, 420, 400], 60),
      new LampHalo([297, 124], 95, [1, 0.68, 0.32], 0.55, 1),
      new LampHalo([612, 586], 22, [1, 0.7, 0.35], 0.5, 2),
      new LightBeam({
        from: [[1270, 150], [1470, 105]],
        to: [[930, 700], [1290, 740]],
        strength: 0.085,
        dust: 160
      })
    ];
  }
};

/** la vela del ambiente, expuesta para que el HUD le fije el vigor según la cordura */
export function findFlame(effects: unknown[]): CandleFlame | null {
  return (effects.find((e) => e instanceof CandleFlame) as CandleFlame) ?? null;
}
