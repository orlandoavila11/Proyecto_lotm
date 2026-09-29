/**
 * Preparación de prueba para verificar la ascensión en la UI SIN tocar la partida real.
 * Úsese sólo contra un motor aislado con base temporal (DB_PATH=... PORT=3457):
 *   npx tsx scripts/_fixture_ascension.ts <ruta.db> <characterId>
 * Deja al personaje con los ingredientes S8 de su vía y la digestión completa; la preparación del rito,
 * la presentación y el trago se hacen desde la UI.
 */
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { AscensionEngine } from '../src/core/ascension/AscensionEngine.js';

const [, , dbPath, characterId] = process.argv;
if (!dbPath || !characterId) throw new Error('uso: _fixture_ascension.ts <ruta.db> <characterId>');
if (/lotm_reborn\.db$/.test(dbPath)) throw new Error('Negado: esta preparación no se aplica a la partida real.');

const db = new DatabaseClient(dbPath);
const char = db.getCharacter(characterId);
if (!char) throw new Error(`no existe ${characterId}`);
const f = AscensionEngine.CANONICAL_FORMULAS[char.pathway.toUpperCase()];
const codes = [...f.mainCodes, ...f.suppCodes.slice(0, 2)];
codes.forEach((code, i) => db.addInventoryItem({
  id: `inv_fixture_${characterId}_${i}`, character_id: characterId, item_code: code, name: code, category: 'INGREDIENT', quality: 'PRISTINE'
}));
db.updateCharacterSomatics(characterId, { digestion: 100 });
console.log(JSON.stringify(AscensionEngine.evaluateAscensionStatus(db, characterId), null, 1));
db.close();
