#!/usr/bin/env node
/**
 * npm run variant:check -- <slug>
 * Prüft eine Variante und meldet verständlich auf Deutsch:
 *  ✖ Fehler (Build würde scheitern oder Seite wäre fehlerhaft)
 *  ▲ Warnungen (vor dem Pitch bzw. Livegang beheben)
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { siteConfigSchema } from '../variants/_schema.ts';
import { buildTheme } from '../src/lib/theme.ts';
import { GEWERK_PRESETS } from '../src/data/gewerke/index.ts';

const require = createRequire(import.meta.url);
const icons = require('lucide-static/icon-nodes.json');
const BRAND_ICONS = ['instagram', 'facebook', 'linkedin', 'youtube', 'whatsapp', 'xing', 'tiktok'];

const c = { red: (s) => `\x1b[31m${s}\x1b[0m`, yellow: (s) => `\x1b[33m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m` };

export function checkVariant(slug, { quiet = false } = {}) {
  const root = new URL(`../variants/${slug}/`, import.meta.url).pathname;
  const fehler = [];
  const warn = [];
  const log = (...a) => !quiet && console.log(...a);

  if (!existsSync(join(root, 'site.config.json'))) {
    fehler.push(`Datei variants/${slug}/site.config.json fehlt. Neue Variante anlegen: npm run variant:new -- ${slug}`);
    return { fehler, warn };
  }
  let raw;
  try {
    raw = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));
  } catch (e) {
    fehler.push(`site.config.json ist kein gültiges JSON: ${e.message}`);
    return { fehler, warn };
  }

  // 1) Schema (Pflichtfelder, Formate, Zeichenlimits)
  const parsed = siteConfigSchema.safeParse(raw);
  if (!parsed.success) {
    for (const i of parsed.error.issues) fehler.push(`${i.path.join(' › ') || '(Wurzel)'}: ${i.message}`);
  }
  const cfg = parsed.success ? parsed.data : raw;

  // 2) Bilder vorhanden?
  const dateien = [];
  const walk = (v, pfad) => {
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${pfad}[${i}]`));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if ((k === 'datei' || k === 'mobil' || k === 'dateiHell' || k === 'dateiMobil') && typeof x === 'string') dateien.push([x, `${pfad}.${k}`]);
        else walk(x, `${pfad}.${k}`);
      }
    }
  };
  walk(raw, 'config');
  for (const [d, p] of dateien) if (!existsSync(join(root, d))) fehler.push(`Bild fehlt: ${d}  ${c.dim(`(${p})`)}`);
  const ohneBild = [];
  walk2(raw, 'config');
  function walk2(v, pfad) {
    if (Array.isArray(v)) v.forEach((x, i) => walk2(x, `${pfad}[${i}]`));
    else if (v && typeof v === 'object') {
      if ('alt' in v && !('datei' in v)) ohneBild.push(pfad);
      for (const [k, x] of Object.entries(v)) walk2(x, `${pfad}.${k}`);
    }
  }
  if (ohneBild.length) warn.push(`${ohneBild.length} Bild-Slot(s) ohne Foto – es wird ein Platzhalter gezeigt: ${ohneBild.slice(0, 4).join(', ')}${ohneBild.length > 4 ? ' …' : ''}`);
  if (cfg.branding?.logo?.datei && !existsSync(join(root, cfg.branding.logo.datei))) fehler.push(`Logo fehlt: ${cfg.branding.logo.datei}`);

  // 3) Platzhalter & Demo-Reste
  const text = JSON.stringify(raw);
  const muster = [
    [/TODO/g, 'TODO-Platzhalter'],
    [/Musterstra(ß|ss)e/gi, '„Musterstraße“'],
    [/Lorem ipsum/gi, 'Lorem ipsum'],
    [/Max Mustermann|Erika Mustermann/g, 'Mustername'],
  ];
  for (const [re, name] of muster) {
    const n = (text.match(re) ?? []).length;
    if (n) fehler.push(`${n}× ${name} in der Config – bitte ersetzen.`);
  }
  if (/@example\.com/.test(text)) warn.push('E-Mail-Adressen mit @example.com (Demo-Daten) – für die Live-Seite echte Adressen eintragen.');
  if (/\b000000\b/.test(text)) warn.push('Telefonnummern/Registerangaben mit 000000 (Demo-Daten) gefunden.');

  // 4) Farbkontraste (WCAG AA)
  if (cfg.branding?.farben?.primaer && /^#[0-9a-f]{6}$/i.test(cfg.branding.farben.primaer)) {
    try {
      const theme = buildTheme({ ...cfg.branding.farben, preset: cfg.branding.stilPreset ?? 'modern-praezise' });
      for (const k of theme.checks.filter((x) => !x.ok)) {
        warn.push(`Kontrast „${k.name}“: ${k.ratio.toFixed(2)} : 1 (mind. ${k.min} : 1) – ${k.vordergrund} auf ${k.hintergrund}${k.name.includes('automatisch') ? '. Wurde automatisch korrigiert, Farbe wirkt ggf. etwas dunkler als im Logo.' : ''}`);
      }
    } catch (e) {
      warn.push(`Farben konnten nicht geprüft werden: ${e.message}`);
    }
  }

  // 5) Gewerk-Preset, Leistungen, Icons, Verweise
  const preset = GEWERK_PRESETS[cfg.gewerk];
  if (preset && Array.isArray(cfg.leistungen)) {
    for (const l of cfg.leistungen) {
      const base = preset.leistungen.find((x) => x.slug === l.slug);
      if (!base && !(l.titel && l.kurztext && l.text && l.icon)) fehler.push(`Leistung „${l.slug}“ gibt es nicht im Preset „${cfg.gewerk}“ – titel, kurztext, text und icon sind dann Pflicht. Verfügbar: ${preset.leistungen.map((x) => x.slug).join(', ')}`);
    }
  }
  const leistungSlugs = new Set((Array.isArray(cfg.leistungen) && cfg.leistungen.length ? cfg.leistungen : (preset?.leistungen ?? [])).map((l) => l.slug));
  for (const r of cfg.referenzen ?? []) if (!leistungSlugs.has(r.leistungSlug)) warn.push(`Referenz „${r.slug}“ verweist auf unbekannte Leistung „${r.leistungSlug}“.`);
  for (const l of cfg.lokaleSeiten ?? []) if (!leistungSlugs.has(l.leistungSlug)) fehler.push(`Lokale Seite „${l.ort}“ verweist auf unbekannte Leistung „${l.leistungSlug}“.`);
  const iconNamen = [];
  const walk3 = (v) => {
    if (Array.isArray(v)) v.forEach(walk3);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) k === 'icon' && typeof x === 'string' ? iconNamen.push(x) : walk3(x);
  };
  walk3(raw);
  for (const i of iconNamen) if (!icons[i] && !BRAND_ICONS.includes(i)) fehler.push(`Unbekanntes Icon „${i}“ – Namen unter https://lucide.dev/icons nachschlagen.`);
  const hl = (cfg.sektionen ?? []).find((s) => s.typ === 'referenzen')?.highlight;
  if (hl && !(cfg.referenzen ?? []).some((r) => r.slug === hl)) warn.push(`sektionen › referenzen › highlight „${hl}“ existiert nicht.`);

  // 6) Livegang-Hinweise
  if (cfg.meta?.noindex === false) {
    if (cfg.demo?.banner?.aktiv) warn.push('noindex ist aus (Live), aber das Demo-Banner ist noch aktiv.');
    if (!cfg.integrationen?.formularEndpoint) warn.push('noindex ist aus (Live), aber kein formularEndpoint gesetzt – Anfragen würden nicht ankommen.');
    if (cfg.betrieb?.bewertungen?.beispiel) warn.push('noindex ist aus (Live), aber Bewertungen sind als Beispiel markiert – nur echte Bewertungen verwenden.');
    if (!cfg.meta?.domain) warn.push('noindex ist aus (Live), aber meta.domain fehlt (Canonical/Sitemap).');
  }

  log(`\n${c.bold(`Variante „${slug}“`)}`);
  if (fehler.length) log(c.red(`\n✖ ${fehler.length} Fehler:`), ...fehler.map((f) => `\n  • ${f}`));
  if (warn.length) log(c.yellow(`\n▲ ${warn.length} Hinweis(e):`), ...warn.map((f) => `\n  • ${f}`));
  if (!fehler.length && !warn.length) log(c.green('\n✔ Alles in Ordnung.'));
  else if (!fehler.length) log(c.green('\n✔ Keine Fehler – baubar.'));
  log('');
  return { fehler, warn };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  const alle = readdirSync(new URL('../variants/', import.meta.url), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name);
  const slugs = arg ? [arg] : alle;
  if (!arg) console.log(c.dim(`Kein Slug angegeben – prüfe alle: ${alle.join(', ')}`));
  let failed = false;
  for (const s of slugs) if (checkVariant(s).fehler.length) failed = true;
  process.exit(failed ? 1 : 0);
}
