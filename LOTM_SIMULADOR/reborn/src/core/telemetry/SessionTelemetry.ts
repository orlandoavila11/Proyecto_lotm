/**
 * SessionTelemetry.ts — Path to Godhood
 * Registro y exportación de telemetría legible para pruebas de juego humanas (Gate G4).
 * Cumple con la Ley de Prosa Diegética: exporta eventos narrativos y de interacción
 * sin exponer números sintéticos al cliente, permitiendo auditoría analítica del Director.
 */

export interface PrologueFunnelMetrics {
  introPassed: boolean;
  introDurationMs: number;
  originSelected: string | null;
  letterRead: boolean;
  letterDurationMs: number;
  thresholdDilemmaChoice: string | null;
  thresholdDurationMs: number;
  potionDrinkHesitationMs: number;
  potionChosen: string | null;
  awakenedAtMs: number;
  totalPrologueTimeMs: number;
}

export interface PlayerDecisionMetric {
  timestamp: number;
  category: 'ACTING_DILEMMA' | 'INVESTIGATION_CLUE' | 'INVESTIGATION_VERDICT' | 'MARKET_PURCHASE' | 'CALENDAR_SLOT';
  contextId: string;
  choiceMade: string;
  hesitationMs: number;
  diegeticSummary: string;
}

export interface FinalSessionStateMetric {
  characterId: string;
  characterName: string;
  pathway: string;
  sequence: number;
  origin: string;
  daysLived: number;
  candleTier: string;
  mirrorTier: string;
  ruinaTier: string;
  activeAnchorsCount: number;
  brokenAnchorsCount: number;
  poundsOnHand: number;
  policeSuspicionDescription: string;
  churchSuspicionDescription: string;
  sessionOutcome: 'ALIVE' | 'DEAD_COMBAT' | 'RAMPAGE' | 'ARRESTED';
}

export interface SessionTelemetryReport {
  sessionId: string;
  testerId: string;
  startTime: string;
  endTime: string;
  totalPlayTimeMs: number;
  prologueFunnel: PrologueFunnelMetrics;
  decisions: PlayerDecisionMetric[];
  finalState: FinalSessionStateMetric;
}

export class SessionTelemetry {
  private sessionId: string;
  private testerId: string;
  private startTime: number;
  private prologueFunnel: PrologueFunnelMetrics;
  private decisions: PlayerDecisionMetric[] = [];
  private finalState: FinalSessionStateMetric | null = null;

  constructor(sessionId: string, testerId: string) {
    this.sessionId = sessionId;
    this.testerId = testerId;
    this.startTime = Date.now();
    this.prologueFunnel = {
      introPassed: false,
      introDurationMs: 0,
      originSelected: null,
      letterRead: false,
      letterDurationMs: 0,
      thresholdDilemmaChoice: null,
      thresholdDurationMs: 0,
      potionDrinkHesitationMs: 0,
      potionChosen: null,
      awakenedAtMs: 0,
      totalPrologueTimeMs: 0
    };
  }

  public recordPrologueStep(step: Partial<PrologueFunnelMetrics>): void {
    this.prologueFunnel = {
      ...this.prologueFunnel,
      ...step
    };
  }

  public recordDecision(metric: PlayerDecisionMetric): void {
    this.decisions.push(metric);
  }

  public setFinalState(state: FinalSessionStateMetric): void {
    this.finalState = state;
  }

  public exportJson(): SessionTelemetryReport {
    const now = Date.now();
    return {
      sessionId: this.sessionId,
      testerId: this.testerId,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(now).toISOString(),
      totalPlayTimeMs: now - this.startTime,
      prologueFunnel: this.prologueFunnel,
      decisions: this.decisions,
      finalState: this.finalState || {
        characterId: 'unknown',
        characterName: 'Sin Nombre',
        pathway: 'UNKNOWN',
        sequence: 9,
        origin: 'UNKNOWN',
        daysLived: 0,
        candleTier: 'VACILANTE',
        mirrorTier: 'AZOGUE_LIMPIO',
        ruinaTier: 'INTEGRO',
        activeAnchorsCount: 3,
        brokenAnchorsCount: 0,
        poundsOnHand: 0,
        policeSuspicionDescription: 'Inadvertido',
        churchSuspicionDescription: 'Inadvertido',
        sessionOutcome: 'ALIVE'
      }
    };
  }

  public exportMarkdown(): string {
    const data = this.exportJson();
    const funnel = data.prologueFunnel;
    const final = data.finalState;

    return `# ACTA DE SESIÓN DIEGÉTICA · TELEMETRÍA HUMANA (G4)
**Sesión:** \`${data.sessionId}\` | **Tester:** \`${data.testerId}\`
**Duración Total:** \`${(data.totalPlayTimeMs / 60000).toFixed(1)} minutos\` | **Fecha:** \`${data.startTime}\`

---

## 1. EMBUDO DEL PRÓLOGO (ONBOARDING DIEGÉTICO)
- **Origen Seleccionado:** \`${funnel.originSelected || 'Ninguno'}\`
- **Lectura de la Carta del Benefactor:** \`${funnel.letterRead ? 'COMPLETADA' : 'SALTADA'}\` (${(funnel.letterDurationMs / 1000).toFixed(1)} s)
- **Dilema del Zaguán de Cherwood:** \`${funnel.thresholdDilemmaChoice || 'N/A'}\` (Hesitación: ${(funnel.thresholdDurationMs / 1000).toFixed(1)} s)
- **Hesitación ante el Primer Trago:** \`${(funnel.potionDrinkHesitationMs / 1000).toFixed(1)} s\` (Tiempo de contemplación de los frascos)
- **Vía Despertada:** \`${funnel.potionChosen || 'N/A'}\`
- **Tiempo Total de Prólogo:** \`${(funnel.totalPrologueTimeMs / 60000).toFixed(2)} min\` (Objetivo: ≤ 15 min)

---

## 2. DECISIONES CLAVE TOMADAS (${data.decisions.length} Registros)
| Categoría | Contexto | Elección | Hesitación | Resultado Diegético |
| :--- | :--- | :--- | :--- | :--- |
${data.decisions.map(d => `| \`${d.category}\` | \`${d.contextId}\` | \`${d.choiceMade}\` | ${(d.hesitationMs / 1000).toFixed(1)} s | ${d.diegeticSummary} |`).join('\n')}

---

## 3. ESTADO SOMÁTICO Y SOCIAL FINAL
- **Identidad:** \`${final.characterName}\` (${final.origin})
- **Rango Espiritual:** \`${final.pathway}\` (Secuencia ${final.sequence})
- **Días de Doble Vida Sobrevividos:** \`${final.daysLived} días\`
- **Condición Somática:**
  - **Llama de la Vela (Sanidad):** \`${final.candleTier}\`
  - **Espejo de Azogue (Corrupción):** \`${final.mirrorTier}\`
  - **Madera del Marco (Ruina):** \`${final.ruinaTier}\`
- **Anclas Humanas:** \`${final.activeAnchorsCount} Activas\` / \`${final.brokenAnchorsCount} Quebradas\`
- **Economía:** \`${final.poundsOnHand} £\` en el cajón
- **Mirada Oficial:**
  - Policía: \`${final.policeSuspicionDescription}\`
  - Iglesia: \`${final.churchSuspicionDescription}\`
- **Desenlace de Sesión:** \`${final.sessionOutcome}\`
`;
  }
}
