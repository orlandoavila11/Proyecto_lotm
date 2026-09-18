import { chromium } from 'file:///C:/Users/sammy.avila/AppData/Local/npm-cache/_npx/98ecb921abf44153/node_modules/playwright-core/index.mjs';
import * as fs from 'node:fs';
import * as path from 'node:path';

const outDir = path.resolve('docs/ui-recovery/evidence/r2');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Chrome for R2 Scene Foundations evidence...');
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

  console.log('📖 Opening http://localhost:5173/?harness=true...');
  await page.goto('http://localhost:5173/?harness=true');
  await page.waitForTimeout(600);

  // 1. Capture Desk Wide across 5 viewports with uniform scaling
  console.log('📸 Capturing Desk Wide in 5 viewports...');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(outDir, `desk_wide_${vp.name}.png`), scale: 'css' });
  }

  // Set standard verification viewport: 1920x1080
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(200);

  // 2. Capture Harness Active with Debug Safe Area
  console.log('📸 Capturing Scene Harness in 1920x1080...');
  await page.screenshot({ path: path.join(outDir, 'r2_scene_harness_wide.png') });

  // 3. Test Keyboard: Toggle Attention Mode with key 'A'
  console.log('⌨️ Testing Attention Mode (Key A)...');
  await page.keyboard.press('a');
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outDir, 'r2_attention_mode_active.png') });

  // 4. Test Keyboard Navigation with Tab
  console.log('⌨️ Testing Tab key navigation across hotspots...');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, 'r2_keyboard_tab_focus.png') });

  // 5. Test Camera Preset FOCUS_DESK
  console.log('🎥 Testing Camera Preset: FOCUS_DESK...');
  await page.locator('#btn-preset-FOCUS_DESK').click({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'r2_camera_focus_desk.png') });

  // 6. Test Camera Preset FOCUS_CORKBOARD
  console.log('🎥 Testing Camera Preset: FOCUS_CORKBOARD...');
  await page.locator('#btn-preset-FOCUS_CORKBOARD').click({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'r2_camera_focus_corkboard.png') });

  // 7. Test Camera Preset FOCUS_HORNACINA
  console.log('🎥 Testing Camera Preset: FOCUS_HORNACINA...');
  await page.locator('#btn-preset-FOCUS_HORNACINA').click({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'r2_camera_focus_hornacina.png') });

  // 8. Test Return to WIDE_OVERVIEW
  console.log('🎥 Resetting Camera to WIDE_OVERVIEW...');
  await page.locator('#btn-preset-WIDE_OVERVIEW').click({ timeout: 5000 });
  await page.waitForTimeout(600);

  // Minimizar Harness para probar la interacción directa sobre el Desván
  console.log('👁️ Minimizing Harness for pure scene interaction...');
  await page.locator('button:has-text("Ocultar Harness")').click({ timeout: 5000 });
  await page.waitForTimeout(300);

  // 9. Test Inspection Layer: Open Candle Hotspot
  console.log('🔍 Testing Inspection Layer on Candle...');
  await page.locator('#hotspot_candle').click({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'r2_inspection_candle.png') });

  // 10. Test Escape Key to return and restore focus
  console.log('⌨️ Testing Escape key to close inspection...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'r2_restored_focus_after_escape.png') });

  // 11. Test Inspection Layer on Mirror
  console.log('🔍 Testing Inspection Layer on Mirror...');
  await page.locator('#hotspot_mirror').click({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'r2_inspection_mirror.png') });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('✅ All R2 evidence screenshots captured successfully in', outDir);
  await browser.close();
}

run().catch((err) => {
  console.error('❌ Error during R2 capture:', err);
  process.exit(1);
});
