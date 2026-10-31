/** Referenz-Galerie: Filter nach Kategorie mit FLIP-Übergängen (Web Animations API) */
import { listeners, reduceMotion } from '../lifecycle';
import { fill } from '../util';

export default function gallery() {
  const { signal, off } = listeners();
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((root) => {
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-kategorie]')];
    const status = root.querySelector<HTMLElement>('[data-gallery-status]');
    const empty = root.querySelector<HTMLElement>('[data-gallery-empty]');

    const apply = (kat: string) => {
      const reduce = reduceMotion();
      // FLIP – First
      const first = new Map(items.map((el) => [el, el.getBoundingClientRect()]));
      const wasVisible = new Map(items.map((el) => [el, !el.hidden]));
      // Last
      items.forEach((el) => (el.hidden = kat !== '*' && el.dataset.kategorie !== kat));
      const visible = items.filter((el) => !el.hidden);
      if (status) status.textContent = fill(status.dataset.template!, { n: visible.length });
      if (empty) empty.hidden = visible.length > 0;
      if (reduce) return;
      // Invert + Play
      visible.forEach((el, n) => {
        const a = first.get(el)!;
        const b = el.getBoundingClientRect();
        if (!wasVisible.get(el)) {
          el.animate([{ opacity: 0, transform: 'scale(0.92) translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: n * 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
          return;
        }
        const dx = a.left - b.left, dy = a.top - b.top;
        if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    };

    buttons.forEach((btn) =>
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        apply(btn.dataset.filter!);
      }, { signal }),
    );
  });
  return off;
}
