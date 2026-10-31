/**
 * Ablauf: Desktop gepinnt (pin + scrub), Fortschrittslinie zeichnet sich,
 * Schritte werden nacheinander aktiv. Mobil: Linie zeichnet sich vertikal ohne Pin.
 */
import { gsap, ScrollTrigger } from '@/lib/animations';
import { reduceMotion } from '../lifecycle';
import { isStatic } from '../lifecycle';

export default function process() {
  if (reduceMotion() || isStatic()) return;
  const mm = gsap.matchMedia();
  document.querySelectorAll<HTMLElement>('[data-process]').forEach((sec) => {
    const fill = sec.querySelector<HTMLElement>('[data-process-fill]');
    const steps = [...sec.querySelectorAll<HTMLElement>('[data-process-step]')];
    if (!fill || !steps.length) return;
    const setActive = (p: number) => steps.forEach((s, i) => s.classList.toggle('is-active', p >= i / steps.length + 0.02 || (i === 0 && p > 0)));
    setActive(0);
    const pin = sec.dataset.process === 'pin';
    // Vertikale Achse auf allen Breiten (z. B. Timeline auf „Über uns“)
    const vertical = sec.dataset.processAxis === 'y';

    mm.add(vertical ? '(min-width: 0px)' : '(max-width: 0px)', () => {
      gsap.set(fill, { scaleY: 0, scaleX: 1 });
      const st = ScrollTrigger.create({
        trigger: sec.querySelector('[data-process-track]') ?? sec,
        start: 'top 70%',
        end: 'bottom 55%',
        scrub: 0.5,
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress });
          setActive(self.progress);
        },
      });
      return () => st.kill();
    });
    if (vertical) return;

    mm.add('(min-width: 64rem)', () => {
      gsap.set(fill, { scaleX: 0, scaleY: 1 });
      const st = ScrollTrigger.create({
        trigger: sec,
        start: pin ? 'top top' : 'top 70%',
        end: pin ? `+=${steps.length * 55}%` : 'bottom 60%',
        pin: pin ? sec.querySelector('[data-process-inner]') : false,
        scrub: 0.6,
        onUpdate: (self) => {
          gsap.set(fill, { scaleX: self.progress });
          setActive(self.progress);
        },
      });
      return () => st.kill();
    });
    mm.add('(max-width: 63.99rem)', () => {
      gsap.set(fill, { scaleY: 0, scaleX: 1 });
      const st = ScrollTrigger.create({
        trigger: sec.querySelector('.ab__track') ?? sec,
        start: 'top 75%',
        end: 'bottom 55%',
        scrub: 0.5,
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress });
          setActive(self.progress);
        },
      });
      return () => st.kill();
    });
  });
  return () => {
    mm.revert();
    document.querySelectorAll('[data-process-step]').forEach((s) => s.classList.add('is-active'));
  };
}
