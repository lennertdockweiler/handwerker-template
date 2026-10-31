/** Karussell auf Basis von scroll-snap (Touch nativ) + Vor/Zurück-Buttons */
import { listeners, reduceMotion } from '../lifecycle';

export default function carousel() {
  const { signal, off } = listeners();
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-carousel-track]');
    const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
    if (!track) return;
    const step = () => (track.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? track.clientWidth;
    const behavior: ScrollBehavior = reduceMotion() ? 'auto' : 'smooth';
    const update = () => {
      if (prev) prev.disabled = track.scrollLeft < 8;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step() - 16, behavior }), { signal });
    next?.addEventListener('click', () => track.scrollBy({ left: step() + 16, behavior }), { signal });
    track.addEventListener('scroll', update, { passive: true, signal });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next?.click();
      if (e.key === 'ArrowLeft') prev?.click();
    }, { signal });
    update();
  });
  return off;
}
