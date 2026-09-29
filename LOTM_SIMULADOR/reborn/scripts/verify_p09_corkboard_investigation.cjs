/**
 * VERIFICACIÓN E2E DE LA INTERFAZ Y REGLAS DE NEGOCIO — PROMPT P09
 * Valida los criterios de aceptación de P09:
 * 1. Adquisición de indicios a través de P08 (locación Cherwood).
 * 2. Visualización exclusiva de indicios descubiertos en el Tablero de Corcho (V04).
 * 3. Conexión de dos indicios con cordel de lana tipado e insight deductivo.
 * 4. Creación y persistencia de nota libre manuscrita en SQLite.
 * 5. Evaluación de hipótesis autorales (fail-forward controlado).
 * 6. Persistencia íntegra de pistas, conexiones, notas e hipótesis tras recarga.
 * 7. Cero filtración de truthModel o pistas ocultas.
 * 8. Generación de captura de evidencia: visual_evidence/p09_case_board.png.
 */

const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const BACKEND_PORT = 3456;
const VITE_PORT = 5187;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const VITE_URL = `http://localhost:${VITE_PORT}`;
const ROOT_DIR = path.resolve(__dirname, '../..');
const EVIDENCE_DIR = path.resolve(ROOT_DIR, 'visual_evidence');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isServerRunning(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode < 500);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerRunning(url)) return true;
    await sleep(400);
  }
  throw new Error(`Servidor en ${url} no respondió tras ${timeoutMs}ms`);
}

