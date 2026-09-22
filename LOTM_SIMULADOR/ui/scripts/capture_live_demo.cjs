/**
 * CAPTURADOR DE PANTALLAS DIEGÉTICAS EN VIVO — PATH TO GODHOOD (BRIEF-10.VISUAL)
 * Usa Chrome del sistema para capturar la aplicación en alta resolución 1920x1080.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = 'C:/Users/sammy.avila/.gemini/antigravity/brain/ee673440-02ad-47b9-b63a-da02e77fc185';

async function captureAll() {
  console.log('[CAPTURA] Iniciando Chrome del sistema...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // 1. Prólogo: Selección de Origen Canónico
  console.log('[CAPTURA 1/7] Capturando Prólogo y Selección de Origen...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_prologue_origin_select.png') });

  // 2. Carta Sellada del Benefactor
  console.log('[CAPTURA 2/7] Capturando Carta Sellada con Lacre Carmesí...');
  const btnComenzar = page.locator('button:has-text("Comenzar la Vigilia")');
  if (await btnComenzar.isVisible()) {
    await btnComenzar.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_letter_sealed.png') });

    // 3. Romper sello y desdoblar pergamino
    console.log('[CAPTURA 3/7] Rompiendo sello y capturando Pergamino Desplegado...');
    const btnRomper = page.locator('button:has-text("Romper el Sello")');
    if (await btnRomper.isVisible()) {
      await btnRomper.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03_letter_unfolded.png') });
    }
  }

  // 4. El Desván Principal (Mesa de caoba, velas, espejo, documentos)
  console.log('[CAPTURA 4/7] Navegando al Desván Principal...');
  await page.goto('http://localhost:5173/?harness=true', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Ocultar Harness para captura diegética limpia
  const btnOcultar = page.locator('button:has-text("Ocultar Harness")');
  if (await btnOcultar.isVisible()) {
    await btnOcultar.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_desvan_main_desk.png') });

  // 5. Tablero de Investigación (8 pistas de Cherwood, hilos rojos, dossier)
  console.log('[CAPTURA 5/7] Capturando Tablero de Investigación de Cherwood (8 Pistas)...');
  const corkboardBtn = page.locator('#hotspot_corkboard');
  if (await corkboardBtn.isVisible()) {
    await corkboardBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_corkboard_investigation.png') });
  }

  // 6. Ascensión Ritual (5 Puertas Canónicas + Cáliz)
  console.log('[CAPTURA 6/7] Capturando Ritual de Ascensión y Cáliz Ceremonial...');
  await page.goto('http://localhost:5173/?harness=true', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  if (await btnOcultar.isVisible()) {
    await btnOcultar.click();
    await page.waitForTimeout(300);
  }
  const chaliceBtn = page.locator('#hotspot_chalice');
  if (await chaliceBtn.isVisible()) {
    await chaliceBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_ascension_ritual_5_gates.png') });
  }

  // 7. Teatro Táctico (Rejilla 5x7, tokens diegéticos, niebla)
  console.log('[CAPTURA 7/7] Capturando Teatro Táctico 5x7...');
  await page.goto('http://localhost:5173/?harness=true', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  if (await btnOcultar.isVisible()) {
    await btnOcultar.click();
    await page.waitForTimeout(300);
  }
  const staircaseBtn = page.locator('#hotspot_staircase_door');
  if (await staircaseBtn.isVisible()) {
    await staircaseBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_tactical_combat.png') });
  }

  await browser.close();
  console.log('[CAPTURA] ¡Todas las 7 capturas se guardaron exitosamente en', OUTPUT_DIR);
}

captureAll().catch(err => {
  console.error('[CAPTURA ERROR]', err);
  process.exit(1);
});

