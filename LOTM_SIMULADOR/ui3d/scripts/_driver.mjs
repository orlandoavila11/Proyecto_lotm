// Navegador de revisión persistente (Chrome instalado + WebGPU) controlado por HTTP local.
//   node scripts/_driver.mjs [puerto=9333] [w=1920] [h=1080]
//   curl -s localhost:9333 -d '{"op":"goto","url":"http://localhost:5174/"}'
// Órdenes: goto{url} · click{text|sel|xy, exact?} · move{xy} · type{text} · key{key} · eval{js}
//          shot{path, clip?:[x,y,w,h]} · wait{ms} · size{w,h} · log{} (errores de consola acumulados) · quit{}
import { chromium } from 'playwright';
import { createServer } from 'node:http';

const [,, port = 9333, w = 1920, h = 1080] = process.argv;
const browser = await chromium.launch({
  channel: process.env.CH ?? 'chrome',
  args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11']
});
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
let logs = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
page.on('response', (r) => { if (r.status() >= 400) logs.push(`http ${r.status()}: ${r.request().method()} ${r.url()}`); });

async function run(c) {
  switch (c.op) {
    case 'goto': await page.goto(c.url, { waitUntil: 'networkidle' }); return 'ok';
    case 'click':
      if (c.xy) await page.mouse.click(c.xy[0], c.xy[1]);
      else if (c.sel) await page.locator(c.sel).first().click({ timeout: c.timeout ?? 5000 });
      else await page.getByText(c.text, { exact: c.exact ?? false }).first().click({ timeout: c.timeout ?? 5000 });
      return 'ok';
    case 'move': await page.mouse.move(c.xy[0], c.xy[1], { steps: 4 }); return 'ok';
    case 'type': await page.keyboard.type(c.text); return 'ok';
    case 'key': await page.keyboard.press(c.key); return 'ok';
    case 'eval': return await page.evaluate(c.js);
    case 'shot':
      await page.screenshot({ path: c.path, clip: c.clip ? { x: c.clip[0], y: c.clip[1], width: c.clip[2], height: c.clip[3] } : undefined });
      return c.path;
    case 'wait': await page.waitForTimeout(c.ms ?? 1000); return 'ok';
    case 'size': await page.setViewportSize({ width: c.w, height: c.h }); return 'ok';
    case 'log': { const l = logs; logs = []; return l; }
    case 'quit': setTimeout(() => browser.close().then(() => process.exit(0)), 50); return 'bye';
    default: throw new Error(`orden desconocida: ${c.op}`);
  }
}

createServer((req, res) => {
  let body = '';
  req.on('data', (d) => (body += d));
  req.on('end', async () => {
    try {
      const cmds = JSON.parse(body || '{}');
      const out = [];
      for (const c of Array.isArray(cmds) ? cmds : [cmds]) {
        out.push(await run(c));
        if (c.after) await page.waitForTimeout(c.after);
      }
      res.end(JSON.stringify(out.length === 1 ? out[0] : out, null, 1));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: String(err?.message ?? err) }));
    }
  });
}).listen(+port, '127.0.0.1', () => console.log(`driver listo en :${port}`));
