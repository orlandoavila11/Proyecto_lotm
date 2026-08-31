import * as fs from 'fs';
import * as path from 'path';
import { 
  SequenceData, 
  MonsterData, 
  SealedArtifactData, 
  QuestData, 
  TarotMemberData, 
  WorldEventData 
} from './types';

export class DatabaseManager {
  private static instance: DatabaseManager;

  private sequencesData: Map<string, Map<number, SequenceData>> = new Map();
  private monstersData: MonsterData[] = [];
  private artifactsData: SealedArtifactData[] = [];
  private questsData: Map<number, QuestData[]> = new Map();
  private tarotMembersData: TarotMemberData[] = [];
  private eventsData: Map<number, WorldEventData[]> = new Map();
  private worldData: Map<string, any> = new Map(); 

  private isInitialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public initialize(basePath: string = path.join(__dirname, '..')): void {
    if (this.isInitialized) return;

    this.loadMonsters(basePath);
    this.loadArtifacts(basePath);
    this.loadQuests(basePath);
    this.loadTarotMembers(basePath);
    this.loadEvents(basePath);
    this.loadSequences(basePath);
    this.loadWorldData(basePath);

    this.isInitialized = true;
  }

  private safeReadJson(filePath: string): any {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const rawData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error(`[DatabaseManager] Error al leer/parsear ${filePath}:`, error);
      return null;
    }
  }

  private loadMonsters(basePath: string): void {
    // Escanea las carpetas 'src/npc' y 'src/monsters' de manera dinámica
    const targetDirs = [
      path.join(basePath, 'npc'),
      path.join(basePath, 'monsters')
    ];

    targetDirs.forEach(dirPath => {
      if (!fs.existsSync(dirPath)) return;

      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isFile()) {
          const json = this.safeReadJson(fullPath);
          if (json) {
            let list: MonsterData[] = [];

            if (Array.isArray(json)) {
              list = json;
            } else if (json.monsters && Array.isArray(json.monsters)) {
              list = json.monsters;
            } else if (json.low_level_monsters && Array.isArray(json.low_level_monsters)) {
              list = json.low_level_monsters;
            } else if (json.elite_monsters && Array.isArray(json.elite_monsters)) {
              list = json.elite_monsters;
            } else if (typeof json === 'object') {
              Object.keys(json).forEach(key => {
                if (Array.isArray(json[key])) {
                  list.push(...json[key]);
                }
              });
            }

            list.forEach((m: MonsterData) => {
              if (m && (m.id || m.name)) {
                if (!this.monstersData.some(e => (e.id && m.id && e.id === m.id) || (e.name && m.name && e.name === m.name))) {
                  this.monstersData.push(m);
                }
              }
            });
          }
        }
      });
    });

    // Fallback por si existe un archivo único 'monsters.json' en la raíz de src
    const singleFile = path.join(basePath, 'monsters.json');
    if (fs.existsSync(singleFile)) {
      const json = this.safeReadJson(singleFile);
      if (json) {
        const list: MonsterData[] = Array.isArray(json) ? json : (json.monsters || []);
        list.forEach((m: MonsterData) => {
          if (m && (m.id || m.name)) {
            if (!this.monstersData.some(e => (e.id && m.id && e.id === m.id) || (e.name && m.name && e.name === m.name))) {
              this.monstersData.push(m);
            }
          }
        });
      }
    }
  }

  private loadArtifacts(basePath: string): void {
    const artifactsDir = path.join(basePath, 'artifacts');
    if (!fs.existsSync(artifactsDir)) return;

    const files = fs.readdirSync(artifactsDir).filter(f => f.endsWith('.json') && !f.includes('index'));
    
    files.forEach(file => {
      const item = this.safeReadJson(path.join(artifactsDir, file));
      if (item) {
        if (Array.isArray(item)) {
          this.artifactsData.push(...item);
        } else if (item.sealedArtifacts) {
          this.artifactsData.push(...item.sealedArtifacts);
        } else {
          this.artifactsData.push(item);
        }
      }
    });
  }

  private loadQuests(basePath: string): void {
    const questsDir = path.join(basePath, 'quests');
    if (!fs.existsSync(questsDir)) return;

    for (let seq = 0; seq <= 9; seq++) {
      const seqPath = path.join(questsDir, `sequence_${seq}_quests.json`);
      const seqJson = this.safeReadJson(seqPath);
      
      if (seqJson) {
        const questList: QuestData[] = Array.isArray(seqJson) ? seqJson : (seqJson.quests || []);
        const existing = this.questsData.get(seq) || [];
        
        questList.forEach((q: QuestData) => {
          if (!existing.some(e => e.id === q.id)) {
            existing.push(q);
          }
        });
        this.questsData.set(seq, existing);
      }
    }

    const globalPath = path.join(questsDir, 'quests.json');
    const json = this.safeReadJson(globalPath);
    if (json) {
      const globalList: QuestData[] = Array.isArray(json) ? json : (json.quests || []);
      globalList.forEach((quest: QuestData) => {
        const seq = quest.sequence !== undefined ? quest.sequence : 9;
        const existing = this.questsData.get(seq) || [];
        existing.push(quest);
        this.questsData.set(seq, existing);
      });
    }
  }

  private loadTarotMembers(basePath: string): void {
    let filePath = path.join(basePath, 'character', 'tarot_members.json');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(basePath, 'tarot_members.json');
    }

    const json = this.safeReadJson(filePath);
    if (json) {
      this.tarotMembersData = Array.isArray(json) ? json : (json.members || json.tarotMembers || []);
    }
  }

  private loadEvents(basePath: string): void {
    const filePath = path.join(basePath, 'events', 'events.json');
    const json = this.safeReadJson(filePath);

    if (!json) return;

    if (json.events && typeof json.events === 'object' && !Array.isArray(json.events)) {
      for (let seq = 0; seq <= 9; seq++) {
        const key = `sequence${seq}`;
        if (Array.isArray(json.events[key])) {
          const existing = this.eventsData.get(seq) || [];
          existing.push(...json.events[key]);
          this.eventsData.set(seq, existing);
        }
      }
    } else {
      const eventsArray = Array.isArray(json) ? json : (Array.isArray(json.events) ? json.events : []);
      eventsArray.forEach((evt: any) => {
        const seq = evt.sequenceNumber !== undefined ? evt.sequenceNumber :
                    (evt.sequence !== undefined ? evt.sequence : 
                    (evt.minSequence !== undefined ? evt.minSequence : 9));
                    
        const existing = this.eventsData.get(seq) || [];
        existing.push(evt);
        this.eventsData.set(seq, existing);
      });
    }
  }

  private loadSequences(basePath: string): void {
    const pathwaysDir = path.join(basePath, 'pathways');
    if (!fs.existsSync(pathwaysDir)) return;

    const files = fs.readdirSync(pathwaysDir).filter(f => f.endsWith('.json'));
    
    files.forEach(file => {
      const json = this.safeReadJson(path.join(pathwaysDir, file));
      if (!json) return;

      const pathwayName = (json.pathway || file.replace('.json', '')).toUpperCase();
      const seqMap = new Map<number, SequenceData>();
      
      if (json.sequences) {
        if (Array.isArray(json.sequences)) {
          json.sequences.forEach((seq: SequenceData) => {
            if (seq.sequenceNumber !== undefined) seqMap.set(seq.sequenceNumber, seq);
          });
        } else if (typeof json.sequences === 'object') {
          for (const key in json.sequences) {
            const seqData = json.sequences[key];
            const seqNum = seqData.sequenceNumber !== undefined ? seqData.sequenceNumber : Number(key);
            seqMap.set(seqNum, seqData);
          }
        }
      } else if (Array.isArray(json)) {
        json.forEach((seq: SequenceData) => {
          if (seq.sequenceNumber !== undefined) seqMap.set(seq.sequenceNumber, seq);
        });
      } else {
        if (json.sequenceNumber !== undefined) {
          seqMap.set(json.sequenceNumber, json);
        }
      }

      this.sequencesData.set(pathwayName, seqMap);
    });
  }

  private loadWorldData(basePath: string): void {
    const worldDir = path.join(basePath, 'world');
    if (!fs.existsSync(worldDir)) return;

    const files = fs.readdirSync(worldDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const key = file.replace('.json', '');
      const data = this.safeReadJson(path.join(worldDir, file));
      if (data) {
        this.worldData.set(key, data);
      }
    });
  }

  public getSequenceData(pathwayName: string, sequenceNumber: number): SequenceData | null {
    const pathwayMap = this.sequencesData.get(pathwayName.toUpperCase());
    if (!pathwayMap) return null;
    return pathwayMap.get(sequenceNumber) || null;
  }

  public getMonstersByLocation(locationName: string): MonsterData[] {
    return this.monstersData.filter(m => 
      m.locations && m.locations.some((loc: string) => loc.toLowerCase() === locationName.toLowerCase())
    );
  }

  public getAllMonsters(): MonsterData[] {
    return this.monstersData;
  }

  public getSealedArtifactById(id: string): SealedArtifactData | null {
    return this.artifactsData.find(a => a.id === id) || null;
  }

  public getAllSealedArtifacts(): SealedArtifactData[] {
    return this.artifactsData;
  }

  public getQuestsBySequence(sequenceNumber: number): QuestData[] {
    return this.questsData.get(sequenceNumber) || [];
  }

  public getAllQuests(): QuestData[] {
    const allQuests: QuestData[] = [];
    this.questsData.forEach(list => allQuests.push(...list));
    return allQuests;
  }

  public getTarotMembers(): TarotMemberData[] {
    return this.tarotMembersData;
  }

  public getEventsBySequence(sequenceNumber: number): WorldEventData[] {
    return this.eventsData.get(sequenceNumber) || [];
  }

  public getAllEvents(): WorldEventData[] {
    const allEvents: WorldEventData[] = [];
    this.eventsData.forEach(list => allEvents.push(...list));
    return allEvents;
  }

  public getWorldData(category: string): any {
    return this.worldData.get(category) || null;
  }
}