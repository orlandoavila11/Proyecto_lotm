import { BeyonderCharacter } from './BeyonderCharacter';
import { SealedArtifactData, QuestData } from '../database/types';

export class Player extends BeyonderCharacter {
  public pounds: number;
  public inventory: Map<string, number>;
  public activeQuests: QuestData[];
  public completedQuestIds: string[];
  public equippedArtifacts: SealedArtifactData[];
  public currentLocation: string;

  constructor(name: string, pathway: string, sequence: number = 9, startingPounds: number = 10) {
    super(name, pathway, sequence);
    this.pounds = startingPounds;
    this.inventory = new Map();
    this.activeQuests = [];
    this.completedQuestIds = [];
    this.equippedArtifacts = [];
    this.currentLocation = "Backlund - Distrito Borough";
  }

  public addItem(itemId: string, count: number = 1): void {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + count);
  }

  public removeItem(itemId: string, count: number = 1): boolean {
    const current = this.inventory.get(itemId) || 0;
    if (current < count) return false;
    
    if (current === count) {
      this.inventory.delete(itemId);
    } else {
      this.inventory.set(itemId, current - count);
    }
    return true;
  }

  public hasItem(itemId: string, count: number = 1): boolean {
    return (this.inventory.get(itemId) || 0) >= count;
  }

  public addPounds(amount: number): void {
    this.pounds += amount;
  }

  public spendPounds(amount: number): boolean {
    if (this.pounds < amount) return false;
    this.pounds -= amount;
    return true;
  }

  public equipArtifact(artifact: SealedArtifactData): void {
    if (this.equippedArtifacts.some(a => a.id === artifact.id)) return;
    
    this.equippedArtifacts.push(artifact);
    
    const gradeNum = typeof artifact.grade === 'number' ? artifact.grade : parseInt(String(artifact.grade), 10);
    if (!isNaN(gradeNum) && gradeNum <= 1) {
      this.corruption = Math.min(100, this.corruption + 10);
    }
  }

  public unequipArtifact(artifactId: string): void {
    this.equippedArtifacts = this.equippedArtifacts.filter(a => a.id !== artifactId);
  }

  public acceptQuest(quest: QuestData): boolean {
    if (this.activeQuests.some(q => q.id === quest.id)) return false;
    this.activeQuests.push(quest);
    return true;
  }

  public completeQuest(questId: string): boolean {
    const index = this.activeQuests.findIndex(q => q.id === questId);
    if (index === -1) return false;

    const quest = this.activeQuests[index];
    this.activeQuests.splice(index, 1);
    this.completedQuestIds.push(quest.id);

    if (quest.rewards) {
      this.addPounds(quest.rewards.pounds || 0);
      if (quest.rewards.actingDigestBonus) {
        this.digest(quest.rewards.actingDigestBonus);
      }
      if (quest.rewards.sanityBonus) {
        this.modifySanity(quest.rewards.sanityBonus);
      }
    }

    return true;
  }
}