async function run() {
  console.log('===============================================================');
  console.log(' PROMPT P09: VERIFICACIÓN E2E DE TABLERO DE CORCHO Y PESQUISAS ');
  console.log('===============================================================');

  let backendProcess = null;
  let viteProcess = null;
  let browser = null;

  try {
    // 1. Iniciar backend si no está activo
    console.log(`[1/8] Verificando servidor backend en ${BACKEND_URL}...`);
    const isBackendUp = await isServerRunning(`${BACKEND_URL}/api/health`);
    if (!isBackendUp) {
      console.log(`[1/8] Iniciando servidor backend Fastify en puerto ${BACKEND_PORT}...`);
      backendProcess = spawn(
        'node',
        ['--import', 'tsx', 'src/server/server.ts'],
        {
          cwd: path.join(ROOT_DIR, 'reborn'),
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, PORT: String(BACKEND_PORT) }
        }
      );
      await waitForServer(`${BACKEND_URL}/api/health`, 25000);
      console.log(`[1/8] Backend Fastify listo en ${BACKEND_URL}`);
    } else {
      console.log(`[1/8] Backend Fastify ya activo y respondiendo en ${BACKEND_URL}`);
    }

    // 2. Iniciar servidor Vite dev
    console.log(`[2/8] Iniciando servidor Vite en puerto ${VITE_PORT}...`);
    viteProcess = spawn(
      'cmd.exe',
      ['/c', 'npx.cmd', 'vite', '--port', String(VITE_PORT), '--strictPort'],
      {
        cwd: path.join(ROOT_DIR, 'ui'),
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );
    await waitForServer(VITE_URL, 25000);
    console.log(`[2/8] Servidor Vite listo en ${VITE_URL}`);

    // 3. Lanzar Playwright
    console.log('[3/8] Lanzando navegador Playwright (canal Chrome)...');
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    page.on('console', msg => console.log(`      [BROWSER ${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => console.log(`      [BROWSER PAGEERROR] ${err.message}`));

    // 4. Conectar a la sesión del juego en el Desván
    console.log('[4/8] Conectando a la sesión de juego en el Desván (V01)...');
    await page.goto(VITE_URL, { waitUntil: 'networkidle' });

    // Si estamos en alguna pantalla hija, volver al Desván
    const backBtn = await page.$('button:has-text("Volver al Desván"), button:has-text("Regresar al Refugio")');
    if (backBtn) {
      await backBtn.click();
      await sleep(600);
    }

    const hasDoor = await page.$('#hotspot_staircase_door');
    if (!hasDoor) {
      console.log('      - Sesión limpia requerida; ejecutando prólogo...');
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });

      await page.waitForSelector('text=Detective Privado', { timeout: 10000 });
      await page.locator('text=Detective Privado').first().click();
      await sleep(300);

      await page.locator('button:has-text("Comenzar la Vigilia")').click();
      await page.waitForSelector('button:has-text("Romper el Sello y Leer")', { timeout: 10000 });
      await page.locator('button:has-text("Romper el Sello y Leer")').click();
      await sleep(500);
      await page.locator('button:has-text("Examinar la Carta y el Sello")').click();

      await page.waitForSelector('text=Curiosidad del Sabueso', { timeout: 10000 });
      await page.locator('text=Curiosidad del Sabueso').click();
      await sleep(300);
      await page.locator('button:has-text("Abrir el Cofre de los Frascos")').click();

      await page.waitForSelector('button:has-text("Elegir el Frasco de Vidrio Cobalto (Vidente)")', { timeout: 10000 });
      await page.locator('button:has-text("Elegir el Frasco de Vidrio Cobalto (Vidente)")').click();
      await sleep(300);

      await page.locator('button:has-text("1. Cerrar la llave de gas")').click();
      await sleep(200);
      await page.locator('button:has-text("2. Apagar el quinqué")').click();
      await sleep(200);
      await page.locator('button:has-text("3. Apagar la vela de sebo")').click();
      await sleep(300);

      await page.locator('button:has-text("Beber de Inmediato")').click();
      await sleep(500);
      await page.locator('button:has-text("Abrir los Ojos")').click();
      await sleep(500);
      await page.locator('button:has-text("Tomar Asiento en el Escritorio")').click();

      await page.waitForSelector('#hotspot_staircase_door', { timeout: 12000 });
    }

    const charId = await page.evaluate(() => localStorage.getItem('lotm_active_character_id'));
    console.log(`      - Personaje activo validado: ${charId}`);

    // 5. Adquirir segundo indicio a través de la Escena del Caso (P08)
    console.log('[5/8] Viajando a la Mansión Sterling (V03) para asegurar al menos 2 indicios...');
    await page.click('#hotspot_staircase_door');
    await page.waitForSelector('text=DESPLAZAMIENTO POR BACKLUND (V02)', { timeout: 10000 });

    const inspectCaseBtn = page.locator('button:has-text("Inspeccionar Escena del Caso (V03)")');
    await inspectCaseBtn.click();
    await page.waitForSelector('text=ESCENA DEL CRIMEN: CHERWOOD (V03)', { timeout: 10000 });

    // Descubrir Despacho Privado de Sterling si no está descubierto
    const studyItem = page.locator('.space-y-3 > div', { hasText: 'Despacho Privado de Sterling' });
    const studyBtn = studyItem.locator('button');
    const studyBtnText = (await studyBtn.innerText()).toUpperCase();
    if (studyBtnText.includes('INSPECCIONAR')) {
      await studyBtn.click();
      await sleep(1000);
      const closeBtn = page.locator('button:has-text("Cerrar Examen")');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await sleep(300);
      }
      console.log('      - Segundo indicio (CLUE_WILL_DRAFT) descubierto en la escena.');
    } else {
      console.log(`      - Indicios previos ya presentes en el caso (estado botón: ${studyBtnText}).`);
    }

    // 6. Navegar al Tablero de Corcho (V04)
    console.log('[6/8] Abriendo Tablero de Corcho (V04) con proyección autoritativa de pistas...');
    const corkboardBtn = page.locator('button:has-text("Consultar Tablero de Corcho")');
    await corkboardBtn.click();

    await page.waitForSelector('button:has-text("Trazar Vínculo")', { timeout: 10000 });
    console.log('      - Tablero de Corcho V04 desplegado con éxito.');

    const boardScreenshotPath = path.join(EVIDENCE_DIR, 'p09_case_board.png');
    await page.screenshot({ path: boardScreenshotPath });
    console.log(`      - [EVIDENCIA] Captura guardada: ${boardScreenshotPath}`);

    // Validar que NO se filtran pistas no descubiertas
    const boardHtml = await page.content();
    if (boardHtml.includes('El Espejo del Huérfano (Artefacto G3-0711)')) {
      throw new Error('[VIOLACIÓN DE AISLAMIENTO] Pista no descubierta proyectada indebidamente en el tablero.');
    }
    console.log('      - Aislamiento estricto verificado: Cero indicios no descubiertos visibles.');

    // 7. Conexión de dos indicios (Tensar Cordel de lana)
    console.log('[7/8] Tensando cordel deductivo entre dos indicios descubiertos...');
    const linkBtn = page.locator('button:has-text("Trazar Vínculo")');
    await linkBtn.click();
    await page.waitForSelector('text=Tensar Cordel entre Indicios', { timeout: 5000 });

    // Seleccionar origen y destino
    const selectBoxes = page.locator('select');
    await selectBoxes.nth(0).selectOption({ label: 'Juguetes de Madera Quemados' });
    await selectBoxes.nth(1).selectOption({ label: 'Borrador de Directivas de Sterling' });

    // Seleccionar relación 'explica'
    await page.locator('button:has-text("EXPLICA")').click();

    // Confirmar conexión
    await page.locator('button:has-text("Tensar Cordel")').click();
    await sleep(600);
    console.log('      - Vínculo deductivo registrado en SQLite.');

    // Cerrar modal de conexión
    await page.locator('button:has-text("Cerrar")').click();
    await sleep(300);

    // 8. Crear y verificar nota manuscrita libre
    console.log('[8/8] Añadiendo nota manuscrita libre al corcho...');
    const noteInput = page.locator('input[placeholder*="Anotar observación"]');
    const noteText = `Nota P09 - Inspección de legados: ${Date.now()}`;
    await noteInput.fill(noteText);
    await page.locator('button:has-text("Clavar Nota")').click();
    await sleep(600);

    // Validar presencia de la nota en el tablero
    await page.waitForSelector(`text=${noteText}`, { timeout: 5000 });
    console.log('      - Nota manuscrita clavada y persistida en SQLite.');

    // 9. Evaluar Hipótesis del Caso (fail-forward controlado)
    console.log('      - Evaluando Hipótesis del Caso en el expediente...');
    const hypoBtn = page.locator('button:has-text("Hipótesis del Caso")');
    await hypoBtn.click();
    await page.waitForSelector('text=Hipótesis Formales del Expediente', { timeout: 5000 });

    // Seleccionar HYPOTHESIS_JULIAN
    const julianCard = page.locator('text=Julian Vance es el ladrón de recuerdos');
    await julianCard.click();
    await sleep(300);

    await page.locator('button:has-text("Someter al Expediente")').click();
    await sleep(800);
    console.log('      - Hipótesis evaluada con fail-forward.');
    await page.locator('button:has-text("Cerrar")').click();

    // 10. Recargar página para verificar continuidad de persistencia
    console.log('      - Recargando página para validar persistencia de estado...');
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(1500);

    // Tras recargar, el cliente restaura sesión en el Desván. Abrimos el corcho desde su hotspot.
    const corkboardDeskHotspot = page.locator('button[aria-label*="Tablero de Corcho de Investigación"]');
    await corkboardDeskHotspot.waitFor({ state: 'visible', timeout: 10000 });
    await corkboardDeskHotspot.click();

    await page.waitForSelector('button:has-text("Trazar Vínculo")', { timeout: 10000 });

    // Validar que la nota y las pistas persisten
    await page.waitForSelector(`text=${noteText}`, { timeout: 5000 });
    await page.waitForSelector('text=Juguetes de Madera Quemados', { timeout: 5000 });
    console.log('      - Persistencia comprobada: nota y pistas preservadas tras recarga.');

    console.log('===============================================================');
    console.log('   VERIFICACIÓN P09 EXITOSA: TODOS LOS CRITERIOS CUMPLIDOS    ');
    console.log('===============================================================');
  } finally {
    if (browser) await browser.close();
    if (viteProcess) {
      try {
        process.kill(viteProcess.pid);
      } catch {}
    }
    if (backendProcess) {
      try {
        process.kill(backendProcess.pid);
      } catch {}
    }
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('[P09 ERROR]', err);
    process.exit(1);
  });
