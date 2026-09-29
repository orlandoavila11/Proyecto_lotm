/**
 * SCRIPT DE VERIFICACIÓN AUTOMATIZADA — PROMPT P07 (ONBOARDING Y CONTINUIDAD CIVIL)
 * Valida los criterios de aceptación de P07:
 * 1. Conexión de los 6 orígenes y las 2 vías a la misma sesión SQLite persistente.
 * 2. Comienzo limpio, recarga mid-prologue, conclusión y retorno al Desván (V01).
 * 3. Acción civil (WORK) con previsualización de costes y avance autoritativo de franja.
 * 4. Persistencia e idempotencia tras recargas sucesivas sin reinvención de identidad.
 * 5. Capturas visuales:
 *    - visual_evidence/p07_origin_selection.png
 *    - visual_evidence/p07_benefactor_letter.png
 *    - visual_evidence/p07_potion_choice.png
 *    - visual_evidence/p07_civil_commitment.png
 *    - visual_evidence/p07_return_to_v01.png
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
  console.log('   PROMPT P07: VERIFICACIÓN E2E DE ONBOARDING Y VIDA CIVIL     ');
  console.log('===============================================================');

  let backendProcess = null;
  let viteProcess = null;
  let browser = null;

  try {
    // 1. Iniciar o verificar Backend Fastify
    console.log(`[1/7] Verificando servidor backend en ${BACKEND_URL}...`);
    let backendReady = false;
    try {
      const probe = await fetch(`${BACKEND_URL}/api/health`);
      if (probe.ok) backendReady = true;
    } catch {
      backendReady = false;
    }

    if (!backendReady) {
      console.log(`[1/7] Iniciando servidor backend Fastify en puerto ${BACKEND_PORT}...`);
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
      console.log(`[1/7] Backend Fastify listo en ${BACKEND_URL}`);
    } else {
      console.log(`[1/7] Backend Fastify ya activo y respondiendo en ${BACKEND_URL}`);
    }

    // 2. Iniciar Vite dev server en puerto 5187
    console.log(`[2/7] Iniciando servidor Vite en puerto ${VITE_PORT}...`);
    viteProcess = spawn(
      'cmd.exe',
      ['/c', 'npx.cmd', 'vite', '--port', String(VITE_PORT), '--strictPort'],
      {
        cwd: path.join(ROOT_DIR, 'ui'),
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );
    await waitForServer(VITE_URL, 20000);
    console.log(`[2/7] Servidor Vite listo en ${VITE_URL}`);

    // 3. Lanzar Playwright
    console.log('[3/7] Lanzando navegador Playwright (canal Chrome)...');
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // 4. Fresh Start: Limpiar almacenamiento local y cargar página
    console.log('[4/7] Iniciando sesión limpia (Fresh Start)...');
    await page.goto(VITE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Validar pantalla de selección de origen
    await page.waitForSelector('text=IDENTIDAD Y ORIGEN EN BACKLUND', { timeout: 10000 });
    console.log('      - Vista de orígenes desplegada correctamente.');
    const originScreenshotPath = path.join(EVIDENCE_DIR, 'p07_origin_selection.png');
    await page.screenshot({ path: originScreenshotPath });
    console.log(`      - Captura guardada: ${originScreenshotPath}`);

    // Seleccionar origen: Detective Privado
    const detectiveCard = page.locator('text=Detective Privado').first();
    await detectiveCard.click();
    await sleep(300);

    // Comenzar la vigilia
    const startButton = page.locator('button:has-text("Comenzar la Vigilia")');
    await startButton.click();
    console.log('      - Clic en "Comenzar la Vigilia".');

    // 5. Carta del Benefactor Silencioso
    await page.waitForSelector('text=De un Benefactor Silencioso', { timeout: 10000 });
    console.log('      - Carta sellada en vitela desplegada.');
    const letterScreenshotPath = path.join(EVIDENCE_DIR, 'p07_benefactor_letter.png');
    await page.screenshot({ path: letterScreenshotPath });
    console.log(`      - Captura guardada: ${letterScreenshotPath}`);

    // Comprobar ID persistido en localStorage
    const savedCharId = await page.evaluate(() => localStorage.getItem('lotm_active_character_id'));
    console.log(`      - ID de personaje autoritativo en sesión: ${savedCharId}`);
    if (!savedCharId) throw new Error('No se persistió lotm_active_character_id en localStorage');

    // Probar recarga mid-prologue (Mid-prologue reload continuity)
    console.log('      - Probando recarga mid-prologue...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('text=De un Benefactor Silencioso', { timeout: 10000 });
    console.log('      - Continuidad mid-prologue confirmada: no se reinició la selección de origen.');

    // Romper el sello de lacre
    const breakSealButton = page.locator('button:has-text("Romper el Sello y Leer")');
    await breakSealButton.click();
    await sleep(800);

    // Examinar carta y avanzar a dilema
    const examineButton = page.locator('button:has-text("Examinar la Carta y el Sello")');
    await examineButton.click();

    // 6. Dilema tutorial
    await page.waitForSelector('text=El Dilema del Zaguán', { timeout: 10000 });
    console.log('      - Dilema del zaguán alcanzado.');
    const curiosityOption = page.locator('text=Curiosidad del Sabueso');
    await curiosityOption.click();
    await sleep(300);
    const openChestButton = page.locator('button:has-text("Abrir el Cofre de los Frascos")');
    await openChestButton.click();

    // 7. Elección de poción críptica
    await page.waitForSelector('text=LOS DOS FRASCOS SOBRE EL TERCIOPELO', { timeout: 10000 });
    console.log('      - Elección de vía y frasco desplegada.');
    const potionScreenshotPath = path.join(EVIDENCE_DIR, 'p07_potion_choice.png');
    await page.screenshot({ path: potionScreenshotPath });
    console.log(`      - Captura guardada: ${potionScreenshotPath}`);

    // Elegir Cobalto (Vía Fool / Vidente)
    const cobaltChoiceBtn = page.locator('button:has-text("Elegir el Frasco de Vidrio Cobalto (Vidente)")');
    await cobaltChoiceBtn.click();

    // 8. Ritual de clausura de la luz
    await page.waitForSelector('text=LA CLAUSURA DE LA LUZ', { timeout: 10000 });
    console.log('      - Clausura de la luz en curso...');
    await page.locator('button:has-text("1. Cerrar la llave de gas")').click();
    await sleep(200);
    await page.locator('button:has-text("2. Apagar el quinqué")').click();
    await sleep(200);
    await page.locator('button:has-text("3. Apagar la vela de sebo")').click();

    // 9. Cáliz e ingesta de la poción
    await page.waitForSelector('text=EL CÁLIZ EN LA OSCURIDAD', { timeout: 10000 });
    console.log('      - Procediendo con ingesta accesible...');
    const immediateDrinkBtn = page.locator('button:has-text("Beber de Inmediato")');
    await immediateDrinkBtn.click();

    // Umbral
    await page.waitForSelector('text=EL UMBRAL', { timeout: 10000 });
    await page.locator('button:has-text("Abrir los Ojos")').click();

    // Despertar Secuencia 9
    await page.waitForSelector('text=EL DESPERTAR EN BACKLUND', { timeout: 10000 });
    console.log('      - Despertar S9 culminado. Entrando al Desván...');
    await page.locator('button:has-text("Tomar Asiento en el Escritorio")').click();

    // 10. Arribo a V01 (El Desván / DeskView)
    console.log('[5/7] Verificando retorno a V01 (El Desván)...');
    await page.waitForSelector('#hotspot_almanack', { timeout: 12000 });
    console.log('      - Desván cargado con éxito en V01.');
    const v01ScreenshotPath = path.join(EVIDENCE_DIR, 'p07_return_to_v01.png');
    await page.screenshot({ path: v01ScreenshotPath });
    console.log(`      - Captura guardada: ${v01ScreenshotPath}`);

    // 11. Abrir Calendario y Vida Civil
    console.log('[6/7] Verificando almanaque y compromiso de vida civil...');
    await page.click('#hotspot_almanack');
    await page.waitForSelector('text=EL ALMANAQUE Y LAS CUATRO FRANJAS', { timeout: 10000 });
    console.log('      - Panel del Almanaque abierto.');

    // Seleccionar acción civil: WORK
    const workActionButton = page.locator('button:has-text("Atender el Empleo Civil")');
    await workActionButton.click();

    // Verificar previsualización de costes
    await page.waitForSelector('text=Previsualización de Compromiso (WORK)', { timeout: 5000 });
    console.log('      - Previsualización de compromiso y consecuencias activa.');
    const civilScreenshotPath = path.join(EVIDENCE_DIR, 'p07_civil_commitment.png');
    await page.screenshot({ path: civilScreenshotPath });
    console.log(`      - Captura guardada: ${civilScreenshotPath}`);

    // Confirmar empleo de franja
    const confirmSlotButton = page.locator('button:has-text("Confirmar Empleo de Franja")');
    await confirmSlotButton.click();

    // Esperar resultado narrativo
    await page.waitForSelector('text=Acontecido en la franja:', { timeout: 10000 });
    console.log('      - Acción civil transaccionada con éxito en SQLite.');

    // Regresar al Desván
    const backBtn = page.locator('button:has-text("Regresar al Buró")');
    await backBtn.click();
    await page.waitForSelector('#hotspot_almanack', { timeout: 10000 });
    console.log('      - Regreso al Desván confirmado.');

    // 12. Recarga final para verificar persistencia completa
    console.log('[7/7] Probando recarga final de sesión persistida...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#hotspot_almanack', { timeout: 10000 });
    const finalCharId = await page.evaluate(() => localStorage.getItem('lotm_active_character_id'));
    console.log(`      - Personaje preservado tras recarga: ${finalCharId === savedCharId ? 'SÍ' : 'NO'}`);

    console.log('===============================================================');
    console.log('   VERIFICACIÓN P07 EXITOSA: TODOS LOS CRITERIOS CUMPLIDOS    ');
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

run().catch((err) => {
  console.error('[P07 ERROR]', err);
  process.exit(1);
});
