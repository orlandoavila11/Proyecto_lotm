import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StatusMatrix, StatusType } from '../../infra/content/schemas/statusMatrix.schema.js';
import { AtomVocabulary, AtomDefinition } from '../../infra/content/schemas/atomVocabulary.schema.js';

export interface GridPosition {
  x: number; // 0..6
  y: number; // 0..4
}

export interface RuntimeStatus {
  status: StatusType;
  durationTurns: number;
  intensity?: number;
}

export interface RuntimeDamageSource {
  type: 'PHYSICAL' | 'SPIRITUAL' | 'ELEMENTAL' | 'POISON' | 'CORRUPTION';
  amount: number;
  timestamp?: number;
}

export interface RuntimeCombatant {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  spirituality: number;
  maxSpirituality: number;
  ap: number;
  maxAp: number;
  attention: number;
  maxAttention: number;
  position: GridPosition;
  statuses: RuntimeStatus[];
  revealedAbilities: string[]; // IDs de habilidades reveladas al oponente
  allAbilityIds?: string[];
  lastDamageSource?: RuntimeDamageSource;
}

export interface AtomExecutionResult {
  atomId: string;
  success: boolean;
  damageDealt: number;
  healingDone: number;
  damageType?: 'PHYSICAL' | 'SPIRITUAL' | 'ELEMENTAL' | 'POISON' | 'CORRUPTION';
  statusApplied?: StatusType;
  statusRemoved?: StatusType;
  displaced?: { from: GridPosition; to: GridPosition };
  revealedAbilities?: string[];
  apDelta?: number;
  attentionDelta?: number;
  spiritualitySpent: number;
  message: string;
}

export class AtomRuntime {
  private static instance: AtomRuntime | null = null;
  private vocabulary: Map<string, AtomDefinition> = new Map();
  private statusMatrix: StatusMatrix;

  private constructor() {
    const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
    const vocabPath = path.join(packageRoot, 'data', 'gameplay', 'balance', 'atom_vocabulary.json');
    const matrixPath = path.join(packageRoot, 'data', 'gameplay', 'balance', 'status_matrix.json');

    const vocabData: AtomVocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
    for (const atom of vocabData.atoms) {
      this.vocabulary.set(atom.id, atom);
    }

    this.statusMatrix = JSON.parse(fs.readFileSync(matrixPath, 'utf-8'));
  }

  public static getInstance(): AtomRuntime {
    if (!AtomRuntime.instance) {
      AtomRuntime.instance = new AtomRuntime();
    }
    return AtomRuntime.instance;
  }

  public getAtom(atomId: string): AtomDefinition | undefined {
    return this.vocabulary.get(atomId);
  }

  public getStatusMatrix(): StatusMatrix {
    return this.statusMatrix;
  }

  /**
   * Resuelve la interacción al intentar aplicar newStatus a un combatiente
   * basándose estrictamente en status_matrix.json (cero ifs cableados).
   */
  public resolveStatusInteraction(
    currentStatuses: RuntimeStatus[],
    newStatus: StatusType,
    duration: number = 2
  ): {
    updatedStatuses: RuntimeStatus[];
    applied: boolean;
    removed?: StatusType;
    explanation: string;
  } {
    let applied = true;
    let removedStatus: StatusType | undefined = undefined;
    let explanation = `Se aplicó el estado [${newStatus}].`;

    const nextStatuses = [...currentStatuses];

    for (let i = nextStatuses.length - 1; i >= 0; i--) {
      const existing = nextStatuses[i];
      const interaction = this.statusMatrix.interactions.find(
        rule =>
          (rule.statusA === existing.status && rule.statusB === newStatus) ||
          (rule.statusB === existing.status && rule.statusA === newStatus)
      );

      if (interaction) {
        if (interaction.resolution === 'MUTUAL_CANCELLATION') {
          removedStatus = existing.status;
          nextStatuses.splice(i, 1);
          applied = false;
          explanation = `[${newStatus}] y [${existing.status}] colisionan: ${interaction.description}`;
          break;
        }

        if (interaction.resolution === 'REMOVE_A') {
          if (interaction.statusA === existing.status) {
            removedStatus = existing.status;
            nextStatuses.splice(i, 1);
            explanation = interaction.description;
          } else {
            applied = false;
            explanation = interaction.description;
            break;
          }
        }

        if (interaction.resolution === 'REMOVE_B') {
          if (interaction.statusB === newStatus) {
            applied = false;
            explanation = interaction.description;
            break;
          } else {
            removedStatus = existing.status;
            nextStatuses.splice(i, 1);
            explanation = interaction.description;
          }
        }

        if (interaction.resolution === 'A_IMMUNE_TO_B') {
          if (interaction.statusA === existing.status) {
            applied = false;
            explanation = `Inmunidad: ${interaction.description}`;
            break;
          }
        }

        if (interaction.resolution === 'B_IMMUNE_TO_A') {
          if (interaction.statusB === existing.status) {
            applied = false;
            explanation = `Inmunidad: ${interaction.description}`;
            break;
          }
        }
      }
    }

    if (applied) {
      const existingIdx = nextStatuses.findIndex(s => s.status === newStatus);
      if (existingIdx >= 0) {
        nextStatuses[existingIdx].durationTurns = Math.max(nextStatuses[existingIdx].durationTurns, duration);
      } else {
        nextStatuses.push({ status: newStatus, durationTurns: duration });
      }
    }

    return {
      updatedStatuses: nextStatuses,
      applied,
      removed: removedStatus,
      explanation
    };
  }

