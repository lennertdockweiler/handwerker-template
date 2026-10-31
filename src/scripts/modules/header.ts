/** Header: kompakt + Blur nach dem Hero, versteckt beim Runter-, zeigt beim Hochscrollen */
import { listeners } from '../lifecycle';

export default function header() {
  const el = document.querySelector<HTMLElement>('[data-header]');
  if (!el) return;
  const { signal, off } = listeners();
  const root = document.documentElement;

  let lastY = scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY;
    const delta = y - lastY;
    el.classList.toggle('is-scrolled', y > 24);
    if (root.classList.contains('menu-open') || y < 200) el.classList.remove('is-hidden');
    else if (delta > 6) el.classList.add('is-hidden');
    else if (delta < -6) el.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true, signal },
  );
  // Fokus im Header → immer sichtbar (Tastaturnutzer)
  el.addEventListener('focusin', () => el.classList.remove('is-hidden'), { signal });
  update();
  return off;
}
