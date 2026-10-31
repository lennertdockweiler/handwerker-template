#!/usr/bin/env node
/**
 * npm run shots -- <slug> [--pages=/,/kontakt/]
 * Screenshots aller Hauptseiten (mobil 390, Tablet 1024, Desktop 1440; Full-Page + Above-the-Fold)
 * nach screenshots/<slug>/. Full-Page nutzt ?static (Endzustand aller Animationen).
 * Voraussetzung: gebaute Variante in dist/<slug>/ (npm run build:all -- <slug>).
 */
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { serve } from './lib/serve.mjs';

const slug = process.argv[2] ?? 'demo';
const pagesArg = process.argv.find((a) => a.startsWith('--pages='));
const dist = new URL(`../dist/${slug}/`, import.meta.url).pathname;
if (!existsSync(join(dist, 'index.html'))) {
  console.error(`\n✖ dist/${slug}/ nicht gefunden. Zuerst bauen: npm run build:all -- ${slug}\n`);
  process.exit(1);
}
const findPages = (dir, base = '/') =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (!statSync(p).isDirectory() || ['_astro', 'og'].includes(f)) return [];
    const route = `${base}${f}/`;
    return [...(existsSync(join(p, 'index.html')) ? [route] : []), ...findPages(p, route)];
  });
const pages = pagesArg ? pagesArg.slice(8).split(',') : ['/', ...findPages(dist)];
const VIEWPORTS = { mobil: { width: 390, height: 844 }, tablet: { width: 1024, height: 1366 }, desktop: { width: 1440, height: 900 } };
const out = new URL(`../screenshots/${slug}/`, import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const { server, url } = await serve(dist);
const browser = await chromium.launch();
const probleme = [];
for (const [name, vp] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: name === 'desktop' ? 1 : 2, locale: 'de-DE', timezoneId: 'Europe/Berlin' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => probleme.push(`${name} JS-Fehler: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && probleme.push(`${name} Konsole: ${m.text()}`));
  for (const p of pages) {
    const file = (p === '/' ? 'start' : p.replace(/^\/|\/$/g, '').replace(/\//g, '_')) + `-${name}`;
    await page.goto(url + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1600);
    await page.screenshot({ path: join(out, `${file}-atf.png`) });
    await page.goto(`${url}${p}?static`, { waitUntil: 'networkidle' });
    // Durchscrollen, damit Lazy-Bilder laden
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 0) probleme.push(`${name} ${p}: ${ov}px horizontaler Overflow`);
    await page.screenshot({ path: join(out, `${file}-full.png`), fullPage: true });
    process.stdout.write('.');
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`\n✔ ${pages.length * 6} Screenshots in screenshots/${slug}/`);
if (probleme.length) {
  console.log(`\n▲ ${probleme.length} Auffälligkeit(en):\n${[...new Set(probleme)].map((x) => `  • ${x}`).join('\n')}`);
  process.exitCode = 1;
}
