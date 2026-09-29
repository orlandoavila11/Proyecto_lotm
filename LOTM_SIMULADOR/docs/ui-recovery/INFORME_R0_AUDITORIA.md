# INFORME DE AUDITORÍA Y REFERENCIA TÉCNICA — BRIEF-10.VISUAL-R0
**Proyecto:** Path to Godhood (*LOTM_ENGINE_REBORN*)  
**Fecha:** 18 de septiembre de 2026  
**Commit Auditado:** `0c2aeb1f5de338a880230512ed225de55c1bf5de`  
**Rama:** `main` | **Remoto:** `https://github.com/orlandoavila11/Proyecto_lotm.git`  
**Estado:** LISTO PARA REVISIÓN (Fase 1 ABIERTA)  

---

## 1. Resumen Ejecutivo

El presente informe consolida la auditoría técnica y visual no mutante del estado actual del frontend y backend de *Path to Godhood*, de acuerdo con las instrucciones de `BRIEF-10.VISUAL-R0` y las leyes operativas de `AGENTS.md`.

- **Integridad de Código:** CERO modificaciones en código de producto, backend, datos canónicos o balances.
- **Suites de Validación del Motor:** **100% PASS** en todas las suites reales existentes (136/136 tests pasados, 0 fallos, 0 omitidos).
  - `verify:tier-l`: 67/67 archivos íntegros (SHA-256 exacto).
  - `lint:determinism`: 0 violaciones de `Math.random` en 57 archivos escaneados.
  - `audit:diegetic`: 0 violaciones mecánicas detectadas en 17 archivos escaneados.
  - `lint:tier-g`: 22/22 esquemas Zod validados sin errores.
  - Gates Reales Ejecutados: **G1** (simulador 200 bots, 45.5% ascenso S8), **G3** (batería Kill-9 en 5 dominios), **G5** (divergencia de pistas 81.65%).
- **Compilación de Artefactos:**
  - `build:server`: Éxito vía `tsc`.
  - `build:ui`: Éxito vía `tsc + vite build` en 1.62s. Bundle JS: **330.46 kB** (gzip: 100.03 kB); CSS: **7.48 kB**.
- **Evidencia Visual:** 16 capturas generadas mediante automatización en navegador real en 5 viewports (`1280x720`, `1366x768`, `1440x900`, `1920x1080`, `2560x1440`), disponibles en `docs/ui-recovery/evidence/r0/`.

---

## 2. Entorno y Herramientas Auditadas

| Componente | Versión Observada | Estado / Comando de Invocación |
|---|---|---|
| **Sistema Operativo** | Windows 11 | PowerShell 5.1 |
| **Node.js** | `v24.20.0` | Cumple con requerimiento `>=22.20.0` |
| **npm / npx** | `11.19.0` | Operativo vía `npm.cmd` / `npx.cmd` |
| **Python 3** | `3.12.1` | Operativo vía `py -3` |
| **Git** | `2.53.0` | Ubicado en GitHub Desktop runtime |
| **Skills Gestor** | `skills@1.7.0` | 6 skills instalados en `.agents/skills/` |
| **Navegador de Pruebas** | Google Chrome | Vía Playwright-core `chromium` |

---

## 3. Resultados de Suites y Comprobaciones Existentes

| Script / Comando | Salida / Resumen | Código de Salida | Tiempo |
|---|---|:---:|:---:|
| `npm run verify:tier-l` | `67/67 archivos íntegros (SHA-256 + tamaño exacto)` | **0** | ~3.0s |
| `npm run lint:determinism` | `0 violaciones detectadas en 57 archivos escaneados` | **0** | ~2.5s |
| `npm run audit:diegetic` | `0 violaciones detectadas en 17 archivos escaneados` | **0** | ~2.8s |
| `npm run lint:tier-g` | `22/22 contratos de Tier G cumplen schemas Zod` | **0** | ~4.0s |
| `npm run build:server` | `tsc` compila limpiamente sin errores de tipo | **0** | ~6.0s |
| `npm run build:ui` | `1864 modules transformed. JS: 330.46 kB, CSS: 7.48 kB` | **0** | 1.62s |
| `npm test` | `136 tests pasados, 21 suites, 0 fallos` | **0** | 9.83s |
| **Gate G1 (Simulador)** | `200 corridas, ascenso S8: 45.5%, muertes: 19.5%, colapsos: 24.0%` | **0** | 4.74s |
| **Gate G3 (Kill-9)** | `5 dominios restaurados byte-equivalente en SQLite` | **0** | 0.36s |
| **Gate G5 (Vías)** | `Divergencia media FOOL vs VISIONARY: 81.65% (>60%)` | **0** | 0.07s |
| **Gate G4 (Humano)** | *Requiere evaluadores humanos reales ciegas de 90 min* | - | `NO EJECUTADO` |

