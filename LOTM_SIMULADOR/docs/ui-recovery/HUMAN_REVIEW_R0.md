# HUMAN_REVIEW — Brief R0: Auditoría y Conflictos Normativos
**Proyecto:** Path to Godhood  
**Fecha:** 18 de septiembre de 2026  
**Brief de origen:** `BRIEF-10.VISUAL-R0`  

---

### [HR-R0-01] Manifest Tier L: Versionado v1.1 vs v2.0
- **Fuente:** `AGENTS.md` §4 cita manifest v1.1 congelado; `manifest.json` en disco declara `"manifestVersion": "2.0"` con categorización de consumers honesta.
- **Impacto:** Ninguno sobre la integridad de datos (los 67 archivos de Tier L coinciden al 100% en SHA-256 y tamaño exacto verificado por `verify_tier_l.cjs`).
- **Opciones:** 
  1. Ratificar que `manifest.json` v2.0 es la autoridad congelada inmutable que no se regenera. (Recomendado)
  2. Ajustar documentación para declarar equivalencia v1.1/v2.0.
- **Estado:** PENDIENTE DE DECISIÓN DEL DIRECTOR

---

### [HR-R0-02] Alcance de Gates Reales: G1 a G5 vs Referencias a G6/G7
- **Fuente:** `AGENTS.md` y `PATH_TO_GODHOOD_v4.md` establecen G1 a G5 como autoridad. Textos antiguos citan G6 y G7.
- **Impacto:** Claridad de validación. La suite actual corre G1 (simulador de jugador), G2 (cobertura Tier G), G3 (batería Kill-9 en 5 dominios), G4 (protocolo humano de 90 min) y G5 (diversidad de vías).
- **Opciones:**
  1. Ratificar que la suite oficial se compone de Gates G1 a G5. (Recomendado)
- **Estado:** PENDIENTE DE DECISIÓN DEL DIRECTOR

---

### [HR-R0-03] Expresión Diegética de Importes Monetarios vs Anti-Mecánico
- **Fuente:** `INSTRUCCIONES_Y_RESTRICCIONES_UI.md` §7 y `AGENTS.md` §3.13.
- **Impacto:** Distinción entre stats numéricos prohibidos (HP, Sanidad %, Ruina numérico) y datos diegéticos naturales (importes en recibos, 2 libras 5 chelines, días de calendario, Secuencia 9).
- **Opciones:**
  1. Ratificar formalmente en R1 que cantidades de dinero, precios de mercado en recibos, fechas de almanaque y números de secuencia dentro de la ficción son válidos si se presentan en soportes diegéticos (papel timbrado, recibos, moneda). (Recomendado)
- **Estado:** PENDIENTE DE DECISIÓN DEL DIRECTOR EN R1

---

### [HR-R0-04] Topología de Navegación del Desván (Escena vs Píldoras Flotantes)
- **Fuente:** Auditoría visual R0 (`DeskView.tsx` y capturas).
- **Impacto:** En el frontend actual, el acceso al Velo, Calendario, Bazar y Combate se realiza mediante botones tipo pill flotantes con iconos genéricos en lugar de objetos físicos interactivos en la mesa/pared.
- **Opciones:**
  1. Sustituir en R1/R3 todos los botones flotantes por objetos integrados: Almanaque (reloj/calendario físico sobre la mesa), Bazar (carta/recibo sellado), Combate (picaporte/arma disimulada en el cajón), Velo (lente/tercer ojo ceremonial). (Recomendado)
- **Estado:** PENDIENTE DE ELECCIÓN DE COMPOSICIÓN EN R1

---

### [HR-R0-05] Presupuesto de Rendimiento y Mediciones de Bundle
- **Fuente:** Plan de recuperación propone < 400 kB JS inicial y respuesta < 100 ms.
- **Medición Real en R0:** JS inicial es de 330.46 kB (gzip: 100.03 kB); CSS es de 7.48 kB.
- **Opciones:**
  1. Ratificar el presupuesto de JS inicial uncompressed <= 400 kB (gzip <= 120 kB). (Recomendado)
- **Estado:** PENDIENTE DE RATIFICACIÓN EN R1

