// Captura de revisión a resolución completa: node scripts/_shot.mjs <out.png> [w] [h] [script.json]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const [,, out, w = 1920, h = 1080, stepsFile] = process.argv;
const browser = await chromium.launch({ channel: process.env.CH ?? 'chrome', args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
const steps = stepsFile ? JSON.parse(readFileSync(stepsFile, 'utf8')) : [];
await page.goto(process.env.URL ?? 'http://localhost:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
for (const s of steps) {
  if (s.click) await page.getByText(s.click, { exact: s.exact ?? false }).first().click();
  if (s.mouse) await page.mouse.click(s.mouse[0], s.mouse[1]);
  if (s.move) await page.mouse.move(s.move[0], s.move[1]);
  if (s.type) await page.keyboard.type(s.type);
  if (s.eval) await page.evaluate(s.eval);
  if (s.shot) await page.screenshot({ path: s.shot });
  await page.waitForTimeout(s.wait ?? 1800);
}
console.log('backend:', await page.evaluate(() => (navigator.gpu ? 'gpu-api' : 'no-gpu-api')));
await page.screenshot({ path: out });
await browser.close();
