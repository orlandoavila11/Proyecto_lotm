# Path to Godhood (LOTM_ENGINE_REBORN)

> RPG sistémico de investigación y doble vida ambientado en el universo de *Lord of the Mysteries*.  
> **Era:** POST-LOTM · PRE-COI (~1353 Quinta Época, ~1 año post-Guerra de los Dioses, Klein en letargo).

---

## 1. DESCRIPCIÓN DEL PROYECTO

*Path to Godhood* es una experiencia diegética victoriana donde el jugador encarna a un extraordinario recién despertado en la ciudad de Backlund.
- **De día:** Un ciudadano con empleo formal, alquiler y deudas.
- **De noche:** Un místico que interpreta un papel sobrenatural según las leyes de su Secuencia.
- **Filosofía:** Cero dashboards analíticos, cero números mecánicos en la interfaz visible. El estado del jugador se expresa físicamente mediante objetos sobre la mesa del desván (la vela, el espejo de azogue, las cartas timbradas).

---

## 2. ESTRUCTURA DEL REPOSITORIO (MONORREPO)

```
LOTM_SIMULADOR/
├── package.json              # Workspace root unificado (reborn + ui)
├── .gitignore                # Reglas de exclusión (node_modules, saves, dist)
├── .agentignore              # Reglas de protección post-purga
├── AGENTS.md                 # Mapa operativo canónico y leyes inviolables
├── reborn/                   # Backend modular y núcleo del motor de juego
│   ├── package.json          # Fastify, node:sqlite, zod, tsx
│   ├── src/
│   │   ├── server/           # Fastify server y rutas REST
│   │   ├── core/             # Motores de dominio puro (acting, combat, investigation, somatics)
│   │   └── infra/            # DatabaseClient (SQLite relacional) y schemas
│   ├── data/
│   │   ├── content/          # Tier L: Biblioteca canónica inmutable (67 JSONs)
│   │   └── gameplay/         # Tier G: Contrato jugable y tablas de balance
│   └── tests/                # Suites de pruebas automatizadas (Gates G1-G7)
├── ui/                       # Frontend React (TypeScript + Vite + TailwindCSS)
│   ├── package.json
│   ├── public/art/           # Galería de activos artísticos victorianos
│   └── src/
│       ├── features/         # Vistas activas (prologue, desk, calendar, combat, corkboard, market, ascension)
│       ├── scene/            # Viewport 1920x1080, cámara y hotspots
│       └── services/         # Cliente API tipado y mapeadores somáticos
└── visual_evidence/          # Capturas PNG automatizadas de validación
```

---

## 3. INSTALACIÓN Y EJECUCIÓN

### Requisitos Previos
- **Node.js:** v22.0.0 o superior (con soporte para `node:sqlite`).
- **NPM:** v10.0.0 o superior con soporte para workspaces.

### Instalación de Dependencias
```bash
npm install
```

### Ejecución en Modo Desarrollo
```bash
# Iniciar backend Fastify (puerto 3456)
npm run dev:server

# Iniciar frontend Vite (puerto 5173 con proxy a backend)
npm run dev:ui
```

### Compilación y Construcción para Producción
```bash
npm run build
```

### Ejecución de Pruebas y Gates de CI
```bash
# Ejecutar suite de pruebas de dominio (175 tests)
npm test

# Ejecutar auditoría anti-mecánica y Ley del Objeto
npm run audit:diegetic

# Comprobar determinismo estricto (prohibición de Math.random)
npm run lint:determinism

# Verificar integridad de biblioteca Tier L
npm run verify:tier-l
```

