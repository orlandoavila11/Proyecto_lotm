import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DilemmaGSchema,
  CaseGSchema,
  CombatantGSchema,
  ArtifactGSchema,
  ConspiracyGSchema,
  NpcWeekGSchema,
  ConvergenceForcesRootGSchema,
  SefiraGroupsGSchema,
  PathwaysManifestGSchema,
  WorldStateRootSchema
} from '../src/infra/content/schemas/index.js';

interface SchemaTarget {
  name: string;
  pattern: string; // Relative path or glob directory in data/gameplay/
  schema: any;
  isArray?: boolean;
}

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const gameplayDir = path.join(packageRoot, 'data', 'gameplay');

const TARGETS: SchemaTarget[] = [
  {
    name: 'SEFIRA_GROUPS_G',
    pattern: 'sefira_groups.json',
    schema: SefiraGroupsGSchema
  },
  {
    name: 'PATHWAYS_MANIFEST_G',
    pattern: 'pathways.manifest.json',
    schema: PathwaysManifestGSchema
  },
  {
    name: 'CONVERGENCE_FORCES_G',
    pattern: 'convergence_forces.json',
    schema: ConvergenceForcesRootGSchema
  },
  {
    name: 'WORLD_STATE_G',
    pattern: 'world_state.json',
    schema: WorldStateRootSchema
  },
  {
    name: 'DILEMMA_G',
    pattern: 'dilemmas',
    schema: DilemmaGSchema
  },
  {
    name: 'CASE_G',
    pattern: 'cases',
    schema: CaseGSchema
  },
  {
    name: 'COMBATANT_G',
    pattern: 'combatants',
    schema: CombatantGSchema
  },
  {
    name: 'ARTIFACT_G',
    pattern: 'artifacts',
    schema: ArtifactGSchema
  },
  {
    name: 'CONSPIRACY_G',
    pattern: 'conspiracies',
    schema: ConspiracyGSchema
  },
  {
    name: 'NPC_WEEK_G',
    pattern: 'npc_weeks',
    schema: NpcWeekGSchema
  }
];

interface LintSummary {
  targetName: string;
  filesScanned: number;
  status: 'PASS' | 'FAIL' | 'EMPTY';
  errorDetails?: string[];
  pendingEraCount?: number;
}

function runLint(): void {
  console.log('=== [LINT TIER G: VALIDACIÓN DE CONTRATOS JUGABLES] ===\n');

  let hasErrors = false;
  const summaries: LintSummary[] = [];
  let totalFilesScanned = 0;
  let totalPendingEraCount = 0;

  for (const target of TARGETS) {
    const targetPath = path.join(gameplayDir, target.pattern);

    if (!fs.existsSync(targetPath)) {
      summaries.push({
        targetName: target.name,
        filesScanned: 0,
        status: 'EMPTY'
      });
      continue;
    }

    const stat = fs.statSync(targetPath);
    const filesToValidate: string[] = [];

    if (stat.isFile()) {
      filesToValidate.push(targetPath);
    } else if (stat.isDirectory()) {
      const entries = fs.readdirSync(targetPath).filter(f => f.endsWith('.json'));
      for (const entry of entries) {
        filesToValidate.push(path.join(targetPath, entry));
      }
    }

    if (filesToValidate.length === 0) {
      summaries.push({
        targetName: target.name,
        filesScanned: 0,
        status: 'EMPTY'
      });
      continue;
    }

    let targetErrors: string[] = [];
    let pendingEraInTarget = 0;

    for (const filePath of filesToValidate) {
      const relPath = path.relative(packageRoot, filePath).replace(/\\/g, '/');
      let rawJson: any;
      try {
        rawJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (err: any) {
        targetErrors.push(`[JSON_PARSE_ERROR] Archivo ${relPath}: ${err.message}`);
        continue;
      }

      // Conteo de PENDING_ERA_REVIEW si es convergence_forces
      if (target.name === 'CONVERGENCE_FORCES_G' && rawJson.sefirot) {
        for (const s of Object.values(rawJson.sefirot) as any[]) {
          if (Array.isArray(s.forces)) {
            for (const f of s.forces) {
              if (f.eraVerified === 'PENDING_ERA_REVIEW') {
                pendingEraInTarget++;
              }
            }
          }
        }
      }

      // Validación de Schema Zod (soporta tanto objeto individual como colección/array)
      if (Array.isArray(rawJson)) {
        for (let idx = 0; idx < rawJson.length; idx++) {
          const parseResult = target.schema.safeParse(rawJson[idx]);
          if (!parseResult.success) {
            for (const issue of parseResult.error.issues) {
              const fieldPath = issue.path.length > 0 ? issue.path.join('.') : '(root)';
              targetErrors.push(`[SCHEMA_FAIL] ${relPath}[${idx}] -> Campo "${fieldPath}": ${issue.message}`);
            }
          }
        }
      } else {
        const parseResult = target.schema.safeParse(rawJson);
        if (!parseResult.success) {
          for (const issue of parseResult.error.issues) {
            const fieldPath = issue.path.length > 0 ? issue.path.join('.') : '(root)';
            targetErrors.push(`[SCHEMA_FAIL] ${relPath} -> Campo "${fieldPath}": ${issue.message}`);
          }
        }
      }
    }

    totalFilesScanned += filesToValidate.length;
    totalPendingEraCount += pendingEraInTarget;

    if (targetErrors.length > 0) {
      hasErrors = true;
      summaries.push({
        targetName: target.name,
        filesScanned: filesToValidate.length,
        status: 'FAIL',
        errorDetails: targetErrors,
        pendingEraCount: pendingEraInTarget
      });
    } else {
      summaries.push({
        targetName: target.name,
        filesScanned: filesToValidate.length,
        status: 'PASS',
        pendingEraCount: pendingEraInTarget
      });
    }
  }

  // Reporte
  console.log('| Schema Target | Archivos | Estado | PENDING_ERA_REVIEW |');
  console.log('| :--- | :---: | :---: | :---: |');
  for (const s of summaries) {
    const eraNote = s.pendingEraCount !== undefined && s.pendingEraCount > 0 ? `${s.pendingEraCount} en cola` : '-';
    console.log(`| **${s.targetName}** | ${s.filesScanned} | **${s.status}** | ${eraNote} |`);
  }

  console.log(`\nTotal archivos Tier G validados: ${totalFilesScanned}`);
  console.log(`Total fuerzas PENDING_ERA_REVIEW: ${totalPendingEraCount}`);

  if (hasErrors) {
    console.error('\n❌ ERRORES DE LINT EN TIER G:');
    for (const s of summaries) {
      if (s.errorDetails) {
        for (const err of s.errorDetails) {
          console.error(`  - ${err}`);
        }
      }
    }
    process.exit(1);
  } else {
    console.log('\n[PASS] Todos los contratos de Tier G cumplen con sus schemas Zod estrictos.\n');
    process.exit(0);
  }
}

runLint();
