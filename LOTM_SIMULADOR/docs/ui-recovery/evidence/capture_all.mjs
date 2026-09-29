import { chromium } from 'file:///C:/Users/sammy.avila/AppData/Local/npm-cache/_npx/98ecb921abf44153/node_modules/playwright-core/index.mjs';
import * as fs from 'node:fs';
import * as path from 'node:path';

const outDir = path.resolve('docs/ui-recovery/evidence/r0');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Chrome...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();

  const viewports = [
    { w: 1280, h: 720, name: '1280x720' },
    { w: 1366, h: 768, name: '1366x768' },
    { w: 1440, h: 900, name: '1440x900' },
    { w: 1920, h: 1080, name: '1920x1080' },
    { w: 2560, h: 1440, name: '2560x1440' }
  ];

  console.log('📖 Opening http://localhost:5173...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(500);

  // 1. Capture Prologue across 5 viewports
  console.log('📸 Capturing Prologue in 5 viewports...');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.screenshot({ path: path.join(outDir, `prologue_${vp.name}.png`), scale: 'css' });
  }

  // Set standard 1920x1080
  await page.setViewportSize({ width: 1920, height: 1080 });

  // 2. Advance through Prologue
  console.log('📜 Advancing Prologue...');
  await page.locator('text=Comenzar la Vigilia').click();
  await page.waitForTimeout(300);

  await page.locator('text=Examinar la Carta y el Sello').click();
  await page.waitForTimeout(300);

  await page.locator('text=Prudencia Civil').click();
  await page.waitForTimeout(200);

  await page.locator('text=Abrir el Cofre de los Frascos').click();
  await page.waitForTimeout(300);

  await page.locator('text=Elegir el Frasco Cobalto').click();
  await page.waitForTimeout(300);

  // Extinguish lamps
  await page.locator('text=1. Cerrar la llave de gas de la ventana exterior').click();
  await page.waitForTimeout(150);
  await page.locator('text=2. Apagar el quinqué de queroseno de la estantería').click();
  await page.waitForTimeout(150);
  await page.locator('text=3. Apagar la vela de sebo del zaguán').click();
  await page.waitForTimeout(500);

  // Hold-to-Drink
  console.log('🍷 Holding to drink potion (3.2s)...');
  const holdBtn = page.locator('button:has-text("Mantener Pulsado para Beber")');
  const box = await holdBtn.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(3300);
    await page.mouse.up();
  }
  await page.waitForTimeout(500);

  // Umbral -> Awakening
  await page.locator('text=Abrir los Ojos').click();
  await page.waitForTimeout(300);

  await page.locator('text=Tomar Asiento en el Escritorio').click();
  await page.waitForTimeout(600);

  // 3. Capture Desk across 5 viewports
  console.log('📸 Capturing Desk in 5 viewports...');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.screenshot({ path: path.join(outDir, `desk_${vp.name}.png`), scale: 'css' });
  }

  await page.setViewportSize({ width: 1920, height: 1080 });

  // 4. Capture Corkboard (Investigation)
  console.log('📸 Capturing Corkboard...');
  await page.locator('text=Expediente Cherwood').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'corkboard_1920x1080.png'), scale: 'css' });
  await page.locator('header button').first().click();
  await page.waitForTimeout(400);

  // 5. Capture Calendar (Almanaque)
  console.log('📸 Capturing Calendar...');
  await page.locator('text=Almanaque de Franjas').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'calendar_1920x1080.png'), scale: 'css' });
  await page.locator('header button').first().click();
  await page.waitForTimeout(400);

  // 6. Capture Market (Bazar de la Niebla)
  console.log('📸 Capturing Market...');
  await page.locator('text=Bazar de la Niebla').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'market_1920x1080.png'), scale: 'css' });
  await page.locator('header button').first().click();
  await page.waitForTimeout(400);

  // 7. Capture Combat (Teatro Táctico)
  console.log('📸 Capturing Combat...');
  await page.locator('text=Ponerse en Guardia').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'combat_1920x1080.png'), scale: 'css' });
  await page.locator('header button').first().click();
  await page.waitForTimeout(400);

  // 8. Capture Ascension (El Cáliz)
  console.log('📸 Capturing Ascension...');
  await page.locator('[title*="Cáliz"]').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'ascension_1920x1080.png'), scale: 'css' });
  await page.locator('header button').first().click();
  await page.waitForTimeout(400);

  // 9. Capture Spirit Vision (Velo)
  console.log('📸 Capturing Spirit Vision...');
  await page.locator('text=Abrir el Tercer Ojo').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'veil_1920x1080.png'), scale: 'css' });

  await browser.close();
  console.log('✅ ALL SCREENSHOTS CAPTURED SUCCESSFULLY IN R0!');
}

run().catch(err => {
  console.error('❌ Error during capture:', err);
  process.exit(1);
});
