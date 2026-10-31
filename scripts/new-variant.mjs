#!/usr/bin/env node
/** npm run variant:new -- <slug>  → kopiert variants/_template, setzt den Slug, zeigt die Checkliste */
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('\n✖ Bitte einen Slug angeben (Kleinbuchstaben, Ziffern, Bindestriche):\n  npm run variant:new -- mueller-elektro\n');
  process.exit(1);
}
const src = new URL('../variants/_template/', import.meta.url);
const dst = new URL(`../variants/${slug}/`, import.meta.url);
if (existsSync(dst)) {
  console.error(`\n✖ variants/${slug}/ existiert bereits.\n`);
  process.exit(1);
}
cpSync(src, dst, { recursive: true });
const file = new URL('site.config.json', dst);
const json = readFileSync(file, 'utf8').replace('"slug": "TODO-slug"', `"slug": "${slug}"`);
writeFileSync(file, json);
const todos = json.split('\n').map((l, i) => [i + 1, l.trim()]).filter(([, l]) => l.includes('TODO'));

console.log(`
✔ Variante angelegt: variants/${slug}/

Checkliste – das brauchst du vom Betrieb:
  [ ] Firmenname, Rechtsform, Inhaber, Gründungsjahr, Mitarbeiterzahl
  [ ] Adresse, Telefon, E-Mail, WhatsApp-Nummer, Öffnungszeiten
  [ ] Logo (SVG/PNG) – optional, sonst automatische Wortmarke
  [ ] Markenfarben (oder: npm run colors -- variants/${slug}/assets/logo.png)
  [ ] Gewerk + Leistungen (Preset passt meist, ggf. Leistungen abwählen)
  [ ] Fotos: Hero, je Leistung 1–3, Referenzen (vorher/nachher), Team-Porträts
  [ ] Einsatzgebiet: Orte + PLZ, Radius
  [ ] Referenzprojekte mit Ort, Jahr, Kurzbeschreibung
  [ ] Offene Stellen, Benefits
  [ ] Impressum: Handwerkskammer, Handwerksrolle, Berufsbezeichnung, Register, USt-IdNr.
  [ ] Echte Bewertungen (Quelle, Schnitt, Anzahl) – sonst als Beispiel kennzeichnen

Noch ${todos.length} TODO-Felder in site.config.json, z. B.:
${todos.slice(0, 8).map(([n, l]) => `  Zeile ${n}: ${l}`).join('\n')}

Weiter:
  npm run variant:check -- ${slug}
  VARIANT=${slug} npm run dev
`);
