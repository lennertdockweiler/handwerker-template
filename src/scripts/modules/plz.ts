/** PLZ-/Einsatzgebiet-Checker */
import { pruefePlz, type PlzData } from '@/lib/plz';
import { fill, json } from '../util';
import { listeners } from '../lifecycle';

interface Data extends PlzData {
  labels: Record<'ja' | 'jaOhneOrt' | 'anfrage' | 'nein' | 'ungueltig', string>;
  anfrageLink: string;
}

export default function plz() {
  const { signal, off } = listeners();
  document.querySelectorAll<HTMLFormElement>('[data-plz-check]').forEach((form) => {
    const d = json<Data>(form, 'data-plz-check');
    const input = form.querySelector<HTMLInputElement>('input')!;
    const out = form.querySelector<HTMLElement>('[data-plz-out]')!;
    const msg = form.querySelector<HTMLElement>('[data-plz-msg]')!;
    const cta = form.querySelector<HTMLAnchorElement>('[data-plz-cta]');
    const check = () => {
      const r = pruefePlz(input.value, d);
      out.dataset.state = r.status;
      input.setAttribute('aria-invalid', String(r.status === 'ungueltig'));
      msg.textContent = r.status === 'ja' ? (r.ort ? fill(d.labels.ja, { ort: r.ort }) : d.labels.jaOhneOrt) : d.labels[r.status];
      msg.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      if (cta) {
        cta.hidden = !(r.status === 'ja' || r.status === 'anfrage');
        const url = new URL(d.anfrageLink, location.href);
        url.searchParams.set('plz', input.value.replace(/\D/g, ''));
        cta.href = url.pathname + url.search;
      }
      // Karte: passenden Ort hervorheben
      document.querySelectorAll<SVGGElement>('[data-map-ort]').forEach((g) => g.classList.toggle('is-hit', !!r.ort && g.dataset.mapOrt === r.ort));
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      check();
    }, { signal });
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 5);
      if (input.value.length === 5) check();
    }, { signal });
  });
  return off;
}
