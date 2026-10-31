#!/usr/bin/env node
/** node scripts/audit-dist.mjs <slug> – Strukturprüfung der gebauten Seiten (H1, noindex, Links, JSON-LD, externe Requests) */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const slug = process.argv[2] ?? 'demo';
const dist = new URL(`../dist/${slug}/`, import.meta.url).pathname;
const pages = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== '_astro' && f !== 'og') walk(p); } else if (f.endsWith('.html')) pages.push(p); });
walk(dist);
const probleme = [];
const exists = (href) => { const clean = href.split('#')[0].split('?')[0]; if (!clean) return true; const p = join(dist, clean); return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html'))); };
let ld = 0, links = 0;
for (const file of pages) {
  const rel = file.replace(dist, '/');
  const html = readFileSync(file, 'utf8');
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) probleme.push(`${rel}: ${h1}× <h1>`);
  if (!/<meta name="robots" content="noindex, nofollow">/.test(html) && !rel.includes('zz-')) probleme.push(`${rel}: kein noindex`);
  if (!/<html lang="de"/.test(html)) probleme.push(`${rel}: lang fehlt`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); ld++; } catch { probleme.push(`${rel}: ungültiges JSON-LD`); } }
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) { links++; if (!exists(m[1])) probleme.push(`${rel}: toter Link ${m[1]}`); }
  if (/href="\/pitch\//.test(html)) probleme.push(`${rel}: verlinkt /pitch/`);
  for (const m of html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) { if (!/<link rel="canonical"|og:|twitter:/.test(html.slice(Math.max(0, m.index - 60), m.index)) && /(src)=/.test(m[0])) probleme.push(`${rel}: externe Ressource ${m[1]}`); }
  if (/fonts\.googleapis|fonts\.gstatic/.test(html)) probleme.push(`${rel}: Google Fonts!`);
}
if (existsSync(join(dist, 'sitemap-index.xml'))) probleme.push('Sitemap vorhanden trotz noindex');
if (!/Disallow: \/\n/.test(readFileSync(join(dist, 'robots.txt'), 'utf8'))) probleme.push('robots.txt sperrt nicht alles');
console.log(`${slug}: ${pages.length} Seiten, ${links} interne Links, ${ld} JSON-LD-Blöcke geprüft`);
console.log(probleme.length ? [...new Set(probleme)].map((p) => `  ✖ ${p}`).join('\n') : '  ✔ keine Probleme');
process.exit(probleme.length ? 1 : 0);
