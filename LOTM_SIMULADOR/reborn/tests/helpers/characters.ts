/**
 * Personajes de prueba creados por el único camino del juego: el prólogo (origen → dilema → poción).
 * Sirve tanto para `app.inject` como para un servidor real por `fetch` (pruebas de kill -9).
 */
type Poster = (url: string, payload: Record<string, unknown>) => Promise<any>;

export interface AwakenOptions {
  name?: string;
  originId?: string;
  potion?: 'COBALT_EYES' | 'AMBER_MIRROR';
}

async function awaken(post: Poster, opts: AwakenOptions = {}): Promise<string> {
  const start = await post('/api/prologue/start', { originId: opts.originId ?? 'ORIGIN_PRIVATE_INVESTIGATOR', name: opts.name ?? 'Ernest Holloway' });
  const characterId = start.characterId as string;
  await post('/api/prologue/tutorial/dilemma', { characterId, choice: 'PRUDENCE' });
  await post('/api/prologue/drink', { characterId, potionChoice: opts.potion ?? 'COBALT_EYES' });
  return characterId;
}

/** con app.inject (Fastify en memoria) */
export function awakenedCharacter(app: { inject: (o: any) => Promise<{ body: string }> }, opts?: AwakenOptions): Promise<string> {
  return awaken(async (url, payload) => JSON.parse((await app.inject({ method: 'POST', url, payload })).body), opts);
}

/** contra un servidor real (fetch) */
export function awakenedCharacterHttp(baseUrl: string, opts?: AwakenOptions): Promise<string> {
  return awaken(async (url, payload) => (await fetch(`${baseUrl}${url}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  })).json(), opts);
}
