import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MigrationRunner } from './MigrationRunner.js';
import { generateDeterministicId } from '../../core/rng/IdGenerator.js';

export interface BattleRow {
  id: string;
  character_id: string;
  state_json: string;
  status: 'ONGOING' | 'VICTORY' | 'DEFEAT' | 'FLED' | 'RAMPAGE_TERMINAL';
  created_at: string;
  updated_at: string;
}

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
  ruina?: number;
  terminal_state?: string | null;
  rent_debt_active?: number;
  rent_debt_amount?: number;
  rent_debt_note?: string | null;
  origin_id?: string | null;
  current_slot?: number;
  work_attendance_weekly?: number;
  consecutive_work_missed?: number;
  prologue_step?: string;
  prologue_data_json?: string;
  salary_pence?: number;
  employer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarLogRow {
  id: string;
  character_id: string;
  day: number;
  slot: number;
  event_type: string;
  subsystem: string;
  step_order: number;
  details_json: string;
  detailsJson?: string;
  created_at?: string;
}

export interface IdentityEventHistoryRow {
  id: string;
  character_id: string;
  event_id: string;
  event_category: string;
  chosen_option_index: number;
  day: number;
  slot: number;
  stat_outcome_json: string;
  created_at?: string;
}

export interface PersonaRow {
  id: string;
  character_id: string;
  legal_name: string;
  profession: string;
  social_class: 'POOR' | 'WORKING_CLASS' | 'MIDDLE_CLASS' | 'ARISTOCRAT';
  district: string;
  police_suspicion: number;
  church_suspicion: number;
  human_anchors: number;
  is_active: number;
  is_compromised: number;
  created_at: string;
}

export interface AnchorRow {
  id: string;
  character_id: string;
  title: string;
  strength: number;
  category: string;
  type?: string;
  name?: string;
  description?: string;
  damage_count?: number;
  is_destroyed?: number;
  created_at: string;
}

export interface CharacterScarRow {
  id: string;
  character_id: string;
  scar_code: string;
  name: string;
  narrative: string;
  origin_anchor_id: string | null;
  is_severe: number;
  mechanics_json: string;
  created_at: string;
}

export interface InventoryItemRow {
  id: string;
  character_id: string;
  item_code: string;
  name: string;
  category: 'INGREDIENT' | 'CHARACTERISTIC' | 'POTION' | 'SEALED_ARTIFACT' | 'CONSUMABLE' | 'DOCUMENT' | 'WEAPON' | 'RITUAL_SUPPLY' | 'HARVEST_LOOT';
  grade: number | null;
  quantity: number;
  metadata_json: string;
  quality?: 'PRISTINE' | 'DAMAGED' | 'CONTAMINATED';
  is_equipped: number;
  created_at: string;
}

export interface MarketTransactionRow {
  id: string;
  character_id: string;
  type: 'BUY' | 'SELL' | 'CURE';
  item_code: string | null;
  quality: string | null;
  pence_amount: number;
  day: number;
  description: string;
  created_at: string;
}

export interface AscensionTelemetryRow {
  id: string;
  character_id: string;
  target_sequence: number;
  target_pathway: string;
  outcome: 'SUCCESS' | 'RAMPAGE';
  presented_at: number;
  confirmed_at: number;
  hesitation_ms: number;
  preparation_score: number;
  quality_average: string;
  created_at: string;
}

export interface AscensionStateRow {
  character_id: string;
  current_step: 'CHECKLIST_IN_PROGRESS' | 'TRAGO_PRESENTED' | 'COMPLETED' | 'FAILED';
  presented_at: number | null;
  checklist_json: string;
  formula_id: string | null;
  updated_at: string;
}

export interface ActingWeeklyStateRow {
  character_id: string;
  current_week: number;
  coherence: number;
  variety_penalty: number;
  instability_flag: number;
  loss_of_self_risk_flag: number;
  weekly_records_json: string;
  history_json: string;
  updated_at?: string;
}

export class DatabaseClient {
  private db: DatabaseSync;
  private isMemory: boolean;

