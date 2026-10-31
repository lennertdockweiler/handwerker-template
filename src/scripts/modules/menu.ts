/** Vollbild-Mobilmenü: Fokusfalle, Escape, inert-Hintergrund, Lenis anhalten */
import { listeners } from '../lifecycle';
import { focusables, smooth } from '../util';

export default function menu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !panel) return;
  const { signal, off } = listeners();
  const root = document.documentElement;
  const label = btn.querySelector<HTMLElement>('[data-label-open]');
  const outside = () => [document.querySelector('main'), document.querySelector('footer'), document.querySelector('[data-sticky-bar]')].filter(Boolean) as HTMLElement[];

  const setOpen = (open: boolean, returnFocus = true) => {
    btn.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? panel.dataset.labelClose! : panel.dataset.labelOpen!;
    root.classList.toggle('menu-open', open);
    outside().forEach((n) => (n.inert = open));
    if (open) {
      panel.hidden = false;
      smooth()?.stop();
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
        focusables(panel)[0]?.focus({ preventScroll: true });
      });
    } else {
      panel.classList.remove('is-open');
      smooth()?.start();
      const done = () => {
        if (!panel.classList.contains('is-open')) panel.hidden = true;
      };
      panel.addEventListener('transitionend', done, { once: true });
      setTimeout(done, 700);
      if (returnFocus) btn.focus({ preventScroll: true });
    }
  };

  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'), { signal });
  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false, false);
  }, { signal });
  document.addEventListener(
    'keydown',
    (e) => {
      if (btn.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab') {
        // Fokusfalle: Panel + Menü-Button
        const items = [btn, ...focusables(panel)];
        const first = items[0]!;
        const last = items[items.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    { signal },
  );
  matchMedia('(min-width: 64rem)').addEventListener('change', (e) => e.matches && setOpen(false, false), { signal });

  return () => {
    off();
    root.classList.remove('menu-open');
    outside().forEach((n) => (n.inert = false));
  };
}