---

## 4. Diagnóstico Visual y Contraste con `UI.txt`

Al contrastar la implementación real de `ui/src` y las capturas obtenidas contra el diagnóstico de `UI.txt` y `PLAN_DE_RECUPERACION_UI.md`, se confirman los siguientes hallazgos:

1. **Estructura Rígida y Falta de Perspectiva Espacial:**
   - La vista de `DeskView.tsx` divide la pantalla en dos franjas verticales fijas (`h-[36vh]` para la pared y `h-[64vh]` para la mesa) mediante CSS flexbox.
   - No existe una cámara lógica uniforme 1920x1080 con escala proporcional; en resoluciones ultrawide o compactas los objetos se separan o se apiñan.
2. **Botones Flotantes Tipo Dashboard:**
   - Para acceder al Velo Espiritual, Calendario, Bazar y Combate, la UI utiliza botones tipo píldora (`rounded-full`, con iconos estándar de Lucide como `Eye`, `Clock`, `ShoppingBag`, `ShieldAlert`) en lugar de objetos físicos integrados en el mobiliario.
3. **Superficies Secundarias Desconectadas:**
   - El Corcho, el Calendario, el Bazar y el Combate se renderizan como vistas completas que reemplazan totalmente el Desván (cambio abrupto de `currentView`), en lugar de transiciones de foco o despliegues espaciales en la mesa/pared.
4. **Hit Areas y Accesibilidad:**
   - El Cáliz en la repisa tiene un tamaño pequeño de 32x40px, por debajo de los 44x44px recomendados.
   - `DeskCracksOverlay` utiliza un SVG con posición absoluta sobre toda la mesa, lo que puede interceptar eventos de puntero si no se controla `pointer-events-none`.
   - La navegación por teclado (Tab/Shift+Tab) no tiene orden de foco espacial definido ni indicador visible persistente en reposo.
5. **Alineación Positiva:**
   - Cero términos mecánicos visibles en pantalla (cumple `audit:diegetic`).
   - El flujo del Prólogo respeta los 6 orígenes canónicos, la elección críptica de frascos y el gesto Hold-to-Drink de 3.0s.

---

## 5. Inventario Técnico Completo

### A. Endpoints REST Activos en Fastify (`reborn/src/server/routes/`)
- `GET /api/health` — Estado del motor, vías cargadas y distritos.
- `POST /api/character/new` — Creación y asignación de origen.
- `GET /api/character/:id` — Recuperación del estado del personaje.
- `POST /api/character/advance-day` — Avance de calendario y cálculo semanal.
- `GET /api/acting/dilemma/:characterId` — Obtención de dilemas canónicos.
- `POST /api/acting/resolve` — Resolución transaccional de actuación.
- `GET /api/city/districts` — Distritos de Backlund.
- `POST /api/city/travel` — Desplazamiento urbano y eventos de convergencia.
- `GET /api/investigation/case/:characterId` — Estado del caso y pistas descubiertas.
- `POST /api/investigation/clue/discover` — Descubrimiento de pista con gating de vía.
- `POST /api/investigation/hypothesis/submit` — Formulación y conexión de hipótesis.
- `POST /api/investigation/verdict` — Resolución acusatoria del caso.
- `GET /api/market/catalog` — Catálogo del bazar según distrito/semana.
- `POST /api/market/purchase` — Compra transaccional con persistencia.
- `POST /api/combat/start` — Inicio de combate táctico 5x7.
- `POST /api/combat/action` — Ejecución de acción táctica y avance de turno.
- `GET /api/combat/status/:battleId` — Estado de batalla activa.
- `POST /api/ascension/attempt` — Ritual de ascensión y apertura de puertas.

