import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const OUT_DIR = resolve('./visual_evidence');
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

async function captureAll() {
  console.log('=== CAPTURA RIGUROSA DE PANTALLAS REALES DE LA APLICACIÓN ===');

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

  // FASE 1: RECORRIDO DEL PRÓLOGO TUTORIAL
  console.log('[1/14] Cargando aplicación limpia para Prólogo...');
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(1000);

  // 1. Orígenes
  console.log('[1/14] Capturando 01_prologue_origin_selection.png');
  await page.screenshot({ path: resolve(OUT_DIR, '01_prologue_origin_selection.png') });

  // 2. Carta Sellada
  console.log('[2/14] Abriendo Carta Sellada...');
  await page.click('button:has-text("Comenzar la Vigilia")');
  await page.waitForTimeout(800);
  console.log('[2/14] Capturando 02_prologue_letter_sealed.png');
  await page.screenshot({ path: resolve(OUT_DIR, '02_prologue_letter_sealed.png') });

  // 3. Romper sello
  console.log('[3/14] Rompiendo el sello de cera carmesí...');
  await page.click('button:has-text("Romper el Sello")');
  await page.waitForTimeout(1400);
  console.log('[3/14] Capturando 03_prologue_letter_unfolded.png');
  await page.screenshot({ path: resolve(OUT_DIR, '03_prologue_letter_unfolded.png') });

  // 4. Dilema del Zaguán
  console.log('[4/14] Accediendo al Dilema del Zaguán...');
  await page.click('button:has-text("Examinar la Carta y el Sello")');
  await page.waitForTimeout(800);
  console.log('[4/14] Capturando 04_prologue_dilemma.png');
  await page.screenshot({ path: resolve(OUT_DIR, '04_prologue_dilemma.png') });

  // 5. Elección de Poción
  console.log('[5/14] Eligiendo Prudencia Civil y abriendo el Cofre de los Frascos...');
  await page.click('text=Prudencia Civil');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Abrir el Cofre de los Frascos")');
  await page.waitForTimeout(800);
  console.log('[5/14] Capturando 05_prologue_potion_choice.png');
  await page.screenshot({ path: resolve(OUT_DIR, '05_prologue_potion_choice.png') });

  // 6. Ritual de Oscurecimiento
  console.log('[6/14] Eligiendo Frasco Cobalto (Fool)...');
  await page.click('button:has-text("Elegir el Frasco Cobalto")');
  await page.waitForTimeout(800);
  console.log('[6/14] Capturando 06_prologue_darkening_ritual.png');
  await page.screenshot({ path: resolve(OUT_DIR, '06_prologue_darkening_ritual.png') });

  // Apagar las lámparas para completar el ritual
  console.log('[6b/14] Extinguiendo las tres fuentes de luz...');
  await page.click('button:has-text("1. Cerrar la llave de gas")');
  await page.waitForTimeout(250);
  await page.click('button:has-text("2. Apagar el quinqué de queroseno")');
  await page.waitForTimeout(250);
  await page.click('button:has-text("3. Apagar la vela de sebo")');
  await page.waitForTimeout(1000);

  // Hold-to-Drink
  const holdBtn = await page.$('button:has-text("Mantener Pulsado para Beber")');
  if (holdBtn) {
    console.log('[6c/14] Sosteniendo trago de poción...');
    const box = await holdBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(3500);
      await page.mouse.up();
    }
  }

  // Esperar drinking y despertar
  await page.waitForTimeout(1000);
  const abrirOjos = await page.$('button:has-text("Abrir los Ojos")');
  if (abrirOjos) {
    await abrirOjos.click();
    await page.waitForTimeout(1000);
  }

  const tomarAsiento = await page.$('button:has-text("Tomar Asiento en el Escritorio")');
  if (tomarAsiento) {
    await tomarAsiento.click();
    await page.waitForTimeout(2000);
  }

  // FASE 2: EL DESVÁN Y SUS VISTAS VINCULADAS
  console.log('\n--- VERIFICANDO LLEGADA AL DESVÁN ---');
  let inDesk = await page.$('#hotspot_almanack');
  if (!inDesk) {
    console.log('[FALLBACK] Creando e hidratando personaje en SQLite...');
    const charResp = await fetch('http://127.0.0.1:3456/api/character/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arthur Pendelton',
        pathway: 'FOOL',
        startingCity: 'Backlund - Hillston',
        background: 'Escribiente Notarial'
      })
    });
    const charData = await charResp.json();
    const pid = charData.character.id;
    await page.evaluate((id) => localStorage.setItem('lotm_active_character_id', id), pid);
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(2000);
  }

  // 7. El Desván (DESK_WIDE)
  console.log('[7/14] Capturando 07_desvan_hub_desk_wide.png');
  await page.screenshot({ path: resolve(OUT_DIR, '07_desvan_hub_desk_wide.png') });

  // 8. CalendarView
  console.log('[8/14] Abriendo CalendarView (#hotspot_almanack)...');
  await page.click('#hotspot_almanack');
  await page.waitForTimeout(1000);
  console.log('[8/14] Capturando 08_calendar_view.png');
  await page.screenshot({ path: resolve(OUT_DIR, '08_calendar_view.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 9. IdentityDossierView
  console.log('[9/14] Abriendo IdentityDossierView (#hotspot_identity_papers)...');
  await page.click('#hotspot_identity_papers');
  await page.waitForTimeout(1000);
  console.log('[9/14] Capturando 09_identity_dossier_view.png');
  await page.screenshot({ path: resolve(OUT_DIR, '09_identity_dossier_view.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 10. ActingMirrorView
  console.log('[10/14] Abriendo ActingMirrorView (#hotspot_acting_diary)...');
  await page.click('#hotspot_acting_diary');
  await page.waitForTimeout(1000);
  console.log('[10/14] Capturando 10_acting_mirror_view.png');
  await page.screenshot({ path: resolve(OUT_DIR, '10_acting_mirror_view.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 11. CombatView
  console.log('[11/14] Abriendo CombatView (#hotspot_staircase_door)...');
  await page.click('#hotspot_staircase_door');
  await page.waitForTimeout(1000);
  console.log('[11/14] Capturando 11_tactical_combat_view.png');
  await page.screenshot({ path: resolve(OUT_DIR, '11_tactical_combat_view.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 12. CorkboardView
  console.log('[12/14] Abriendo CorkboardView (#hotspot_corkboard)...');
  await page.click('#hotspot_corkboard');
  await page.waitForTimeout(1000);
  console.log('[12/14] Capturando 12_corkboard_investigation_view.png');
  await page.screenshot({ path: resolve(OUT_DIR, '12_corkboard_investigation_view.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 13. AscensionView
  console.log('[13/14] Abriendo AscensionView (#hotspot_chalice)...');
  await page.click('#hotspot_chalice');
  await page.waitForTimeout(1000);
  console.log('[13/14] Capturando 13_ascension_ceremony_view.png');
  await page.screenshot({ path: resolve(OUT_DIR, '13_ascension_ceremony_view.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 14. MarketView
  console.log('[14/14] Abriendo MarketView (#hotspot_bazaar_letter)...');
  await page.click('#hotspot_bazaar_letter');
  await page.waitForTimeout(1000);
  console.log('[14/14] Capturando 14_market_bazaar_view.png');
  await page.screenshot({ path: resolve(OUT_DIR, '14_market_bazaar_view.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  await browser.close();
  console.log('\n=== RECORRIDO VISUAL Y CAPTURAS 100% COMPLETADAS ===');
}

captureAll().catch(err => {
  console.error('[FAIL] Error en captura:', err);
  process.exit(1);
});

