import { DatabaseClient } from '../reborn/src/infra/database/DatabaseClient.js';
const db = new DatabaseClient('./saves/lotm_reborn.db');
console.log('Character:', db.db.prepare("SELECT id, name, pathway, sequence, digestion_progress FROM characters WHERE id = 'char_1790267861425'").get());
console.log('Telemetry:', db.db.prepare("SELECT * FROM ascension_telemetry ORDER BY created_at DESC LIMIT 3").all());
console.log('Inventory:', db.db.prepare("SELECT * FROM inventory_items WHERE character_id = 'char_1790267861425'").all());

