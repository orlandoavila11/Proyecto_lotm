const fs = require('fs');
const path = require('path');

const outDir = path.resolve('docs/ui-recovery/evidence/r0');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const viewports = [
    { w: 1280, h: 720, name: '1280x720' },
    { w: 1366, h: 768, name: '1366x768' },
    { w: 1440, h: 900, name: '1440x900' },
    { w: 1920, h: 1080, name: '1920x1080' },
    { w: 2560, h: 1440, name: '2560x1440' }
  ];

  // 1. Capture Prologue across 5 viewports
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.screenshot({ path: path.join(outDir, `prologue_${vp.name}.png`), scale: 'css' });
  }

  // Set standard 1920x1080
  await page.setViewportSize({ width: 1920, height: 1080 });

  // 2. Advance through Prologue
  await page.locator('text=Comenzar la Vigilia').click();
  await page.waitForTimeout(400);

  await page.locator('text=Examinar la Carta y el Sello').click();
  await page.waitForTimeout(400);

  await page.locator('text=Prudencia Civil').click();
  await page.waitForTimeout(300);

  await page.locator('text=Abrir el Cofre de los Frascos').click();
  await page.waitForTimeout(400);

  await page.locator('text=Elegir el Frasco Cobalto').click();
  await page.waitForTimeout(400);

  // Extinguish lamps
  await page.locator('text=1. Cerrar la llave de gas de la ventana exterior').click();
  await page.waitForTimeout(200);
  await page.locator('text=2. Apagar el quinqué de queroseno de la estantería').click();
  await page.waitForTimeout(200);
  await page.locator('text=3. Apagar la vela de sebo del zaguán').click();
  await page.waitForTimeout(800);

  // Hold-to-Drink
  const holdBtn = page.locator('button:has-text("Mantener Pulsado para Beber")');
  const box = await holdBtn.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(3300);
    await page.mouse.up();
  }
  await page.waitForTimeout(600);

  // Umbral -> Awakening
  await page.locator('text=Abrir los Ojos').click();
  await page.waitForTimeout(400);

  await page.locator('text=Tomar Asiento en el Escritorio').click();
  await page.waitForTimeout(800);

  // 3. Capture Desk across 5 viewports
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.screenshot({ path: path.join(outDir, `desk_${vp.name}.png`), scale: 'css' });
  }

  await page.setViewportSize({ width: 1920, height: 1080 });

  // 4. Capture Corkboard (Investigation)
  await page.locator('text=Expediente Cherwood').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'corkboard_1920x1080.png'), scale: 'css' });
  await page.locator('button:has-text("Volver al Escritorio"), button:has-text("Volver al Desván")').first().click();
  await page.waitForTimeout(500);

  // 5. Capture Calendar (Almanaque)
  await page.locator('text=Almanaque de Franjas').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'calendar_1920x1080.png'), scale: 'css' });
  await page.locator('button:has-text("Volver al Escritorio"), button:has-text("Volver al Desván")').first().click();
  await page.waitForTimeout(500);

  // 6. Capture Market (Bazar de la Niebla)
  await page.locator('text=Bazar de la Niebla').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'market_1920x1080.png'), scale: 'css' });
  await page.locator('button:has-text("Volver al Escritorio"), button:has-text("Volver al Desván")').first().click();
  await page.waitForTimeout(500);

  // 7. Capture Combat (Teatro Táctico)
  await page.locator('text=Ponerse en Guardia').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'combat_1920x1080.png'), scale: 'css' });
  await page.locator('button:has-text("Volver al Escritorio"), button:has-text("Volver al Desván")').first().click();
  await page.waitForTimeout(500);

  // 8. Capture Ascension (El Cáliz)
  await page.locator('title="Cáliz de plata para ascensión de secuencia", div:has-text("El Cáliz")').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'ascension_1920x1080.png'), scale: 'css' });
  await page.locator('button:has-text("Volver al Escritorio"), button:has-text("Volver al Desván")').first().click();
  await page.waitForTimeout(500);

  // 9. Capture Spirit Vision (Velo)
  await page.locator('text=Abrir el Tercer Ojo').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'veil_1920x1080.png'), scale: 'css' });

  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY IN R0!');
}

await run();

