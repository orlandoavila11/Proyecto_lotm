/**
 * Aviso de "hay más texto" en todos los paneles `.scroll`: el borde que oculta lectura se desvanece en
 * proporción a lo que queda por ver (un desbordamiento de 20 px no atenúa 60 px de texto). Escribe
 * --fade-top / --fade-bot en cada contenedor; la máscara vive en hud.css.
 */
const MAX_TOP = 32;
const MAX_BOT = 56;

function measure(el: HTMLElement) {
  const hidden = el.scrollHeight - el.clientHeight;
  const top = hidden > 1 ? Math.min(MAX_TOP, el.scrollTop) : 0;
  const bot = hidden > 1 ? Math.min(MAX_BOT, Math.max(0, hidden - el.scrollTop)) : 0;
  el.style.setProperty('--fade-top', `${top}px`);
  el.style.setProperty('--fade-bot', `${bot}px`);
}

export function installScrollEdges(root: HTMLElement = document.body): () => void {
  let queued = false;
  const all = () => {
    queued = false;
    root.querySelectorAll<HTMLElement>('.scroll').forEach(measure);
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(all);
  };
  // el scroll no burbujea: se escucha en captura
  const onScroll = (e: Event) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.classList.contains('scroll')) measure(t);
  };
  // texto que llega del motor, paneles que se montan, fuentes que terminan de cargar
  const mo = new MutationObserver(schedule);
  mo.observe(root, { childList: true, subtree: true, characterData: true });
  document.addEventListener('scroll', onScroll, true);
  window.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  schedule();
  return () => {
    mo.disconnect();
    document.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', schedule);
  };
}
