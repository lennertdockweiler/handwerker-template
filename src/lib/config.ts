/**
 * Lädt die aktive Variante (VARIANT → Vite-Alias @variant), validiert sie gegen
 * variants/_schema.ts, mischt das Gewerk-Preset ein und löst alle Texte (Anrede,
 * Platzhalter, Typografie) einmal zentral auf. Komponenten lesen nur von `site`.
 */
import rawConfig from '@variant/site.config.json';
import { siteConfigSchema, formatIssues, type SiteConfig, type Sektion } from '../../variants/_schema';
import { GEWERK_PRESETS, basisTexte, basisBenefits, type GewerkPreset } from '@/data/gewerke';
import type { PresetFrage, Sprachbausteine } from '@/data/gewerke/types';
import { ui } from '@/data/ui';
import { buildTheme } from './theme';
import { text as tx, type Anrede, type Vars } from './text';
import { resolveFontPair } from '@/data/fonts.mjs';
import { withBase } from './paths';

/* ── Validierung ─────────────────────────────────────────────────── */

const parsed = siteConfigSchema.safeParse(rawConfig);
if (!parsed.success) {
  // Build bricht mit klarer, deutscher Fehlermeldung ab.
  throw new Error(
    `\n\n✖ Die Konfiguration der Variante „${__VARIANT__}“ ist ungültig (variants/${__VARIANT__}/site.config.json):\n\n${formatIssues(parsed.error)}\n\nTipp: npm run variant:check -- ${__VARIANT__}\n`,
  );
}
const c: SiteConfig = parsed.data;
const preset: GewerkPreset = GEWERK_PRESETS[c.gewerk] ?? GEWERK_PRESETS.allgemein!;
const mode: Anrede = c.meta.anrede;

/* ── Platzhalter-Kontext ─────────────────────────────────────────── */

const jahr = new Date().getFullYear();
const vars: Vars = {
  name: c.betrieb.name,
  kurzname: c.betrieb.kurzname,
  ort: c.betrieb.adresse.ort,
  region: c.betrieb.adresse.region ?? 'Umgebung',
  gruendungsjahr: c.betrieb.gruendungsjahr ?? '',
  jahre: c.betrieb.gruendungsjahr ? jahr - c.betrieb.gruendungsjahr : '',
  gewerk: c.gewerkBezeichnung ?? preset.bezeichnung,
  mitarbeiter: c.betrieb.mitarbeiter ?? '',
  radius: c.einsatzgebiet.radiusKm,
  plz: c.betrieb.adresse.plz,
  telefon: c.betrieb.telefon,
  inhaber: c.betrieb.inhaber,
};

/** Text mit Anrede der Kunden auflösen */
export const t = (raw: string, extra?: Vars) => tx(raw, mode, { ...vars, ...extra });
/** Text immer in Du-Ansprache (Karriere) */
export const tDu = (raw: string, extra?: Vars) => tx(raw, 'du', { ...vars, ...extra });

/**
 * Fehlende Angaben (Gründungsjahr, Mitarbeiterzahl) dürfen keine Lücken wie „Seit .“
 * oder „mit  Leuten“ erzeugen: betroffene Formulierungen werden neutral umgestellt.
 */
function ohneFehlendeAngaben(s: string): string {
  let r = s;
  if (!c.betrieb.gruendungsjahr) {
    r = r
      .replace(/Seit \{gruendungsjahr\} (\p{L}+) wir\b/gu, (_m, verb: string) => `Wir ${verb}`)
      .replace(/\s*Seit \{gruendungsjahr\}\.?/g, '')
      .replace(/\s+seit \{gruendungsjahr\}/g, '')
      .replace(/\{jahre\}\s+Jahre?\s*/g, '');
  }
  if (!c.betrieb.mitarbeiter) r = r.replace(/mit \{mitarbeiter\} Leuten/g, 'mit Leuten');
  return r.trim();
}

const sprachbausteine = Object.fromEntries(
  Object.entries({ ...basisTexte, ...preset.texte, ...(c.texte as Partial<Sprachbausteine>) }).map(([k, v]) => [k, ohneFehlendeAngaben(String(v))]),
) as unknown as Sprachbausteine;
/** Sprachbaustein (Preset → überschrieben durch config.texte) */
export const sb = (key: keyof Sprachbausteine, extra?: Vars) =>
  key.startsWith('karriere') ? tDu(sprachbausteine[key], extra) : t(sprachbausteine[key], extra);

