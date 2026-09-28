import { DatabaseClient } from './DatabaseClient.js';
import { CommandConflictError, RevisionConflictError, EntityNotFoundError } from '../../core/errors/DomainError.js';

export interface CommandEnvelope<TPayload = any> {
  commandId?: string;
  characterId: string;
  commandType: string;
  payload: TPayload;
  expectedRevision?: number;
}

export interface CommandReceipt<TResponse = any> {
  commandId: string;
  characterId: string;
  commandType: string;
  payloadHash: string;
  response: TResponse;
  revision: number;
  createdAt: string;
}

export interface ProcessedCommand<TResponse = any> {
  response: TResponse;
  fromReceipt: boolean;
  revision: number;
}

/**
 * Serializa de forma canónica y determinista un valor JavaScript ordenando recursivamente
 * todas las claves de los objetos. Garantiza que { a: 1, b: 2 } y { b: 2, a: 1 } produzcan
 * exactamente el mismo hash sin importar el orden de inserción.
 */
export function canonicalStringify(obj: any): string {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${canonicalStringify(obj[k])}`);
  return '{' + pairs.join(',') + '}';
}

export class CommandProcessor {
  /**
   * Ejecuta una mutación dentro de un sobre transaccional e idempotente.
   * 
   * Invariantes garantizadas:
   * 1. Si existe un recibo previo para commandId:
   *    - Verifica que characterId, commandType y el payload canónico coincidan.
   *    - Si coinciden: devuelve la respuesta persistida sin volver a mutar (fromReceipt: true).
   *    - Si difieren: lanza CommandConflictError (HTTP 409).
   * 2. Si se proporciona expectedRevision:
   *    - Comprueba que la revisión actual del personaje coincida exactamente con expectedRevision.
   *    - Si difiere: lanza RevisionConflictError (HTTP 409).
   * 3. Ejecuta la mutación dentro de una transacción SQLite inmediata:
   *    - Aplica la mutación.
   *    - Incrementa monótonamente la revisión del personaje.
   *    - Si se especificó commandId, persiste el recibo con la nueva revisión.
   */
  public static execute<TPayload, TResponse>(
    db: DatabaseClient,
    envelope: CommandEnvelope<TPayload>,
    mutationFn: () => TResponse
  ): ProcessedCommand<TResponse> {
    const { commandId, characterId, commandType, payload, expectedRevision } = envelope;
    const payloadHash = canonicalStringify(payload);

    // 1. Resolver recibo existente antes de evaluar conflictos de revisión
    if (commandId) {
      const existing = db.getCommandReceipt(commandId);
      if (existing) {
        if (existing.characterId !== characterId) {
          throw new CommandConflictError(
            `El Command ID '${commandId}' pertenece a otro personaje ('${existing.characterId}' != '${characterId}').`
          );
        }
        if (existing.commandType !== commandType) {
          throw new CommandConflictError(
            `El Command ID '${commandId}' fue registrado para '${existing.commandType}', no '${commandType}'.`
          );
        }
        if (existing.payloadHash !== payloadHash) {
          throw new CommandConflictError(
            `El Command ID '${commandId}' ya fue ejecutado con un payload diferente.`
          );
        }
        return {
          response: existing.response as TResponse,
          fromReceipt: true,
          revision: existing.revision ?? 1
        };
      }
    }

    // 2. Verificar existencia del personaje
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new EntityNotFoundError(`Personaje con ID '${characterId}' no encontrado.`);
    }

    // 3. Salvaguarda de concurrencia optimista (Revisión)
    const currentRevision = char.revision ?? 1;
    if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
      throw new RevisionConflictError(
        `Conflicto de revisión concurrente: se esperaba revisión ${expectedRevision} pero el personaje está en revisión ${currentRevision}. Refresque el estado.`
      );
    }

    // 4. Ejecución atómica en transacción SQLite
    const result = db.transaction(() => {
      const out = mutationFn();
      const newRevision = db.incrementCharacterRevision(characterId);
      if (commandId) {
        db.saveCommandReceipt({
          commandId,
          characterId,
          commandType,
          payloadHash,
          response: out,
          revision: newRevision
        });
      }
      return { response: out, revision: newRevision };
    });

    return {
      response: result.response,
      fromReceipt: false,
      revision: result.revision
    };
  }
}
