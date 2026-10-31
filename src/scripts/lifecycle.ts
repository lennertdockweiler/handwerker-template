/**
 * Lebenszyklus aller Skripte mit Astro View Transitions:
 *  - astro:page-load  → alle Module initialisieren (auch beim ersten Laden)
 *  - astro:before-swap → alle Cleanups ausführen (ScrollTrigger, Lenis, Observer, Listener)
 *  - astro:after-swap → .js-Klasse wiederherstellen (Astro tauscht <html>-Attribute)
 * Jedes Modul gibt optional eine Cleanup-Funktion zurück.
 */
export type Cleanup = () => void;
export type Module = () => void | Cleanup | Promise<void | Cleanup>;

let cleanups: Cleanup[] = [];
let generation = 0;

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Statik-Modus (?static): keine Bewegung, Endzustand sichtbar – für Screenshots */
export const isStatic = () => document.documentElement.classList.contains('is-static');
export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isDesktop = () => matchMedia('(min-width: 64rem)').matches;
export const saveData = () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/** Skaliert Distanzen/Dauer nach config.branding.animationsIntensitaet */
export function intensity(): number {
  const v = document.documentElement.dataset.intensity;
  return v === 'dezent' ? 0.6 : v === 'ausdrucksstark' ? 1.4 : 1;
}

/** Wartet auf window.load und einen Leerlauf-Moment – hält schwere Module aus dem LCP-Pfad. */
export function afterLoad(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 700 }) : setTimeout(resolve, 120));
    if (document.readyState === 'complete') idle();
    else addEventListener('load', idle, { once: true });
  });
}

/** Lädt ein Modul nur, wenn passende Elemente auf der Seite sind (Code-Splitting). */
export function lazy(selector: string, loader: () => Promise<{ default: Module }>, opts: { deferred?: boolean } = {}): Module {
  return async () => {
    if (!document.querySelector(selector)) return;
    if (opts.deferred) await afterLoad();
    const mod = await loader();
    return mod.default();
  };
}

/** AbortController-Helfer: alle Listener eines Moduls mit einem Aufruf entfernen */
export function listeners() {
  const ac = new AbortController();
  return { signal: ac.signal, off: () => ac.abort() };
}

export function start(modules: Module[]) {
  const run = async () => {
    const gen = ++generation;
    const results = await Promise.allSettled(modules.map((m) => Promise.resolve().then(m)));
    for (const r of results) {
      if (r.status === 'rejected') console.error('[template]', r.reason);
      else if (typeof r.value === 'function') {
        // Seite wurde inzwischen gewechselt → sofort aufräumen
        if (gen !== generation) r.value();
        else cleanups.push(r.value);
      }
    }
    document.documentElement.classList.add('anim-ready');
  };
  document.addEventListener('astro:page-load', run);
  document.addEventListener('astro:before-swap', () => {
    generation++;
    const list = cleanups;
    cleanups = [];
    for (const c of list.reverse()) {
      try {
        c();
      } catch (e) {
        console.error('[template] cleanup', e);
      }
    }
  });
  document.addEventListener('astro:after-swap', () => {
    document.documentElement.classList.add('js');
    if (/[?&]static\b/.test(location.search)) document.documentElement.classList.add('is-static', 'anim-failed');
  });
}
