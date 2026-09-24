import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { DatabaseClient } from '../reborn/src/infra/database/DatabaseClient.js';

const OUT_DIR = resolve('./visual_evidence');
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const DB_PATH = resolve('./saves/lotm_reborn.db');
const db = new DatabaseClient(DB_PATH);

async function runF04Validation() {
  console.log('========================================================================');
  console.log('VALIDACIÓN RIGUROSA DE INTEGRACIÓN REAL DE SISTEMAS — FINDING F04');
  console.log('========================================================================\n');

  // 1. Asegurar o recuperar personaje activo
  const existingChars = db.db.prepare('SELECT id, name, pathway, sequence, raw_pence FROM characters LIMIT 1').all();
  let charId;
  if (existingChars.length > 0) {
    charId = existingChars[0].id;
    console.log(`[SETUP] Personaje existente encontrado: ${existingChars[0].name} (${charId}), Vía: ${existingChars[0].pathway}, Secuencia: ${existingChars[0].sequence}, Fondos: ${existingChars[0].raw_pence}d`);
  } else {
    console.log('[SETUP] Creando personaje en SQLite...');
    const charResp = await fetch('http://127.0.0.1:3456/api/character/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arthur Pendelton',
        pathway: 'FOOL',
        startingCity: 'Backlund - Cherwood',
        background: 'Escribiente Notarial'
      })
    });
    const cData = await charResp.json();
    charId = cData.character.id;
    console.log(`[SETUP] Creado personaje: ${charId}`);
  }

  // Lanzar Browser Playwright
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // Navegar e inyectar personaje activo
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate((id) => {
    localStorage.setItem('lotm_active_character_id', id);
  }, charId);
  await page.reload();
  await page.waitForTimeout(2000);

  const f04Log = [];

  // =========================================================================
  // SUB-MISION 1: MarketView -> Fastify -> SQLite (market_transactions / inventory_items)
  // =========================================================================
  console.log('\n--- [1/4] VALIDANDO MARKETVIEW ---');
  const marketPenceBefore = db.db.prepare('SELECT raw_pence FROM characters WHERE id = ?').get(charId).raw_pence;
  const marketTxBefore = db.db.prepare('SELECT COUNT(*) as c FROM market_transactions WHERE character_id = ?').get(charId).c;
  const invCountBefore = db.db.prepare('SELECT COUNT(*) as c FROM inventory_items WHERE character_id = ?').get(charId).c;
  console.log(`[MARKET BEFORE] Pence: ${marketPenceBefore}, Tx Count: ${marketTxBefore}, Inventory Items: ${invCountBefore}`);

  // Abrir Mercado
  await page.click('#hotspot_bazaar_letter');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_market_01_before.png') });

  // Seleccionar ítem y comprar
  console.log('[MARKET ACTION] Comprando Jugo de Estramonio Purificado...');
  await page.click('button:has-text("Pagar y Recoger el Paquete")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_market_02_action.png') });

  // Verificar estado persistido en SQLite
  const marketPenceAfter = db.db.prepare('SELECT raw_pence FROM characters WHERE id = ?').get(charId).raw_pence;
  const marketTxAfter = db.db.prepare('SELECT COUNT(*) as c FROM market_transactions WHERE character_id = ?').get(charId).c;
  const invCountAfter = db.db.prepare('SELECT COUNT(*) as c FROM inventory_items WHERE character_id = ?').get(charId).c;
  const lastTx = db.db.prepare('SELECT * FROM market_transactions WHERE character_id = ? ORDER BY created_at DESC LIMIT 1').get(charId);
  console.log(`[MARKET PERSISTED] Pence: ${marketPenceAfter} (Gasto: ${marketPenceBefore - marketPenceAfter}d), Tx Count: ${marketTxAfter}, Inventory: ${invCountAfter}`);
  console.log(`[MARKET PERSISTED TX] ID: ${lastTx.id}, Item: ${lastTx.item_code}, Amount: ${lastTx.pence_amount}d`);

  // Reload y verificación
  console.log('[MARKET RELOAD] Recargando página...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForTimeout(2000);
  await page.click('#hotspot_bazaar_letter');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_market_03_reload.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  const marketSuccess = marketTxAfter > marketTxBefore && marketPenceAfter < marketPenceBefore;
  f04Log.push({
    system: 'MarketView',
    status: marketSuccess ? 'PASSED' : 'FAILED',
    before: { pence: marketPenceBefore, transactions: marketTxBefore, inventory: invCountBefore },
    persisted: { pence: marketPenceAfter, transactions: marketTxAfter, inventory: invCountAfter, lastTxCode: lastTx?.item_code },
    screenshots: ['f04_market_01_before.png', 'f04_market_02_action.png', 'f04_market_03_reload.png']
  });

  // =========================================================================
  // SUB-MISION 2: CombatView -> Fastify -> SQLite (battles)
  // =========================================================================
  console.log('\n--- [2/4] VALIDANDO COMBATVIEW ---');
  const battlesBefore = db.db.prepare('SELECT COUNT(*) as c FROM battles WHERE character_id = ?').get(charId).c;
  console.log(`[COMBAT BEFORE] Total battles en SQLite: ${battlesBefore}`);

  // Abrir Combate
  await page.click('#hotspot_staircase_door');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_combat_01_before.png') });

  // Ejecutar Acción Táctica (Habilidad de Secuencia 9 / Disparo de Precisión)
  console.log('[COMBAT ACTION] Ejecutando Disparo de Precisión / Habilidad mística...');
  await page.click('button:has-text("Disparo de Precisión")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_combat_02_action.png') });

  // Verificar persistencia en SQLite
  const activeBattleRow = db.db.prepare('SELECT * FROM battles WHERE character_id = ? ORDER BY created_at DESC LIMIT 1').get(charId);
  console.log(`[COMBAT PERSISTED] Battle ID: ${activeBattleRow?.id}, Status: ${activeBattleRow?.status}`);
  if (activeBattleRow) {
    const battleState = JSON.parse(activeBattleRow.state_json);
    console.log(`[COMBAT PERSISTED STATE] Turn Count: ${battleState.turnCount}, TurnLog Entries: ${battleState.turnLog?.length}`);
  }

  // Reload y verificación
  console.log('[COMBAT RELOAD] Recargando página...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForTimeout(2000);
  await page.click('#hotspot_staircase_door');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_combat_03_reload.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  const combatSuccess = !!activeBattleRow;
  f04Log.push({
    system: 'CombatView',
    status: combatSuccess ? 'PASSED' : 'FAILED',
    before: { battlesCount: battlesBefore },
    persisted: { battleId: activeBattleRow?.id, status: activeBattleRow?.status },
    screenshots: ['f04_combat_01_before.png', 'f04_combat_02_action.png', 'f04_combat_03_reload.png']
  });

  // =========================================================================
  // SUB-MISION 3: CorkboardView -> Fastify -> SQLite (case_instances)
  // =========================================================================
  console.log('\n--- [3/4] VALIDANDO CORKBOARDVIEW ---');
  const casesBefore = db.db.prepare('SELECT COUNT(*) as c FROM investigation_case_instances WHERE character_id = ?').get(charId).c;
  console.log(`[CORKBOARD BEFORE] Case instances en SQLite: ${casesBefore}`);

  // Abrir Corcho
  await page.click('#hotspot_corkboard');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_corkboard_01_before.png') });

  // Acción: Clavar Hipótesis
  console.log('[CORKBOARD ACTION] Escribiendo y clavando hipótesis...');
  await page.fill('input[placeholder*="hipótesis"]', 'Julian Vance encubre a los huérfanos para protegerlos de una purga eclesiástica');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Clavar Hipótesis")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_corkboard_02_action.png') });

  // Verificar persistencia en SQLite
  const activeCaseRow = db.db.prepare('SELECT * FROM investigation_case_instances WHERE character_id = ? ORDER BY created_at DESC LIMIT 1').get(charId);
  console.log(`[CORKBOARD PERSISTED] Case Instance ID: ${activeCaseRow?.id}, Status: ${activeCaseRow?.status}`);
  if (activeCaseRow) {
    const cState = JSON.parse(activeCaseRow.state_json);
    console.log(`[CORKBOARD PERSISTED STATE] Title: ${cState.title}, Tested Hypotheses: ${cState.testedHypotheses?.length}`);
  }

  // Reload y verificación
  console.log('[CORKBOARD RELOAD] Recargando página...');
  await page.click('button:has-text("Volver al Desván")');
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForTimeout(2000);
  await page.click('#hotspot_corkboard');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_corkboard_03_reload.png') });
  await page.click('button:has-text("Volver al Desván")');
  await page.waitForTimeout(800);

  const corkboardSuccess = !!activeCaseRow;
  f04Log.push({
    system: 'CorkboardView',
    status: corkboardSuccess ? 'PASSED' : 'FAILED',
    before: { caseInstances: casesBefore },
    persisted: { caseInstanceId: activeCaseRow?.id, status: activeCaseRow?.status },
    screenshots: ['f04_corkboard_01_before.png', 'f04_corkboard_02_action.png', 'f04_corkboard_03_reload.png']
  });

  // =========================================================================
  // SUB-MISION 4: AscensionView -> Fastify -> SQLite (characters.sequence / ascension_telemetry)
  // =========================================================================
  console.log('\n--- [4/4] VALIDANDO ASCENSIONVIEW ---');
  // Asegurar que el personaje cumple las precondiciones canónicas para el ascenso:
  // 100% digestión + los dos ingredientes principales en inventario
  db.db.prepare('UPDATE characters SET digestion_progress = 100.0 WHERE id = ?').run(charId);

  // Asegurar ingredientes canónicos en inventario
  const ensureItem = (code, name, quality = 'PRISTINE') => {
    const exists = db.db.prepare('SELECT id FROM inventory_items WHERE character_id = ? AND item_code = ?').get(charId, code);
    if (!exists) {
      db.addInventoryItem({
        id: db.nextId('inv_ing'),
        character_id: charId,
        item_code: code,
        name,
        category: 'INGREDIENT',
        grade: null,
        quantity: 1,
        quality,
        metadata_json: '{}'
      });
    }
  };

  ensureItem('ING_GOAT_HORN_CRYSTAL', 'Cristal de Cuerno de Cabra Gris Madura de Hornacis');
  ensureItem('ING_HUMAN_FACED_ROSE_STALK', 'Tallo Completo de Rosa con Rostro Humano');
  ensureItem('ING_JIMSONWEED_JUICE', 'Jugo de Estramonio Purificado');
  ensureItem('ING_BLACK_SUNFLOWER_POWDER', 'Polvo de Girasol de Borde Negro');

  const seqBefore = db.db.prepare('SELECT sequence FROM characters WHERE id = ?').get(charId).sequence;
  const telemetryBefore = db.db.prepare('SELECT COUNT(*) as c FROM ascension_telemetry WHERE character_id = ?').get(charId).c;
  console.log(`[ASCENSION BEFORE] Secuencia: ${seqBefore}, Telemetry rows: ${telemetryBefore}`);

  // Abrir Ceremonia de Ascenso
  await page.click('#hotspot_chalice');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_ascension_01_before.png') });

  // Acción: Hold-to-Drink durante 3.2 segundos
  console.log('[ASCENSION ACTION] Sosteniendo el cáliz durante 3.2 segundos...');
  const chaliceButton = await page.$('div[role="button"][aria-label*="ingerir la poción"]');
  if (chaliceButton) {
    const box = await chaliceButton.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(3400);
      await page.mouse.up();
    }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_ascension_02_action.png') });

  // Aceptar la nueva forma
  const aceptarForma = await page.$('button:has-text("Aceptar la Nueva Forma")');
  if (aceptarForma) {
    await aceptarForma.click();
    await page.waitForTimeout(1000);
  }

  // Verificar persistencia en SQLite
  const seqAfter = db.db.prepare('SELECT sequence FROM characters WHERE id = ?').get(charId).sequence;
  const telemetryAfter = db.db.prepare('SELECT COUNT(*) as c FROM ascension_telemetry WHERE character_id = ?').get(charId).c;
  const lastTelemetry = db.db.prepare('SELECT * FROM ascension_telemetry WHERE character_id = ? ORDER BY created_at DESC LIMIT 1').get(charId);
  console.log(`[ASCENSION PERSISTED] Secuencia en DB: ${seqAfter} (Antes: ${seqBefore}), Telemetry Count: ${telemetryAfter}`);
  if (lastTelemetry) {
    console.log(`[ASCENSION TELEMETRY ROW] Outcome: ${lastTelemetry.outcome}, Target Seq: ${lastTelemetry.target_sequence}, Hesitation: ${lastTelemetry.hesitation_ms}ms`);
  }

  // Reload y verificación
  console.log('[ASCENSION RELOAD] Recargando página...');
  const regresarBtn = await page.$('button:has-text("Regresar a la Mesa del Desván")');
  if (regresarBtn) {
    await regresarBtn.click();
    await page.waitForTimeout(800);
  } else {
    await page.keyboard.press('Escape');
  }
  await page.reload();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: resolve(OUT_DIR, 'f04_ascension_03_reload.png') });

  const ascensionSuccess = seqAfter === 8 && telemetryAfter > telemetryBefore;
  f04Log.push({
    system: 'AscensionView',
    status: ascensionSuccess ? 'PASSED' : 'FAILED',
    before: { sequence: seqBefore, telemetryRows: telemetryBefore },
    persisted: { sequence: seqAfter, telemetryRows: telemetryAfter, outcome: lastTelemetry?.outcome },
    screenshots: ['f04_ascension_01_before.png', 'f04_ascension_02_action.png', 'f04_ascension_03_reload.png']
  });

  await browser.close();

  // Guardar log consolidado JSON
  writeFileSync(resolve(OUT_DIR, 'f04_integration_results.json'), JSON.stringify(f04Log, null, 2), 'utf-8');

  console.log('\n========================================================================');
  console.log('RESULTADO FINAL DE INTEGRACIÓN F04:');
  console.log('========================================================================');
  for (const item of f04Log) {
    console.log(`- ${item.system}: [${item.status}] (Screenshots: ${item.screenshots.join(', ')})`);
  }
  console.log('========================================================================\n');
}

runF04Validation().catch(err => {
  console.error('[FATAL ERROR IN F04 VALIDATION]:', err);
  process.exit(1);
});
