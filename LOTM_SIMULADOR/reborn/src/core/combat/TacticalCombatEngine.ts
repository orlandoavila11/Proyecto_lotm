import { CanonicalPathwayId } from '../types/pathway.js';
import { SeededRNG } from '../rng/SeededRNG.js';

export interface CombatSkill {
  id: string;
  name: string;
  pathway: CanonicalPathwayId;
  minSequence: number;
  spiritualityCost: number;
  damage: number;
  sanityDelta: number;
  effect?: 'STUN' | 'SLEEP' | 'DODGE' | 'LIFE_LEECH' | 'DEFENSE_DOWN' | 'DAMAGE_REDUCTION';
  description: string;
}

export interface CombatActor {
  id: string;
  name: string;
  isPlayer: boolean;
  pathway?: CanonicalPathwayId;
  sequence: number;
  currentHp: number;
  maxHp: number;
  currentSpirituality: number;
  maxSpirituality: number;
  isStunned?: boolean;
  isAsleep?: boolean;
  isDodging?: boolean;
  defenseDownTurns?: number;
}

export interface CombatTurnResult {
  turnNumber: number;
  actorName: string;
  actionName: string;
  damageDealt: number;
  healingDone: number;
  spiritualitySpent: number;
  message: string;
  targetCurrentHp: number;
  isTargetDefeated: boolean;
  effectTriggered?: string;
}

export class TacticalCombatEngine {
  private static skillRegistry: Map<CanonicalPathwayId, CombatSkill[]> = new Map();

  static {
    this.initAllPathwaySkills();
  }

  private static registerSkill(skill: CombatSkill): void {
    const list = this.skillRegistry.get(skill.pathway) || [];
    list.push(skill);
    this.skillRegistry.set(skill.pathway, list);
  }

