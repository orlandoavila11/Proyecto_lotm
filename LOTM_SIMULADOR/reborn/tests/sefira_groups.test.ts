import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANONICAL_PATHWAYS, CanonicalPathwayId } from '../src/core/types/pathway.js';

describe('Sefira Groups & Convergence Pools: Validación Estructural Fail-Loud', () => {
  const packageRoot = fileURLToPath(new URL('..', import.meta.url));
  const sefiraPath = path.join(packageRoot, 'data', 'gameplay', 'sefira_groups.json');
  const forcesPath = path.join(packageRoot, 'data', 'gameplay', 'convergence_forces.json');

  it('el archivo sefira_groups.json existe, está firmado por el Director y contiene los 9 grupos', () => {
    assert.strictEqual(fs.existsSync(sefiraPath), true, 'sefira_groups.json debe existir en Tier G');
    const data = JSON.parse(fs.readFileSync(sefiraPath, 'utf-8'));

    assert.strictEqual(data.sealedBy, 'Director');
    assert.ok(data.sealedAt, 'Debe incluir timestamp de sellado');

    const groupKeys = Object.keys(data.groups);
    assert.strictEqual(groupKeys.length, 9, 'Deben existir exactamente 9 grupos séfira');
  });

  it('Validación 1: 22 de 22 vías canónicas están asignadas a grupos séfira', () => {
    const data = JSON.parse(fs.readFileSync(sefiraPath, 'utf-8'));
    const assigned = new Set<string>();

    for (const group of Object.values(data.groups) as Array<{ pathways: string[] }>) {
      for (const p of group.pathways) {
        assigned.add(p);
      }
    }

    for (const canonical of CANONICAL_PATHWAYS) {
      assert.strictEqual(
        assigned.has(canonical),
        true,
        `Vía canónica faltante en grupos séfira: ${canonical}`
      );
    }
    assert.strictEqual(assigned.size, 22, 'Deben haber exactamente 22 vías asignadas');
  });

  it('Validación 2: Cada vía canónica está en exactamente UN grupo séfira (disyunción estricta)', () => {
    const data = JSON.parse(fs.readFileSync(sefiraPath, 'utf-8'));
    const pathwayToGroup = new Map<string, string>();
    const duplicates: Array<{ pathway: string; groups: string[] }> = [];

    for (const [groupId, group] of Object.entries(data.groups) as Array<[string, { pathways: string[] }]>) {
      for (const p of group.pathways) {
        if (pathwayToGroup.has(p)) {
          duplicates.push({ pathway: p, groups: [pathwayToGroup.get(p)!, groupId] });
        } else {
          pathwayToGroup.set(p, groupId);
        }
      }
    }

    assert.deepStrictEqual(duplicates, [], 'No debe existir ninguna vía asignada a múltiples grupos');
  });

  it('Validación 3: Las 6 vías jugables pertenecen a 6 grupos séfira distintos', () => {
    const data = JSON.parse(fs.readFileSync(sefiraPath, 'utf-8'));
    const playablePathways: CanonicalPathwayId[] = ['FOOL', 'VISIONARY', 'CHAINED', 'JUSTICIAR', 'MOON', 'DEMONESS'];

    const pathwayToGroup = new Map<string, string>();
    for (const [groupId, group] of Object.entries(data.groups) as Array<[string, { pathways: string[] }]>) {
      for (const p of group.pathways) {
        pathwayToGroup.set(p, groupId);
      }
    }

    const assignedGroups = new Set<string>();
    for (const p of playablePathways) {
      const g = pathwayToGroup.get(p);
      assert.ok(g, `Vía jugable ${p} debe tener grupo asignado`);
      assignedGroups.add(g);
    }

    assert.strictEqual(
      assignedGroups.size,
      6,
      `Las 6 vías jugables deben pertenecer a 6 grupos distintos (obtenidos: ${assignedGroups.size})`
    );
  });

  it('Validación 4: 0 IDs huérfanos (todos resuelven contra CanonicalPathwayId)', () => {
    const data = JSON.parse(fs.readFileSync(sefiraPath, 'utf-8'));
    const canonicalSet = new Set<string>(CANONICAL_PATHWAYS);
    const orphans: string[] = [];

    for (const group of Object.values(data.groups) as Array<{ pathways: string[] }>) {
      for (const p of group.pathways) {
        if (!canonicalSet.has(p)) {
          orphans.push(p);
        }
      }
    }

    assert.deepStrictEqual(orphans, [], 'No debe haber ningún ID huérfano no canónico');
  });

  it('Autoridad de Convergencia: convergence_pools.draft.json ha sido superseded por convergence_forces.json', () => {
    const draftPoolsPath = path.join(packageRoot, 'data', 'gameplay', 'convergence_pools.draft.json');
    assert.strictEqual(fs.existsSync(draftPoolsPath), false, 'convergence_pools.draft.json debe haber sido eliminado (superseded)');
    assert.strictEqual(fs.existsSync(forcesPath), true, 'convergence_forces.json es la autoridad única');

    const forcesData = JSON.parse(fs.readFileSync(forcesPath, 'utf-8'));
    assert.strictEqual(forcesData.sealedBy, 'Director');
    assert.strictEqual(Object.keys(forcesData.sefirot).length, 9);
  });
});

