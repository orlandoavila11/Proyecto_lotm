import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';

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
  category: 'FAMILY' | 'CIVILIAN_ROUTINE' | 'DIARY' | 'BELIEF' | 'BOND';
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
    this.initSchema();
  }

  private initSchema(): void {
    // Leer schema.sql relativo a este módulo
    const schemaPath = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1')), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      this.db.exec(schemaSql);
    } else {
      // Fallback si corre compilado
      const fallbackPath = path.resolve('src/infra/database/schema.sql');
      if (fs.existsSync(fallbackPath)) {
        this.db.exec(fs.readFileSync(fallbackPath, 'utf-8'));
      }
    }

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
        digestion_progress, raw_pence, current_location, current_day
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      char.id, char.name, char.pathway, char.sequence,
      char.current_health, char.max_health,
      char.current_spirituality, char.max_spirituality,
      char.sanity, char.corruption,
      char.digestion_progress, char.raw_pence,
      char.current_location, char.current_day
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
  }): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.health !== undefined) { fields.push('current_health = ?'); values.push(updates.health); }
    if (updates.spirituality !== undefined) { fields.push('current_spirituality = ?'); values.push(updates.spirituality); }
    if (updates.sanity !== undefined) { fields.push('sanity = ?'); values.push(updates.sanity); }
    if (updates.corruption !== undefined) { fields.push('corruption = ?'); values.push(updates.corruption); }
    if (updates.digestion !== undefined) { fields.push('digestion_progress = ?'); values.push(updates.digestion); }
    if (updates.sequence !== undefined) { fields.push('sequence = ?'); values.push(updates.sequence); }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const sql = `UPDATE characters SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);
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
    this.db.prepare(`
      INSERT INTO anchors (id, character_id, title, strength, category)
      VALUES (?, ?, ?, ?, ?)
    `).run(anchor.id, anchor.character_id, anchor.title, anchor.strength, anchor.category);
  }

  public getAnchors(characterId: string): AnchorRow[] {
    return (this.db.prepare('SELECT * FROM anchors WHERE character_id = ?').all(characterId) as unknown[]) as AnchorRow[];
  }

  public getTotalAnchorStrength(characterId: string): number {
    const rows = this.getAnchors(characterId);
    if (rows.length === 0) return 20; // Piso base de humanidad
    const total = rows.reduce((sum, a) => sum + a.strength, 0);
    return Math.min(100, Math.floor(total / rows.length * 1.5));
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

  // --- ACTING LOG ---
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
  }): void {
    this.db.prepare(`
      INSERT INTO acting_records (id, character_id, pathway, sequence, dilemma_id, choice_id, digestion_gained, sanity_delta, day, narrative_log)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id, record.character_id, record.pathway, record.sequence,
      record.dilemma_id, record.choice_id, record.digestion_gained,
      record.sanity_delta, record.day, record.narrative_log
    );
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

  public close(): void {
    this.db.close();
  }
}
