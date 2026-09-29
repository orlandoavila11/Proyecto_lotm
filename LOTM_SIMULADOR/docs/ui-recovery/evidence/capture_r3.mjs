import { chromium } from 'file:///C:/Users/sammy.avila/AppData/Local/npm-cache/_npx/98ecb921abf44153/node_modules/playwright-core/index.mjs';
import * as fs from 'node:fs';
import * as path from 'node:path';

const outDir = path.resolve('docs/ui-recovery/evidence/r3');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Chrome for BRIEF-10.VISUAL-R3 evidence capture...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('📖 Navigating to http://localhost:5173/?harness=true...');
  await page.goto('http://localhost:5173/?harness=true');
  await page.waitForTimeout(1000);

  // 1. Vista General del Desván (Wide 1920x1080 con 11 Objetos Físicos)
  console.log('📸 1. Capturing full scene: r3_desvan_wide_1920x1080.png...');
  await page.screenshot({ path: path.join(outDir, 'r3_desvan_wide_1920x1080.png') });

  // 2. Modo Atención (Tecla A) mostrando las etiquetas de ≤ 7 palabras
  console.log('⌨️ 2. Toggling Attention Mode (Key A)...');
  await page.keyboard.press('a');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(outDir, 'r3_attention_mode_11_objects.png') });
  await page.keyboard.press('a'); // Desactivar atención
  await page.waitForTimeout(200);

  // 3. Primer Plano: Escalera y Picaporte (Zaguán)
  console.log('📸 3. Camera preset FOCUS_STAIRCASE...');
  await page.locator('#btn-preset-FOCUS_STAIRCASE').click({ timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'r3_object_staircase_door.png') });

  // 4. Primer Plano: Hornacina y El Cáliz de Plata
  console.log('📸 4. Camera preset FOCUS_HORNACINA...');
  await page.locator('#btn-preset-FOCUS_HORNACINA').click({ timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'r3_object_niche_chalice.png') });

  // 5. Primer Plano: Tablero de Corcho e Hilos Rojos (Investigación)
  console.log('📸 5. Camera preset FOCUS_CORKBOARD...');
  await page.locator('#btn-preset-FOCUS_CORKBOARD').click({ timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'r3_object_corkboard.png') });

  // 6. Primer Plano: Mesa de Caoba con Objetos (FOCUS_DESK)
  console.log('📸 6. Camera preset FOCUS_DESK...');
  await page.locator('#btn-preset-FOCUS_DESK').click({ timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'r3_camera_focus_desk.png') });

  // 7. Hover / Foco en la Vela de Sebo
  console.log('📸 7. Hover CandleObject...');
  await page.locator('#hotspot_candle').hover({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'r3_object_candle_hover.png') });

  // 8. Hover / Foco en el Espejo de Azogue
  console.log('📸 8. Hover SomaticMirrorObject...');
  await page.locator('#hotspot_mirror').hover({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'r3_object_mirror_hover.png') });

  // 9. Hover en Reloj de Faltriquera y Almanaque
  console.log('📸 9. Hover PocketWatchObject...');
  await page.locator('#hotspot_almanack').hover({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'r3_object_pocket_watch_hover.png') });

  // 10. Hover en Misiva Sellada del Bazar
  console.log('📸 10. Hover BazaarLetterObject...');
  await page.locator('#hotspot_bazaar_letter').hover({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'r3_object_bazaar_letter_hover.png') });

  // 11. Hover en Pliegos Notariales de Identidad
  console.log('📸 11. Hover IdentityPapersObject...');
  await page.locator('#hotspot_identity_papers').hover({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'r3_object_identity_papers_hover.png') });

  // 12. Hover en Cuaderno de Actuación
  console.log('📸 12. Hover ActingBookObject...');
  await page.locator('#hotspot_acting_diary').hover({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'r3_object_acting_book_hover.png') });

  // 13. Hover en Monedero de Cuero
  console.log('📸 13. Hover LeatherPouchObject...');
  await page.locator('#hotspot_money_pouch').hover({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'r3_object_leather_pouch_hover.png') });

  // 14. Hover en Grietas de Ruina
  console.log('📸 14. Hover DeskCracksOverlay...');
  await page.locator('#hotspot_mahogany_cracks').hover({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'r3_object_desk_cracks_hover.png') });

  // 15. Activación de Visión Espiritual (Tecla V)
  console.log('👁️ 15. Toggling Spirit Vision (Key V)...');
  await page.keyboard.press('v');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'r3_spirit_vision_veil_active.png') });
  await page.keyboard.press('v'); // Desactivar
  await page.waitForTimeout(200);

  // 16. Restablecer a WIDE_OVERVIEW
  console.log('📸 16. Reset to WIDE_OVERVIEW...');
  await page.locator('#btn-preset-WIDE_OVERVIEW').click({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'r3_final_clean_desk.png') });

  await browser.close();
  console.log('✅ Evidence capture for BRIEF-10.VISUAL-R3 completed successfully!');
}

run().catch((err) => {
  console.error('❌ Error during evidence capture:', err);
  process.exit(1);
});
