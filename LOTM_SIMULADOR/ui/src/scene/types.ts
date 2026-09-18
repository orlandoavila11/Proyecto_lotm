/**
 * TIPOS Y CONTRATOS DE ESCENA — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 * Autoridad: Contrato Visual v1.0 (Propuesta B — 2.5D por Capas)
 */

export type CameraPresetId = 
  | 'WIDE_OVERVIEW' 
  | 'FOCUS_DESK' 
  | 'FOCUS_CORKBOARD' 
  | 'FOCUS_HORNACINA' 
  | 'FOCUS_STAIRCASE';

export interface CameraPreset {
  x: number;
  y: number;
  zoom: number;
}

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  WIDE_OVERVIEW: { x: 0, y: 0, zoom: 1.0 },
  FOCUS_DESK: { x: 0, y: -160, zoom: 1.35 },
  FOCUS_CORKBOARD: { x: -520, y: 120, zoom: 1.50 },
  FOCUS_HORNACINA: { x: 0, y: 260, zoom: 1.65 },
  FOCUS_STAIRCASE: { x: 540, y: -40, zoom: 1.40 }
};

export type HotspotId = 
  | 'hotspot_mirror'
  | 'hotspot_chalice'
  | 'hotspot_corkboard'
  | 'hotspot_candle'
  | 'hotspot_almanack'
  | 'hotspot_identity_papers'
  | 'hotspot_acting_diary'
  | 'hotspot_money_pouch'
  | 'hotspot_bazaar_letter'
  | 'hotspot_staircase_door'
  | 'hotspot_mahogany_cracks';

export interface HotspotBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HotspotContract {
  id: HotspotId;
  accessibleName: string;
  restingLabel: string; // Regla Constitucional: Máximo 7 palabras
  bounds: HotspotBounds;
  depthLayer: 0 | 1 | 2 | 3 | 4 | 5;
  cameraPreset: CameraPresetId;
  stateVariant: string;
  disabledReason?: string;
  isUrgent?: boolean;
  proseMoment?: string;
}

export type NavigationState = 
  | 'DESK_WIDE'
  | 'DESK_FOCUS'
  | 'INSPECTION_LAYER'
  | 'CORKBOARD_STAGE'
  | 'COMBAT_STAGE'
  | 'CEREMONY_STAGE'
  | 'CALENDAR_STAGE'
  | 'MARKET_STAGE'
  | 'ACTING_STAGE';

export interface SceneNavigationState {
  currentView: NavigationState;
  activeCameraPreset: CameraPresetId;
  activeHotspotId: HotspotId | null;
  focusedHotspotId: HotspotId | null;
  inspectedData: unknown | null;
  isAttentionModeActive: boolean;
  isSpiritVisionActive: boolean;
  isPendingOperation: boolean;
  focusHistory: HotspotId[];
}

export type NavigationAction = 
  | { type: 'SET_CAMERA_PRESET'; preset: CameraPresetId }
  | { 
      type: 'NAVIGATE_TO'; 
      view: NavigationState; 
      cameraPreset?: CameraPresetId; 
      hotspotId?: HotspotId; 
      inspectedData?: unknown; 
    }
  | { type: 'FOCUS_HOTSPOT'; hotspotId: HotspotId | null }
  | { type: 'OPEN_INSPECTION'; hotspotId: HotspotId; data?: unknown }
  | { type: 'CLOSE_INSPECTION' }
  | { type: 'BACK_TO_DESK' }
  | { type: 'TOGGLE_ATTENTION' }
  | { type: 'SET_ATTENTION'; active: boolean }
  | { type: 'TOGGLE_SPIRIT_VISION' }
  | { type: 'SET_OPERATION_PENDING'; pending: boolean };

/**
 * Catálogo Canónico de Hotspots en Lienzo 1920x1080 (Propuesta B - El Desván 2.5D)
 */
