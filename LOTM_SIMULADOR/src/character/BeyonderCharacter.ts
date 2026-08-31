import { DatabaseManager } from '../database/DatabaseManager';
import { PathwaySystem } from '../pathways/PathwaySystem';
import { SequenceData, Anchor } from '../database/types';

export class BeyonderCharacter {
  public name: string;
  public pathway: string;
  public sequence: number; // 9 (Iniciado) a 0 (Deidad)
  public digestionPercentage: number; // 0 a 100%
  public sanity: number; // 0 a 100
  public maxSanity: number;
  public corruption: number; // 0 a 100
  public anchors: Anchor[];
  
  private pathwaySystem: PathwaySystem;

  constructor(name: string, pathway: string, sequence: number = 9) {
    this.name = name;
    this.pathway = pathway.toUpperCase();
    this.sequence = Math.max(0, Math.min(9, sequence));
    this.digestionPercentage = 0;
    this.sanity = 100;
    this.maxSanity = 100;
    this.corruption = 0;
    this.anchors = [];
    this.pathwaySystem = new PathwaySystem();
  }

  public isSemiGodOrAbove(): boolean {
    return this.sequence <= 4;
  }

  public getCurrentSequenceDetails(): SequenceData | null {
    const db = DatabaseManager.getInstance();
    return db.getSequenceData(this.pathway, this.sequence);
  }

  public digest(amount: number): void {
    if (this.digestionPercentage >= 100) return;

    this.digestionPercentage = Math.min(100, this.digestionPercentage + amount);
    
    if (this.digestionPercentage === 100) {
      this.corruption = Math.max(0, this.corruption - 15);
      this.sanity = Math.min(this.maxSanity, this.sanity + 20);
    }
  }

  public addAnchor(sourceName: string, stabilityContribution: number = 25): void {
    const newAnchor: Anchor = {
      id: `anchor_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sourceName,
      stabilityContribution: Math.min(100, Math.max(1, stabilityContribution))
    };
    this.anchors.push(newAnchor);
  }

  public getTotalAnchorStrength(): number {
    if (this.anchors.length === 0) return 0;
    const sum = this.anchors.reduce((acc, anchor) => acc + anchor.stabilityContribution, 0);
    return Math.min(100, Math.round(sum / this.anchors.length));
  }

  public modifySanity(amount: number): void {
    if (amount < 0 && this.isSemiGodOrAbove()) {
      const anchorMitigation = (this.getTotalAnchorStrength() / 100) * 0.5;
      const mitigatedLoss = amount * (1 - anchorMitigation);
      this.sanity = Math.max(0, this.sanity + mitigatedLoss);
    } else {
      this.sanity = Math.max(0, Math.min(this.maxSanity, this.sanity + amount));
    }

    if (this.sanity < 30) {
      this.corruption = Math.min(100, this.corruption + (30 - this.sanity) * 0.2);
    }
  }

  public canAdvanceTo(targetPathway: string = this.pathway): { success: boolean; reason: string } {
    if (this.digestionPercentage < 100) {
      return { success: false, reason: "La poción de la secuencia actual no se ha digerido por completo (100%)." };
    }

    if (this.sequence <= 0) {
      return { success: false, reason: "Ya has alcanzado la Secuencia 0 (Deidad Suprema)." };
    }

    const nextSeq = this.sequence - 1;
    const isSamePathway = targetPathway.toUpperCase() === this.pathway;

    if (!isSamePathway) {
      if (nextSeq > 4) {
        return { 
          success: false, 
          reason: "Solo puedes cambiar a una Vía Vecina en Secuencias Altas (Secuencia 4 o superior)." 
        };
      }

      const isNeighbor = this.pathwaySystem.isNeighboringPathway(this.pathway, targetPathway);
      if (!isNeighbor) {
        return { 
          success: false, 
          reason: `La vía '${targetPathway}' no pertenece al mismo grupo de Sephirot que '${this.pathway}'.` 
        };
      }
    }

    if (nextSeq <= 4 && this.getTotalAnchorStrength() < 40) {
      return { 
        success: false, 
        reason: "Necesitas al menos un 40% de fuerza de Anclas de Humanidad para soportar la divinidad sin perder el control." 
      };
    }

    return { success: true, reason: "Requisitos cumplidos para la promoción." };
  }

  public advanceSequence(targetPathway: string = this.pathway): boolean {
    const check = this.canAdvanceTo(targetPathway);
    if (!check.success) {
      console.warn(`[BeyonderCharacter] Fallo al avanzar: ${check.reason}`);
      return false;
    }

    this.sequence -= 1;
    this.pathway = targetPathway.toUpperCase();
    this.digestionPercentage = 0;
    
    this.maxSanity += 20;
    this.sanity = this.maxSanity;
    
    return true;
  }
}