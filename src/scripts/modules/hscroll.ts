/** Horizontal-Scroll-Galerie: Desktop gepinnt (scrub), mobil nativer Swipe mit scroll-snap */
import { gsap, ScrollTrigger } from '@/lib/animations';
import { reduceMotion } from '../lifecycle';
import { isStatic } from '../lifecycle';

export default function hscroll() {
  if (reduceMotion() || isStatic()) return;
  const mm = gsap.matchMedia();
  document.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((sec) => {
    const track = sec.querySelector<HTMLElement>('[data-hscroll-track]');
    if (!track) return;
    mm.add('(min-width: 64rem)', () => {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth + parseFloat(getComputedStyle(sec.querySelector('.hg__viewport')!).paddingLeft) * 2);
      if (dist() < 40) return;
      sec.classList.add('is-pinned');
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: { trigger: sec, start: 'center center', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { clearProps: 'transform' });
        sec.classList.remove('is-pinned');
      };
    });
  });
  ScrollTrigger.refresh();
  return () => mm.revert();
}
