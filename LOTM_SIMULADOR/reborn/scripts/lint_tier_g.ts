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
  WorldStateRootSchema,
  DilemmaEffectsTableSchema,
  AtomVocabularySchema,
  StatusMatrixSchema,
  PlayerAbilitiesFileSchema,
  GrimoiresFileSchema,
  ActingBalanceSchema,
  SomaticsBalanceSchema,
  ConvergenceBalanceSchema,
  EconomyBalanceSchema,
  EconomyMarketSchema
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
  },
  {
    name: 'DILEMMA_EFFECTS_BALANCE',
    pattern: 'balance/dilemma_effects.json',
    schema: DilemmaEffectsTableSchema
  },
  {
    name: 'ATOM_VOCABULARY_BALANCE',
    pattern: 'balance/atom_vocabulary.json',
    schema: AtomVocabularySchema
  },
  {
    name: 'STATUS_MATRIX_BALANCE',
    pattern: 'balance/status_matrix.json',
    schema: StatusMatrixSchema
  },
  {
    name: 'PLAYER_ABILITIES_G',
    pattern: 'abilities/player_abilities.json',
    schema: PlayerAbilitiesFileSchema
  },
  {
    name: 'LORE_G',
    pattern: 'lore/grimoires.json',
    schema: GrimoiresFileSchema
  },
  {
    name: 'ACTING_BALANCE',
    pattern: 'balance/acting.json',
    schema: ActingBalanceSchema
  },
  {
    name: 'SOMATICS_BALANCE',
    pattern: 'balance/somatics.json',
    schema: SomaticsBalanceSchema
  },
  {
    name: 'CONVERGENCE_BALANCE',
    pattern: 'balance/convergence.json',
    schema: ConvergenceBalanceSchema
  },
  {
    name: 'ECONOMY_BALANCE',
    pattern: 'balance/economy.json',
    schema: EconomyBalanceSchema
  },
  {
    name: 'ECONOMY_MARKET',
    pattern: 'economy/market.json',
    schema: EconomyMarketSchema
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

  // Cargar átomos de vocabulario para validaciones cruzadas
  const vocabPath = path.join(gameplayDir, 'balance', 'atom_vocabulary.json');
  let validAtomIds: Set<string> = new Set();
  let economyAtomIds: Set<string> = new Set(['ATOM_DRAIN_AP', 'ATOM_GAIN_AP', 'ATOM_ATTENTION_EXCHANGE']);
  if (fs.existsSync(vocabPath)) {
    try {
      const vJson = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
      if (Array.isArray(vJson.atoms)) {
        validAtomIds = new Set(vJson.atoms.map((a: any) => a.id));
        const econ = vJson.atoms.filter((a: any) => a.category === 'ECONOMY').map((a: any) => a.id);
        if (econ.length > 0) {
          economyAtomIds = new Set(econ);
        }
      }
    } catch {}
  }

  // Cargar estados canónicos de status_matrix.json para validación estricta
  const matrixPath = path.join(gameplayDir, 'balance', 'status_matrix.json');
  let validStatuses: Set<string> = new Set();
  if (fs.existsSync(matrixPath)) {
    try {
      const mJson = JSON.parse(fs.readFileSync(matrixPath, 'utf-8'));
      if (Array.isArray(mJson.statuses)) {
        validStatuses = new Set(mJson.statuses);
      }
    } catch {}
  }

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

      // Validación estricta anti-dual authority para DILEMMA_G (Regla del Director BRIEF-02.4-FIX)
      if (target.name === 'DILEMMA_G' && Array.isArray(rawJson)) {
        const effectsPath = path.join(gameplayDir, 'balance', 'dilemma_effects.json');
        let validEffectKeys: Set<string> = new Set();
        if (fs.existsSync(effectsPath)) {
          try {
            const effJson = JSON.parse(fs.readFileSync(effectsPath, 'utf-8'));
            if (effJson.profiles) {
              validEffectKeys = new Set(Object.keys(effJson.profiles));
            }
          } catch {}
        }

        const FORBIDDEN_PESOS_KEYS = [
          'digestion', 'digestionGain', 'sanity', 'sanityDelta',
          'policeSuspicion', 'churchSuspicion', 'suspicion',
          'pence', 'penceReward', 'spirituality', 'spiritualityCost',
          'health', 'hp'
        ];

        for (const dilemma of rawJson) {
          if (Array.isArray(dilemma.options)) {
            for (const opt of dilemma.options) {
              if (opt.pesos && typeof opt.pesos === 'object') {
                const pesosKeys = Object.keys(opt.pesos);
                const forbiddenFound = pesosKeys.filter(k => FORBIDDEN_PESOS_KEYS.includes(k));
                if (forbiddenFound.length > 0) {
                  targetErrors.push(`[DUAL_AUTHORITY_FAIL] ${relPath}: En dilema '${dilemma.id}', opción '${opt.id}': pesos duplica estadísticas del perfil (${forbiddenFound.join(', ')}). Las estadísticas fluyen EXCLUSIVAMENTE de effectKey -> dilemma_effects.json.`);
                }
              }

              if (opt.effectKey && !validEffectKeys.has(opt.effectKey)) {
                targetErrors.push(`[ORPHAN_EFFECT_KEY] ${relPath}: En dilema '${dilemma.id}', opción '${opt.id}': effectKey '${opt.effectKey}' no existe en dilemma_effects.json.`);
              }
            }
          }
        }
      }

      // Validación de habilidades y economía para COMBATANT_G (Regla del Director BRIEF-03)
      if (target.name === 'COMBATANT_G' && Array.isArray(rawJson)) {
        // BRIEF-08 Chore 0.a: Verificación de escalera RIVER en una línea (coherencia interna del ladder S9 -> S8 -> S7)
        const riverLadder = ['nighthawk_sleepless_patrol', 'nighthawk_midnight_poet', 'nighthawk_squad_captain'].map(id => rawJson.find((c: any) => c.id === id));
        if (!riverLadder.every((c, i) => c && c.pathwayTag === 'DARKNESS' && c.sefiraGroupRef === 'DEATH_CLUSTER' && (i === 0 || c.atomStats.hp > riverLadder[i - 1]!.atomStats.hp))) {
          targetErrors.push(`[RIVER_LADDER_VIOLATION] ${relPath}: Incoherencia en escalera RIVER (debe ser S9 Sleepless -> S8 Poet -> S7 Nightmare con progresión monótona).`);
        }

        for (const combatant of rawJson) {
          if (Array.isArray(combatant.abilities)) {
            for (const ability of combatant.abilities) {
              let economyCount = 0;
              if (Array.isArray(ability.atoms)) {
                for (const atomInv of ability.atoms) {
                  if (!validAtomIds.has(atomInv.atomId)) {
                    targetErrors.push(`[ORPHAN_ATOM] ${relPath}: Combatiente '${combatant.id}', habilidad '${ability.id}' referencia átomo desconocido '${atomInv.atomId}'.`);
                  }

                  if (atomInv.atomId === 'ATOM_ATTENTION_EXCHANGE') {
                    targetErrors.push(`[ILLEGAL_ATOM] ${relPath}: Combatiente '${combatant.id}', habilidad '${ability.id}': ATOM_ATTENTION_EXCHANGE solo está permitido en player abilities.`);
                  }

                  if (atomInv.atomId === 'ATOM_APPLY_STATUS' || atomInv.atomId === 'ATOM_REMOVE_STATUS') {
                    const statusParam = atomInv.params?.status;
                    if (!statusParam || !validStatuses.has(statusParam)) {
                      targetErrors.push(`[INVALID_STATUS_REFERENCE] ${relPath}: Combatiente '${combatant.id}', habilidad '${ability.id}' referencia status no canónico '${statusParam}'. Estados válidos: ${Array.from(validStatuses).join(', ')}.`);
                    }
                  }

                  if (economyAtomIds.has(atomInv.atomId)) {
                    economyCount++;
                  }
                }
              }

              if (economyCount > 1) {
                targetErrors.push(`[ECONOMY_RULE_VIOLATION] ${relPath}: Combatiente '${combatant.id}', habilidad '${ability.id}' tiene ${economyCount} átomos de economía (máximo 1 permitido).`);
              }
            }
          }
        }
      }

      // Validación de player abilities contra vocabulario de átomos y regla anti-doble cobro
      if (target.name === 'PLAYER_ABILITIES_G' && rawJson.abilities) {
        for (const ability of rawJson.abilities) {
          if (Array.isArray(ability.atoms)) {
            for (const atomInv of ability.atoms) {
              if (!validAtomIds.has(atomInv.atomId)) {
                targetErrors.push(`[ORPHAN_ATOM] ${relPath}: Player ability '${ability.id}' referencia átomo desconocido '${atomInv.atomId}'.`);
              }

              if (atomInv.atomId === 'ATOM_APPLY_STATUS' || atomInv.atomId === 'ATOM_REMOVE_STATUS') {
                const statusParam = atomInv.params?.status;
                if (!statusParam || !validStatuses.has(statusParam)) {
                  targetErrors.push(`[INVALID_STATUS_REFERENCE] ${relPath}: Player ability '${ability.id}' referencia status no canónico '${statusParam}'. Estados válidos: ${Array.from(validStatuses).join(', ')}.`);
                }
              }
            }

            const hasAuthoritativeEconomy = ability.atoms.some(
              (atomInv: any) => economyAtomIds.has(atomInv.atomId) && atomInv.params?.apCost !== undefined && atomInv.params?.apCost > 0
            );
            if (hasAuthoritativeEconomy && ability.apCost > 0) {
              targetErrors.push(
                `[DOUBLE_CHARGE_VIOLATION] ${relPath}: Habilidad '${ability.id}' declara apCost: ${ability.apCost} pero contiene un átomo de economía autoritativo con apCost. La habilidad contenedora debe tener apCost: 0 para evitar doble cobro.`
              );
            }
          }
        }
      }

      // Validación de atomEffects en ARTIFACT_G
      if (target.name === 'ARTIFACT_G' && Array.isArray(rawJson)) {
        for (const artifact of rawJson) {
          if (Array.isArray(artifact.atomEffects)) {
            for (const eff of artifact.atomEffects) {
              if (!validAtomIds.has(eff.atomId)) {
                targetErrors.push(`[ORPHAN_ATOM] ${relPath}: Artefacto '${artifact.id}' referencia átomo desconocido '${eff.atomId}'.`);
              }

              if (eff.atomId === 'ATOM_APPLY_STATUS' || eff.atomId === 'ATOM_REMOVE_STATUS') {
                const statusParam = eff.params?.status;
                if (!statusParam || !validStatuses.has(statusParam)) {
                  targetErrors.push(`[INVALID_STATUS_REFERENCE] ${relPath}: Artefacto '${artifact.id}' referencia status no canónico '${statusParam}'. Estados válidos: ${Array.from(validStatuses).join(', ')}.`);
                }
              }
            }
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
