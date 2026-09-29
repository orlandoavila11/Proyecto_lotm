/**
 * El servidor entrega el texto de la carta del Benefactor sólo al iniciar el prólogo.
 * Se guarda en este navegador para poder releerla; si se pierde, la vista lo dice abiertamente.
 */
const key = (id: string) => `lotm_benefactor_letter_${id}`;

export function rememberLetter(characterId: string, text: string) {
  try {
    localStorage.setItem(key(characterId), text);
  } catch {
    /* almacenamiento bloqueado */
  }
}

export function rememberedLetter(characterId: string): string | null {
  try {
    return localStorage.getItem(key(characterId));
  } catch {
    return null;
  }
}
