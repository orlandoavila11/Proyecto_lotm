# REGISTRO DE DECISIONES DE ARQUITECTURA Y DIRECCIÓN (DECISIONS.md)
**Path to Godhood (LOTM_ENGINE_REBORN)**
**Fecha:** 28 de septiembre de 2026
**Baseline de Referencia:** `1eb779faca93939fd4bdd14f1501c7351544c2b8`

---

## 1. MANDATO Y AUTORIDAD DEL PROYECTO

El usuario ha autorizado formalmente la elevación visual y técnica del proyecto existente mediante la integración de **Phaser 4.2.1** para escenarios, objetos, cámaras, iluminación y efectos tácticos, preservando el frontend **React** existente para lecturas accesibles, tipografía editorial, formularios y menús HUD.

Se desestima la propuesta de migración externa a Godot. El trabajo se ancla y se entrega exclusivamente en el repositorio existente `LOTM_SIMULADOR`.

---

## 2. ACTUALIZACIÓN ACOTADA DE REGLAS DE PRESENTACIÓN

De acuerdo con la directriz del documento rector (*01_DIRECCION_DEL_JUEGO.md*, §I.14):

1. **Información Mecánica Útil Autorizada en UI:**
   - *Regla histórica:* Prohibición absoluta de números mecánicos en la pantalla (sanidad, PA, costes, turnos).
   - *Actualización autorizada:* Se autoriza la visualización de información mecánica conocida por el jugador (como puntos de acción restantes, coste en peniques, munición en tambor, franja horaria o identificadores de turno) cuando esta ayude activamente a la jugabilidad y toma de decisiones tácticas.
   - *Salvaguarda:* Se mantiene la prohibición estricta de revelar secretos narrativos, atributos ocultos de enemigos, fórmulas de probabilidad interna no conocidas o verdades no descubiertas de casos.
2. **Extensión de Etiquetas en Reposo:**
   - *Regla histórica:* Límite de 7 palabras por objeto en reposo.
   - *Actualización autorizada:* Los objetos y paneles pueden usar la longitud necesaria para garantizar claridad y accesibilidad, siempre que no sobrecarguen la escena con texto analítico apilado.
3. **Inmutabilidad de Canon y Datos (Tier L):**
   - El canon de *Lord of the Mysteries* y los 67 archivos de Tier L permanecen inmutables bajo control criptográfico SHA-256 (`manifest.json` v1.1 / v2.0). Ninguna decisión artística o de interfaz autoriza modificar el lore ni las vías.

---

## 3. DECISIONES DE ARQUITECTURA (ADRs)

### ADR-001: Entrada de Renderizado Dual Reversible (`?renderer=phaser`)
- **Contexto:** Se requiere integrar Phaser sin romper la vista existente ni perder capacidad de comparación inmediata.
- **Decisión:** `App.tsx` soportará el parámetro `?renderer=phaser`. Por defecto, la aplicación seguirá operativa en React/DOM durante las fases iniciales (P00-P03). Una vez validado el recorrido completo en P14/P15, Phaser pasará a ser el renderizador predeterminado.
- **Consecuencias:** Ambas vistas consumirán exactamente los mismos servicios de API y el mismo estado de sesión; no se crearán motores de juego ni estados de guardado bifurcados.

### ADR-002: Fuente Única de Estado de Sesión en Cliente (Public Projection)
- **Contexto:** Actualmente varios componentes (`CombatView`, `MarketView`, `CorkboardView`) manejan estados locales no coordinados y recurren a un ID hardcodeado `char_1790267861425`.
- **Decisión:** Definir una capa de sesión tipada (`ui/src/session/`) que almacene la identidad activa, el snapshot de recursos confirmados por el backend y el estado de comandos pendientes.
- **Consecuencias:** Si no hay sesión activa, la UI entra en un estado explícito de selección o creación; queda prohibido inyectar IDs ficticios de respaldo en producción.

### ADR-003: Idempotencia y Recibos Transaccionales (`command_receipts`)
- **Contexto:** Las operaciones de viaje, compra, combate y consumo de pociones pueden fallar por red o repetirse por doble clic.
- **Decisión:** Extender el mecanismo de recibos ya presente en `calendarRoutes.ts` y la migración `009_command_integrity.sql` a todos los endpoints mutacionales (`/api/economy/buy`, `/api/combat/action`, `/api/city/travel`, `/api/ascension/drink`, etc.).
- **Consecuencias:** Cada mutación recibe un `commandId`. Si se reintenta tras un timeout, el servidor devuelve el resultado ya persistido sin duplicar cobros ni daño.

### ADR-004: Erradicación de Autoridad Falsa en el Frontend
- **Contexto:** `CombatView.tsx` otorgaba victorias y huidas en bloques `catch` de red; `AscensionView.tsx` mutaba las 5 puertas a `true` al montarse; `CorkboardView.tsx` sembraba pistas estáticas.
- **Decisión:** La autoridad de reglas reside 100% en Fastify y SQLite. El frontend es exclusivamente un visualizador e intérprete de proyecciones públicas confirmadas.
- **Consecuencias:** Errores de red se presentan como fallos recuperables con opción de reintento, nunca como transiciones de victoria u optimismo no confirmado.

### ADR-005: Pipeline de Arte Basado en Fichas Técnicas y Despiece Real
- **Contexto:** Las capturas y artes previos integraban objetos horneados en el fondo con texto diminuto.
- **Decisión:** El arte de producción se separa en fondos escénicos limpios (WebP/JPEG 1920x1080), objetos de mesa con alpha real (PNG/WebP), sombras de contacto independientes y textos renderizados en HTML vectorial sobre el lienzo.
- **Consecuencias:** Queda prohibido recortar screenshots conceptuales para usarlos como falsa interfaz. Todo recurso que entre a producción debe contar con su ficha en el manifest de activos.
