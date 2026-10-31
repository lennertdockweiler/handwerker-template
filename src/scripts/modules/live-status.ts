/** „Jetzt erreichbar“: Status nach Uhrzeit in Europe/Berlin, minütlich aktualisiert */
import { status, type Zeiten, type Tag } from '@/lib/hours';
import { fill, json } from '../util';

interface Data {
  zeiten: Zeiten | null;
  labels: { offen: string; geschlossen: string; bis: string; naechste: string; heute: string; morgen: string; tage: Record<Tag, string> };
}

export default function liveStatus() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-live-status]')];
  if (!els.length) return;
  const render = () => {
    for (const el of els) {
      const d = json<Data>(el, 'data-live-status');
      const out = el.querySelector('[data-ls-text]');
      if (!out) continue;
      if (!d.zeiten) {
        el.dataset.state = 'offen';
        out.textContent = d.labels.offen;
        continue;
      }
      const s = status(d.zeiten);
      el.dataset.state = s.offen ? 'offen' : 'geschlossen';
      if (s.offen) out.textContent = `${d.labels.offen} · ${fill(d.labels.bis, { zeit: s.bis! })}`;
      else if (s.naechste) {
        const tag = s.naechste.inTagen === 0 ? d.labels.heute : s.naechste.inTagen === 1 ? d.labels.morgen : d.labels.tage[s.naechste.tag];
        out.textContent = `${d.labels.geschlossen} · ${fill(d.labels.naechste, { tag, zeit: s.naechste.von })}`;
      } else out.textContent = d.labels.geschlossen;
    }
  };
  render();
  const id = setInterval(render, 60_000);
  return () => clearInterval(id);
}
