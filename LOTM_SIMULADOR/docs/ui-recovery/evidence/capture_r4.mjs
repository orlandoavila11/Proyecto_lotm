import { chromium } from 'file:///C:/Users/sammy.avila/AppData/Local/npm-cache/_npx/98ecb921abf44153/node_modules/playwright-core/index.mjs';
import * as fs from 'node:fs';
import * as path from 'node:path';

const outDir = path.resolve('docs/ui-recovery/evidence/r4');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Chrome for BRIEF-10.VISUAL-R4 evidence capture...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('📖 Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);

  // 1. Abrir Calendario mediante clic en hotspot_almanack (Lectura sin consumo de tiempo)
  console.log('📸 1. Opening Calendar (Almanaque)...');
  await page.locator('#hotspot_almanack').click({ force: true });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'r4_calendar_morning_reading.png') });

  // 2. Ejecutar acción de franja civil (WORK)
  console.log('📸 2. Executing WORK slot action...');
  const workBtn = page.getByRole('button', { name: /Atender el Empleo Civil/i });
  if (await workBtn.isVisible()) {
    await workBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'r4_calendar_action_work_executed.png') });
  }

  // 3. Regresar al desván mediante tecla Escape
  console.log('⌨️ 3. Returning to Desk via Escape...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // 4. Abrir Pliegos de Identidad (hotspot_identity_papers)
  console.log('📸 4. Opening Identity Dossier (Papeles Notariales)...');
  await page.locator('#hotspot_identity_papers').click({ force: true });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'r4_identity_dossier_unfolded.png') });

  // 5. Captura de opciones o dilemas de identidad civil
  console.log('📸 5. Capturing Identity civil friction...');
  const optBtn = page.getByRole('button', { name: /Responder con diplomacia/i });
  if (await optBtn.isVisible()) {
    await optBtn.click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(outDir, 'r4_identity_dilemma_choice.png') });

  // 6. Regresar al desván mediante tecla Escape
  console.log('⌨️ 6. Returning to Desk via Escape...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // 7. Abrir Cuaderno de Actuación en Piel (hotspot_acting_diary)
  console.log('📸 7. Opening Acting Diary (Cuaderno de Actuación)...');
  await page.locator('#hotspot_acting_diary').click({ force: true });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'r4_acting_book_dilemma.png') });

  // 8. Capturar bitácora y resoluciones
  console.log('📸 8. Selecting choice and resolving acting dilemma...');
  const choiceBtn = page.getByRole('button', { name: /Transmitir la advertencia/i });
  if (await choiceBtn.isVisible()) {
    await choiceBtn.click();
    await page.waitForTimeout(300);
    const resolveBtn = page.getByRole('button', { name: /Interpretar el Rol/i });
    if (await resolveBtn.isVisible()) {
      await resolveBtn.click();
      await page.waitForTimeout(600);
    }
  }
  await page.screenshot({ path: path.join(outDir, 'r4_acting_resolution_recorded.png') });

  // 9. Regresar al desván y capturar escritorio sincronizado con nueva franja y tiempo
  console.log('⌨️ 9. Returning to Desk...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'r4_desk_synchronized_evening.png') });

  console.log('✅ All 7 R4 evidence screenshots captured successfully in docs/ui-recovery/evidence/r4/');
  await browser.close();
}

run().catch(err => {
  console.error('❌ Failed capturing R4 evidence:', err);
  process.exit(1);
});
