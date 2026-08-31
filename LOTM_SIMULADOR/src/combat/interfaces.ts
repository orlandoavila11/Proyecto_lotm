export type CombatActionType = "PHYSICAL_ATTACK" | "BEYONDER_SPELL" | "USE_ARTIFACT" | "FLEE";

// 2. Status Effects Canónicos
export type StatusEffectType = 
  | "CONCEALED"      // Vía Sleepless: Invisible, inmune al primer golpe
  | "PARALYZED"      // Vía Sailor/Storms: Pierde el turno por descarga eléctrica
  | "FLAMING"        // Vía Hunter: Daño de fuego persistente por turno
  | "PSYCHIC_SHIELD" // Vía Spectator: Inmunidad al daño de Sanity o manipulación mental
  | "THREAD_BINDING"; // Vía Seer/Marionettist: Pierde velocidad gradualmente

export interface StatusEffect {
  type: StatusEffectType;
  durationTurns: number;
  potency: number;
}

export interface CombatTurnResult {
  actionTaken: string;
  damageDealt: number;
  spiritualitySpent: number;
  corruptionGained: number; // 4. Corruption durante combate
  logMessage: string;
}
