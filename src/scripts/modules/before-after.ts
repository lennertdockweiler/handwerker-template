/** Vorher/Nachher-Slider: Pointer (Maus/Touch), Tastatur, Hinweis-Wackeln */
import { reduceMotion, listeners } from '../lifecycle';

export default function beforeAfter() {
  const { signal, off } = listeners();
  const observers: IntersectionObserver[] = [];
  document.querySelectorAll<HTMLElement>('[data-before-after]').forEach((root) => {
    const handle = root.querySelector<HTMLElement>('[data-ba-handle]');
    if (!handle) return;
    let pos = 50;
    let dragging = false;
    let hinted = false;
    const set = (p: number) => {
      pos = Math.max(0, Math.min(100, p));
      root.style.setProperty('--pos', `${pos}%`);
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
      handle.setAttribute('aria-valuetext', `${Math.round(pos)} %`);
    };
    const fromEvent = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    root.addEventListener('pointerdown', (e) => {
      dragging = true;
      hinted = true;
      root.classList.add('is-dragging');
      root.setPointerCapture(e.pointerId);
      fromEvent(e);
    }, { signal });
    root.addEventListener('pointermove', (e) => dragging && fromEvent(e), { signal });
    const end = () => {
      dragging = false;
      root.classList.remove('is-dragging');
    };
    root.addEventListener('pointerup', end, { signal });
    root.addEventListener('pointercancel', end, { signal });
    handle.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 2;
      const keys: Record<string, number> = { ArrowLeft: pos - step, ArrowDown: pos - step, ArrowRight: pos + step, ArrowUp: pos + step, Home: 0, End: 100, PageDown: pos - 20, PageUp: pos + 20 };
      if (e.key in keys) {
        e.preventDefault();
        hinted = true;
        set(keys[e.key]!);
      }
    }, { signal });

    // Einmaliges Hinweis-Wackeln beim ersten Sichtbarwerden
    if (!reduceMotion()) {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting || hinted) return;
          io.disconnect();
          const frames = [50, 62, 40, 54, 50];
          const t0 = performance.now();
          const dur = 1600;
          const step = (t: number) => {
            if (hinted && t - t0 > 50) return;
            const p = Math.min(1, (t - t0) / dur);
            const seg = p * (frames.length - 1);
            const i = Math.min(frames.length - 2, Math.floor(seg));
            const f = seg - i;
            const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
            set(frames[i]! + (frames[i + 1]! - frames[i]!) * e);
            if (p < 1) requestAnimationFrame(step);
          };
          setTimeout(() => requestAnimationFrame(step), 350);
        },
        { threshold: 0.6 },
      );
      io.observe(root);
      observers.push(io);
    }
  });
  return () => {
    off();
    observers.forEach((o) => o.disconnect());
  };
}