/* ── Leistungen (Preset + Config zusammenführen) ─────────────────── */

export interface Bild {
  datei?: string | undefined;
  mobil?: string | undefined;
  alt: string;
  motiv?: string | undefined;
  fokus?: string | undefined;
}
export interface Frage extends PresetFrage {
  pflicht: boolean;
}
export interface Leistung {
  slug: string;
  titel: string;
  kurztext: string;
  text: string;
  icon: string;
  motiv: string;
  bilder: Bild[];
  nutzen: string[];
  ablauf: { titel: string; text: string }[];
  faq: { frage: string; antwort: string }[];
  anfrageFragen: Frage[];
  kundengruppen: ('privat' | 'gewerbe')[];
  kostenschaetzer?: {
    einheit: string;
    label: string;
    preisVon: number;
    preisBis: number;
    grundpreis: number;
    min: number;
    max: number;
    schritt: number;
    standard: number;
  };
}

function resolveLeistungen(): Leistung[] {
  const fromConfig = c.leistungen;
  const source = fromConfig ?? preset.leistungen.map((l) => ({ slug: l.slug, aktiv: true }));
  const result: Leistung[] = [];
  for (const entry of source) {
    if ('aktiv' in entry && entry.aktiv === false) continue;
    const base = preset.leistungen.find((l) => l.slug === entry.slug);
    const e = entry as Partial<Leistung> & { slug: string };
    const titel = e.titel ?? base?.titel;
    const kurztext = e.kurztext ?? base?.kurztext;
    const text = e.text ?? base?.text;
    const icon = e.icon ?? base?.icon;
    if (!titel || !kurztext || !text || !icon) {
      throw new Error(
        `\n✖ Leistung „${entry.slug}“ gibt es nicht im Gewerk-Preset „${preset.key}“. Für eigene Leistungen sind titel, kurztext, text und icon Pflicht.\n`,
      );
    }
    const ks = e.kostenschaetzer ?? base?.kostenschaetzer;
    result.push({
      slug: entry.slug,
      titel: t(titel),
      kurztext: t(kurztext),
      text: t(text),
      icon,
      motiv: base?.motiv ?? titel,
      bilder: (e.bilder ?? []).map((b) => ({ ...b, alt: t(b.alt) })),
      nutzen: (e.nutzen ?? base?.nutzen ?? []).map((n) => t(n)),
      ablauf: (e.ablauf ?? base?.ablauf ?? preset.ablauf).map((s) => ({ titel: t(s.titel), text: t(s.text) })),
      faq: (e.faq ?? base?.faq ?? []).map((f) => ({ frage: t(f.frage), antwort: t(f.antwort) })),
      anfrageFragen: (e.anfrageFragen ?? base?.anfrageFragen ?? []).map((f) => ({
        ...f,
        frage: t(f.frage),
        hilfe: f.hilfe ? t(f.hilfe) : undefined,
        pflicht: f.pflicht ?? false,
      })) as Frage[],
      kundengruppen: e.kundengruppen ?? base?.kundengruppen ?? ['privat', 'gewerbe'],
      ...(ks
        ? {
            kostenschaetzer: {
              grundpreis: 0,
              min: 1,
              max: 200,
              schritt: 1,
              standard: 40,
              ...ks,
              label: t(ks.label),
            },
          }
        : {}),
    });
  }
  return result;
}

/* ── Abgeleitete Inhalte ─────────────────────────────────────────── */

const leistungen = resolveLeistungen();
const notdienstAktiv = c.notdienst.aktiv && !!c.notdienst.telefon;

const seiten = {
  leistungen: c.seiten.leistungen,
  referenzen: c.seiten.referenzen && c.referenzen.length > 0,
  ueberUns: c.seiten.ueberUns,
  karriere: c.seiten.karriere,
  notdienst: c.seiten.notdienst && notdienstAktiv,
  kontakt: c.seiten.kontakt,
  pitch: c.demo.pitchSeite,
};

