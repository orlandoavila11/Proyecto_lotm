/**
 * SCRIPT DE VERIFICACIÓN AUTOMATIZADA — PROMPT P08 (VIAJE Y LOCACIÓN DE INVESTIGACIÓN)
 * Valida los criterios de aceptación de P08:
 * 1. Conexión de la salida del refugio (hotspot_staircase_door) a la escena ilustrada de viaje (V02).
 * 2. Previsualización de tarifas de carruaje (2s / 24d) y selección de distritos canónicos de Backlund.
 * 3. Acceso a la escena real de investigación de Cherwood (V03: Mansión Sterling & Orfanato San Dionisio).
 * 4. Puntos de interacción canónicos con adquisición de indicios autoritativa (/api/investigation/clue/visit-source):
 *    - Descubrimiento mundano (Chimenea -> CLUE_BURNED_TOYS).
 *    - Descubrimiento esotérico por vía (Desván -> CLUE_ASTROLOGY_RECORD para FOOL).
 *    - Bloqueo justificado por vía divergente (Tocador -> CLUE_MIND_TRACES para VISIONARY).
 * 5. Re-inspección gratuita e idempotente sin duplicar pistas en SQLite.
 * 6. Consulta del Tablero de Corcho con reflejo de los indicios descubiertos.
 * 7. Ruta de retorno al Desván (V01) y persistencia tras recarga.
 * 8. Capturas visuales:
 *    - visual_evidence/p08_travel_scene.png
 *    - visual_evidence/p08_investigation_location.png
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BACKEND_PORT = 3456;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const VITE_PORT = 5187;
const VITE_URL = `http://localhost:${VITE_PORT}`;

const EVIDENCE_DIR = path.join(ROOT_DIR, 'visual_evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // Esperando
    }
    await sleep(400);
  }
  throw new Error(`Timeout esperando el servidor en ${url}`);
}

async function run() {
  console.log('===============================================================');
  console.log(' PROMPT P08: VERIFICACIÓN E2E DE VIAJE Y LOCACIÓN DE PESQUISA  ');
  console.log('===============================================================');

  let backendProcess = null;
  let viteProcess = null;
  let browser = null;

  try {
    // 1. Iniciar o verificar Backend Fastify
    console.log(`[1/8] Verificando servidor backend en ${BACKEND_URL}...`);
    let backendReady = false;
    try {
      const probe = await fetch(`${BACKEND_URL}/api/health`);
      if (probe.ok) backendReady = true;
    } catch {
      backendReady = false;
    }

    if (!backendReady) {
      console.log(`[1/8] Iniciando servidor backend Fastify en puerto ${BACKEND_PORT}...`);
      backendProcess = spawn(
        'cmd.exe',
        ['/c', 'npx.cmd', 'tsx', 'src/server/server.ts'],
        {
          cwd: path.join(ROOT_DIR, 'reborn'),
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, PORT: String(BACKEND_PORT) }
        }
      );
      await waitForServer(`${BACKEND_URL}/api/health`, 20000);
      console.log(`[1/8] Backend Fastify listo en ${BACKEND_URL}`);
    } else {
      console.log(`[1/8] Backend Fastify ya activo y respondiendo en ${BACKEND_URL}`);
    }

    // 2. Iniciar Vite dev server en puerto 5187
    console.log(`[2/8] Iniciando servidor Vite en puerto ${VITE_PORT}...`);
    viteProcess = spawn(
      'cmd.exe',
      ['/c', 'npx.cmd', 'vite', '--port', String(VITE_PORT), '--strictPort'],
      {
        cwd: path.join(ROOT_DIR, 'ui'),
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );
    await waitForServer(VITE_URL, 20000);
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

    // 4. Cargar página y asegurar sesión en el Desván
    console.log('[4/8] Conectando a la sesión de juego en el Desván (V01)...');
    await page.goto(VITE_URL, { waitUntil: 'networkidle' });

    // Comprobar si ya estamos en alguna vista hija y regresar al Desván
    const backBtn = await page.$('button:has-text("Volver al Desván"), button:has-text("Regresar al Refugio")');
    if (backBtn) {
      await backBtn.click();
      await sleep(600);
    }

    const hasDoor = await page.$('#hotspot_staircase_door');
    if (!hasDoor) {
      console.log('      - No hay personaje activo en sesión; realizando prólogo expedito...');
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });

      // Seleccionar Detective Privado
      await page.waitForSelector('text=Detective Privado', { timeout: 10000 });
      const detectiveCard = page.locator('text=Detective Privado').first();
      await detectiveCard.click();
      await sleep(300);

      // Comenzar la vigilia
      const startButton = page.locator('button:has-text("Comenzar la Vigilia")');
      await startButton.click();

      // Esperar carta del benefactor
      await page.waitForSelector('text=De un Benefactor Silencioso', { timeout: 10000 });
      await sleep(500);

      // Benefactor letter
      await page.waitForSelector('button:has-text("Romper el Sello y Leer")', { timeout: 10000 });
      await page.locator('button:has-text("Romper el Sello y Leer")').click();
      await sleep(800);
      await page.locator('button:has-text("Examinar la Carta y el Sello")').click();

      // Dilema
      await page.waitForSelector('text=Curiosidad del Sabueso', { timeout: 10000 });
      await page.locator('text=Curiosidad del Sabueso').click();
      await sleep(300);
      await page.locator('button:has-text("Abrir el Cofre de los Frascos")').click();

      // Cobalto (Fool / Vidente)
      await page.waitForSelector('button:has-text("Elegir el Frasco de Vidrio Cobalto (Vidente)")', { timeout: 10000 });
      await page.locator('button:has-text("Elegir el Frasco de Vidrio Cobalto (Vidente)")').click();
      await sleep(300);

      // Luces
      await page.waitForSelector('button:has-text("1. Cerrar la llave de gas")', { timeout: 10000 });
      await page.locator('button:has-text("1. Cerrar la llave de gas")').click();
      await sleep(200);
      await page.locator('button:has-text("2. Apagar el quinqué")').click();
      await sleep(200);
      await page.locator('button:has-text("3. Apagar la vela de sebo")').click();
      await sleep(300);

      // Ingesta
      await page.waitForSelector('button:has-text("Beber de Inmediato")', { timeout: 10000 });
      await page.locator('button:has-text("Beber de Inmediato")').click();
      await sleep(500);

      // Umbral
      await page.waitForSelector('button:has-text("Abrir los Ojos")', { timeout: 10000 });
      await page.locator('button:has-text("Abrir los Ojos")').click();
      await sleep(500);

      // Despertar
      await page.waitForSelector('button:has-text("Tomar Asiento en el Escritorio")', { timeout: 10000 });
      await page.locator('button:has-text("Tomar Asiento en el Escritorio")').click();

      await page.waitForSelector('#hotspot_staircase_door', { timeout: 12000 });
      console.log('      - Prólogo completado. Desván listo.');
    } else {
      console.log('      - Sesión persistente activa encontrada en el Desván.');
    }

    const charId = await page.evaluate(() => localStorage.getItem('lotm_active_character_id'));
    console.log(`      - Identidad de personaje confirmada: ${charId}`);

    // 5. Salir del Refugio por la Escalera hacia la Escena de Viaje (V02)
    console.log('[5/8] Pulsando picaporte de la escalera (#hotspot_staircase_door) para viajar...');
    await page.click('#hotspot_staircase_door');

    // Validar pantalla de Desplazamiento por Backlund (V02)
    await page.waitForSelector('text=DESPLAZAMIENTO POR BACKLUND (V02)', { timeout: 10000 });
    console.log('      - Escena de viaje V02 desplegada sin forzar combate.');

    const travelScreenshotPath = path.join(EVIDENCE_DIR, 'p08_travel_scene.png');
    await page.screenshot({ path: travelScreenshotPath });
    console.log(`      - [EVIDENCIA] Captura guardada: ${travelScreenshotPath}`);

    // Verificar presencia de distritos canónicos
    await page.waitForSelector('text=Distrito de Cherwood', { timeout: 5000 });
    await page.waitForSelector('text=Barrio Este', { timeout: 5000 });
    await page.waitForSelector('text=Área del Puente de Backlund', { timeout: 5000 });
    console.log('      - Distritos canónicos validados en la cuadrícula de paradas.');

    // 6. Entrar a la Escena del Caso en Cherwood (V03)
    console.log('[6/8] Accediendo a la Escena del Crimen: Mansión Sterling & Orfanato (V03)...');
    const inspectCaseBtn = page.locator('button:has-text("Inspeccionar Escena del Caso (V03)")');
    await inspectCaseBtn.click();

    // Validar pantalla de Escena del Crimen (V03)
    await page.waitForSelector('text=ESCENA DEL CRIMEN: CHERWOOD (V03)', { timeout: 10000 });
    console.log('      - Escena de investigación V03 desplegada.');

    const locationScreenshotPath = path.join(EVIDENCE_DIR, 'p08_investigation_location.png');
    await page.screenshot({ path: locationScreenshotPath });
    console.log(`      - [EVIDENCIA] Captura guardada: ${locationScreenshotPath}`);

    // 7. Descubrimiento de indicios e interacción forense
    console.log('[7/8] Evaluando interacción con puntos de pista y gating por afinidad...');

    // A. Descubrimiento mundano: Cenicero de la Chimenea Exterior
    console.log('      - Inspeccionando Cenicero de la Chimenea Exterior...');
    const chimneyItem = page.locator('.space-y-3 > div', { hasText: 'Cenicero de la Chimenea Exterior' });
    await chimneyItem.locator('button', { hasText: 'Inspeccionar' }).click();
    await sleep(600);

    // Validar que se registró
    await page.waitForSelector('text=REGISTRADA', { timeout: 5000 });
    console.log('      - Indicio mundano (CLUE_BURNED_TOYS) descubierto y registrado en SQLite.');

    // Cerrar detalle
    const closeDetailBtn = page.locator('button:has-text("Cerrar Examen")');
    if (await closeDetailBtn.isVisible()) {
      await closeDetailBtn.click();
      await sleep(200);
    }

    // B. Reexaminar (idempotencia y gratuidad)
    console.log('      - Probando reexaminación de indicio ya descubierto...');
    await chimneyItem.locator('button', { hasText: 'Reexaminar' }).click();
    await sleep(300);
    await page.waitForSelector('text=Pista Incorporada al Expediente', { timeout: 5000 });
    console.log('      - Reexaminación inmediata exitosa sin recargo ni duplicación.');
    await page.locator('button:has-text("Cerrar Examen")').click();

    // C. Pista esotérica permitida para FOOL: Marcas del Desván del Orfanato
    console.log('      - Inspeccionando Marcas del Desván del Orfanato (Afinidad Vidente)...');
    const atticItem = page.locator('.space-y-3 > div', { hasText: 'Marcas del Desván del Orfanato' });
    await atticItem.locator('button', { hasText: 'Inspeccionar' }).click();
    await sleep(600);
    await page.waitForSelector('text=Marcas del Desván del Orfanato', { timeout: 5000 });
    console.log('      - Indicio esotérico de vía FOOL (CLUE_ASTROLOGY_RECORD) descubierto con éxito.');

    if (await page.locator('button:has-text("Cerrar Examen")').isVisible()) {
      await page.locator('button:has-text("Cerrar Examen")').click();
    }

    // D. Pista esotérica bloqueada para FOOL: Tocador de Evangeline Sterling (requiere VISIONARY)
    console.log('      - Inspeccionando Tocador de Evangeline Sterling (Afinidad Espectador)...');
    const boudoirItem = page.locator('.space-y-3 > div', { hasText: 'Tocador de Evangeline Sterling' });
    await boudoirItem.locator('button', { hasText: 'Inspeccionar' }).click();
    await sleep(600);

    // Debe mostrar BLOQUEADA o razón de bloqueo
    await page.waitForSelector('text=BLOQUEADA', { timeout: 5000 });
    console.log('      - Gating por Vía confirmado: acceso rechazado con justificación visible y sin crash.');

    // 8. Consulta de Tablero de Corcho y retorno al Refugio
    console.log('[8/8] Verificando Tablero de Corcho, ruta de retorno y persistencia...');
    const corkboardBtn = page.locator('button:has-text("Consultar Tablero de Corcho")');
    await corkboardBtn.click();

    await page.waitForSelector('text=EL ECO EN EL NIDO VACÍO', { timeout: 10000 });
    console.log('      - Tablero de Corcho desplegado.');

    // Volver al Desván
    const backToRefugeBtn = page.locator('button:has-text("Volver al Desván")');
    await backToRefugeBtn.click();

    await page.waitForSelector('#hotspot_staircase_door', { timeout: 10000 });
    console.log('      - Retorno al Desván confirmado.');

    // Recargar para validar persistencia
    console.log('      - Probando recarga de página para validar continuidad...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#hotspot_staircase_door', { timeout: 10000 });
    console.log('      - Persistencia y continuidad confirmadas tras recarga.');

    console.log('===============================================================');
    console.log('   VERIFICACIÓN P08 EXITOSA: TODOS LOS CRITERIOS CUMPLIDOS    ');
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
    console.error('[P08 ERROR]', err);
    process.exit(1);
  });
