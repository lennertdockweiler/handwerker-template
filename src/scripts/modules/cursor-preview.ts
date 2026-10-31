/** Cursorfolgende Bildvorschau in Listen – nur Desktop mit Maus, nie bei Reduced Motion */
import { finePointer, reduceMotion, isDesktop, listeners } from '../lifecycle';

export default function cursorPreview() {
  if (!finePointer() || reduceMotion() || !isDesktop()) return;
  const { signal, off } = listeners();
  document.querySelectorAll<HTMLElement>('[data-cursor-preview]').forEach((list) => {
    const box = list.parentElement?.querySelector<HTMLElement>('[data-preview-el]');
    const img = box?.querySelector('img');
    if (!box || !img) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0, active = false;
    const loop = () => {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      const tilt = Math.max(-8, Math.min(8, (x - cx) * 0.08));
      box.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      if (active || Math.abs(x - cx) > 0.5) raf = requestAnimationFrame(loop);
    };
    list.querySelectorAll<HTMLElement>('[data-preview]').forEach((row) => {
      row.addEventListener('pointerenter', () => {
        const src = row.dataset.preview;
        if (!src) return;
        if (img.getAttribute('src') !== src) img.src = src;
        box.classList.add('is-on');
      }, { signal });
    });
    list.addEventListener('pointermove', (e) => {
      x = e.clientX + 40;
      y = e.clientY;
      if (!active) {
        active = true;
        cx = x;
        cy = y;
        raf = requestAnimationFrame(loop);
      }
    }, { signal });
    list.addEventListener('pointerleave', () => {
      active = false;
      box.classList.remove('is-on');
    }, { signal });
    signal.addEventListener('abort', () => cancelAnimationFrame(raf));
  });
  return off;
}
