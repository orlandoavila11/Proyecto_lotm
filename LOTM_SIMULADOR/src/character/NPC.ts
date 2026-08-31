import { BeyonderCharacter } from './BeyonderCharacter';
import { MonsterData, TarotMemberData, ThreatLevel, FactionReputation } from '../database/types';

export type NPCFaction = FactionReputation | "WILD_BEYONDER" | "MONSTER";

export class NPC extends BeyonderCharacter {
  public id: string;
  public faction: NPCFaction;
  public threatLevel: ThreatLevel;
  public isHostile: boolean;
  public bossType?: string;
  public dropItems: string[];
  public favorability: number; // -100 (Enemigo Hostil) a 100 (Aliado)
  public isRampaging: boolean;

  constructor(
    id: string,
    name: string,
    pathway: string,
    sequence: number,
    faction: NPCFaction = "WILD_BEYONDER",
    threatLevel: ThreatLevel = "MEDIUM"
  ) {
    super(name, pathway, sequence);
    this.id = id;
    this.faction = faction;
    this.threatLevel = threatLevel;
    this.isHostile = faction === "AURORA_ORDER" || faction === "MONSTER";
    this.dropItems = [];
    this.favorability = this.isHostile ? -50 : 0;
    this.isRampaging = false;
  }

  public static fromMonsterData(monster: MonsterData): NPC {
    const npc = new NPC(
      monster.id,
      monster.name,
      monster.pathwayRelated || "FOOL",
      monster.recommendedSequence,
      "MONSTER",
      monster.threatLevel || "MEDIUM"
    );

    npc.bossType = monster.bossType;
    npc.dropItems = monster.dropItems || [];
    npc.isHostile = true;

    npc.sanity = 30;
    npc.corruption = 70;
    if (monster.threatLevel === "ANGEL" || monster.threatLevel === "HIGH_SAINT") {
      npc.isRampaging = true;
    }

    return npc;
  }

  public static fromTarotMember(member: TarotMemberData): NPC {
    const npc = new NPC(
      member.id,
      member.name,
      member.pathway,
      member.highestKnownSequence,
      "TAROT_CLUB",
      member.highestKnownSequence <= 4 ? "SAINT" : "MEDIUM"
    );

    npc.isHostile = false;
    npc.favorability = 50;
    npc.addAnchor("Lealtad al Sr. Tonto y el Club Tarot", 80);
    return npc;
  }

  public adjustFavorability(amount: number): void {
    this.favorability = Math.max(-100, Math.min(100, this.favorability + amount));
    if (this.favorability < -30) {
      this.isHostile = true;
    } else if (this.favorability >= 0 && this.faction !== "MONSTER") {
      this.isHostile = false;
    }
  }

  public checkControlLoss(): boolean {
    if (this.sanity <= 0 || this.corruption >= 90) {
      this.isRampaging = true;
      this.isHostile = true;
      this.name = `[PERDIÓ EL CONTROL] ${this.name}`;
      return true;
    }
    return false;
  }

  public getCombatPowerMultiplier(): number {
    let base = (10 - this.sequence) * 1.5;
    
    if (this.threatLevel === "ANGEL") base *= 3.0;
    else if (this.threatLevel === "HIGH_SAINT" || this.threatLevel === "SAINT") base *= 2.0;
    else if (this.threatLevel === "HIGH") base *= 1.4;

    if (this.isRampaging) base *= 1.3;

    return Math.max(1, Math.round(base));
  }
}