/**
 * Proyecciones públicas que devuelve Fastify (reborn/src/server/routes). Sólo se tipa lo que la UI usa;
 * el cliente nunca inventa campos que el servidor no envía.
 */

export type SanityTier = 'LUCID' | 'NERVOUS_TENSION' | 'HALLUCINATING' | 'NEAR_COLLAPSE' | 'RAMPAGING';
export type CorruptionTier = 'PRISTINE' | 'LATENT_MURMURS' | 'ASTRAL_STRAIN' | 'MUTATING' | 'CORRUPTED_VESSEL';
export type RuinaTier = 'INTEGRO' | 'MARCADO' | 'EROSIONADO' | 'ROTO' | 'PERDIDO';
export type Quality = 'PRISTINE' | 'DAMAGED' | 'CONTAMINATED';

export interface CharacterRow {
  id: string;
  name: string;
  pathway: string;
  sequence: number;
  current_health: number;
  max_health: number;
  current_spirituality: number;
  max_spirituality: number;
  sanity: number;
  corruption: number;
  digestion_progress: number;
  raw_pence: number;
  current_location: string;
  current_day: number;
  current_slot?: number;
  origin_id?: string | null;
  prologue_step?: string;
  employer_name?: string;
  salary_pence?: number;
  rent_debt_active?: number;
  rent_debt_note?: string | null;
  revision?: number;
}

export interface PersonaRow {
  id: string;
  legal_name: string;
  profession: string;
  district: string;
  police_suspicion: number;
  church_suspicion: number;
}

export interface AnchorRow {
  id: string;
  title: string;
  name?: string;
  description?: string;
  strength: number;
  category: string;
  is_destroyed?: number;
}

export interface InventoryItemRow {
  id: string;
  item_code: string;
  name: string;
  category: string;
  quantity: number;
  quality?: Quality;
}

export interface SomaticsEvaluation {
  sanityTier: SanityTier;
  sanityDescription: string;
  corruptionTier: CorruptionTier;
  corruptionDescription: string;
  ruina: number;
  ruinaTier: RuinaTier;
  ruinaDescriptor: string;
  isRampaging: boolean;
  canSafelyConsumePotion: boolean;
  blockers: string[];
}

export interface Wallet {
  pounds: number;
  soli: number;
  pence: number;
}

export interface CharacterSnapshot {
  character: CharacterRow;
  /** null durante el prólogo (aún sin vía) */
  sequenceName: string | null;
  activePersona: PersonaRow | null;
  anchors: AnchorRow[];
  inventory: InventoryItemRow[];
  somatics: SomaticsEvaluation;
  wallet: Wallet;
}

// ── prólogo

export interface OriginDef {
  id: string;
  name: string;
  profession: string;
  socialClass: string;
  startingDistrict?: string;
  startingPence?: number;
  weeklySalaryPence: number;
  originAnchors?: Array<{ name?: string; title?: string; description?: string }>;
  initialContact?: { name?: string; description?: string } | string;
  initialBurden?: { type?: string; description?: string } | string;
  prologueIntro: string;
}

export interface PrologueStart {
  characterId: string;
  originName: string;
  introNarrative: string;
  benefactorLetterText: string;
  prologueStep: string;
}

export interface PrologueStatus {
  characterId: string;
  prologueStep: string;
  originId: string | null;
  character: CharacterRow;
  benefactorLetterText: string | null;
}

export interface PotionOption {
  id: 'COBALT_EYES' | 'AMBER_MIRROR';
  title: string;
  appearance: string;
  sensoryEcho: string;
  targetPathway: string;
  targetSequenceName: string;
}

// ── ciudad

export interface District {
  id: string;
  name: string;
  district_name: string;
  danger_rank: string;
  landmark: string;
  description: string;
}

export interface TravelResult {
  success: boolean;
  newLocation: string;
  districtName: string;
  farePaidPence: number;
  remainingPence: number;
  encounter: string | null;
  message: string;
}

// ── investigación

export interface DiscoveredClue {
  id: string;
  nombre: string;
  descripcion: string;
  sourceVisited: string;
  discoveredAtDay: number;
  isConcealed: boolean;
}

export type ClueRelation = 'acusa' | 'explica' | 'localiza' | 'contradice';

export interface ClueEdge {
  clueA: string;
  clueB: string;
  relation: ClueRelation;
  isCorrect: boolean;
  insight: string | null;
}

export interface CaseNote {
  id: string;
  text: string;
  createdAtDay: number;
  x?: number;
  y?: number;
}

export interface CaseState {
  id: string;
  caseId: string;
  title: string;
  status: 'DORMANT' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
  dayCounter: number;
  discoveredClues: DiscoveredClue[];
  unsealedConcealedClues: string[];
  connectedEdges: ClueEdge[];
  activeHypothesisId: string | null;
  testedHypotheses: Array<{ hypothesisId: string; isCorrect: boolean; testedAtDay: number }>;
  falseClues: Array<{ id: string; nombre: string; descripcion: string }>;
  notes?: CaseNote[];
  resolutionUnlocked: boolean;
  resolvedState?: { resolutionId: string; nombre: string; localEffects: string };
}

/** proyección pública: alias opaco, teoría sólo tras contrastarla, soporte sólo con pistas ya vistas */
export interface Hypothesis {
  id: string;
  name: string;
  teoria: string | null;
  pistasSoporte: string[];
  tested: boolean;
  isCorrect: boolean | null;
}