const B = withBase;
const links = {
  start: B('/'),
  leistungen: B('/leistungen/'),
  leistung: (slug: string) => B(seiten.leistungen ? `/leistungen/${slug}/` : '/#leistungen'),
  referenzen: B('/referenzen/'),
  referenz: (slug: string) => B(`/referenzen/${slug}/`),
  ueberUns: B('/ueber-uns/'),
  karriere: B('/karriere/'),
  stelle: (slug: string) => B(`/karriere/${slug}/`),
  notdienst: B('/notdienst/'),
  kontakt: seiten.kontakt ? B('/kontakt/') : `mailto:${c.betrieb.email}`,
  anfrage: (slug?: string) => (seiten.kontakt ? B(`/kontakt/${slug ? `?leistung=${slug}` : ''}`) : `mailto:${c.betrieb.email}`),
  bewerbung: B('/karriere/#schnellbewerbung'),
  impressum: B('/impressum/'),
  datenschutz: B('/datenschutz/'),
};

const nav = [
  seiten.leistungen && { label: ui.nav.leistungen, href: links.leistungen },
  seiten.referenzen && { label: ui.nav.referenzen, href: links.referenzen },
  seiten.ueberUns && { label: ui.nav.ueberUns, href: links.ueberUns },
  seiten.karriere && { label: ui.nav.karriere, href: links.karriere, badge: c.stellen.length || undefined },
  seiten.notdienst && { label: ui.nav.notdienst, href: links.notdienst, notfall: true },
  seiten.kontakt && { label: ui.nav.kontakt, href: links.kontakt },
].filter(Boolean) as { label: string; href: string; badge?: number; notfall?: boolean }[];

function kennzahlen() {
  if (c.kennzahlen?.length) return c.kennzahlen.map((k) => ({ ...k, label: t(k.label) }));
  const list: { wert: number; praefix?: string; suffix?: string; label: string }[] = [];
  if (c.betrieb.gruendungsjahr) list.push({ wert: jahr - c.betrieb.gruendungsjahr, label: ui.usps.jahre });
  if (c.betrieb.projekte) list.push({ wert: c.betrieb.projekte, suffix: '+', label: ui.usps.projekte });
  if (c.betrieb.mitarbeiter) list.push({ wert: c.betrieb.mitarbeiter, label: ui.usps.mitarbeiter });
  if (c.betrieb.reaktionszeit) {
    const m = c.betrieb.reaktionszeit.match(/^([\d.,]+)\s*(.*)$/);
    if (m) list.push({ wert: Number(m[1]!.replace(',', '.')), suffix: m[2] ? ` ${m[2]}` : '', label: ui.usps.reaktion });
  } else if (c.betrieb.azubis) list.push({ wert: c.betrieb.azubis, label: ui.usps.azubis });
  return list.slice(0, 4);
}

const fontPair = resolveFontPair(c) as [string, string];

export const site = {
  variant: __VARIANT__,
  config: c,
  preset,
  anrede: mode,
  vars,
  jahr,
  leistungen,
  faq: (c.faq ?? preset.faq).map((f) => ({ frage: t(f.frage), antwort: t(f.antwort) })),
  ablauf: (c.ablauf ?? preset.ablauf).map((s) => ({ titel: t(s.titel), text: t(s.text) })),
  werte: (c.werte ?? preset.werte).map((w) => ({ titel: t(w.titel), text: t(w.text) })),
  benefits: (c.benefits ?? basisBenefits).map((b) => ({ ...b, titel: tDu(b.titel), text: tDu(b.text) })),
  kennzahlen: kennzahlen(),
  notdienst: { ...c.notdienst, aktiv: notdienstAktiv, leistungen: c.notdienst.leistungen ?? preset.notdienstLeistungen ?? [] },
  seiten,
  links,
  nav,
  gewerkName: c.gewerkBezeichnung ?? preset.bezeichnung,
  schemaTyp: preset.schemaTyp,
  theme: buildTheme({
    primaer: c.branding.farben.primaer,
    akzent: c.branding.farben.akzent,
    neutralTon: c.branding.farben.neutralTon,
    preset: c.branding.stilPreset,
  }),
  fonts: { headline: fontPair[0], text: fontPair[1] },
  demoFormular: !c.integrationen.formularEndpoint,
  sektionen: c.sektionen.filter((s) => s.aktiv) as Sektion[],
  berufsbezeichnung: c.rechtliches.berufsbezeichnung ?? preset.berufsbezeichnung,
};

export type Site = typeof site;
export type { Sektion };
