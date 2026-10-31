/** Kostenschätzer: animierter Preisrahmen beim Verschieben des Reglers */
import { euro, json, tweenNumber, zahl } from '../util';
import { listeners, reduceMotion } from '../lifecycle';

interface K {
  einheit: string;
  preisVon: number;
  preisBis: number;
  grundpreis: number;
  min: number;
  max: number;
}

export default function kosten() {
  const { signal, off } = listeners();
  const stops: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-kosten]').forEach((root) => {
    const k = json<K>(root, 'data-kosten');
    const input = root.querySelector<HTMLInputElement>('[data-kosten-input]')!;
    const menge = root.querySelector<HTMLElement>('[data-kosten-menge]')!;
    const vonEl = root.querySelector<HTMLElement>('[data-kosten-von]')!;
    const bisEl = root.querySelector<HTMLElement>('[data-kosten-bis]')!;
    const dec = Number(input.dataset.decimals ?? 0);
    let cur = { von: 0, bis: 0 };
    let stop: (() => void) | undefined;
    const calc = (m: number) => ({ von: k.grundpreis + m * k.preisVon, bis: k.grundpreis + m * k.preisBis });
    const update = (animate = true) => {
      const m = Number(input.value);
      menge.textContent = `${zahl(m, dec)} ${k.einheit}`;
      input.style.setProperty('--fill', `${((m - k.min) / (k.max - k.min)) * 100}%`);
      const target = calc(m);
      stop?.();
      if (!animate || reduceMotion()) {
        cur = target;
        vonEl.textContent = euro(target.von);
        bisEl.textContent = euro(target.bis);
        return;
      }
      const from = { ...cur };
      stop = tweenNumber(0, 1, 450, (p) => {
        cur = { von: from.von + (target.von - from.von) * p, bis: from.bis + (target.bis - from.bis) * p };
        // Auf 10 € runden – wirkt ruhiger und ehrlicher als Centbeträge
        vonEl.textContent = euro(Math.round(cur.von / 10) * 10);
        bisEl.textContent = euro(Math.round(cur.bis / 10) * 10);
      });
    };
    input.addEventListener('input', () => update(), { signal });
    update(false);
    stops.push(() => stop?.());
  });
  return () => {
    off();
    stops.forEach((s) => s());
  };
}
