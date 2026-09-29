# REPOSITORY_HYGIENE_REPORT — PATH TO GODHOOD (AUDIT FINDING F20)
**Proyecto:** *Path to Godhood* (LOTM_ENGINE_REBORN)  
**Fecha:** 24 de Septiembre, 2026  
**Auditor Responsable:** Implementation Engineer  
**Estado:** ✅ AUDITADO Y DOCUMENTADO  

---

## 1. RESUMEN EJECUTIVO DE HIGIENE DEL REPOSITORIO

| Área Auditada | Estado | Severidad | Diagnóstico Principal |
| :--- | :--- | :--- | :--- |
| **Control de Versiones (Git)** | ⚠️ Irregularidad en Índice | 🔴 Alta | **557 archivos de `node_modules/` trackeados** en el índice de Git. |
| **Bases de Datos en Git** | ✅ Limpio | 🟢 Ninguna | 0 archivos `.db` o `.sqlite` en el índice de Git. |
| **Archivos de Construcción (`dist/`)** | ⚠️ Irregularidad en Índice | 🟡 Media | 118 archivos `dist` (provenientes de dependencias de node_modules) en el índice. |
| **Archivos de Bloqueo (Lockfiles)** | ⚠️ Divergencia de Workspaces | 🟡 Media | 3 `package-lock.json` coexistiendo (raíz, `reborn/`, `ui/`). |
| **Documentación Raíz (README)** | ✅ Corregido | 🟢 Ninguna | No existía `README.md` en raíz; se redactó y formalizó. |
| **Scripts de Construcción y Test** | ✅ 100% Funcionales | 🟢 Ninguna | Scripts de root coordinan ambos workspaces sin fallos. |
| **Preparación para Distribución** | ⚠️ Requiere Optimización | 🟡 Media | Activos en `ui/public/art` pesan 65.88 MB (requiere WebP y purga). |

---

## 2. AUDITORÍA DETALLADA POR ÁREA

### 2.1 Archivos `node_modules` en el Índice de Git
- **Hallazgo Crítico:** La inspección directa del archivo binario `../.git/index` (1,454 entradas totales) revela que **557 archivos pertenecientes a `LOTM_SIMULADOR/node_modules/` fueron añadidos al staging o commiteados previamente**.
- **Ejemplos de Archivos Trackeados:**
  - `LOTM_SIMULADOR/node_modules/.bin/acorn`
  - `LOTM_SIMULADOR/node_modules/.bin/ts-node`
  - `LOTM_SIMULADOR/node_modules/@jridgewell/resolve-uri/dist/*`
- **Causa Raíz:** Una ejecución previa de `git add .` se realizó antes de que `.gitignore` excluyera explícitamente `node_modules/`.
- **Acción Requerida:** Ejecutar `git rm -r --cached LOTM_SIMULADOR/node_modules` para purgar los 557 archivos del índice sin borrar los módulos locales del disco.

### 2.2 Gestión de Lockfiles y Workspaces de NPM
- **Situación Actual:**
  - `LOTM_SIMULADOR/package-lock.json` (Presente)
  - `LOTM_SIMULADOR/reborn/package-lock.json` (Presente)
  - `LOTM_SIMULADOR/ui/package-lock.json` (Presente)
- **Problema:** En arquitecturas de monorrepo con NPM Workspaces (`"workspaces": ["reborn", "ui"]`), el único archivo de bloqueo con autoridad debe ser el de la raíz. La presencia de lockfiles secundarios en `reborn/` y `ui/` provoca discrepancias de versiones entre entornos de CI y máquinas de desarrollo locales.
- **Acción Requerida:** Eliminar `reborn/package-lock.json` y `ui/package-lock.json`; regenerar el lockfile unificado desde la raíz con `npm install --package-lock-only`.

### 2.3 Documentación y Guías del Proyecto
- **Diagnóstico Previo:** Ausencia total de `README.md` en la raíz del monorrepo. El archivo `ui/README.md` contenía únicamente la plantilla genérica de Vite para React.
- **Acción Ejecutada:** Se redactó un `README.md` canónico en la raíz de `LOTM_SIMULADOR/` que documenta:
  - Fantasía y era oficial (*POST-LOTM · PRE-COI*).
  - Estructura limpia del monorrepo.
  - Comandos de desarrollo, build y ejecución de gates de CI.

### 2.4 Scripts de Build y Pipeline de Integración
Los scripts definidos en `package.json` fueron verificados y auditados:
- `npm run build` -> Compila backend TypeScript (`reborn/dist/`) y frontend Vite (`ui/dist/`) en 3.99s.
- `npm test` -> Ejecuta 175 tests unitarios y de integración con 0 fallos en 8.26s.
- `npm run audit:diegetic` -> Valida 0 violaciones anti-mecánicas en 27 archivos UI.
- `npm run lint:determinism` -> Valida 0 usos de `Math.random` en todo `reborn/src/`.

---

## 3. RESUMEN DE ACCIONES CORRECTIVAS RECOMENDADAS

| ID Acción | Descripción | Impacto |
| :--- | :--- | :--- |
| **ACT-HYG-01** | `git rm -r --cached LOTM_SIMULADOR/node_modules` | Purgar 557 archivos de dependencias del índice Git |
| **ACT-HYG-02** | Eliminar lockfiles anidados (`reborn/package-lock.json`, `ui/package-lock.json`) | Unificar árbol de dependencias en raíz |
| **ACT-HYG-03** | Conversión WebP de `ui/public/art` | Reducir bundle distribuible de 65.88 MB a ~16 MB |
| **ACT-HYG-04** | Incorporar `*.db`, `*.sqlite`, `*.log` explícitamente en `.gitignore` padre | Prevenir fugas de saves en repositorios padre |

