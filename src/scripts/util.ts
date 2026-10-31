/** Kleine, geteilte Helfer für Client-Skripte */
import type Lenis from 'lenis';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[hidden]') && el.offsetParent !== null);
}

/** Globale Lenis-Instanz (gesetzt vom Motion-Modul) */
export function smooth(): Lenis | undefined {
  return (window as Window & { __lenis?: Lenis }).__lenis;
}

export function setSmooth(l: Lenis | undefined) {
  (window as Window & { __lenis?: Lenis }).__lenis = l;
}

export const euro = (n: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
export const zahl = (n: number, d = 0) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

export function fill(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{([a-zA-Z]+)\}/g, (m, k: string) => (vars[k] === undefined ? m : String(vars[k])));
}

export function json<T>(el: Element, attr: string): T {
  return JSON.parse(el.getAttribute(attr) ?? '{}') as T;
}

/** Zählt eine Zahl sanft hoch (für Preise/Rechner), ohne GSAP */
export function tweenNumber(from: number, to: number, ms: number, onUpdate: (v: number) => void) {
  const t0 = performance.now();
  let raf = 0;
  const step = (t: number) => {
    const p = Math.min(1, (t - t0) / ms);
    const e = 1 - Math.pow(1 - p, 3);
    onUpdate(from + (to - from) * e);
    if (p < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