### B. Objetos Diegéticos Identificados en Escena
- **La Vela de Sebo:** Reflejo de sanidad (`SanityTier`).
- **El Espejo de Azogue:** Reflejo de corrupción (`CorruptionTier`).
- **Las Grietas de la Madera:** Reflejo de ruina acumulada (`RuinaTier`).
- **El Pliego Notarial / Papeles:** Identidad civil, profesión, distrito, carga y 3 anclas.
- **El Cuaderno de Cuero:** Principios de actuación y diario de digestión.
- **El Saquito de Cuero:** Fondos en libras, chelines y peniques.
- **El Tablero de Corcho:** Caso Cherwood, pistas e hilos lógicos.
- **El Reloj / Almanaque:** Franja horaria y rutina semanal.
- **La Misiva Sellada:** Bazar clandestino.
- **El Picaporte / Umbral:** Estado de alerta táctica y combate.
- **El Cáliz de Plata:** Repisa ritual y ascensión de secuencia.

### C. Métricas de Rendimiento del Frontend
- **Bundle JavaScript Uncompressed:** `330.46 kB` (Target: `< 400 kB` — **CUMPLE**)
- **Bundle JavaScript Gzip:** `100.03 kB`
- **Bundle CSS:** `7.48 kB` (gzip: `2.53 kB`)
- **Tiempo de build:** `1.62 s`
- **Módulos transformados:** `1,864`

---

## 6. Clasificación de Hallazgos

### P0 (Bloqueantes de Experiencia / Integridad)
- *Ninguno detectado en el motor de dominio ni en los datos.* El motor persiste transaccionalmente en SQLite y la suite pasa 136/136 tests.

### P1 (Defectos Estructurales de UI / Navegación)
- **[P1-UI-01] Navegación por Reemplazo Total:** Las superficies secundarias (Corcho, Almanaque, Bazar, Combate) desmontan El Desván en lugar de ser inspecciones o transiciones espaciales coherentes.
- **[P1-UI-02] Botones Flotantes Tipo Widget:** Presencia de botones tipo píldora (`rounded-full`) con iconos genéricos que rompen la inmersión diegética.
- **[P1-UI-03] Ausencia de Máquina Central de Estados de Navegación:** El enrutamiento actual depende de un `useState` básico en `App.tsx` sin pila de retorno tipada ni restauración de foco accesible.

### P2 (Mejoras de Acabado y Ergonomía)
- **[P2-UI-01] Hit Area del Cáliz:** Dimensión reducida (32x40px) requiere ampliación a `>= 44x44px` con hit area semántica.
- **[P2-UI-02] Indicadores de Foco por Teclado:** Se requiere foco visible de alto contraste acorde a la paleta victoriana para navegación accesible sin mouse.

---

## 7. Propuesta Acotada para Brief R1

Para el brief **BRIEF-10.VISUAL-R1**, se propone:
1. Diseñar dos composiciones conceptuales (**A** y **B**) para El Desván sobre el lienzo lógico uniforme `1920x1080` (integrando pared, mesa de caoba, ventana de niebla, estantería y escalera).
2. Eliminar definitivamente los botones flotantes de Velo, Almanaque, Bazar y Guardia, sustituyéndolos por objetos diegéticos con silueta y ubicación física natural.
3. Modelar la máquina de navegación tipada con estados de cámara (Wide, Focus, Inspection) y pila de retorno unificada.
4. Elaborar el catálogo de fichas de activos y la matriz de estados somáticos (vela, espejo, madera) para someter a aprobación del Director.

---

**Estado de Entrega:** `LISTO PARA REVISIÓN`  
*Queda a la espera de la revisión humana y firma del Director antes de iniciar R1.*

