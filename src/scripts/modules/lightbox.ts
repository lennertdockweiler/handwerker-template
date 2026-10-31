/** Lightbox: Klick/Enter öffnet, Pfeiltasten/Swipe blättern, Escape schließt (natives <dialog>) */
import { fill, json } from '../util';
import { listeners, reduceMotion } from '../lifecycle';
import { smooth } from '../util';

interface Item {
  src: string;
  srcset?: string;
  alt: string;
}

export default function lightbox() {
  const dlg = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  if (!dlg) return;
  const { signal, off } = listeners();
  const img = dlg.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const cap = dlg.querySelector<HTMLElement>('[data-lb-cap]')!;
  const prev = dlg.querySelector<HTMLButtonElement>('[data-lb-prev]')!;
  const next = dlg.querySelector<HTMLButtonElement>('[data-lb-next]')!;
  const stage = dlg.querySelector<HTMLElement>('[data-lb-stage]')!;
  const labels = json<{ bildVon: string }>(dlg, 'data-labels');
  let items: Item[] = [];
  let i = 0;
  let opener: HTMLElement | null = null;

  const show = (n: number, dir = 0) => {
    i = (n + items.length) % items.length;
    const it = items[i]!;
    const swap = () => {
      img.src = it.src;
      if (it.srcset) img.srcset = it.srcset;
      else img.removeAttribute('srcset');
      img.sizes = '100vw';
      img.alt = it.alt;
      cap.textContent = `${it.alt} · ${fill(labels.bildVon, { n: i + 1, gesamt: items.length })}`;
      prev.hidden = next.hidden = items.length < 2;
    };
    if (dir && !reduceMotion()) {
      img.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 40}px)` }], { duration: 160, easing: 'ease-in' }).onfinish = () => {
        swap();
        img.animate([{ opacity: 0, transform: `translateX(${dir * 40}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
      };
    } else swap();
  };

  const open = (trigger: HTMLElement) => {
    items = json<Item[]>(trigger.closest('[data-lightbox]')!, 'data-lightbox');
    opener = trigger;
    show(Number(trigger.dataset.lightboxIndex ?? 0));
    smooth()?.stop();
    dlg.showModal();
  };

  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox-index]');
    if (t) {
      e.preventDefault();
      open(t);
    }
  }, { signal });
  dlg.addEventListener('close', () => {
    smooth()?.start();
    opener?.focus({ preventScroll: true });
  }, { signal });
  dlg.querySelector('[data-lb-close]')!.addEventListener('click', () => dlg.close(), { signal });
  prev.addEventListener('click', () => show(i - 1, -1), { signal });
  next.addEventListener('click', () => show(i + 1, 1), { signal });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(i + 1, 1);
    if (e.key === 'ArrowLeft') show(i - 1, -1);
  }, { signal });
  // Klick auf den Hintergrund schließt
  stage.addEventListener('click', (e) => e.target === stage && dlg.close(), { signal });

  // Swipe
  let x0 = 0, y0 = 0, t0 = 0;
  stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); }, { signal });
  stage.addEventListener('pointerup', (e) => {
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - t0 < 800) show(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { signal });

  return () => {
    off();
    if (dlg.open) dlg.close();
  };
}