  private static initAllPathwaySkills(): void {
    // 1. FOOL
    this.registerSkill({ id: 'SKILL_FOOL_9_SPIRIT_VISION', name: 'Visión Espiritual & Intuición', pathway: 'FOOL', minSequence: 9, spiritualityCost: 10, damage: 15, sanityDelta: 1, description: 'Analiza el flujo astral y predice el punto débil del oponente.' });
    this.registerSkill({ id: 'SKILL_FOOL_7_AIR_BULLET', name: 'Bala de Aire Comprimido', pathway: 'FOOL', minSequence: 7, spiritualityCost: 20, damage: 38, sanityDelta: 0, description: 'Dispara un proyectil sónico invisible con la potencia de un rifle de gran calibre.' });

    // 2. RED PRIEST
    this.registerSkill({ id: 'SKILL_HUNTER_9_SNIPE', name: 'Tiro de Precisión de Cazador', pathway: 'RED_PRIEST', minSequence: 9, spiritualityCost: 10, damage: 25, sanityDelta: 0, description: 'Impacta el punto vital con proyectil balístico reforzado.' });
    this.registerSkill({ id: 'SKILL_HUNTER_8_PROVOKE', name: 'Provocación Flamígera', pathway: 'RED_PRIEST', minSequence: 8, spiritualityCost: 15, damage: 12, sanityDelta: 1, effect: 'DEFENSE_DOWN', description: 'Enfurece al oponente reduciendo su guardia en un 30%.' });
    this.registerSkill({ id: 'SKILL_HUNTER_7_FIRE_RAVEN', name: 'Cuervo de Fuego Carmesí', pathway: 'RED_PRIEST', minSequence: 7, spiritualityCost: 25, damage: 45, sanityDelta: 0, description: 'Lanza un ave de fuego espiritual que impacta y quema el cuerpo astral.' });

    // 3. VISIONARY
    this.registerSkill({ id: 'SKILL_SPECTATOR_9_PSYCHO', name: 'Lectura Mental Rápida', pathway: 'VISIONARY', minSequence: 9, spiritualityCost: 10, damage: 14, sanityDelta: 2, description: 'Lee la intención de ataque del enemigo neutralizando su ventaja.' });
    this.registerSkill({ id: 'SKILL_SPECTATOR_8_PLACATE', name: 'Apaciguamiento Psíquico', pathway: 'VISIONARY', minSequence: 8, spiritualityCost: 20, damage: 10, sanityDelta: 8, effect: 'DEFENSE_DOWN', description: 'Apacigua la hostilidad del enemigo y restaura la sanidad del usuario.' });
    this.registerSkill({ id: 'SKILL_SPECTATOR_7_AWE', name: 'Ola de Pavor Hipnótico (Awe)', pathway: 'VISIONARY', minSequence: 7, spiritualityCost: 25, damage: 28, sanityDelta: 0, effect: 'STUN', description: 'Paraliza la mente del adversario con terror absoluto durante un turno.' });

    // 4. DOOR
    this.registerSkill({ id: 'SKILL_DOOR_9_MECHANISM', name: 'Desarme de Mecanismos', pathway: 'DOOR', minSequence: 9, spiritualityCost: 10, damage: 16, sanityDelta: 0, description: 'Atrofia el equipo o las armas del enemigo.' });
    this.registerSkill({ id: 'SKILL_DOOR_8_SPATIAL_BLINK', name: 'Parpadeo Espacial (Blink)', pathway: 'DOOR', minSequence: 8, spiritualityCost: 20, damage: 0, sanityDelta: 0, effect: 'DODGE', description: 'Se desliza a través del espacio esquivando completamente el próximo ataque.' });

    // 5. ERROR
    this.registerSkill({ id: 'SKILL_ERROR_9_INITIATIVE', name: 'Robo de Iniciativa', pathway: 'ERROR', minSequence: 9, spiritualityCost: 10, damage: 18, sanityDelta: 0, description: 'Sustrae la concentración del enemigo para golpear primero.' });
    this.registerSkill({ id: 'SKILL_ERROR_7_THEFT_VIGOR', name: 'Robo Conceptual de Vigor', pathway: 'ERROR', minSequence: 7, spiritualityCost: 25, damage: 32, sanityDelta: 1, effect: 'LIFE_LEECH', description: 'Drena 25 puntos de vitalidad del enemigo canalizándolos a tu salud.' });

    // 6. SUN
    this.registerSkill({ id: 'SKILL_SUN_9_HOLY_LIGHT', name: 'Ráfaga de Luz Sagrada', pathway: 'SUN', minSequence: 9, spiritualityCost: 12, damage: 24, sanityDelta: 2, description: 'Emite radiación pura que disuelve sombras y espectros.' });
    this.registerSkill({ id: 'SKILL_SUN_7_SOLAR_CLEANSE', name: 'Purificación Solar Llameante', pathway: 'SUN', minSequence: 7, spiritualityCost: 25, damage: 42, sanityDelta: 4, description: 'Llama a la luz abrasadora del Eterno Sol Abrasador.' });

    // 7. DARKNESS
    this.registerSkill({ id: 'SKILL_DARKNESS_9_SOUL_QUIET', name: 'Pacificador de Almas', pathway: 'DARKNESS', minSequence: 9, spiritualityCost: 10, damage: 18, sanityDelta: 3, description: 'Acalla el frenesí espiritual con la calma de la noche.' });
    this.registerSkill({ id: 'SKILL_DARKNESS_8_SLUMBER', name: 'Poema del Letargo (Slumber)', pathway: 'DARKNESS', minSequence: 8, spiritualityCost: 20, damage: 10, sanityDelta: 2, effect: 'SLEEP', description: 'Entona versos de medianoche induciendo un sueño profundo en el rival.' });

    // 8. TYRANT
    this.registerSkill({ id: 'SKILL_TYRANT_9_TORPEDO', name: 'Arpón de Presión Acuática', pathway: 'TYRANT', minSequence: 9, spiritualityCost: 12, damage: 26, sanityDelta: 0, description: 'Proyecta agua condensada con la fuerza de un ariete naval.' });
    this.registerSkill({ id: 'SKILL_TYRANT_7_LIGHTNING', name: 'Descarga Eléctrica de Tempestad', pathway: 'TYRANT', minSequence: 7, spiritualityCost: 25, damage: 44, sanityDelta: 0, description: 'Canaliza un rayo celeste que calcina el blanco.' });

    // 9. WHITE TOWER
    this.registerSkill({ id: 'SKILL_WHITE_TOWER_9_ANALYSIS', name: 'Análisis de Flujo Racional', pathway: 'WHITE_TOWER', minSequence: 9, spiritualityCost: 10, damage: 20, sanityDelta: 1, description: 'Identifica la falla en la postura del rival para un contragolpe quirúrgico.' });
    this.registerSkill({ id: 'SKILL_WHITE_TOWER_7_SIMULATION', name: 'Simulación de Hechizo Arcano', pathway: 'WHITE_TOWER', minSequence: 7, spiritualityCost: 25, damage: 36, sanityDelta: 0, description: 'Replica una técnica enemiga proyectándola con mayor precisión.' });

    // 10. JUSTICIAR
    this.registerSkill({ id: 'SKILL_JUSTICIAR_9_PROHIBITION', name: 'Mandato de Prohibición', pathway: 'JUSTICIAR', minSequence: 9, spiritualityCost: 12, damage: 15, sanityDelta: 0, effect: 'DEFENSE_DOWN', description: 'Decretas que el ataque del oponente es ilegítimo, reduciendo su daño.' });
    this.registerSkill({ id: 'SKILL_JUSTICIAR_8_RESTRAINT', name: 'Golpe de Coerción de Alguacil', pathway: 'JUSTICIAR', minSequence: 8, spiritualityCost: 18, damage: 30, sanityDelta: 0, effect: 'STUN', description: 'Somete al agresor contra el suelo con cadenas invisibles de orden.' });

    // 11. TWILIGHT GIANT
    this.registerSkill({ id: 'SKILL_WARRIOR_9_GIANT_SLASH', name: 'Tajo Pesado de Guerrero', pathway: 'TWILIGHT_GIANT', minSequence: 9, spiritualityCost: 10, damage: 28, sanityDelta: 0, description: 'Golpe demoledor cuerpo a cuerpo que resquebraja escudos y armaduras.' });
    this.registerSkill({ id: 'SKILL_WARRIOR_7_AURA', name: 'Hoja del Crepúsculo Solar', pathway: 'TWILIGHT_GIANT', minSequence: 7, spiritualityCost: 25, damage: 46, sanityDelta: 1, description: 'Envuelve el arma en un halo crepuscular marchitador.' });

    // 12. DEATH
    this.registerSkill({ id: 'SKILL_DEATH_9_CHILL', name: 'Contacto Cadavérico Gélido', pathway: 'DEATH', minSequence: 9, spiritualityCost: 10, damage: 22, sanityDelta: 0, description: 'Transmite la temperatura del inframundo entumeciendo los músculos del rival.' });
    this.registerSkill({ id: 'SKILL_DEATH_7_SPIRIT_WHIP', name: 'Látigo de Espectros Errantes', pathway: 'DEATH', minSequence: 7, spiritualityCost: 25, damage: 38, sanityDelta: 0, description: 'Invoca espíritus atados al río de la muerte para flagelar el alma enemiga.' });

    // 13. DEMONESS
    this.registerSkill({ id: 'SKILL_DEMONESS_9_SHADOW_DAGGER', name: 'Puñalada de Sombra Venenosa', pathway: 'DEMONESS', minSequence: 9, spiritualityCost: 10, damage: 26, sanityDelta: 0, description: 'Apuñala desde el ángulo ciego inyectando veneno paralizante.' });
    this.registerSkill({ id: 'SKILL_DEMONESS_7_BLACK_FLAME', name: 'Maleficio de Fuego Negro', pathway: 'DEMONESS', minSequence: 7, spiritualityCost: 25, damage: 42, sanityDelta: 0, description: 'Conjura llamas gélidas que devoran la carne y la mente.' });

    // 14. HERMIT
    this.registerSkill({ id: 'SKILL_HERMIT_9_RUNE_BLAST', name: 'Ráfaga de Runas Herméticas', pathway: 'HERMIT', minSequence: 9, spiritualityCost: 12, damage: 24, sanityDelta: 1, description: 'Detona inscripciones místicas que rasgan el tejido espiritual.' });
    this.registerSkill({ id: 'SKILL_HERMIT_7_SCROLL', name: 'Despliegue de Pergamino de Brujo', pathway: 'HERMIT', minSequence: 7, spiritualityCost: 25, damage: 40, sanityDelta: 0, description: 'Libera una cascada de energía mágica elemental.' });

    // 15. WHEEL OF FORTUNE
    this.registerSkill({ id: 'SKILL_MONSTER_9_MISFORTUNE', name: 'Calamidad Imprevista (Misfortune)', pathway: 'WHEEL_OF_FORTUNE', minSequence: 9, spiritualityCost: 10, damage: 20, sanityDelta: 2, effect: 'DEFENSE_DOWN', description: 'Deforma las probabilidades: un fallo azaroso hace tropezar al oponente.' });
    this.registerSkill({ id: 'SKILL_MONSTER_7_LUCKY_CRIT', name: 'Impacto Milagroso del Destino', pathway: 'WHEEL_OF_FORTUNE', minSequence: 7, spiritualityCost: 25, damage: 45, sanityDelta: 2, description: 'Un golpe fortuito que encuentra la grieta estadística absoluta del blindaje.' });

    // 16. MOON
    this.registerSkill({ id: 'SKILL_MOON_9_TOXIC_POUCH', name: 'Bolsa de Esporas Tóxicas', pathway: 'MOON', minSequence: 9, spiritualityCost: 10, damage: 22, sanityDelta: 0, description: 'Arroja polvos fúngicos que corroen las vías respiratorias del adversario.' });
    this.registerSkill({ id: 'SKILL_MOON_7_VAMPIRIC_CLAWS', name: 'Garras Vampíricas de Medianoche', pathway: 'MOON', minSequence: 7, spiritualityCost: 25, damage: 36, sanityDelta: 0, effect: 'LIFE_LEECH', description: 'Desgarra la carne enemiga drenando sangre para restaurar la propia vitalidad.' });

    // 17. MOTHER
    this.registerSkill({ id: 'SKILL_MOTHER_9_VINES', name: 'Enredadera de Raíces Estranguladoras', pathway: 'MOTHER', minSequence: 9, spiritualityCost: 10, damage: 20, sanityDelta: 0, effect: 'STUN', description: 'Brotan lianas del suelo inmovilizando los pies del agresor.' });
    this.registerSkill({ id: 'SKILL_MOTHER_8_HEAL', name: 'Cicatrización Biológica de Médico', pathway: 'MOTHER', minSequence: 8, spiritualityCost: 18, damage: 0, sanityDelta: 3, description: 'Regenera el tejido celular restaurando 35 puntos de salud.' });

    // 18. PARAGON
    this.registerSkill({ id: 'SKILL_PARAGON_9_BOMB', name: 'Bomba Alquímica de Presión', pathway: 'PARAGON', minSequence: 9, spiritualityCost: 12, damage: 26, sanityDelta: 0, description: 'Detona un cilindro de pólvora y reactivos volátiles.' });
    this.registerSkill({ id: 'SKILL_PARAGON_7_DISMANTLE', name: 'Desmantelamiento Estructural', pathway: 'PARAGON', minSequence: 7, spiritualityCost: 25, damage: 40, sanityDelta: 0, effect: 'DEFENSE_DOWN', description: 'Explota los puntos de tensión material del blindaje enemigo.' });

    // 19. BLACK EMPEROR
    this.registerSkill({ id: 'SKILL_LAWYER_9_EXPLOIT', name: 'Distorsión de Vulnerabilidad', pathway: 'BLACK_EMPEROR', minSequence: 9, spiritualityCost: 10, damage: 20, sanityDelta: 1, effect: 'DEFENSE_DOWN', description: 'Encuentra el vacío legal en la defensa del adversario.' });
    this.registerSkill({ id: 'SKILL_LAWYER_8_CRASH', name: 'Embate Bárbaro Demoledor', pathway: 'BLACK_EMPEROR', minSequence: 8, spiritualityCost: 18, damage: 32, sanityDelta: 0, description: 'Carga con fuerza bruta avasallante que desbarata la formación.' });

    // 20. CHAINED
    this.registerSkill({ id: 'SKILL_CHAINED_9_RESILIENCE', name: 'Resistencia de Cadenas de Hierro', pathway: 'CHAINED', minSequence: 9, spiritualityCost: 12, damage: 15, sanityDelta: 2, effect: 'DAMAGE_REDUCTION', description: 'El cuerpo de Prisionero endurece su carne amortiguando el dolor.' });
    this.registerSkill({ id: 'SKILL_CHAINED_7_WEREWOLF', name: 'Mordisco Feral de Hombre Lobo', pathway: 'CHAINED', minSequence: 7, spiritualityCost: 25, damage: 42, sanityDelta: 0, effect: 'LIFE_LEECH', description: 'Acometida con mandíbula lupina que desgarra y succiona vitalidad.' });

    // 21. ABYSS
    this.registerSkill({ id: 'SKILL_ABYSS_9_MALICE', name: 'Percepción Asesina de Malicia', pathway: 'ABYSS', minSequence: 9, spiritualityCost: 10, damage: 22, sanityDelta: 0, description: 'Anticipa el ataque homicida apuñalando antes de que el rival reaccione.' });
    this.registerSkill({ id: 'SKILL_ABYSS_7_CORROSION', name: 'Tajo Corrosivo Abisal', pathway: 'ABYSS', minSequence: 7, spiritualityCost: 25, damage: 40, sanityDelta: 0, description: 'Cuchillada cargada de toxinas demoníacas que supuran ácido.' });

    // 22. HANGED MAN
    this.registerSkill({ id: 'SKILL_HANGED_MAN_9_SURGE', name: 'Oleada de Sangre de Suplicante', pathway: 'HANGED_MAN', minSequence: 9, spiritualityCost: 12, damage: 25, sanityDelta: 1, description: 'Canaliza devoción dolorosa en una explosión de espiritualidad escarlata.' });
    this.registerSkill({ id: 'SKILL_HANGED_MAN_8_MURMUR', name: 'Murmullo Enloquecedor de Oyente', pathway: 'HANGED_MAN', minSequence: 8, spiritualityCost: 20, damage: 30, sanityDelta: -1, effect: 'STUN', description: 'Transmite al cerebro del adversario los susurros ininteligibles del Creador Verdadero.' });
  }

