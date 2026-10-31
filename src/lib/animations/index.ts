/**
 * Zentrale, wiederverwendbare GSAP-Animationen. Anwendung per data-Attribut:
 *
 *   data-anim="reveal-up"     Fade + Slide nach oben
 *   data-anim="fade"          nur Fade
 *   data-anim-stagger         Kinder gestaffelt einblenden (Listen, Grids)
 *   data-anim="image-reveal"  Bild öffnet sich per clip-path + leichtes Scale-down
 *   data-anim="lines"         Headline: Zeilen per Maske (SplitText)
 *   data-anim="words"         Headline: Wörter steigen auf (ohne Maske, LCP-sicher)
 *   data-anim="draw"          Linie zeichnet sich (scaleX)
 *   data-anim="hero-media"    Hero-Bild: sichtbar von Anfang an, Scale 1.08 → 1
 *   data-parallax="0.15"      Parallax-Ebene (Faktor)
 *   data-count="1234"         Zähler (data-decimals, data-prefix, data-suffix)
 *   data-magnetic             Magnetischer Button (nur pointer: fine)
 *   data-inview               setzt .is-in beim Sichtbarwerden (CSS-gesteuerte Effekte)
 *
 * Es werden ausschließlich transform, opacity und clip-path animiert.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export interface MotionOptions {
  reduce: boolean;
  /** Intensität: 0.6 dezent · 1 standard · 1.4 ausdrucksstark */
  k: number;
  fine: boolean;
}

/** Endzustand: Inline-Styles entfernen UND markieren, damit die CSS-Ausgangsregeln nicht wieder greifen */
const show = (el: Element) => {
  el.setAttribute('data-anim-done', '');
  gsap.set(el, { clearProps: 'opacity,transform,clipPath' });
};
const START = 'top 88%';

export function reveal(root: ParentNode, o: MotionOptions) {
  root.querySelectorAll<HTMLElement>('[data-anim="reveal-up"],[data-anim="fade"]').forEach((el) => {
    const fade = el.dataset.anim === 'fade' || o.reduce;
    // Im Hero sofort (gestaffelt) einblenden, sonst beim Scrollen
    const hero = el.closest('[data-hero]');
    const heroIndex = hero ? [...hero.querySelectorAll('[data-anim="reveal-up"]')].indexOf(el) : 0;
    gsap.fromTo(
      el,
      { opacity: 0, y: fade ? 0 : 28 * o.k },
      {
        opacity: 1,
        y: 0,
        duration: (fade ? 0.6 : 0.9) * (0.75 + o.k * 0.25),
        ease: 'power3.out',
        delay: hero ? 0.35 + heroIndex * 0.12 : Number(el.dataset.delay ?? 0),
        ...(hero ? {} : { scrollTrigger: { trigger: el, start: START, once: true } }),
        onComplete: () => show(el),
      },
    );
  });

  root.querySelectorAll<HTMLElement>('[data-anim-stagger]').forEach((list) => {
    const items = [...list.children] as HTMLElement[];
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: o.reduce ? 0 : 32 * o.k });
    ScrollTrigger.batch(items, {
      start: START,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: o.reduce ? 0.5 : 0.85,
          ease: 'power3.out',
          stagger: o.reduce ? 0 : 0.08 * o.k,
          overwrite: true,
          onComplete: () => batch.forEach(show),
        }),
    });
  });
}

export function imageReveal(root: ParentNode, o: MotionOptions) {
  root.querySelectorAll<HTMLElement>('[data-anim="image-reveal"]').forEach((el) => {
    if (o.reduce) {
      gsap.fromTo(el, { opacity: 0, clipPath: 'inset(0% 0 0 0)' }, { opacity: 1, duration: 0.6, scrollTrigger: { trigger: el, start: START, once: true }, onComplete: () => show(el) });
      return;
    }
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: START, once: true }, onComplete: () => show(el) });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1 * (0.8 + o.k * 0.2), ease: 'expo.out' });
    if (img) tl.fromTo(img, { scale: 1 + 0.12 * o.k }, { scale: 1, duration: 1.5, ease: 'expo.out', clearProps: 'transform' }, 0);
  });
}

