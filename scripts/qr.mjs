#!/usr/bin/env node
/** npm run qr -- <slug> <url>  → qr/<slug>.png + .svg in Markenfarbe (mit ausreichendem Kontrast) */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import QRCode from 'qrcode';
import { buildTheme, contrast } from '../src/lib/theme.ts';

const [slug, url] = process.argv.slice(2);
if (!slug || !url) {
  console.error('\n✖ Aufruf: npm run qr -- <slug> <url>\n  z. B. npm run qr -- demo https://brandt.demo.example.com\n');
  process.exit(1);
}
const cfg = JSON.parse(readFileSync(new URL(`../variants/${slug}/site.config.json`, import.meta.url), 'utf8'));
const theme = buildTheme({ ...cfg.branding.farben, preset: cfg.branding.stilPreset ?? 'modern-praezise' });
// QR-Codes brauchen kräftigen Kontrast: dunkelste sinnvolle Markenfarbe auf Weiß
const dark = [theme.tokens.brand, theme.tokens.dark, theme.scales.primary[800], '#000000'].find((f) => contrast(f, '#ffffff') >= 7);
const opts = { errorCorrectionLevel: 'M', margin: 2, color: { dark, light: '#ffffff' } };
mkdirSync(new URL('../qr/', import.meta.url), { recursive: true });
await QRCode.toFile(new URL(`../qr/${slug}.png`, import.meta.url).pathname, url, { ...opts, width: 1200 });
writeFileSync(new URL(`../qr/${slug}.svg`, import.meta.url), await QRCode.toString(url, { ...opts, type: 'svg' }));
console.log(`✔ qr/${slug}.png und qr/${slug}.svg erzeugt (Farbe ${dark}) → ${url}`);
