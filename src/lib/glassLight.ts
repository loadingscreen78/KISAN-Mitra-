/**
 * Interactive glass catches light where it is touched. This keeps two CSS
 * variables (--light-x, --light-y) on the glass element under the pointer,
 * which the ::before highlight in index.css reads. One listener for the whole
 * app, batched to one write per frame.
 */
const SELECTOR = '.glass-card-interactive, .glass-interactive';

let installed = false;

export function installGlassLight() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  let frame = 0;
  let pending: { element: HTMLElement; x: number; y: number } | null = null;

  const apply = () => {
    frame = 0;
    if (!pending) return;
    const { element, x, y } = pending;
    pending = null;
    element.style.setProperty('--light-x', `${x}px`);
    element.style.setProperty('--light-y', `${y}px`);
  };

  const track = (event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    const element = target?.closest<HTMLElement>(SELECTOR);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    pending = { element, x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (event.type === 'pointerdown') apply();
    else if (!frame) frame = requestAnimationFrame(apply);
  };

  window.addEventListener('pointermove', track, { passive: true });
  window.addEventListener('pointerdown', track, { passive: true, capture: true });
}