export function draw(root: ParentNode, o: MotionOptions) {
  root.querySelectorAll<HTMLElement>('[data-anim="draw"]').forEach((el) => {
    gsap.fromTo(el, { scaleX: o.reduce ? 1 : 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 95%', once: true }, onComplete: () => show(el) });
  });
}

/** Headlines: Zeilen per Maske (für Bild-Heros) oder Wörter ohne Maske (LCP-sicher) */
export async function headlines(root: ParentNode, o: MotionOptions) {
  const els = [...root.querySelectorAll<HTMLElement>('[data-anim="lines"],[data-anim="words"]')];
  if (!els.length) return [];
  if (o.reduce) {
    els.forEach((el) => {
      el.setAttribute('data-anim-done', '');
      gsap.set(el, { clearProps: 'clipPath' });
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    });
    return [];
  }
  const { SplitText } = await import('gsap/SplitText');
  gsap.registerPlugin(SplitText);
  await document.fonts?.ready;
  return els.map((el) => {
    const words = el.dataset.anim === 'words';
    const inHero = !!el.closest('[data-hero]');
    el.setAttribute('data-anim-done', '');
    gsap.set(el, { clipPath: 'none' });
    return SplitText.create(el, {
      type: words ? 'words' : 'lines',
      ...(words ? {} : { mask: 'lines' as const }),
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        const targets = words ? self.words : self.lines;
        return gsap.from(targets, {
          yPercent: words ? 40 : 110,
          opacity: words ? 0.001 : 1,
          duration: words ? 0.9 : 1.1 * (0.8 + o.k * 0.2),
          ease: 'expo.out',
          stagger: 0.09 * o.k,
          delay: inHero ? 0.15 : 0,
          scrollTrigger: inHero ? undefined : { trigger: el, start: START, once: true },
        });
      },
    });
  });
}

export function heroMedia(root: ParentNode, o: MotionOptions) {
  root.querySelectorAll<HTMLElement>('[data-anim="hero-media"]').forEach((el) => {
    if (o.reduce) return;
    // LCP: Bild ist sofort sichtbar, nur sanftes Scale
    gsap.fromTo(el, { scale: 1 + 0.06 * o.k }, { scale: 1, duration: 1.8, ease: 'expo.out' });
  });
}

export function parallax(root: ParentNode, o: MotionOptions) {
  if (o.reduce || o.k < 0.8) return;
  const mobile = matchMedia('(max-width: 47.99rem)').matches;
  root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const f = Number(el.dataset.parallax || 0.1) * (mobile ? 0.4 : 1) * o.k;
    gsap.fromTo(
      el,
      { yPercent: -f * 50 },
      { yPercent: f * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

export function counters(root: ParentNode, o: MotionOptions) {
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    const dec = Number(el.dataset.decimals ?? 0);
    const fmt = new Intl.NumberFormat('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const final = el.textContent;
    if (o.reduce) return;
    const below = el.getBoundingClientRect().top > innerHeight;
    if (!below) return;
    const obj = { v: 0 };
    el.textContent = fmt.format(0);
    gsap.to(obj, {
      v: to,
      duration: 1.6 + 0.4 * o.k,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = fmt.format(obj.v)),
      onComplete: () => (el.textContent = final),
    });
  });
}

export function magnetic(root: ParentNode, o: MotionOptions) {
  if (!o.fine || o.reduce || o.k < 0.8) return () => {};
  const offs: (() => void)[] = [];
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25 * o.k);
      yTo((e.clientY - r.top - r.height / 2) * 0.35 * o.k);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    offs.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    });
  });
  return () => offs.forEach((f) => f());
}

export function inview(root: ParentNode, o: MotionOptions) {
  root.querySelectorAll<HTMLElement>('[data-inview]').forEach((el) => {
    if (o.reduce) return el.classList.add('is-in');
    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => el.classList.add('is-in') });
  });
}
