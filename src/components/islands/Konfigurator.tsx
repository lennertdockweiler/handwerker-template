/**
 * Anfrage-Konfigurator (Preact-Island, client:visible).
 * Leistung → Fragen aus dem Gewerk-Preset → Dringlichkeit → PLZ (Einsatzgebiet) →
 * Fotos (Drag & Drop, clientseitig) → Kontakt → Zusammenfassung → Senden.
 * Zwischenstand wird in localStorage gesichert (ohne Fotos).
 * Alle Texte kommen als Props aus src/data/ui.ts – keine Texte in dieser Datei.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { AccessibleInputHTMLAttributes } from 'preact';
import { pruefePlz, type PlzData } from '@/lib/plz';
import { submitForm } from '@/scripts/submit';
import './konfigurator.css';

export interface KFrage {
  id: string;
  frage: string;
  typ: 'auswahl' | 'mehrfach' | 'ja-nein' | 'zahl' | 'text';
  optionen?: string[] | undefined;
  einheit?: string | undefined;
  hilfe?: string | undefined;
  pflicht: boolean;
}
export interface KLeistung {
  slug: string;
  titel: string;
  kurztext: string;
  icon: string;
  fragen: KFrage[];
}
export interface KLabels {
  schritte: string[];
  schrittVon: string;
  leistungFrage: string;
  leistungHilfe: string;
  sonstiges: string;
  sonstigesText: string;
  detailsTitel: string;
  detailsHilfe: string;
  beschreibung: string;
  beschreibungPlatzhalter: string;
  ja: string;
  nein: string;
  zeitraumTitel: string;
  dringlichkeit: string[];
  wunschtermin: string;
  ortTitel: string;
  ortHilfe: string;
  plz: string;
  strasse: string;
  ort: string;
  plzStatus: { ja: string; anfrage: string; nein: string; ungueltig: string };
  fotosTitel: string;
  fotosHilfe: string;
  fotosDrop: string;
  fotosAuswaehlen: string;
  fotosDemo: string;
  fotoEntfernen: string;
  fotoZuGross: string;
  kontaktTitel: string;
  name: string;
  email: string;
  telefon: string;
  rueckruf: string;
  rueckrufOptionen: string[];
  pruefenTitel: string;
  pruefenHilfe: string;
  bearbeiten: string;
  fotos: string;
  keineAngabe: string;
  weiter: string;
  zurueck: string;
  senden: string;
  sendet: string;
  optional: string;
  datenschutz: string;
  datenschutzLink: string;
  fehlerPflicht: string;
  fehlerEmail: string;
  fehlerTelefon: string;
  fehlerAuswahl: string;
  fehlerKontakt: string;
  fehlerSenden: string;
  erfolgTitel: string;
  erfolgText: string;
  demoBadge: string;
  demoHinweis: string;
  neueAnfrage: string;
  entwurf: string;
  entwurfVerwerfen: string;
  honeypot: string;
  betreff: string;
}
interface Props {
  leistungen: KLeistung[];
  plzData: PlzData;
  labels: KLabels;
  endpoint: string;
  accessKey?: string | undefined;
  demo: boolean;
  datenschutzUrl: string;
  storageKey: string;
  telefon: string;
}

interface State {
  leistung: string;
  antworten: Record<string, string | string[]>;
  beschreibung: string;
  dringlichkeit: string;
  termin: string;
  plz: string;
  ort: string;
  strasse: string;
  name: string;
  email: string;
  tel: string;
  rueckruf: string;
}
const EMPTY: State = { leistung: '', antworten: {}, beschreibung: '', dringlichkeit: '', termin: '', plz: '', ort: '', strasse: '', name: '', email: '', tel: '', rueckruf: '' };
const SONSTIGES = '__sonstiges';
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (v[k] === undefined ? m : String(v[k])));
const MAX_FOTOS = 6;
const MAX_MB = 10;

export default function Konfigurator(p: Props) {
  const L = p.labels;
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [s, setS] = useState<State>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fotos, setFotos] = useState<{ file: File; url: string }[]>([]);
  const [fotoMsg, setFotoMsg] = useState('');
  const [drag, setDrag] = useState(false);
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const total = L.schritte.length;
  const leistung = p.leistungen.find((l) => l.slug === s.leistung);
  const plzResult = useMemo(() => (s.plz.length === 5 ? pruefePlz(s.plz, p.plzData) : null), [s.plz]);

  // Entwurf laden + Vorauswahl aus der URL (?leistung=…&plz=…)
  useEffect(() => {
    let st = EMPTY;
    try {
      const raw = localStorage.getItem(p.storageKey);
      if (raw) {
        st = { ...EMPTY, ...(JSON.parse(raw) as Partial<State>) };
        setRestored(true);
      }
    } catch {}
    const q = new URLSearchParams(location.search);
    const ql = q.get('leistung');
    const qp = q.get('plz');
    if (ql && p.leistungen.some((l) => l.slug === ql)) st = { ...st, leistung: ql };
    if (qp && /^\d{5}$/.test(qp)) st = { ...st, plz: qp };
    setS(st);
    if (ql && p.leistungen.some((l) => l.slug === ql)) setStep(1);
  }, []);

  // Zwischenstand sichern
  useEffect(() => {
    if (done) return;
    try {
      if (JSON.stringify(s) !== JSON.stringify(EMPTY)) localStorage.setItem(p.storageKey, JSON.stringify(s));
    } catch {}
  }, [s, done]);

  // Fokus auf die Schritt-Überschrift
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headRef.current?.focus({ preventScroll: true });
    const top = headRef.current?.closest('.kf')?.getBoundingClientRect().top ?? 0;
    if (top < 0) headRef.current?.closest('.kf')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }, [step, done]);

  useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.url)), []);

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((o) => ({ ...o, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: '' }));
  };
  const setAntwort = (id: string, v: string | string[]) => {
    setS((o) => ({ ...o, antworten: { ...o.antworten, [id]: v } }));
    if (errors[`f-${id}`]) setErrors((e) => ({ ...e, [`f-${id}`]: '' }));
  };

  const validate = (n: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (n === 0 && !s.leistung) e.leistung = L.fehlerAuswahl;
    if (n === 1 && leistung) {
      for (const f of leistung.fragen) {
        const v = s.antworten[f.id];
        if (f.pflicht && (!v || (Array.isArray(v) && !v.length))) e[`f-${f.id}`] = f.typ === 'zahl' || f.typ === 'text' ? L.fehlerPflicht : L.fehlerAuswahl;
      }
    }
    if (n === 1 && s.leistung === SONSTIGES && !s.beschreibung.trim()) e.beschreibung = L.fehlerPflicht;
    if (n === 2 && !s.dringlichkeit) e.dringlichkeit = L.fehlerAuswahl;
    if (n === 3 && !/^\d{5}$/.test(s.plz)) e.plz = L.plzStatus.ungueltig;
    if (n === 5) {
      if (!s.name.trim()) e.name = L.fehlerPflicht;
      if (!s.email.trim() && !s.tel.trim()) e.tel = L.fehlerKontakt;
      if (s.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email.trim())) e.email = L.fehlerEmail;
      if (s.tel.trim() && !/^\+?[0-9 ()/-]{6,}$/.test(s.tel.trim())) e.tel = L.fehlerTelefon;
    }
    return e;
  };

  const go = (n: number) => {
    if (n > step) {
      const e = validate(step);
      if (Object.keys(e).length) {
        setErrors(e);
        const firstKey = Object.keys(e)[0]!;
        requestAnimationFrame(() => document.getElementById(`kf-${firstKey}`)?.focus());
        return;
      }
    }
    setErrors({});
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const msgs: string[] = [];
    const next = [...fotos];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_MB * 1024 * 1024) {
        msgs.push(fill(L.fotoZuGross, { name: file.name }));
        continue;
      }
      if (next.length >= MAX_FOTOS) break;
      next.push({ file, url: URL.createObjectURL(file) });
    }
    setFotos(next);
    setFotoMsg(msgs.join(' '));
  };
  const removeFoto = (i: number) => {
    URL.revokeObjectURL(fotos[i]!.url);
    setFotos(fotos.filter((_, n) => n !== i));
  };

  const summary = (): [string, string][] => {
    const rows: [string, string][] = [[L.schritte[0]!, leistung?.titel ?? L.sonstigesText]];
    if (leistung) for (const f of leistung.fragen) {
      const v = s.antworten[f.id];
      if (v && (!Array.isArray(v) || v.length)) rows.push([f.frage, `${Array.isArray(v) ? v.join(', ') : v}${f.einheit && f.typ === 'zahl' ? ` ${f.einheit}` : ''}`]);
    }
    if (s.beschreibung) rows.push([L.beschreibung, s.beschreibung]);
    rows.push([L.schritte[2]!, [s.dringlichkeit, s.termin && new Date(s.termin).toLocaleDateString('de-DE')].filter(Boolean).join(' · ')]);
    rows.push([L.schritte[3]!, [s.strasse, `${s.plz} ${s.ort}`.trim(), plzResult ? L.plzStatus[plzResult.status] : ''].filter(Boolean).join(' · ')]);
    rows.push([L.fotos, fotos.length ? String(fotos.length) : L.keineAngabe]);
    rows.push([L.schritte[5]!, [s.name, s.email, s.tel, s.rueckruf].filter(Boolean).join(' · ')]);
    return rows;
  };

  const send = async (e: Event) => {
    e.preventDefault();
    if (step < total - 1) return go(step + 1);
    const form = e.currentTarget as HTMLFormElement;
    const hp = (form.elements.namedItem('website') as HTMLInputElement | null)?.value;
    if (hp) return;
    setBusy(true);
    setSendError('');
    const fd = new FormData();
    fd.append('_subject', fill(L.betreff, { leistung: leistung?.titel ?? L.sonstigesText, plz: s.plz }));
    summary().forEach(([k, v]) => fd.append(k, v));
    fd.append('email', s.email);
    fotos.forEach((f, i) => fd.append(`foto_${i + 1}`, f.file, f.file.name));
    const res = await submitForm(p.endpoint || undefined, fd, p.accessKey);
    setBusy(false);
    if (!res.ok) return setSendError(fill(L.fehlerSenden, { telefon: p.telefon }));
    try {
      localStorage.removeItem(p.storageKey);
    } catch {}
    setDone(true);
  };

  const reset = () => {
    try {
      localStorage.removeItem(p.storageKey);
    } catch {}
    fotos.forEach((f) => URL.revokeObjectURL(f.url));
    setFotos([]);
    setS(EMPTY);
    setErrors({});
    setDone(false);
    setRestored(false);
    setDir(-1);
    setStep(0);
  };

  const err = (k: string) =>
    errors[k] ? (
      <p class="field-error" id={`kf-${k}-err`} role="alert">
        {errors[k]}
      </p>
    ) : null;
  const desc = (k: string) => (errors[k] ? `kf-${k}-err` : undefined);

  if (done)
    return (
      <div class="kf kf--done" aria-live="polite">
        <svg class="kf__check" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" />
          <path d="M19 33l9 9 17-19" />
        </svg>
        <h2 class="h2" tabIndex={-1} ref={headRef}>
          {L.erfolgTitel}
        </h2>
        <p class="lead">{L.erfolgText}</p>
        {p.demo && (
          <p class="kf__demo">
            <span class="label">{L.demoBadge}</span> {L.demoHinweis}
          </p>
        )}
        <button type="button" class="btn btn--ghost" onClick={reset}>
          {L.neueAnfrage}
        </button>
      </div>
    );

  const Choice = ({ name, value, type, checked, onChange, children, id }: { name: string; value: string; type: 'radio' | 'checkbox'; checked: boolean; onChange: () => void; children: preact.ComponentChildren; id?: string }) => (
    <span class="kf__choice">
      {/* type ist radio|checkbox – Preacts diskriminierte Input-Typen erfordern hier den Cast */}
      <input {...({ class: 'chip-input', type, name, value, id: id ?? `kf-${name}-${value}`, checked, onChange } as unknown as AccessibleInputHTMLAttributes<HTMLInputElement>)} />
      <label class="chip" for={id ?? `kf-${name}-${value}`}>
        {children}
      </label>
    </span>
  );

  return (
    <form class="kf" onSubmit={send} noValidate>
      <div class="kf__top">
        <p class="label kf__count" aria-live="polite">
          {fill(L.schrittVon, { n: step + 1, gesamt: total })} · {L.schritte[step]}
        </p>
        <div class="kf__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${(step + 1) / total})` }} />
        </div>
        <ol class="kf__steps" aria-hidden="true">
          {L.schritte.map((t, i) => (
            <li class={i === step ? 'is-current' : i < step ? 'is-done' : ''}>{t}</li>
          ))}
        </ol>
      </div>

      {restored && step === 0 && (
        <p class="kf__restored">
          {L.entwurf}
          <button type="button" class="link-u link-u--static kf__linkbtn" onClick={reset}>
            {L.entwurfVerwerfen}
          </button>
        </p>
      )}

      <div class={`kf__step kf__step--${dir > 0 ? 'fwd' : 'back'}`} key={step}>
        {step === 0 && (
          <fieldset class="kf__fs" aria-describedby={desc('leistung')}>
            <legend>
              <h2 class="h3" tabIndex={-1} ref={headRef}>
                {L.leistungFrage}
              </h2>
            </legend>
            <p class="muted kf__hint">{L.leistungHilfe}</p>
            <div class="kf__cards" id="kf-leistung" tabIndex={-1}>
              {[...p.leistungen, { slug: SONSTIGES, titel: L.sonstiges, kurztext: L.sonstigesText, icon: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>', fragen: [] }].map((l) => (
                <span class="kf__card">
                  <input
                    class="kf__card-input"
                    type="radio"
                    name="leistung"
                    id={`kf-l-${l.slug}`}
                    value={l.slug}
                    checked={s.leistung === l.slug}
                    onChange={() => {
                      set('leistung', l.slug);
                      setS((o) => ({ ...o, leistung: l.slug, antworten: o.leistung === l.slug ? o.antworten : {} }));
                    }}
                  />
                  <label for={`kf-l-${l.slug}`} class="kf__card-label">
                    {/* icon = zur Build-Zeit erzeugte Lucide-SVG-Pfade (vertrauenswürdig, keine Nutzereingabe) */}
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: l.icon }} />
                    <span class="kf__card-t">{l.titel}</span>
                    <span class="kf__card-x">{l.kurztext}</span>
                  </label>
                </span>
              ))}
            </div>
            {err('leistung')}
          </fieldset>
        )}

        {step === 1 && (
          <div class="kf__fs">
            <h2 class="h3" tabIndex={-1} ref={headRef}>
              {fill(L.detailsTitel, { titel: leistung?.titel ?? L.sonstiges })}
            </h2>
            <p class="muted kf__hint">{L.detailsHilfe}</p>
            <div class="kf__fields">
              {leistung?.fragen.map((f) => (
                <div class="field" key={f.id}>
                  {f.typ === 'auswahl' || f.typ === 'mehrfach' || f.typ === 'ja-nein' ? (
                    <fieldset class="kf__fs" aria-describedby={desc(`f-${f.id}`)}>
                      <legend class="field-label">
                        {f.frage} {!f.pflicht && <span class="opt">({L.optional})</span>}
                      </legend>
                      <div class="kf__chips" id={`kf-f-${f.id}`} tabIndex={-1}>
                        {(f.typ === 'ja-nein' ? [L.ja, L.nein] : (f.optionen ?? [])).map((o, oi) => {
                          const v = s.antworten[f.id];
                          const multi = f.typ === 'mehrfach';
                          const checked = multi ? Array.isArray(v) && v.includes(o) : v === o;
                          return (
                            <Choice
                              name={`f-${f.id}`}
                              id={`kf-f-${f.id}-${oi}`}
                              value={o}
                              type={multi ? 'checkbox' : 'radio'}
                              checked={checked}
                              onChange={() => {
                                if (!multi) return setAntwort(f.id, o);
                                const arr = Array.isArray(v) ? v : [];
                                setAntwort(f.id, checked ? arr.filter((x) => x !== o) : [...arr, o]);
                              }}
                            >
                              {o}
                            </Choice>
                          );
                        })}
                      </div>
                    </fieldset>
                  ) : (
                    <>
                      <label class="field-label" for={`kf-f-${f.id}`}>
                        {f.frage} {!f.pflicht && <span class="opt">({L.optional})</span>}
                      </label>
                      <div class={f.einheit ? 'kf__unit' : ''}>
                        <input
                          id={`kf-f-${f.id}`}
                          class="input"
                          type={f.typ === 'zahl' ? 'text' : 'text'}
                          inputMode={f.typ === 'zahl' ? 'decimal' : undefined}
                          value={(s.antworten[f.id] as string) ?? ''}
                          onInput={(e) => setAntwort(f.id, (e.currentTarget as HTMLInputElement).value)}
                          aria-describedby={[desc(`f-${f.id}`), f.hilfe ? `kf-f-${f.id}-h` : ''].filter(Boolean).join(' ') || undefined}
                          aria-invalid={!!errors[`f-${f.id}`]}
                        />
                        {f.einheit && <span class="kf__unit-t">{f.einheit}</span>}
                      </div>
                    </>
                  )}
                  {f.hilfe && (
                    <p class="field-hint" id={`kf-f-${f.id}-h`}>
                      {f.hilfe}
                    </p>
                  )}
                  {err(`f-${f.id}`)}
                </div>
              ))}
              <div class="field">
                <label class="field-label" for="kf-beschreibung">
                  {L.beschreibung} {s.leistung !== SONSTIGES && <span class="opt">({L.optional})</span>}
                </label>
                <textarea id="kf-beschreibung" class="input" rows={4} placeholder={L.beschreibungPlatzhalter} value={s.beschreibung} onInput={(e) => set('beschreibung', (e.currentTarget as HTMLTextAreaElement).value)} aria-invalid={!!errors.beschreibung} aria-describedby={desc('beschreibung')} />
                {err('beschreibung')}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div class="kf__fs">
            <h2 class="h3" tabIndex={-1} ref={headRef}>
              {L.zeitraumTitel}
            </h2>
            <fieldset class="kf__fs" aria-describedby={desc('dringlichkeit')}>
              <legend class="sr-only">{L.zeitraumTitel}</legend>
              <div class="kf__list" id="kf-dringlichkeit" tabIndex={-1}>
                {L.dringlichkeit.map((d, i) => (
                  <Choice name="dringlichkeit" id={`kf-d-${i}`} value={d} type="radio" checked={s.dringlichkeit === d} onChange={() => set('dringlichkeit', d)}>
                    {d}
                  </Choice>
                ))}
              </div>
              {err('dringlichkeit')}
            </fieldset>
            <div class="field kf__narrow">
              <label class="field-label" for="kf-termin">
                {L.wunschtermin}
              </label>
              <input id="kf-termin" class="input" type="date" min={new Date().toISOString().slice(0, 10)} value={s.termin} onInput={(e) => set('termin', (e.currentTarget as HTMLInputElement).value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div class="kf__fs">
            <h2 class="h3" tabIndex={-1} ref={headRef}>
              {L.ortTitel}
            </h2>
            <p class="muted kf__hint">{L.ortHilfe}</p>
            <div class="kf__grid2">
              <div class="field">
                <label class="field-label" for="kf-plz">
                  {L.plz}
                </label>
                <input id="kf-plz" class="input tabular" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={s.plz} onInput={(e) => set('plz', (e.currentTarget as HTMLInputElement).value.replace(/\D/g, '').slice(0, 5))} aria-invalid={!!errors.plz} aria-describedby={['kf-plz-status', desc('plz')].filter(Boolean).join(' ')} />
                {err('plz')}
              </div>
              <div class="field">
                <label class="field-label" for="kf-ort">
                  {L.ort} <span class="opt">({L.optional})</span>
                </label>
                <input id="kf-ort" class="input" autoComplete="address-level2" value={s.ort} onInput={(e) => set('ort', (e.currentTarget as HTMLInputElement).value)} />
              </div>
            </div>
            <p id="kf-plz-status" class={`kf__plz kf__plz--${plzResult?.status ?? 'leer'}`} aria-live="polite">
              {plzResult && plzResult.status !== 'ungueltig' && L.plzStatus[plzResult.status]}
              {plzResult?.ort && ` · ${plzResult.ort}`}
            </p>
            <div class="field">
              <label class="field-label" for="kf-strasse">
                {L.strasse} <span class="opt">({L.optional})</span>
              </label>
              <input id="kf-strasse" class="input" autoComplete="street-address" value={s.strasse} onInput={(e) => set('strasse', (e.currentTarget as HTMLInputElement).value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div class="kf__fs">
            <h2 class="h3" tabIndex={-1} ref={headRef}>
              {L.fotosTitel}
            </h2>
            <p class="muted kf__hint">{L.fotosHilfe}</p>
            <label
              class={`kf__drop${drag ? ' is-drag' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                addFiles(e.dataTransfer?.files ?? null);
              }}
            >
              <input type="file" accept="image/*" multiple class="sr-only" onChange={(e) => addFiles((e.currentTarget as HTMLInputElement).files)} />
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
                <path d="M12 12v9M8 16l4-4 4 4" />
              </svg>
              <span>
                {L.fotosDrop} <span class="kf__drop-btn">{L.fotosAuswaehlen}</span>
              </span>
            </label>
            {fotoMsg && (
              <p class="field-error" role="alert">
                {fotoMsg}
              </p>
            )}
            {fotos.length > 0 && (
              <ul class="kf__thumbs">
                {fotos.map((f, i) => (
                  <li key={f.url}>
                    <img src={f.url} alt={f.file.name} width="160" height="120" />
                    <button type="button" class="kf__thumb-x" onClick={() => removeFoto(i)} aria-label={fill(L.fotoEntfernen, { name: f.file.name })}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {p.demo && <p class="field-hint">{L.fotosDemo}</p>}
          </div>
        )}

        {step === 5 && (
          <div class="kf__fs">
            <h2 class="h3" tabIndex={-1} ref={headRef}>
              {L.kontaktTitel}
            </h2>
            <div class="kf__fields">
              <div class="field">
                <label class="field-label" for="kf-name">
                  {L.name}
                </label>
                <input id="kf-name" class="input" autoComplete="name" value={s.name} onInput={(e) => set('name', (e.currentTarget as HTMLInputElement).value)} aria-invalid={!!errors.name} aria-describedby={desc('name')} />
                {err('name')}
              </div>
              <div class="kf__grid2">
                <div class="field">
                  <label class="field-label" for="kf-email">
                    {L.email}
                  </label>
                  <input id="kf-email" class="input" type="email" autoComplete="email" value={s.email} onInput={(e) => set('email', (e.currentTarget as HTMLInputElement).value)} aria-invalid={!!errors.email} aria-describedby={desc('email')} />
                  {err('email')}
                </div>
                <div class="field">
                  <label class="field-label" for="kf-tel">
                    {L.telefon}
                  </label>
                  <input id="kf-tel" class="input tabular" type="tel" autoComplete="tel" inputMode="tel" value={s.tel} onInput={(e) => set('tel', (e.currentTarget as HTMLInputElement).value)} aria-invalid={!!errors.tel} aria-describedby={desc('tel')} />
                  {err('tel')}
                </div>
              </div>
              <fieldset class="kf__fs">
                <legend class="field-label">
                  {L.rueckruf} <span class="opt">({L.optional})</span>
                </legend>
                <div class="kf__chips">
                  {L.rueckrufOptionen.map((o, i) => (
                    <Choice name="rueckruf" id={`kf-r-${i}`} value={o} type="radio" checked={s.rueckruf === o} onChange={() => set('rueckruf', o)}>
                      {o}
                    </Choice>
                  ))}
                </div>
              </fieldset>
              <div class="hp-field" aria-hidden="true">
                <label for="kf-website">{L.honeypot}</label>
                <input id="kf-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div class="kf__fs">
            <h2 class="h3" tabIndex={-1} ref={headRef}>
              {L.pruefenTitel}
            </h2>
            <p class="muted kf__hint">{L.pruefenHilfe}</p>
            <dl class="kf__sum">
              {summary().map(([k, v], i) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>
                    {v || L.keineAngabe}
                    {i === 0 && (
                      <button type="button" class="kf__edit" onClick={() => go(0)}>
                        {L.bearbeiten}
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {fotos.length > 0 && (
              <ul class="kf__thumbs kf__thumbs--sm">
                {fotos.map((f) => (
                  <li key={f.url}>
                    <img src={f.url} alt={f.file.name} width="96" height="72" />
                  </li>
                ))}
              </ul>
            )}
            <p class="kf__ds">
              {L.datenschutz} <a href={p.datenschutzUrl} class="link-u link-u--static">{L.datenschutzLink}</a>.
            </p>
            {sendError && (
              <p class="field-error" role="alert">
                {sendError}
              </p>
            )}
          </div>
        )}
      </div>

      <div class="kf__nav">
        {step > 0 && (
          <button type="button" class="btn btn--ghost" onClick={() => go(step - 1)}>
            {L.zurueck}
          </button>
        )}
        <button type="submit" class={`btn btn--lg kf__next${busy ? ' is-busy' : ''}`} aria-disabled={busy}>
          {step < total - 1 ? L.weiter : busy ? L.sendet : L.senden}
        </button>
      </div>
    </form>
  );
}