  public static getSkillsForPathway(pathway: CanonicalPathwayId, sequence: number): CombatSkill[] {
    const all = this.skillRegistry.get(pathway) || [];
    // Retornar habilidades disponibles para el rango actual (minSequence >= sequence, ya que 9 es menor que 7)
    return all.filter(s => s.minSequence >= sequence);
  }

  public static executeAction(
    actor: CombatActor,
    target: CombatActor,
    skillId?: string,
    rng?: SeededRNG
  ): CombatTurnResult {
    let damage = 12; // Ataque básico de puño / estilete
    let healing = 0;
    let cost = 0;
    let actionName = 'Ataque Físico Básico';
    let message = `${actor.name} arremete con un ataque físico directo.`;
    let effectTriggered: string | undefined = undefined;

    // Si el objetivo estaba esquivando por Parpadeo Espacial
    if (target.isDodging) {
      target.isDodging = false;
      return {
        turnNumber: 1,
        actorName: actor.name,
        actionName,
        damageDealt: 0,
        healingDone: 0,
        spiritualitySpent: 0,
        message: `¡${target.name} se desvaneció a través del espacio! El ataque de ${actor.name} atravesó el vacío.`,
        targetCurrentHp: target.currentHp,
        isTargetDefeated: false,
        effectTriggered: 'DODGE'
      };
    }

    if (skillId && actor.pathway) {
      const skills = this.getSkillsForPathway(actor.pathway, actor.sequence);
      const skill = skills.find(s => s.id === skillId);
      if (skill && actor.currentSpirituality >= skill.spiritualityCost) {
        cost = skill.spiritualityCost;
        damage = skill.damage;
        actionName = skill.name;
        actor.currentSpirituality -= cost;

        if (skill.effect === 'DODGE') {
          actor.isDodging = true;
          message = `${actor.name} ejecutó [${skill.name}]. Su silueta parpadea fuera del plano físico.`;
          return {
            turnNumber: 1,
            actorName: actor.name,
            actionName,
            damageDealt: 0,
            healingDone: 0,
            spiritualitySpent: cost,
            message,
            targetCurrentHp: target.currentHp,
            isTargetDefeated: false,
            effectTriggered: 'DODGE'
          };
        }

        if (skill.effect === 'STUN') {
          target.isStunned = true;
          effectTriggered = 'STUN';
        } else if (skill.effect === 'SLEEP') {
          target.isAsleep = true;
          effectTriggered = 'SLEEP';
        } else if (skill.effect === 'LIFE_LEECH') {
          healing = Math.floor(damage * 0.5);
          actor.currentHp = Math.min(actor.maxHp, actor.currentHp + healing);
          effectTriggered = 'LIFE_LEECH';
        } else if (skill.effect === 'DEFENSE_DOWN') {
          target.defenseDownTurns = 2;
          effectTriggered = 'DEFENSE_DOWN';
        }

        // Si es curación pura (como Mother S8)
        if (damage === 0 && skill.id === 'SKILL_MOTHER_8_HEAL') {
          healing = 35;
          actor.currentHp = Math.min(actor.maxHp, actor.currentHp + healing);
          return {
            turnNumber: 1,
            actorName: actor.name,
            actionName,
            damageDealt: 0,
            healingDone: healing,
            spiritualitySpent: cost,
            message: `${actor.name} canalizó vitalidad biológica recuperando +${healing} HP.`,
            targetCurrentHp: target.currentHp,
            isTargetDefeated: false,
            effectTriggered: 'HEAL'
          };
        }

        message = `${actor.name} canalizó su poder de [${actor.pathway}]: ¡${skill.name}!`;
      }
    }

    // Variación determinista de daño con SeededRNG si está presente
    if (rng && damage > 0) {
      const variance = rng.nextInt(-2, 2);
      damage = Math.max(1, damage + variance);
      if (rng.checkChance(15)) {
        damage = Math.floor(damage * 1.5);
        message += ' ¡Impacto Crítico Espiritual!';
      }
    }

    // Modificador de defensa baja
    if (target.defenseDownTurns && target.defenseDownTurns > 0) {
      damage = Math.floor(damage * 1.3);
      target.defenseDownTurns--;
    }

    target.currentHp = Math.max(0, target.currentHp - damage);
    const isDefeated = target.currentHp === 0;

    return {
      turnNumber: 1,
      actorName: actor.name,
      actionName,
      damageDealt: damage,
      healingDone: healing,
      spiritualitySpent: cost,
      message: `${message} Infligió ${damage} puntos de daño a ${target.name}.`,
      targetCurrentHp: target.currentHp,
      isTargetDefeated: isDefeated,
      effectTriggered
    };
  }