  constructor(dbPath: string = ':memory:') {
    this.isMemory = dbPath === ':memory:';
    if (!this.isMemory) {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA foreign_keys = ON;');
    if (!this.isMemory) {
      this.db.exec('PRAGMA journal_mode = WAL;');
      this.db.exec('PRAGMA synchronous = NORMAL;');
    }
    this.initSchema();
  }

  private initSchema(): void {
    // Ejecutar migraciones versionadas e idempotentes
    const runner = new MigrationRunner(this.db);
    runner.run();

    // Inicializar distritos si la tabla está vacía
    const countDistricts = (this.db.prepare('SELECT COUNT(*) as count FROM districts').get() as any)?.count || 0;
    if (countDistricts === 0) {
      const insertDist = this.db.prepare(
        'INSERT INTO districts (id, city, district_name, tension_level, inquisitorial_alert, convergence_index) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const initialDistricts = [
        ['DIST_CHERWOOD', 'Backlund', 'Distrito de Cherwood (Clase Media & Detectives)', 15, 10, 5],
        ['DIST_EAST_BOROUGH', 'Backlund', 'Barrio Este (Bajos Fondos & Pobreza)', 45, 25, 20],
        ['DIST_QUEEN', 'Backlund', 'Distrito de la Reina (Palacios & Aristocracia)', 10, 40, 5],
        ['DIST_BRIDGE', 'Backlund', 'Área del Puente de Backlund (Comercio & Niebla)', 30, 15, 15],
        ['DIST_BAYAM', 'Bayam', 'Ciudad de Bayam (Puerto & Piratería Colonial)', 50, 35, 30]
      ];
      initialDistricts.forEach(d => insertDist.run(...d));
    }
  }

  public getRawDb(): DatabaseSync {
    return this.db;
  }

  private inTransaction: boolean = false;
  private savepointCounter: number = 0;

  /**
   * Ejecuta una operación atómica dentro de una transacción SQLite.
   * Si ocurre un error, revierte los cambios automáticamente (ROLLBACK).
   */
  public transaction<T>(fn: () => T): T {
    if (this.inTransaction) {
      const sp = `sp_${++this.savepointCounter}`;
      this.db.exec(`SAVEPOINT ${sp}`);
      try {
        const res = fn();
        this.db.exec(`RELEASE ${sp}`);
        return res;
      } catch (err) {
        this.db.exec(`ROLLBACK TO ${sp}`);
        throw err;
      }
    } else {
      this.inTransaction = true;
      this.db.exec('BEGIN IMMEDIATE');
      try {
        const res = fn();
        this.db.exec('COMMIT');
        return res;
      } catch (err) {
        try {
          this.db.exec('ROLLBACK');
        } catch {}
        throw err;
      } finally {
        this.inTransaction = false;
      }
    }
  }

  /**
   * Genera un identificador secuencial y monótono persistido en SQLite (F07).
   * Sobrevive a reinicios del proceso y llamadas a setDeterministicSeed.
   */
  public nextId(prefix: string): string {
    const row = this.db.prepare(`
      INSERT INTO entity_sequences (prefix, last_val, updated_at)
      VALUES (?, 1, datetime('now'))
      ON CONFLICT(prefix) DO UPDATE SET last_val = entity_sequences.last_val + 1, updated_at = datetime('now')
      RETURNING last_val
    `).get(prefix) as { last_val: number } | undefined;

    const val = row?.last_val ?? 1;
    const hash = Math.abs((val * 2654435761) ^ 13530101).toString(36);
    return `${prefix}_${hash}_${val}`;
  }

  public getCommandReceipt(commandId: string): {
    commandId: string;
    characterId: string;
    commandType: string;
    payloadHash: string;
    response: any;
    createdAt: string;
  } | null {
    const row = this.db.prepare('SELECT * FROM command_receipts WHERE command_id = ?').get(commandId) as any;
    if (!row) return null;
    return {
      commandId: row.command_id,
      characterId: row.character_id,
      commandType: row.command_type,
      payloadHash: row.payload_hash,
      response: JSON.parse(row.response_json),
      createdAt: row.created_at
    };
  }

  public saveCommandReceipt(receipt: {
    commandId: string;
    characterId: string;
    commandType: string;
    payloadHash: string;
    response: any;
  }): void {
    this.db.prepare(`
      INSERT INTO command_receipts (command_id, character_id, command_type, payload_hash, response_json, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(command_id) DO UPDATE SET response_json = excluded.response_json
    `).run(
      receipt.commandId,
      receipt.characterId,
      receipt.commandType,
      receipt.payloadHash,
      JSON.stringify(receipt.response)
    );
  }

  // --- MÉTODOS DE PERSONAJE ---
  public createCharacter(char: Omit<CharacterRow, 'created_at' | 'updated_at'>): CharacterRow {
    const stmt = this.db.prepare(`
      INSERT INTO characters (
        id, name, pathway, sequence, current_health, max_health,
        current_spirituality, max_spirituality, sanity, corruption,
        digestion_progress, raw_pence, current_location, current_day,
        ruina, terminal_state, rent_debt_active, rent_debt_amount, rent_debt_note,
        origin_id, current_slot, work_attendance_weekly, consecutive_work_missed,
        prologue_step, prologue_data_json, salary_pence, employer_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      char.id, char.name, char.pathway, char.sequence,
      char.current_health, char.max_health,
      char.current_spirituality, char.max_spirituality,
      char.sanity, char.corruption,
      char.digestion_progress ?? 0, char.raw_pence ?? 0,
      char.current_location ?? 'Backlund - Cherwood', char.current_day ?? 1,
      char.ruina ?? 0,
      char.terminal_state ?? null,
      char.rent_debt_active ?? 0,
      char.rent_debt_amount ?? 0,
      char.rent_debt_note ?? null,
      char.origin_id ?? null,
      char.current_slot ?? 0,
      char.work_attendance_weekly ?? 0,
      char.consecutive_work_missed ?? 0,
      char.prologue_step ?? 'COMPLETED',
      char.prologue_data_json ?? '{}',
      char.salary_pence ?? 240,
      char.employer_name ?? ''
    );

    return this.getCharacter(char.id)!;
  }

  public getCharacter(id: string): CharacterRow | null {
    const row = this.db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    return (row as unknown as CharacterRow) || null;
  }

  public updateCharacterSomatics(id: string, updates: {
    health?: number;
    spirituality?: number;
    sanity?: number;
    corruption?: number;
    digestion?: number;
    sequence?: number;
    ruina?: number;
    terminal_state?: string | null;
  }): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.health !== undefined) { fields.push('current_health = ?'); values.push(updates.health); }
    if (updates.spirituality !== undefined) { fields.push('current_spirituality = ?'); values.push(updates.spirituality); }
    if (updates.sanity !== undefined) { fields.push('sanity = ?'); values.push(updates.sanity); }
    if (updates.corruption !== undefined) { fields.push('corruption = ?'); values.push(updates.corruption); }
    if (updates.digestion !== undefined) { fields.push('digestion_progress = ?'); values.push(updates.digestion); }
    if (updates.sequence !== undefined) { fields.push('sequence = ?'); values.push(updates.sequence); }
    if (updates.ruina !== undefined) { fields.push('ruina = ?'); values.push(updates.ruina); }
    if (updates.terminal_state !== undefined) { fields.push('terminal_state = ?'); values.push(updates.terminal_state); }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const sql = `UPDATE characters SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);
  }

  /**
   * Incrementa la ruina de forma estrictamente monótona (acumulador permanente, jamás baja).
   */
  public updateCharacterRuina(id: string, ruinaDelta: number): number {
    this.db.prepare(`
      UPDATE characters 
      SET ruina = MAX(ruina, ruina + ?), updated_at = datetime('now') 
      WHERE id = ?
    `).run(ruinaDelta, id);
    const row = this.db.prepare('SELECT ruina FROM characters WHERE id = ?').get(id) as any;
    return row?.ruina ?? 0;
  }

  public setTerminalState(id: string, terminalState: string): void {
    this.db.prepare(`
      UPDATE characters
      SET terminal_state = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(terminalState, id);
  }

  public updateCharacterWealth(id: string, penceDelta: number): number {
    this.db.prepare('UPDATE characters SET raw_pence = MAX(0, raw_pence + ?), updated_at = datetime(\'now\') WHERE id = ?').run(penceDelta, id);
    const row = this.db.prepare('SELECT raw_pence FROM characters WHERE id = ?').get(id) as any;
    return row?.raw_pence ?? 0;
  }

  public advanceCharacterDay(id: string, days: number = 1): number {
    this.db.prepare('UPDATE characters SET current_day = current_day + ?, updated_at = datetime(\'now\') WHERE id = ?').run(days, id);
    const row = this.db.prepare('SELECT current_day FROM characters WHERE id = ?').get(id) as any;
    return row?.current_day ?? 1;
  }

  // --- MÉTODOS DE PERSONAS (DOBLE VIDA) ---
  public createPersona(persona: Omit<PersonaRow, 'created_at'>): PersonaRow {
    const stmt = this.db.prepare(`
      INSERT INTO personas (
        id, character_id, legal_name, profession, social_class,
        district, police_suspicion, church_suspicion, human_anchors,
        is_active, is_compromised
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      persona.id, persona.character_id, persona.legal_name, persona.profession,
      persona.social_class, persona.district, persona.police_suspicion,
      persona.church_suspicion, persona.human_anchors,
      persona.is_active, persona.is_compromised
    );

    return persona as PersonaRow;
  }

  public getActivePersona(characterId: string): PersonaRow | null {
    const row = this.db.prepare('SELECT * FROM personas WHERE character_id = ? AND is_active = 1 LIMIT 1').get(characterId);
    return (row as unknown as PersonaRow) || null;
  }

  public updatePersonaSuspicion(personaId: string, policeDelta: number, churchDelta: number): void {
    this.db.prepare(`
      UPDATE personas 
      SET police_suspicion = MIN(100, MAX(0, police_suspicion + ?)),
          church_suspicion = MIN(100, MAX(0, church_suspicion + ?))
      WHERE id = ?
    `).run(policeDelta, churchDelta, personaId);
  }

  // --- ANCLAS ---
  public addAnchor(anchor: Omit<AnchorRow, 'created_at'>): void {
    const mapCategory = (t: string) => {
      if (['FAMILY', 'CIVILIAN_ROUTINE', 'DIARY', 'BELIEF', 'BOND'].includes(t)) return t;
      if (t === 'PERSON') return 'BOND';
      if (t === 'CONVICTION') return 'BELIEF';
      return 'CIVILIAN_ROUTINE';
    };
    const cat = mapCategory(anchor.category || anchor.type || 'CIVILIAN_ROUTINE');
    const tipologyType = anchor.type || anchor.category || 'ROUTINE';

    this.db.prepare(`
      INSERT INTO anchors (id, character_id, title, strength, category, type, name, description, damage_count, is_destroyed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      anchor.id,
      anchor.character_id,
      anchor.title || anchor.name || 'Ancla',
      anchor.strength,
      cat,
      tipologyType,
      anchor.name || anchor.title || 'Ancla',
      anchor.description || '',
      anchor.damage_count ?? 0,
      anchor.is_destroyed ?? 0
    );
  }

  public getAnchors(characterId: string): AnchorRow[] {
    return (this.db.prepare('SELECT * FROM anchors WHERE character_id = ? ORDER BY created_at ASC').all(characterId) as unknown[]) as AnchorRow[];
  }

  public getActiveAnchors(characterId: string): AnchorRow[] {
    return (this.db.prepare('SELECT * FROM anchors WHERE character_id = ? AND is_destroyed = 0 ORDER BY strength DESC').all(characterId) as unknown[]) as AnchorRow[];
  }

  public damageAnchor(anchorId: string, damage: number): { anchor: AnchorRow; destroyed: boolean } {
    const existing = this.db.prepare('SELECT * FROM anchors WHERE id = ?').get(anchorId) as unknown as AnchorRow;
    if (!existing) throw new Error(`Ancla no encontrada: ${anchorId}`);
    const newStrength = Math.max(0, existing.strength - damage);
    const newDamageCount = (existing.damage_count || 0) + 1;
    const isDestroyed = newStrength === 0 ? 1 : 0;
    this.db.prepare(`
      UPDATE anchors 
      SET strength = ?, damage_count = ?, is_destroyed = ?
      WHERE id = ?
    `).run(newStrength, newDamageCount, isDestroyed, anchorId);
    const updated = this.db.prepare('SELECT * FROM anchors WHERE id = ?').get(anchorId) as unknown as AnchorRow;
    return { anchor: updated, destroyed: isDestroyed === 1 };
  }

  public repairAnchor(anchorId: string, amount: number): AnchorRow {
    this.db.prepare(`
      UPDATE anchors 
      SET strength = MIN(100, strength + ?)
      WHERE id = ? AND is_destroyed = 0
    `).run(amount, anchorId);
    return this.db.prepare('SELECT * FROM anchors WHERE id = ?').get(anchorId) as unknown as AnchorRow;
  }

  public getTotalAnchorStrength(characterId: string): number {
    const rows = this.getActiveAnchors(characterId);
    if (rows.length === 0) return 10; // Piso mínimo cuando todo está destruido o ausente
    const total = rows.reduce((sum, a) => sum + a.strength, 0);
    return Math.min(100, Math.floor((total / rows.length) * 1.5));
  }

  // --- CICATRICES (SCARS) ---
  public addScar(scar: {
    id: string;
    character_id?: string;
    characterId?: string;
    scar_code?: string;
    scarCode?: string;
    name: string;
    narrative: string;
    origin_anchor_id?: string | null;
    originAnchorId?: string | null;
    is_severe?: boolean;
    isSevere?: boolean;
    mechanics: any[];
  }): void {
    const charId = scar.character_id || scar.characterId || '';
    const code = scar.scar_code || scar.scarCode || '';
    const origin = scar.origin_anchor_id ?? scar.originAnchorId ?? null;
    const severe = (scar.is_severe ?? scar.isSevere) ? 1 : 0;

    this.db.prepare(`
      INSERT INTO character_scars (id, character_id, scar_code, name, narrative, origin_anchor_id, is_severe, mechanics_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      scar.id,
      charId,
      code,
      scar.name,
      scar.narrative,
      origin,
      severe,
      JSON.stringify(scar.mechanics || [])
    );
  }

  public getScars(characterId: string): any[] {
    const rows = this.db.prepare('SELECT * FROM character_scars WHERE character_id = ? ORDER BY created_at ASC').all(characterId) as unknown as CharacterScarRow[];
    return rows.map(r => ({
      id: r.id,
      characterId: r.character_id,
      scarCode: r.scar_code,
      name: r.name,
      narrative: r.narrative,
      originAnchorId: r.origin_anchor_id || undefined,
      isSevere: r.is_severe === 1,
      mechanics: JSON.parse(r.mechanics_json || '[]'),
      createdAt: r.created_at
    }));
  }

  // --- REGISTRO DE COMPRAS DE SUSURROS [S] ---
  public recordWhisperPurchase(record: {
    id: string;
    character_id: string;
    dilemma_id: string;
    choice_id: string;
    price_paid: any;
    advantage_granted: any;
    day: number;
  }): void {
    this.db.prepare(`
      INSERT INTO somatics_whisper_purchases (id, character_id, dilemma_id, choice_id, price_paid_json, advantage_granted_json, day)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id,
      record.character_id,
      record.dilemma_id,
      record.choice_id,
      JSON.stringify(record.price_paid),
      JSON.stringify(record.advantage_granted),
      record.day
    );
  }

  public getWhisperPurchases(characterId: string): any[] {
    const rows = this.db.prepare('SELECT * FROM somatics_whisper_purchases WHERE character_id = ? ORDER BY created_at ASC').all(characterId) as any[];
    return rows.map(r => ({
      id: r.id,
      characterId: r.character_id,
      dilemmaId: r.dilemma_id,
      choiceId: r.choice_id,
      pricePaid: JSON.parse(r.price_paid_json),
      advantageGranted: JSON.parse(r.advantage_granted_json),
      day: r.day,
      createdAt: r.created_at
    }));
  }

  // --- EVENTOS DE RAMPAGE ---
  public recordRampageEvent(event: {
    id: string;
    character_id: string;
    trigger_reason: string;
    start_day: number;
    end_day: number;
    hours_skipped: number;
    damaged_anchor_id?: string | null;
    district_impact: any;
    case_impact: any;
    reconstruction_dossier: any;
    wake_narrative: string;
  }): void {
    this.db.prepare(`
      INSERT INTO rampage_events (id, character_id, trigger_reason, start_day, end_day, hours_skipped, damaged_anchor_id, district_impact_json, case_impact_json, reconstruction_dossier_json, wake_narrative)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.character_id,
      event.trigger_reason,
      event.start_day,
      event.end_day,
      event.hours_skipped,
      event.damaged_anchor_id ?? null,
      JSON.stringify(event.district_impact),
      JSON.stringify(event.case_impact),
      JSON.stringify(event.reconstruction_dossier),
      event.wake_narrative
    );
  }

  public getRampageEvents(characterId: string): any[] {
    const rows = this.db.prepare('SELECT * FROM rampage_events WHERE character_id = ? ORDER BY created_at DESC').all(characterId) as any[];
    return rows.map(r => ({
      id: r.id,
      characterId: r.character_id,
      triggerReason: r.trigger_reason,
      startDay: r.start_day,
      endDay: r.end_day,
      hoursSkipped: r.hours_skipped,
      damagedAnchorId: r.damaged_anchor_id,
      districtImpact: JSON.parse(r.district_impact_json),
      caseImpact: JSON.parse(r.case_impact_json),
      reconstructionDossier: JSON.parse(r.reconstruction_dossier_json),
      wakeNarrative: r.wake_narrative,
      createdAt: r.created_at
    }));
  }

  // --- INVENTARIO ---
  public addItem(item: Omit<InventoryItemRow, 'created_at'>): void {
    const qly = item.quality ?? 'PRISTINE';
    const existing = this.db.prepare('SELECT id, quantity FROM inventory_items WHERE character_id = ? AND item_code = ? AND quality = ?').get(item.character_id, item.item_code, qly) as any;
    if (existing) {
      this.db.prepare('UPDATE inventory_items SET quantity = quantity + ? WHERE id = ?').run(item.quantity, existing.id);
    } else {
      this.db.prepare(`
        INSERT INTO inventory_items (id, character_id, item_code, name, category, grade, quantity, quality, metadata_json, is_equipped)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(item.id, item.character_id, item.item_code, item.name, item.category, item.grade, item.quantity, qly, item.metadata_json, item.is_equipped);
    }
  }

  public getInventory(characterId: string): InventoryItemRow[] {
    return (this.db.prepare('SELECT * FROM inventory_items WHERE character_id = ?').all(characterId) as unknown[]) as InventoryItemRow[];
  }

  // --- ACTING LOG & WEEKLY STATE ---
  public logActing(record: {
    id: string;
    character_id: string;
    pathway: string;
    sequence: number;
    dilemma_id: string;
    choice_id: string;
    digestion_gained: number;
    sanity_delta: number;
    day: number;
    narrative_log: string;
    alignment?: number;
    acting_weight?: number;
    decay_applied?: number;
  }): void {
    this.db.prepare(`
      INSERT INTO acting_records (id, character_id, pathway, sequence, dilemma_id, choice_id, digestion_gained, sanity_delta, day, narrative_log, alignment, acting_weight, decay_applied)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id, record.character_id, record.pathway, record.sequence,
      record.dilemma_id, record.choice_id, record.digestion_gained,
      record.sanity_delta, record.day, record.narrative_log,
      record.alignment ?? 0, record.acting_weight ?? 1.0, record.decay_applied ?? 1.0
    );
  }

  public getActingRecords(characterId: string): any[] {
    return this.db.prepare('SELECT * FROM acting_records WHERE character_id = ? ORDER BY day ASC, created_at ASC').all(characterId) as any[];
  }

  public saveActingWeeklyState(state: ActingWeeklyStateRow): void {
    const existing = this.db.prepare('SELECT character_id FROM acting_weekly_states WHERE character_id = ?').get(state.character_id);
    if (existing) {
      this.db.prepare(`
        UPDATE acting_weekly_states
        SET current_week = ?, coherence = ?, variety_penalty = ?, instability_flag = ?, loss_of_self_risk_flag = ?, weekly_records_json = ?, history_json = ?, updated_at = datetime('now')
        WHERE character_id = ?
      `).run(
        state.current_week, state.coherence, state.variety_penalty,
        state.instability_flag, state.loss_of_self_risk_flag,
        state.weekly_records_json, state.history_json, state.character_id
      );
    } else {
      this.db.prepare(`
        INSERT INTO acting_weekly_states (character_id, current_week, coherence, variety_penalty, instability_flag, loss_of_self_risk_flag, weekly_records_json, history_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        state.character_id, state.current_week, state.coherence, state.variety_penalty,
        state.instability_flag, state.loss_of_self_risk_flag,
        state.weekly_records_json, state.history_json
      );
    }
  }

  public getActingWeeklyState(characterId: string): ActingWeeklyStateRow | null {
    const row = this.db.prepare('SELECT * FROM acting_weekly_states WHERE character_id = ?').get(characterId);
    return (row as unknown as ActingWeeklyStateRow) || null;
  }

  public recordTransgression(characterId: string, week: number): number {
    const weeklyState = this.getActingWeeklyState(characterId);
    let history: any = {};
    if (weeklyState && weeklyState.history_json) {
      try {
        history = JSON.parse(weeklyState.history_json);
      } catch {}
    }
    if (!history.transgressions_by_week) {
      history.transgressions_by_week = {};
    }
    const currentTransgressions = (history.transgressions_by_week[week] || 0) + 1;
    history.transgressions_by_week[week] = currentTransgressions;

    this.saveActingWeeklyState({
      character_id: characterId,
      current_week: weeklyState?.current_week ?? week,
      coherence: weeklyState?.coherence ?? 0,
      variety_penalty: weeklyState?.variety_penalty ?? 0,
      instability_flag: weeklyState?.instability_flag ?? 0,
      loss_of_self_risk_flag: weeklyState?.loss_of_self_risk_flag ?? 0,
      weekly_records_json: weeklyState?.weekly_records_json ?? '[]',
      history_json: JSON.stringify(history)
    });

    return currentTransgressions;
  }

  public recordWeeklyCoherenceSnapshot(characterId: string, week: number, coherence: number): void {
    const weeklyState = this.getActingWeeklyState(characterId);
    let history: any = {};
    if (weeklyState && weeklyState.history_json) {
      try {
        history = JSON.parse(weeklyState.history_json);
      } catch {}
    }
    if (!history.past_coherences) {
      history.past_coherences = [];
    }
    history.past_coherences.push(coherence);

    this.saveActingWeeklyState({
      character_id: characterId,
      current_week: week,
      coherence,
      variety_penalty: weeklyState?.variety_penalty ?? 0,
      instability_flag: weeklyState?.instability_flag ?? 0,
      loss_of_self_risk_flag: weeklyState?.loss_of_self_risk_flag ?? 0,
      weekly_records_json: weeklyState?.weekly_records_json ?? '[]',
      history_json: JSON.stringify(history)
    });
  }

  // --- DISTRITOS Y CONVERGENCIA ---
  public getDistricts(): any[] {
    return this.db.prepare('SELECT * FROM districts').all();
  }

  public getDistrict(districtId: string): any {
    return this.db.prepare(`
      SELECT * FROM districts 
      WHERE LOWER(id) = LOWER(?) OR id = ? OR LOWER(district_name) LIKE ?
      LIMIT 1
    `).get(districtId, districtId, `%${districtId.toLowerCase()}%`);
  }

  public updateDistrictConvergence(districtId: string, delta: number, day?: number): number {
    let d = this.getDistrict(districtId);
    if (!d) {
      this.db.prepare(`
        INSERT INTO districts (id, city, district_name, tension_level, inquisitorial_alert, convergence_index, last_incident_day)
        VALUES (?, 'Backlund', ?, 15, 10, 0, 0)
      `).run(districtId, districtId);
      d = this.getDistrict(districtId);
    }
    const current = d ? (d.convergence_index ?? 0) : 0;
    const nextVal = Math.max(0, Math.min(100, current + delta));
    if (d) {
      if (day !== undefined && delta > 0) {
        this.db.prepare('UPDATE districts SET convergence_index = ?, last_incident_day = ? WHERE id = ?').run(nextVal, day, d.id);
      } else {
        this.db.prepare('UPDATE districts SET convergence_index = ? WHERE id = ?').run(nextVal, d.id);
      }
    }
    return nextVal;
  }

  public logConvergenceEvent(event: {
    id: string;
    character_id: string;
    district_id: string;
    event_type: 'PUBLIC_COMBAT' | 'ASCENSION' | 'ECCLESIASTICAL_DILEMMA' | 'WHISPER_PURCHASE' | 'DECAY';
    index_delta: number;
    resulting_index: number;
    day: number;
  }): void {
    this.db.prepare(`
      INSERT INTO convergence_events (id, character_id, district_id, event_type, index_delta, resulting_index, day)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(event.id, event.character_id, event.district_id, event.event_type, event.index_delta, event.resulting_index, event.day);
  }

  public getPendingIncursion(characterId: string): any {
    return this.db.prepare('SELECT * FROM pending_incursions WHERE character_id = ? AND status = ?').get(characterId, 'PENDING');
  }

  public createPendingIncursion(inc: {
    id: string;
    character_id: string;
    district_id: string;
    squad_type?: string;
    church_suspicion_snapshot: number;
    day: number;
  }): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO pending_incursions (id, character_id, district_id, squad_type, church_suspicion_snapshot, status, day, updated_at)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?, datetime('now'))
    `).run(inc.id, inc.character_id, inc.district_id, inc.squad_type || 'NIGHTHAWKS_SQUAD', inc.church_suspicion_snapshot, inc.day);
  }

  public updateIncursionStatus(incursionId: string, status: 'PENDING' | 'ENGAGED' | 'RESOLVED' | 'FLED'): void {
    this.db.prepare('UPDATE pending_incursions SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, incursionId);
  }

  public clearPendingIncursion(characterId: string): void {
    this.db.prepare('DELETE FROM pending_incursions WHERE character_id = ?').run(characterId);
  }

  // --- CASOS DE INVESTIGACIÓN ---
  public createInvestigationCase(c: {
    id: string;
    character_id: string;
    case_code: string;
    title: string;
    district: string;
    status: 'OPEN' | 'EVIDENCE_COLLECTED' | 'READY_FOR_DEDUCTION' | 'SOLVED' | 'FAILED' | 'COVERED_UP';
    culprit_name: string;
    verdict_action?: string;
    reward_pence: number;
    created_day: number;
  }): void {
    this.db.prepare(`
      INSERT INTO investigation_cases (id, character_id, case_code, title, district, status, culprit_name, verdict_action, reward_pence, created_day)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(c.id, c.character_id, c.case_code, c.title, c.district, c.status, c.culprit_name, c.verdict_action || null, c.reward_pence, c.created_day);
  }

  public getInvestigationCases(characterId: string): any[] {
    return this.db.prepare('SELECT * FROM investigation_cases WHERE character_id = ? ORDER BY created_day DESC').all(characterId);
  }

  public getCharacterCases(characterId: string): any[] {
    return this.getInvestigationCases(characterId);
  }

  public getInvestigationCase(caseId: string): any {
    return this.db.prepare('SELECT * FROM investigation_cases WHERE id = ?').get(caseId);
  }

  public updateCaseStatus(caseId: string, status: string, verdictAction?: string): void {
    this.db.prepare('UPDATE investigation_cases SET status = ?, verdict_action = ? WHERE id = ?')
      .run(status, verdictAction || null, caseId);
  }

  public addClue(clue: {
    id: string;
    case_id: string;
    clue_code: string;
    title: string;
    description: string;
    clue_type: 'FORENSIC' | 'SPIRITUAL' | 'TESTIMONY' | 'DOCUMENT';
    is_discovered: number;
  }): void {
    this.db.prepare(`
      INSERT INTO investigation_clues (id, case_id, clue_code, title, description, clue_type, is_discovered)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(clue.id, clue.case_id, clue.clue_code, clue.title, clue.description, clue.clue_type, clue.is_discovered);
  }

  public getCaseClues(caseId: string): any[] {
    return this.db.prepare('SELECT * FROM investigation_clues WHERE case_id = ?').all(caseId);
  }

  public discoverClue(clueId: string): void {
    this.db.prepare('UPDATE investigation_clues SET is_discovered = 1 WHERE id = ?').run(clueId);
  }

  // --- MÉTODOS DE INSTANCIAS DE CASO (Fase 1 · Brief-04) ---
  public saveCaseInstance(instance: {
    id: string;
    character_id: string;
    case_id: string;
    status: 'DORMANT' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
    state_json: string;
  }): void {
    const existing = this.db.prepare('SELECT id FROM investigation_case_instances WHERE id = ?').get(instance.id);
    if (existing) {
      this.db.prepare(`
        UPDATE investigation_case_instances
        SET status = ?, state_json = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(instance.status, instance.state_json, instance.id);
    } else {
      this.db.prepare(`
        INSERT INTO investigation_case_instances (id, character_id, case_id, status, state_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(instance.id, instance.character_id, instance.case_id, instance.status, instance.state_json);
    }
  }

  public getCaseInstance(id: string): any {
    return this.db.prepare('SELECT * FROM investigation_case_instances WHERE id = ?').get(id);
  }

  public getActiveCaseForCharacter(characterId: string, caseId?: string): any {
    if (caseId) {
      return this.db.prepare(`
        SELECT * FROM investigation_case_instances
        WHERE character_id = ? AND case_id = ? AND status = 'ACTIVE'
        ORDER BY updated_at DESC
        LIMIT 1
      `).get(characterId, caseId);
    }
    return this.db.prepare(`
      SELECT * FROM investigation_case_instances
      WHERE character_id = ? AND status = 'ACTIVE'
      ORDER BY updated_at DESC
      LIMIT 1
    `).get(characterId);
  }

  public getCharacterCaseInstances(characterId: string): any[] {
    return this.db.prepare(`
      SELECT * FROM investigation_case_instances
      WHERE character_id = ?
      ORDER BY updated_at DESC
    `).all(characterId);
  }

  // --- MÉTODOS DE BATALLA Y COMBATE ---
  public createBattle(characterId: string, state: any): BattleRow {
    const battleId = generateDeterministicId(`battle_${characterId}`);
    const stateJson = JSON.stringify(state);
    const stmt = this.db.prepare(`
      INSERT INTO battles (id, character_id, state_json, status, created_at, updated_at)
      VALUES (?, ?, ?, 'ONGOING', datetime('now'), datetime('now'))
    `);
    stmt.run(battleId, characterId, stateJson);
    return this.getBattleById(battleId)!;
  }

  public getActiveBattle(characterId: string): BattleRow | null {
    const row = this.db.prepare(`
      SELECT * FROM battles
      WHERE character_id = ? AND status = 'ONGOING'
      ORDER BY created_at DESC
      LIMIT 1
    `).get(characterId);
    return (row as unknown as BattleRow) || null;
  }

  public getBattleById(battleId: string): BattleRow | null {
    const row = this.db.prepare('SELECT * FROM battles WHERE id = ?').get(battleId);
    return (row as unknown as BattleRow) || null;
  }

  public updateBattle(battleId: string, state: any, status: 'ONGOING' | 'VICTORY' | 'DEFEAT' | 'FLED' = 'ONGOING'): void {
    const stateJson = JSON.stringify(state);
    this.db.prepare(`
      UPDATE battles
      SET state_json = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(stateJson, status, battleId);
  }

  public finishBattle(battleId: string, status: 'VICTORY' | 'DEFEAT' | 'FLED'): void {
    this.db.prepare(`
      UPDATE battles
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, battleId);
  }

  // --- MÉTODOS DE ECONOMÍA Y ALQUILER ---
  public updateCharacterRentDebt(characterId: string, active: boolean, amount: number, note?: string | null): void {
    this.db.prepare(`
      UPDATE characters
      SET rent_debt_active = ?, rent_debt_amount = ?, rent_debt_note = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(active ? 1 : 0, amount, note ?? null, characterId);
  }

  // --- MÉTODOS DE INVENTARIO CON CALIDAD ---
  public addInventoryItem(item: {
    id: string;
    character_id: string;
    item_code: string;
    name: string;
    category: string;
    grade?: number | null;
    quantity?: number;
    quality?: 'PRISTINE' | 'DAMAGED' | 'CONTAMINATED';
    metadata_json?: string;
    is_equipped?: number;
  }): InventoryItemRow {
    const qty = item.quantity ?? 1;
    const qly = item.quality ?? 'PRISTINE';
    const meta = item.metadata_json ?? '{}';
    const isEq = item.is_equipped ?? 0;
    const grade = item.grade ?? null;

    const existing = this.db.prepare(`
      SELECT * FROM inventory_items
      WHERE character_id = ? AND item_code = ? AND quality = ?
    `).get(item.character_id, item.item_code, qly) as InventoryItemRow | undefined;

    if (existing) {
      this.db.prepare(`
        UPDATE inventory_items
        SET quantity = quantity + ?
        WHERE id = ?
      `).run(qty, existing.id);
      return this.getInventoryItemById(existing.id)!;
    }

    this.db.prepare(`
      INSERT INTO inventory_items (
        id, character_id, item_code, name, category, grade, quantity, quality, metadata_json, is_equipped
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(item.id, item.character_id, item.item_code, item.name, item.category, grade, qty, qly, meta, isEq);

    return this.getInventoryItemById(item.id)!;
  }

  public getInventoryItemById(id: string): InventoryItemRow | null {
    const row = this.db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(id);
    return (row as unknown as InventoryItemRow) || null;
  }

  public getInventoryItems(characterId: string): InventoryItemRow[] {
    const rows = this.db.prepare('SELECT * FROM inventory_items WHERE character_id = ? ORDER BY category, name').all(characterId);
    return rows as unknown as InventoryItemRow[];
  }

  public removeInventoryItem(id: string, quantityToRemove: number = 1): void {
    const existing = this.getInventoryItemById(id);
    if (!existing) return;
    if (existing.quantity <= quantityToRemove) {
      this.db.prepare('DELETE FROM inventory_items WHERE id = ?').run(id);
    } else {
      this.db.prepare('UPDATE inventory_items SET quantity = quantity - ? WHERE id = ?').run(quantityToRemove, id);
    }
  }

  public consumeItemByCode(characterId: string, itemCode: string, quantity: number = 1): boolean {
    const existing = this.db.prepare(`
      SELECT * FROM inventory_items
      WHERE character_id = ? AND item_code = ? AND quantity >= ?
      ORDER BY quantity ASC LIMIT 1
    `).get(characterId, itemCode, quantity) as InventoryItemRow | undefined;

    if (!existing) {
      const items = this.db.prepare(`
        SELECT * FROM inventory_items
        WHERE character_id = ? AND item_code = ?
      `).all(characterId, itemCode) as unknown as InventoryItemRow[];
      const totalAvailable = items.reduce((acc, it) => acc + it.quantity, 0);
      if (totalAvailable < quantity) return false;

      let remaining = quantity;
      for (const it of items) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, it.quantity);
        this.removeInventoryItem(it.id, take);
        remaining -= take;
      }
      return true;
    }

    this.removeInventoryItem(existing.id, quantity);
    return true;
  }

  // --- MÉTODOS DE TRANSACCIONES DE MERCADO ---
  public logMarketTransaction(tx: {
    id: string;
    character_id: string;
    type: 'BUY' | 'SELL' | 'CURE';
    item_code?: string | null;
    quality?: string | null;
    pence_amount: number;
    day: number;
    description?: string;
  }): void {
    this.db.prepare(`
      INSERT INTO market_transactions (
        id, character_id, type, item_code, quality, pence_amount, day, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      tx.id,
      tx.character_id,
      tx.type,
      tx.item_code ?? null,
      tx.quality ?? null,
      tx.pence_amount,
      tx.day,
      tx.description ?? ''
    );
  }

  public getMarketTransactions(characterId: string): MarketTransactionRow[] {
    const rows = this.db.prepare('SELECT * FROM market_transactions WHERE character_id = ? ORDER BY created_at DESC').all(characterId);
    return rows as unknown as MarketTransactionRow[];
  }

  // --- MÉTODOS DE ASCENSO Y TELEMETRÍA ---
  public saveAscensionState(state: {
    character_id: string;
    current_step: 'CHECKLIST_IN_PROGRESS' | 'TRAGO_PRESENTED' | 'COMPLETED' | 'FAILED';
    presented_at?: number | null;
    checklist_json: string;
    formula_id?: string | null;
  }): void {
    this.db.prepare(`
      INSERT INTO ascension_state (
        character_id, current_step, presented_at, checklist_json, formula_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(character_id) DO UPDATE SET
        current_step = excluded.current_step,
        presented_at = excluded.presented_at,
        checklist_json = excluded.checklist_json,
        formula_id = excluded.formula_id,
        updated_at = datetime('now')
    `).run(
      state.character_id,
      state.current_step,
      state.presented_at ?? null,
      state.checklist_json,
      state.formula_id ?? null
    );
  }

  public getAscensionState(characterId: string): AscensionStateRow | null {
    const row = this.db.prepare('SELECT * FROM ascension_state WHERE character_id = ?').get(characterId);
    return (row as unknown as AscensionStateRow) || null;
  }

  public clearAscensionState(characterId: string): void {
    this.db.prepare('DELETE FROM ascension_state WHERE character_id = ?').run(characterId);
  }

  public logAscensionTelemetry(telemetry: {
    id: string;
    character_id: string;
    target_sequence: number;
    target_pathway: string;
    outcome: 'SUCCESS' | 'RAMPAGE';
    presented_at: number;
    confirmed_at: number;
    hesitation_ms: number;
    preparation_score: number;
    quality_average: string;
  }): void {
    this.db.prepare(`
      INSERT INTO ascension_telemetry (
        id, character_id, target_sequence, target_pathway, outcome,
        presented_at, confirmed_at, hesitation_ms, preparation_score, quality_average
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      telemetry.id,
      telemetry.character_id,
      telemetry.target_sequence,
      telemetry.target_pathway,
      telemetry.outcome,
      telemetry.presented_at,
      telemetry.confirmed_at,
      telemetry.hesitation_ms,
      telemetry.preparation_score,
      telemetry.quality_average
    );
  }

  public getAscensionTelemetry(characterId: string): AscensionTelemetryRow[] {
    const rows = this.db.prepare('SELECT * FROM ascension_telemetry WHERE character_id = ? ORDER BY created_at DESC').all(characterId);
    return rows as unknown as AscensionTelemetryRow[];
  }

  // --- MÉTODOS DE CALENDARIO Y TIEMPO DIARIO ---
  public advanceCharacterSlot(characterId: string, consumeSlots: number = 1): { day: number; slot: number; dayAdvanced: boolean } {
    const char = this.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);

    const currentSlot = char.current_slot ?? 0;
    const currentDay = char.current_day ?? 1;

    const totalSlots = currentSlot + consumeSlots;
    const newSlot = totalSlots % 4;
    const daysToAdd = Math.floor(totalSlots / 4);
    const newDay = currentDay + daysToAdd;
    const dayAdvanced = daysToAdd > 0;

    this.db.prepare(`
      UPDATE characters
      SET current_slot = ?, current_day = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newSlot, newDay, characterId);

    return { day: newDay, slot: newSlot, dayAdvanced };
  }

  public setCharacterSlot(characterId: string, day: number, slot: number): void {
    this.db.prepare(`
      UPDATE characters
      SET current_day = ?, current_slot = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(day, slot, characterId);
  }

  public updatePrologueState(characterId: string, step: string, dataJson?: string): void {
    if (dataJson !== undefined) {
      this.db.prepare(`
        UPDATE characters
        SET prologue_step = ?, prologue_data_json = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(step, dataJson, characterId);
    } else {
      this.db.prepare(`
        UPDATE characters
        SET prologue_step = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(step, characterId);
    }
  }

  public recordWorkAttendance(characterId: string): { totalWeekly: number; consecutiveMissed: number } {
    this.db.prepare(`
      UPDATE characters
      SET work_attendance_weekly = work_attendance_weekly + 1,
          consecutive_work_missed = 0,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(characterId);

    const row = this.db.prepare('SELECT work_attendance_weekly, consecutive_work_missed FROM characters WHERE id = ?').get(characterId) as any;
    return {
      totalWeekly: row?.work_attendance_weekly ?? 0,
      consecutiveMissed: row?.consecutive_work_missed ?? 0
    };
  }

  public resetWeeklyWorkAttendance(characterId: string): void {
    this.db.prepare(`
      UPDATE characters
      SET work_attendance_weekly = 0, updated_at = datetime('now')
      WHERE id = ?
    `).run(characterId);
  }

  public incrementConsecutiveWorkMissed(characterId: string): number {
    this.db.prepare(`
      UPDATE characters
      SET consecutive_work_missed = consecutive_work_missed + 1, updated_at = datetime('now')
      WHERE id = ?
    `).run(characterId);
    const row = this.db.prepare('SELECT consecutive_work_missed FROM characters WHERE id = ?').get(characterId) as any;
    return row?.consecutive_work_missed ?? 0;
  }

  public resetConsecutiveWorkMissed(characterId: string): void {
    this.db.prepare(`
      UPDATE characters
      SET consecutive_work_missed = 0, updated_at = datetime('now')
      WHERE id = ?
    `).run(characterId);
  }

  public addCalendarLog(log: Omit<CalendarLogRow, 'created_at'>): void {
    this.db.prepare(`
      INSERT INTO calendar_log (
        id, character_id, day, slot, event_type, subsystem, step_order, details_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      log.id, log.character_id, log.day, log.slot, log.event_type,
      log.subsystem, log.step_order ?? 0, log.details_json ?? log.detailsJson ?? '{}'
    );
  }

  public getCalendarLogs(characterId: string, limit: number = 100): CalendarLogRow[] {
    const rows = this.db.prepare('SELECT * FROM calendar_log WHERE character_id = ? ORDER BY day ASC, slot ASC, step_order ASC LIMIT ?').all(characterId, limit);
    return rows as unknown as CalendarLogRow[];
  }

  public addIdentityEventHistory(hist: Omit<IdentityEventHistoryRow, 'created_at'>): void {
    this.db.prepare(`
      INSERT INTO identity_event_history (
        id, character_id, event_id, event_category, chosen_option_index, day, slot, stat_outcome_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      hist.id, hist.character_id, hist.event_id, hist.event_category,
      hist.chosen_option_index, hist.day, hist.slot, hist.stat_outcome_json ?? '{}'
    );
  }

  public getIdentityEventHistory(characterId: string, limit: number = 50): IdentityEventHistoryRow[] {
    const rows = this.db.prepare('SELECT * FROM identity_event_history WHERE character_id = ? ORDER BY day DESC, slot DESC LIMIT ?').all(characterId, limit);
    return rows as unknown as IdentityEventHistoryRow[];
  }

  public close(): void {
    this.db.close();
  }
}
