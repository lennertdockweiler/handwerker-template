/**
 * Formulare (Schnellbewerbung u. a.): Validierung mit verständlichen Meldungen
 * (aria-live, aria-invalid, nicht nur Farbe), Honeypot, Ladezustand, Erfolgsanimation.
 */
import { json, fill } from '../util';
import { listeners } from '../lifecycle';
import { submitForm } from '../submit';

type Msgs = Record<'pflicht' | 'telefon' | 'email' | 'auswahl' | 'senden' | 'zusammenfassung', string>;

const TEL = /^\+?[0-9 ()/-]{6,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function form() {
  const { signal, off } = listeners();
  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((f) => {
    const msgs = json<Msgs>(f, 'data-msgs');
    const setError = (name: string, msg: string) => {
      const out = f.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
      if (out) out.textContent = msg;
      f.querySelectorAll<HTMLInputElement>(`[name="${name}"]`).forEach((el) => el.setAttribute('aria-invalid', String(!!msg)));
    };
    const validate = (name?: string) => {
      const names = name ? [name] : [...new Set([...f.querySelectorAll<HTMLInputElement>('[required]')].map((el) => el.name))];
      let first: HTMLElement | null = null;
      for (const n of names) {
        const els = [...f.querySelectorAll<HTMLInputElement>(`[name="${n}"]`)];
        const el = els[0];
        if (!el) continue;
        let msg = '';
        if (el.type === 'radio' || el.type === 'checkbox') {
          if (el.required && !els.some((x) => x.checked)) msg = msgs.auswahl;
        } else {
          const v = el.value.trim();
          if (el.required && !v) msg = msgs.pflicht;
          else if (v && el.type === 'tel' && !TEL.test(v)) msg = msgs.telefon;
          else if (v && el.type === 'email' && !EMAIL.test(v)) msg = msgs.email;
        }
        setError(n, msg);
        if (msg && !first) first = el;
      }
      return first;
    };
    f.addEventListener('focusout', (e) => {
      const el = e.target as HTMLInputElement;
      if (el.name && el.getAttribute('aria-invalid') === 'true') validate(el.name);
    }, { signal });
    f.addEventListener('change', (e) => {
      const el = e.target as HTMLInputElement;
      if (el.name && el.getAttribute('aria-invalid') === 'true') validate(el.name);
    }, { signal });

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formErr = f.querySelector<HTMLElement>('[data-form-error]');
      if (formErr) formErr.textContent = '';
      const invalid = validate();
      if (invalid) {
        if (formErr) formErr.textContent = msgs.zusammenfassung;
        invalid.focus();
        return;
      }
      const data = new FormData(f);
      if (String(data.get('website') ?? '')) return; // Honeypot: Bot
      data.delete('website');
      const btn = f.querySelector<HTMLButtonElement>('[type="submit"]');
      const label = btn?.querySelector<HTMLElement>('[data-btn-label]');
      const old = label?.textContent;
      if (btn) {
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-busy');
        if (label) label.textContent = btn.dataset.labelBusy ?? old ?? '';
      }
      const res = await submitForm(f.dataset.endpoint, data, f.dataset.key);
      if (btn) {
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('is-busy');
        if (label && old) label.textContent = old;
      }
      if (!res.ok) {
        if (formErr) formErr.textContent = msgs.senden;
        return;
      }
      const success = f.parentElement?.querySelector<HTMLElement>('[data-form-success]');
      if (success) {
        const title = success.querySelector<HTMLElement>('[data-success-title]');
        const vorname = String(data.get('name') ?? data.get('vorname') ?? '').trim().split(/\s+/)[0] ?? '';
        if (title?.dataset.template) title.textContent = fill(title.dataset.template, { vorname }).replace(/,\s*!/, '!');
        f.hidden = true;
        success.hidden = false;
        success.focus();
      }
    }, { signal });
  });
  return off;
}
