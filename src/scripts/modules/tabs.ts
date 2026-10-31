/** ARIA-Tabs (Pfeiltasten, Pos1/Ende). Ohne JS sind alle Panels sichtbar. */
import { listeners } from '../lifecycle';

export default function tabs() {
  const { signal, off } = listeners();
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const list = root.querySelector<HTMLElement>('[data-tablist]');
    if (!list) return;
    const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')!)!);
    root.classList.add('is-enhanced');

    const select = (i: number, focus = false) => {
      tabs.forEach((t, n) => {
        const on = n === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[n]!.hidden = !on;
      });
      if (focus) tabs[i]!.focus();
      panels[i]!.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => select(i), { signal }));
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (i < 0) return;
      const map: Record<string, number> = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (e.key in map) {
        e.preventDefault();
        select(map[e.key]!, true);
      }
    }, { signal });
    select(Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));
  });
  return () => {
    off();
  };
}