  /**
   * Ejecuta un átomo determinista sobre emisor y objetivo(s).
   */
  public executeAtom(
    actor: RuntimeCombatant,
    target: RuntimeCombatant,
    atomId: string,
    params: Record<string, any> = {}
  ): AtomExecutionResult {
    const atom = this.vocabulary.get(atomId);
    if (!atom) {
      throw new Error(`Átomo de combate desconocido: '${atomId}'`);
    }

    if (atom.playerOnly && !actor.isPlayer) {
      throw new Error(`El átomo '${atomId}' está restringido exclusivamente a habilidades de jugador.`);
    }

    const result: AtomExecutionResult = {
      atomId,
      success: true,
      damageDealt: 0,
      healingDone: 0,
      spiritualitySpent: atom.baseCosts.spirituality,
      message: ''
    };

    switch (atom.id) {
      case 'ATOM_DAMAGE_PHYSICAL': {
        const base = params.baseDamage ?? 15;
        let finalDamage = base;
        if (target.statuses.some(s => s.status === 'WEAKENED')) {
          finalDamage = Math.floor(finalDamage * 1.3);
        }
        target.hp = Math.max(0, target.hp - finalDamage);
        target.lastDamageSource = { type: 'PHYSICAL', amount: finalDamage };
        result.damageDealt = finalDamage;
        result.damageType = 'PHYSICAL';
        result.message = `${actor.name} asestó un impacto físico de ${finalDamage} daño a ${target.name}.`;
        break;
      }

      case 'ATOM_DAMAGE_SPIRITUAL': {
        const base = params.baseDamage ?? 20;
        let finalDamage = base;
        if (target.statuses.some(s => s.status === 'WEAKENED')) {
          finalDamage = Math.floor(finalDamage * 1.3);
        }
        target.hp = Math.max(0, target.hp - finalDamage);
        target.lastDamageSource = { type: 'SPIRITUAL', amount: finalDamage };
        result.damageDealt = finalDamage;
        result.damageType = 'SPIRITUAL';
        result.message = `${actor.name} rasgó el cuerpo astral de ${target.name} infligiendo ${finalDamage} daño espiritual puro.`;
        break;
      }

      case 'ATOM_DAMAGE_ELEMENTAL': {
        const base = params.baseDamage ?? 22;
        const element = params.element ?? 'fire';
        let finalDamage = base;
        if (target.statuses.some(s => s.status === 'WEAKENED')) {
          finalDamage = Math.floor(finalDamage * 1.3);
        }
        target.hp = Math.max(0, target.hp - finalDamage);
        target.lastDamageSource = { type: 'ELEMENTAL', amount: finalDamage };
        result.damageDealt = finalDamage;
        result.damageType = 'ELEMENTAL';
        result.message = `${actor.name} desató energía elemental de [${element}] causando ${finalDamage} daño devastador a ${target.name}.`;
        break;
      }

      case 'ATOM_APPLY_STATUS': {
        const statusToApply = params.status as StatusType;
        const duration = params.durationTurns ?? 2;
        const resolution = this.resolveStatusInteraction(target.statuses, statusToApply, duration);
        target.statuses = resolution.updatedStatuses;
        if (resolution.applied) {
          result.statusApplied = statusToApply;
        }
        if (resolution.removed) {
          result.statusRemoved = resolution.removed;
        }
        result.message = `${actor.name} alteró el estado de ${target.name}: ${resolution.explanation}`;
        break;
      }

      case 'ATOM_REMOVE_STATUS': {
        const statusToRemove = params.status as StatusType;
        target.statuses = target.statuses.filter(s => s.status !== statusToRemove);
        result.statusRemoved = statusToRemove;
        result.message = `${actor.name} purgó el estado [${statusToRemove}] de ${target.name}.`;
        break;
      }

      case 'ATOM_DISPLACE_PUSH': {
        const dist = params.distance ?? 1;
        const oldPos = { ...target.position };
        const dx = target.position.x >= actor.position.x ? 1 : -1;
        const newX = Math.min(6, Math.max(0, target.position.x + dx * dist));
        target.position.x = newX;
        result.displaced = { from: oldPos, to: { ...target.position } };
        result.message = `${target.name} fue empujado hacia la celda (${target.position.x}, ${target.position.y}).`;
        break;
      }

      case 'ATOM_DISPLACE_PULL': {
        const dist = params.distance ?? 1;
        const oldPos = { ...target.position };
        const dx = target.position.x > actor.position.x ? -1 : 1;
        const newX = Math.min(6, Math.max(0, target.position.x + dx * dist));
        target.position.x = newX;
        result.displaced = { from: oldPos, to: { ...target.position } };
        result.message = `${target.name} fue atraído hacia la celda (${target.position.x}, ${target.position.y}).`;
        break;
      }

      case 'ATOM_DISPLACE_MOVE': {
        const toPos = params.targetPosition as GridPosition;
        if (toPos) {
          const oldPos = { ...actor.position };
          actor.position = { ...toPos };
          result.displaced = { from: oldPos, to: { ...toPos } };
          result.message = `${actor.name} se desplazó a (${toPos.x}, ${toPos.y}).`;
        }
        break;
      }

      case 'ATOM_DISPLACE_TELEPORT': {
        const toPos = params.targetPosition as GridPosition;
        if (toPos) {
          const oldPos = { ...actor.position };
          actor.position = { ...toPos };
          result.displaced = { from: oldPos, to: { ...toPos } };
          result.message = `${actor.name} parpadeó en el espacio reapareciendo en (${toPos.x}, ${toPos.y}).`;
        }
        break;
      }

      case 'ATOM_SCRUTINIZE': {
        const count = params.revealCount ?? 1;
        const hidden = (target.allAbilityIds || []).filter(id => !actor.revealedAbilities.includes(id));
        const revealed = hidden.slice(0, count);
        for (const rev of revealed) {
          if (!actor.revealedAbilities.includes(rev)) {
            actor.revealedAbilities.push(rev);
          }
        }
        result.revealedAbilities = revealed;
        result.message = `${actor.name} escudriñó a ${target.name} revelando ${revealed.length} habilidad(es) oculta(s): [${revealed.join(', ')}].`;
        break;
      }

      case 'ATOM_REVEAL': {
        target.statuses = target.statuses.filter(s => s.status !== 'CONCEALED');
        result.statusRemoved = 'CONCEALED';
        result.message = `El velo de ocultación de ${target.name} ha sido disipado por completo.`;
        break;
      }

      case 'ATOM_HEAL_HP': {
        const amt = params.amount ?? 25;
        const prev = target.hp;
        target.hp = Math.min(target.maxHp, target.hp + amt);
        result.healingDone = target.hp - prev;
        result.message = `${actor.name} sanó las heridas de ${target.name} recuperando +${result.healingDone} HP.`;
        break;
      }

      case 'ATOM_HEAL_SPIRITUALITY': {
        const amt = params.amount ?? 20;
        const prev = target.spirituality;
        target.spirituality = Math.min(target.maxSpirituality, target.spirituality + amt);
        result.message = `${actor.name} canalizó espiritualidad recuperando +${target.spirituality - prev} puntos.`;
        break;
      }

      case 'ATOM_HEAL_SANITY': {
        const amt = params.amount ?? 5;
        result.message = `${actor.name} estabilizó la mente restaurando +${amt} de sanidad.`;
        break;
      }

      case 'ATOM_DRAIN_AP': {
        const amt = params.amount ?? 1;
        target.ap = Math.max(0, target.ap - amt);
        result.apDelta = -amt;
        result.message = `${actor.name} entorpeció a ${target.name} drenando ${amt} Punto(s) de Acción.`;
        break;
      }

      case 'ATOM_GAIN_AP': {
        const amt = params.amount ?? 1;
        actor.ap = Math.min(actor.maxAp + 1, actor.ap + amt);
        result.apDelta = amt;
        result.message = `${actor.name} canalizó un estallido de velocidad ganando +${amt} PA.`;
        break;
      }

      case 'ATOM_ATTENTION_EXCHANGE': {
        const apCost = params.apCost ?? 1;
        const attGain = params.attentionGained ?? 1;
        actor.ap = Math.max(0, actor.ap - apCost);
        actor.attention = Math.min(actor.maxAttention, actor.attention + attGain);
        result.apDelta = -apCost;
        result.attentionDelta = attGain;
        result.message = `${actor.name} adoptó una postura de observación atenta (+${attGain} Atención, -${apCost} PA).`;
        break;
      }

      default:
        throw new Error(`Manejador no implementado para el átomo '${atom.id}'`);
    }

    return result;
  }
}
