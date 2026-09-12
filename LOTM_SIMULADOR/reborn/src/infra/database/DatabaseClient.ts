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
  created_at: string;
  updated_at: string;
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
  category: 'INGREDIENT' | 'CHARACTERISTIC' | 'POTION' | 'SEALED_ARTIFACT' | 'CONSUMABLE' | 'DOCUMENT' | 'WEAPON';
  grade: number | null;
  quantity: number;
  metadata_json: string;
  is_equipped: number;
  created_at: string;
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

  // --- MÉTODOS DE PERSONAJE ---
  public createCharacter(char: Omit<CharacterRow, 'created_at' | 'updated_at'>): CharacterRow {
    const stmt = this.db.prepare(`
      INSERT INTO characters (
        id, name, pathway, sequence, current_health, max_health,
        current_spirituality, max_spirituality, sanity, corruption,
        digestion_progress, raw_pence, current_location, current_day,
        ruina, terminal_state
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      char.id, char.name, char.pathway, char.sequence,
      char.current_health, char.max_health,
      char.current_spirituality, char.max_spirituality,
      char.sanity, char.corruption,
      char.digestion_progress, char.raw_pence,
      char.current_location, char.current_day,
      char.ruina ?? 0,
      char.terminal_state ?? null
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
    const existing = this.db.prepare('SELECT id, quantity FROM inventory_items WHERE character_id = ? AND item_code = ?').get(item.character_id, item.item_code) as any;
    if (existing) {
      this.db.prepare('UPDATE inventory_items SET quantity = quantity + ? WHERE id = ?').run(item.quantity, existing.id);
    } else {
      this.db.prepare(`
        INSERT INTO inventory_items (id, character_id, item_code, name, category, grade, quantity, metadata_json, is_equipped)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(item.id, item.character_id, item.item_code, item.name, item.category, item.grade, item.quantity, item.metadata_json, item.is_equipped);
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

  // --- DISTRITOS ---
  public getDistricts(): any[] {
    return this.db.prepare('SELECT * FROM districts').all();
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

  public close(): void {
    this.db.close();
  }
}
