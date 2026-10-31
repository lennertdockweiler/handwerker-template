#!/usr/bin/env node
/** npm run colors -- <logo.png|svg>  → schlägt Markenfarben aus dem Logo vor */
import sharp from 'sharp';

const file = process.argv[2];
if (!file) {
  console.error('\n✖ Aufruf: npm run colors -- variants/<slug>/assets/logo.png\n');
  process.exit(1);
}
const { data, info } = await sharp(file).resize(80, 80, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const buckets = new Map();
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 128) continue;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max > 242 && min > 235) continue; // Weiß/Hintergrund
  const key = [r, g, b].map((v) => Math.round(v / 24) * 24).join(',');
  const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0, sat: (max - min) / (max || 1) };
  e.n++; e.r += r; e.g += g; e.b += b;
  buckets.set(key, e);
}
const hex = (e) => '#' + [e.r / e.n, e.g / e.n, e.b / e.n].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const top = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 6);
if (!top.length) {
  console.log('Keine deckenden Farben gefunden.');
  process.exit(0);
}
const primaer = top[0];
const akzent = top.slice(1).sort((a, b) => b.sat - a.sat)[0];
console.log(`\nDominante Farben (${info.width}×${info.height}):`);
top.forEach((e) => console.log(`  ${hex(e)}  ${Math.round((e.n / top.reduce((s, x) => s + x.n, 0)) * 100)} %`));
console.log(`\nVorschlag für site.config.json:\n  "farben": { "primaer": "${hex(primaer)}"${akzent ? `, "akzent": "${hex(akzent)}"` : ''} }\n`);