export const CANONICAL_HOTSPOTS: Record<HotspotId, HotspotContract> = {
  hotspot_mirror: {
    id: 'hotspot_mirror',
    accessibleName: 'El Espejo de Azogue',
    restingLabel: 'El azogue refleja tu semblante humano.',
    bounds: { x: 870, y: 460, width: 180, height: 240 },
    depthLayer: 2,
    cameraPreset: 'FOCUS_DESK',
    stateVariant: 'MIRROR_CLEAN',
    proseMoment: 'Tu rostro en el cristal muestra la fatiga de la noche, pero tus ojos te pertenecen por entero.'
  },
  hotspot_chalice: {
    id: 'hotspot_chalice',
    accessibleName: 'El Cáliz de Plata',
    restingLabel: 'Cáliz ceremonial en la hornacina umbría.',
    bounds: { x: 910, y: 160, width: 100, height: 140 },
    depthLayer: 1,
    cameraPreset: 'FOCUS_HORNACINA',
    stateVariant: 'CHALICE_RESTING',
    proseMoment: 'El cáliz de plata espera el ungüento y las Cinco Puertas para la siguiente transmutación.'
  },
  hotspot_corkboard: {
    id: 'hotspot_corkboard',
    accessibleName: 'Tablero de Corcho de Investigación',
    restingLabel: 'Expediente Cherwood; pistas e hilos rojos.',
    bounds: { x: 1480, y: 220, width: 340, height: 260 },
    depthLayer: 1,
    cameraPreset: 'FOCUS_CORKBOARD',
    stateVariant: 'CORKBOARD_ACTIVE',
    proseMoment: 'Notas rasgadas, retratos desvaídos y sospechas entrelazadas sobre el caso de Backlund.'
  },
  hotspot_candle: {
    id: 'hotspot_candle',
    accessibleName: 'La Vela de Sebo',
    restingLabel: 'Llama viva y clara sobre peltre.',
    bounds: { x: 540, y: 560, width: 110, height: 180 },
    depthLayer: 2,
    cameraPreset: 'FOCUS_DESK',
    stateVariant: 'CANDLE_BRILLIANT',
    proseMoment: 'La llama se eleva erguida sin vacilar; tus pensamientos fluyen lúcidos y en calma.'
  },
  hotspot_almanack: {
    id: 'hotspot_almanack',
    accessibleName: 'Reloj de Faltriquera y Almanaque',
    restingLabel: 'Reloj de latón marcando la franja.',
    bounds: { x: 480, y: 760, width: 140, height: 130 },
    depthLayer: 2,
    cameraPreset: 'FOCUS_DESK',
    stateVariant: 'ALMANACK_IDLE',
    proseMoment: 'El tic-tac seco del escape de cilindro recuerda el paso implacable del tiempo civil y oculto.'
  },
  hotspot_identity_papers: {
    id: 'hotspot_identity_papers',
    accessibleName: 'Pliegos Notariales de Identidad',
    restingLabel: 'Papeles civiles con sello y anclas.',
    bounds: { x: 740, y: 720, width: 220, height: 170 },
    depthLayer: 2,
    cameraPreset: 'FOCUS_DESK',
    stateVariant: 'PAPERS_FORMAL',
    proseMoment: 'Tu empleo, recibos de alquiler y las cartas de quienes aún te consideran un hombre común.'
  },
  hotspot_acting_diary: {
    id: 'hotspot_acting_diary',
    accessibleName: 'Cuaderno de Cuero de Actuación',
    restingLabel: 'Cuaderno de cuero con marcapáginas carmesí.',
    bounds: { x: 1040, y: 710, width: 200, height: 180 },
    depthLayer: 2,
    cameraPreset: 'FOCUS_DESK',
    stateVariant: 'DIARY_COHERENT',
    proseMoment: 'Tus notas registran interpretaciones fieles al principio de la vía. La digestión prosigue en silencio.'
  },
  hotspot_money_pouch: {
    id: 'hotspot_money_pouch',
    accessibleName: 'Monedero de Cuero de Loen',
    restingLabel: 'Monedero gastado con libras y peniques.',
    bounds: { x: 1280, y: 700, width: 130, height: 130 },
    depthLayer: 2,
    cameraPreset: 'FOCUS_DESK',
    stateVariant: 'POUCH_BALANCED',
    proseMoment: 'El peso metálico de la subsistencia diaria en las calles húmedas de Backlund.'
  },
  hotspot_bazaar_letter: {
    id: 'hotspot_bazaar_letter',
    accessibleName: 'Misiva Sellada del Bazar Clandestino',
    restingLabel: 'Carta con lacre carmesí del Bazar.',
    bounds: { x: 1270, y: 570, width: 140, height: 110 },
    depthLayer: 2,
    cameraPreset: 'FOCUS_DESK',
    stateVariant: 'LETTER_SEALED',
    proseMoment: 'Una misiva urgente con el sello del mercado subterráneo de materiales extraordinarios.'
  },
  hotspot_staircase_door: {
    id: 'hotspot_staircase_door',
    accessibleName: 'Escalera de Caracol y Picaporte',
    restingLabel: 'Escalera al zaguán; calma exterior.',
    bounds: { x: 120, y: 380, width: 220, height: 420 },
    depthLayer: 1,
    cameraPreset: 'FOCUS_STAIRCASE',
    stateVariant: 'STAIRCASE_PEACEFUL',
    proseMoment: 'Los peldaños de roble descienden hacia la puerta del zaguán. Ningún intruso ha violado el umbral.'
  },
  hotspot_mahogany_cracks: {
    id: 'hotspot_mahogany_cracks',
    accessibleName: 'Grietas de Ruina en la Caoba',
    restingLabel: 'Hendidura oscura tallada en la caoba.',
    bounds: { x: 670, y: 880, width: 580, height: 90 },
    depthLayer: 2,
    cameraPreset: 'FOCUS_DESK',
    stateVariant: 'CRACKS_MARKED',
    proseMoment: 'Una fisura delgada recorre la caoba: el peso de lo sobrenatural ha dejado una marca imborrable.'
  }
};