  /**
   * Simulación completa determinista de combate por turnos utilizando SeededRNG.
   * Con la misma semilla, el resultado es 100% idéntico e inmutable.
   */
  public static simulateDeterministicCombat(
    player: CombatActor,
    enemy: CombatActor,
    seed: number | string,
    maxTurns: number = 30
  ): {
    victory: boolean;
    turnsCount: number;
    playerFinalHp: number;
    enemyFinalHp: number;
    turnLog: CombatTurnResult[];
  } {
    const rng = new SeededRNG(seed);
    const turnLog: CombatTurnResult[] = [];
    let turn = 1;
    let victory = false;

    // Clonar actores para no mutar los originales
    const p: CombatActor = { ...player };
    const e: CombatActor = { ...enemy };

    const playerSkills = p.pathway ? this.getSkillsForPathway(p.pathway, p.sequence) : [];

    while (turn <= maxTurns && p.currentHp > 0 && e.currentHp > 0) {
      // 1. Turno de jugador
      let chosenSkillId: string | undefined = undefined;
      const affordableSkills = playerSkills.filter(s => p.currentSpirituality >= s.spiritualityCost);
      if (affordableSkills.length > 0 && rng.checkChance(70)) {
        const idx = rng.nextInt(0, affordableSkills.length - 1);
        chosenSkillId = affordableSkills[idx].id;
      }

      const pResult = this.executeAction(p, e, chosenSkillId, rng);
      pResult.turnNumber = turn;
      turnLog.push(pResult);

      if (e.currentHp <= 0) {
        victory = true;
        break;
      }

      // 2. Turno del enemigo
      if (e.isStunned) {
        e.isStunned = false;
        turnLog.push({
          turnNumber: turn,
          actorName: e.name,
          actionName: 'Aturdido',
          damageDealt: 0,
          healingDone: 0,
          spiritualitySpent: 0,
          message: `${e.name} está aturdido.`,
          targetCurrentHp: p.currentHp,
          isTargetDefeated: false
        });
      } else if (e.isAsleep) {
        e.isAsleep = false;
        turnLog.push({
          turnNumber: turn,
          actorName: e.name,
          actionName: 'Dormido',
          damageDealt: 0,
          healingDone: 0,
          spiritualitySpent: 0,
          message: `${e.name} está dormido.`,
          targetCurrentHp: p.currentHp,
          isTargetDefeated: false
        });
      } else {
        const eResult = this.executeAction(e, p, undefined, rng);
        eResult.turnNumber = turn;
        turnLog.push(eResult);
      }

      if (p.currentHp <= 0) {
        victory = false;
        break;
      }

      turn++;
    }

    return {
      victory,
      turnsCount: turnLog.length,
      playerFinalHp: p.currentHp,
      enemyFinalHp: e.currentHp,
      turnLog
    };
  }
}