export interface Resolution {
  id: 'RESOLUTION_A_JUSTICE' | 'RESOLUTION_B_TRUTH' | 'RESOLUTION_C_STABILITY' | 'RESOLUTION_D_HEIR';
  nombre: string;
  accion: string;
  consecuenciasLocales: string;
}

export interface CaseEnvelope {
  success: boolean;
  caseState: CaseState;
  availableHypotheses: Hypothesis[];
  availableResolutions: Resolution[];
}

export interface VisitSourceResult {
  success: boolean;
  clue?: DiscoveredClue;
  message: string;
  reason?: string;
  state: CaseState;
  availableHypotheses?: Hypothesis[];
}

// ── mercado

export interface MarketListing {
  id: string;
  name: string;
  pathwayTarget?: string;
  category?: string;
  sequence?: number;
  basePricePence: number;
  availableQualities: Quality[];
  stock?: number;
}

export interface DistrictMarket {
  districtId: string;
  districtName: string;
  vendorName?: string;
  specialtyPathway?: string;
  inventory: MarketListing[];
}

export interface MarketEnvelope {
  market: DistrictMarket;
  qualityModifiers?: Record<string, { priceMultiplier: number }>;
}

export interface BuyResult {
  success: boolean;
  penceSpent: number;
  remainingBalance: number;
  error?: string;
}

// ── combate

export interface CombatStatus {
  status: string;
  durationTurns?: number;
}

/** el personaje: sus propias cifras sí las conoce */
export interface BattlePlayer {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  spirituality: number;
  maxSpirituality: number;
  ap: number;
  maxAp: number;
  attention: number;
  maxAttention: number;
  position: { x: number; y: number };
  statuses: string[];
}

/** el adversario tal como lo percibe el personaje: nunca sus cifras ni su repertorio oculto */
export interface BattleEnemy {
  id: string;
  name: string;
  condition: 'FIRM' | 'WOUNDED' | 'FALTERING';
  position: { x: number; y: number };
  statuses: string[];
  knownAbilities: Array<{ id: string; name: string; description: string; range: number }>;
}

export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  apCost: number;
  spiritualityCost: number;
  range: number;
  targetType: 'SELF' | 'SINGLE_ENEMY' | 'SINGLE_ALLY' | 'AREA' | 'GRID_CELL';
}

export interface BattleEnvelope {
  battleId: string;
  status: 'ONGOING' | 'VICTORY' | 'DEFEAT' | 'FLED' | 'NEGOTIATED' | 'RAMPAGE_TERMINAL';
  grid: { width: number; height: number };
  turnCount: number;
  initiativeWinner: 'PLAYER' | 'ENEMY';
  player: BattlePlayer;
  enemy: BattleEnemy;
  availableSkills: CombatSkill[];
  /** narración de lo ocurrido en esta petición (inicio, acción, turno del adversario) */
  messages?: string[];
  resumed?: boolean;
  outcome?: CombatOutcome | null;
}

export interface CombatOutcome {
  pursePence: number;
  harvest: { name: string; quality: Quality } | null;
}

export interface CombatActionResult extends BattleEnvelope {
  battleOver: boolean;
  victory: boolean;
  messages: string[];
}

// ── actuación e identidad

export interface ActingChoice {
  id: string;
  label: string;
  description: string;
}

export interface ActingDilemma {
  id: string;
  title: string;
  description: string;
  corePrinciple: string;
  sequenceName?: string;
  choices: ActingChoice[];
}

export interface ActingResolution {
  success: boolean;
  message: string;
  isAligned?: boolean;
  digestionProgress: number;
  isFullyDigested: boolean;
}

export interface IdentityEvent {
  id: string;
  title: string;
  description?: string;
  situation?: string;
  options: Array<{ text?: string; label?: string; description?: string }>;
}

// ── calendario

export type CalendarAction = 'WORK' | 'INVESTIGATE' | 'SOCIALIZE' | 'OPERATE';

export interface CalendarOutcome {
  actionType: CalendarAction;
  day: number;
  slot: number;
  slotName: string;
  narrative: string;
  datedEventTriggered?: { type: string; title: string; description: string };
}

export interface CalendarLog {
  id: string;
  day: number;
  slot: number;
  event_type: string;
  subsystem: string;
  details_json: string;
  created_at?: string;
}

// ── ascensión

export interface AscensionStatus {
  canDrink: boolean;
  currentSequence: number;
  targetSequence: number;
  pathway: string;
  door1_formula: { passed: boolean; name: string; details: string };
  door2_ingredients: {
    passed: boolean; mainCount: number; requiredMainCount: number; supplementaryCount: number; requiredSupplementaryCount: number;
    averageQuality: Quality; details: string[];
    /** nombre del catálogo, papel en la fórmula y si ya se posee (AscensionEngine.evaluateAscensionStatus) */
    items: { code: string; name: string; role: 'MAIN' | 'SUPPLEMENTARY'; owned: boolean; quality: Quality | null }[];
  };
  door3_digestion: { passed: boolean; current: number; required: number; details: string };
  door4_preparation: { passed: boolean; score: number; maxScore: number; checklist: Record<'lugar' | 'momento' | 'materiales_rituales' | 'costos_anclaje', boolean> };
}

export interface AscensionResult {
  outcome: 'SUCCESS' | 'RAMPAGE';
  newSequence: number;
  narrativeText: string;
}

/** Sobre común de las mutaciones transaccionales */
export interface Receipted {
  fromReceipt?: boolean;
  revision?: number;
}
