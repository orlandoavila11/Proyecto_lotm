# Registro de Skills Instalados para la UI de Path to Godhood

**Fecha de instalación:** 18 de septiembre de 2026  
**Entorno de ejecución:** Windows (PowerShell) | Node v24.20.0 | npm 11.19.0 | Python 3.12.1 | Git 2.53.0  
**Gestor de skills:** `skills@1.7.0` & `ui-ux-pro-max-cli@2.15.0`  
**Destino local:** `.agents/skills/`

---

## 1. Alcance y gobernanza

De acuerdo con la orden de instalación aprobada por el Director:
- **Ámbito:** Exclusivamente herramientas y guías operativas de diseño, interfaz y pruebas para el plan de recuperación UI (`BRIEF-10.VISUAL-R0` a `R10`).
- **Código de producto:** Cero modificaciones en `ui/src/`, `reborn/src/`, `reborn/data/`, dependencias del juego (`package.json`, `package-lock.json`), balance, motores de dominio, Tier L ni `AGENTS.md`.
- **Fase de desarrollo:** Fase 1 ABIERTA.

---

## 2. Inventario de skills autorizados e instalados

| # | Skill | Autor / Procedencia | Versión / Fuente | Ruta Local | Estado |
|---|---|---|---|---|---|
| 1 | `impeccable` | Paul Bakaus (`pbakaus/impeccable`) | GitHub (`main`, hash: `ec48c58c...`) | `.agents/skills/impeccable/SKILL.md` | `INSTALADO` / `VERIFICADO` |
| 2 | `ui-ux-pro-max` | Next Level Builder | npm `ui-ux-pro-max-cli@2.15.0` | `.agents/skills/ui-ux-pro-max/SKILL.md` | `INSTALADO` / `VERIFICADO` |
| 3 | `vercel-react-best-practices` | Vercel (`vercel-labs/agent-skills`) | GitHub (hash: `6b526d01...`) | `.agents/skills/vercel-react-best-practices/SKILL.md` | `INSTALADO` / `VERIFICADO` |
| 4 | `vercel-composition-patterns` | Vercel (`vercel-labs/agent-skills`) | GitHub (hash: `10eb4ec9...`) | `.agents/skills/vercel-composition-patterns/SKILL.md` | `INSTALADO` / `VERIFICADO` |
| 5 | `web-design-guidelines` | Vercel (`vercel-labs/agent-skills`) | GitHub (hash: `d8e7d3af...`) | `.agents/skills/web-design-guidelines/SKILL.md` | `INSTALADO` / `VERIFICADO` |
| 6 | `playwright-cli` | Microsoft (`microsoft/playwright-cli`) | npm `@playwright/cli@0.1.20` / GitHub | `.agents/skills/playwright-cli/SKILL.md` | `INSTALADO` / `VERIFICADO` |

*Nota sobre submódulos auxiliares generados por UI/UX Pro Max CLI:* Se crearon fichas de consulta modular en `.agents/skills/` (`banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`). No interfieren con el juego ni añaden dependencias.

---

## 3. Matriz de verificación y estado operativo

| Skill | Instalado | Recursos verificados | Cargado por el agente | Herramienta operativa | Detalle de comprobación |
|---|:---:|:---:|:---:|:---:|---|
| `impeccable` | SÍ | SÍ | SÍ | SÍ | `SKILL.md` presente con `agents/`, `reference/` y `scripts/`. Sin comandos mutantes ejecutados. |
| `ui-ux-pro-max` | SÍ | SÍ | SÍ | SÍ | Python 3.12.1 validado con `.agents/skills/ui-ux-pro-max/scripts/search.py --help`. Consulta de prueba ejecutada sin mutaciones. |
| `vercel-react-best-practices` | SÍ | SÍ | SÍ | SÍ | `SKILL.md` verificado (reglas de React/Vite aisladas de Next.js). |
| `vercel-composition-patterns` | SÍ | SÍ | SÍ | SÍ | `SKILL.md` verificado (patrones de composición para componentes y modales). |
| `web-design-guidelines` | SÍ | SÍ | SÍ | SÍ | `SKILL.md` verificado (criterios de accesibilidad WCAG, foco, contraste y semántica). |
| `playwright-cli` | SÍ | SÍ | SÍ | SÍ | CLI `@playwright/cli@0.1.20` verificado vía `npx --package=@playwright/cli@0.1.20`. Sesión de prueba `about:blank` con captura y cierre exitoso. |

---

## 4. Registro de hashes (`skills-lock.json`)

```json
{
  "version": 1,
  "skills": {
    "impeccable": {
      "source": "pbakaus/impeccable",
      "sourceType": "github",
      "skillPath": ".agents/skills/impeccable/SKILL.md",
      "computedHash": "ec48c58ca973b42c826d5d3be9069b7023d2361ebf7f89ee56b0bae7eb92390a"
    },
    "playwright-cli": {
      "source": "microsoft/playwright-cli",
      "sourceType": "github",
      "skillPath": "skills/playwright-cli/SKILL.md",
      "computedHash": "09eed98ea76073cf14ca967ed222db08c42407b4db02149a7b4be04b2736ae6f"
    },
    "vercel-composition-patterns": {
      "source": "vercel-labs/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/composition-patterns/SKILL.md",
      "computedHash": "10eb4ec94577b79ae98c63ce3e7f35f8a6a06436a4011bff083b397de6960eeb"
    },
    "vercel-react-best-practices": {
      "source": "vercel-labs/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/react-best-practices/SKILL.md",
      "computedHash": "6b526d013e28073246a36f99b529bc43745d30832ecfa8217b359c34f260ca6b"
    },
    "web-design-guidelines": {
      "source": "vercel-labs/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/web-design-guidelines/SKILL.md",
      "computedHash": "d8e7d3afe37dcc8a97b99ffb5afdb4d0919ae0092ea8b68f44eb201f035e33ac"
    }
  }
}
```

---

## 5. Control de cambios en el repositorio

- **Archivos creados por la instalación:**
  - `.agents/skills/` (carpetas de skills locales)
  - `skills-lock.json` (registro de procedencia del instalador)
  - `.playwright-cli/` (artefactos temporales de la sesión de prueba)
  - `docs/ui-recovery/SKILLS_INSTALADOS.md` (este reporte)
- **Archivos de producto modificados:** CERO (`0`).
- **Estado del proyecto:** Fase 1 ABIERTA. Listo para el brief correspondiente (`P00` / `R0`).

