/** Akkordeon (nur unterhalb 64rem). Ohne JS bleibt alles aufgeklappt. */
import { listeners } from '../lifecycle';

export default function accordion() {
  const { signal, off } = listeners();
  const mq = matchMedia('(min-width: 64rem)');
  const groups = [...document.querySelectorAll<HTMLElement>('[data-accordion]')];

  const apply = () => {
    for (const g of groups) {
      const toggles = [...g.querySelectorAll<HTMLButtonElement>('[data-accordion-toggle]')];
      toggles.forEach((btn, i) => {
        const panel = document.getElementById(btn.getAttribute('aria-controls')!);
        if (!panel) return;
        const open = mq.matches || i === 0;
        btn.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
      });
    }
  };

  for (const g of groups) {
    g.addEventListener(
      'click',
      (e) => {
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-accordion-toggle]');
        if (!btn) return;
        const panel = document.getElementById(btn.getAttribute('aria-controls')!);
        if (!panel) return;
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
        if (open) panel.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
      },
      { signal },
    );
  }
  mq.addEventListener('change', apply, { signal });
  apply();
  return off;
}
