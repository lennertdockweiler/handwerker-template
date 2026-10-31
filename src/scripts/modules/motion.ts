/**
 * Bewegung: Lenis (Smooth Scroll) korrekt mit ScrollTrigger gekoppelt + alle
 * data-anim-Effekte. Räumt beim Seitenwechsel vollständig auf.
 */
import { gsap, ScrollTrigger, reveal, imageReveal, draw, headlines, heroMedia, parallax, counters, magnetic, inview, type MotionOptions } from '@/lib/animations';
import { reduceMotion, finePointer, intensity } from '../lifecycle';
import { isStatic } from '../lifecycle';
import { setSmooth } from '../util';

export default async function motion() {
  if (isStatic()) return;
  const o: MotionOptions = { reduce: reduceMotion(), k: intensity(), fine: finePointer() };
  let lenis: import('lenis').default | undefined;
  let tick: ((t: number) => void) | undefined;

  // Lenis nur ohne Reduced Motion; Touch-Scrolling bleibt nativ.
  if (!o.reduce) {
    const { default: Lenis } = await import('lenis');
    lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      anchors: { offset: -80 },
      autoRaf: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (t: number) => lenis!.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setSmooth(lenis);
  }

  // Hat der 3-s-Fallback schon alles sichtbar gemacht, nicht erneut ausblenden
  const late = document.documentElement.classList.contains('anim-failed');
  const ctx = gsap.context(() => {
    heroMedia(document, o);
    if (!late) reveal(document, o);
    if (!late) imageReveal(document, o);
    if (!late) draw(document, o);
    parallax(document, o);
    counters(document, o);
    inview(document, o);
  });
  const offMagnetic = magnetic(document, o);
  const splits = late ? [] : await ctx.add(() => headlines(document, o));

  // Bilder/Fonts verschieben Layout → Trigger neu berechnen
  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', refresh, { once: true });
  document.fonts?.ready.then(refresh);

  return () => {
    offMagnetic();
    (splits as { revert: () => void }[] | undefined)?.forEach((s) => s.revert());
    ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    removeEventListener('load', refresh);
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
    setSmooth(undefined);
  };
}
