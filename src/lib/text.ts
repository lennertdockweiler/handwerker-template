/**
 * Text-Helfer: Anrede-Weichen, Platzhalter, deutsche Typografie und Formate.
 * Läuft im Build (Astro) und im Browser (Islands/Skripte) – keine Node-APIs.
 */

export type Anrede = 'sie' | 'du';
export type Vars = Record<string, string | number | undefined>;

const NBSP = ' ';
const NNBSP = ' ';

/** {{Sie|du}} → passende Variante */
export function anrede(text: string, mode: Anrede): string {
  return text.replace(/\{\{([^|{}]*)\|([^{}]*)\}\}/g, (_, sie: string, du: string) => (mode === 'du' ? du : sie));
}

/** {name} → Wert. Unbekannte Platzhalter bleiben sichtbar, damit sie im Check auffallen. */
export function fill(text: string, vars: Vars = {}): string {
  return text.replace(/\{([a-zA-Z]+)\}/g, (m, key: string) => {
    const v = vars[key];
    return v === undefined || v === '' ? m : String(v);
  });
}

const EINHEITEN = ['€', '%', 'm²', 'm³', 'm', 'cm', 'mm', 'km', 'kW', 'kWh', 'kWp', 'h', 'Min.', 'Std.', 'Jahre', 'Jahren', 'Tage', 'Tagen', 'Wochen', 'Monate', 'Stück', 'lfm', 'Uhr', 'Mitarbeiter', 'Stufen'];
const EINHEIT_RE = new RegExp(`(\\d)\\s(${EINHEITEN.map((e) => e.replace(/[.²³]/g, (c) => (c === '.' ? '\\.' : c))).join('|')})(?=[\\s.,;:!?)–]|$)`, 'g');

/** Deutsche Mikrotypografie: geschützte Leerzeichen, Gedankenstriche, Anführungszeichen. */
export function typo(text: string): string {
  return text
    .replace(EINHEIT_RE, `$1${NBSP}$2`)
    .replace(/\b(z|u|d|o|v|s)\.\s([BaähAgSdrH])\./g, `$1.${NNBSP}$2.`) // z. B., u. a., d. h., o. Ä., v. a., s. o.
    .replace(/§\s(\d)/g, `§${NBSP}$1`)
    .replace(/\s-\s/g, ` – `)
    .replace(/(\d)\s?–\s?(\d)/g, `$1–$2`) // Bis-Strich ohne Leerzeichen: 10–20
    .replace(/"([^"]+)"/g, '„$1“')
    .replace(/(\d)\s(\d{3})\b/g, `$1${NNBSP}$2`); // Telefon-/Tausender-Gruppen nicht trennen
}

export function text(raw: string, mode: Anrede, vars?: Vars): string {
  return typo(fill(anrede(raw, mode), vars));
}

/* ── Formate (de-DE) ─────────────────────────────────────────────── */

const euroFmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const euroFmt2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
const zahlFmt = new Intl.NumberFormat('de-DE');

export const euro = (n: number, cent = false) => (cent ? euroFmt2 : euroFmt).format(n);
export const zahl = (n: number) => zahlFmt.format(n);

/** "2026-10-21" → "21.10.2026" */
export function datum(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** Telefonnummer → tel:-Link (E.164 ohne Leerzeichen) */
export function telHref(tel: string): string {
  let n = tel.replace(/[^\d+]/g, '');
  if (n.startsWith('0') && !n.startsWith('00')) n = `+49${n.slice(1)}`;
  return `tel:${n}`;
}

/** WhatsApp-Link mit optionalem Text */
export function waHref(tel: string, msg?: string): string {
  let n = tel.replace(/\D/g, '');
  if (n.startsWith('0')) n = `49${n.slice(1)}`;
  return `https://wa.me/${n}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
}

/** Telefonnummer für die Anzeige mit geschützten Leerzeichen (bricht nicht um). */
export const telAnzeige = (tel: string) => tel.replace(/ /g, NBSP);

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
