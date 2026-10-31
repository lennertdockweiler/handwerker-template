/** Pitch-Rechner: unbesetzte Stellen und Zeitersparnis, animierte Ergebnisse */
import { euro, fill, json, tweenNumber, zahl } from '../util';
import { listeners, reduceMotion } from '../lifecycle';

export default function pitch() {
  const root = document.querySelector<HTMLElement>('[data-pitch]');
  if (!root) return;
  const { signal, off } = listeners();
  const cfg = json<{ wochen: number; stunden: string }>(root, 'data-pitch');
  const val = (id: string) => Number(root.querySelector<HTMLInputElement>(`#${id}`)?.value ?? 0);
  const last: Record<string, number> = {};
  const stops: Record<string, () => void> = {};
  const show = (key: string, target: number, fmt: (n: number) => string) => {
    const el = root.querySelector<HTMLElement>(`[data-res="${key}"]`);
    if (!el) return;
    stops[key]?.();
    const from = last[key] ?? target;
    last[key] = target;
    if (reduceMotion()) return void (el.textContent = fmt(target));
    stops[key] = tweenNumber(from, target, 500, (v) => (el.textContent = fmt(v)));
  };
  const update = () => {
    root.querySelectorAll<HTMLInputElement>('input[type=range]').forEach((r) => {
      const out = root.querySelector(`[data-out="${r.id}"]`);
      if (out) out.textContent = `${zahl(Number(r.value))}${r.dataset.einheit ? ` ${r.dataset.einheit}` : ''}`;
    });
    show('verlust', val('p-anzahl') * val('p-umsatz') * val('p-monate'), (n) => euro(Math.round(n / 100) * 100));
    const std = (val('p-anfragen') * val('p-minuten') * cfg.wochen) / 60;
    show('stunden', std, (n) => fill(cfg.stunden, { n: zahl(Math.round(n)) }));
    show('wert', std * val('p-satz'), (n) => euro(Math.round(n / 10) * 10));
  };
  root.addEventListener('input', update, { signal });
  update();
  return () => {
    off();
    Object.values(stops).forEach((s) => s());
  };
}
