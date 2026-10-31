#!/usr/bin/env node
/**
 * npm run lighthouse -- <slug> [/pfad1,/pfad2] [--keep] [--block=muster]
 *
 * Lighthouse mobil (simuliertes 4G) für eine Variante. Baut dafür automatisch eine
 * temporäre Kopie mit meta.noindex = false (sonst kann SEO nicht 100 erreichen),
 * misst über einen lokalen, komprimierenden Server und räumt danach auf.
 * --keep   Testkopie nicht löschen (schneller bei mehreren Läufen)
 * --block  URL-Muster blockieren, z. B. --block=*.woff2 (für Ursachenanalyse)
 * Chrome: CHROME_PATH setzen, sonst wird das installierte Google Chrome verwendet.
 */
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { serve } from './lib/serve.mjs';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const [slug = 'demo', pfadArg = '/'] = args.filter((a) => !a.startsWith('--'));
const keep = flags.includes('--keep');
const block = flags.find((f) => f.startsWith('--block='))?.slice(8);
const PORT = 4600;
const tmp = `zz-lh-${slug}`;
const root = new URL('../', import.meta.url).pathname;
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const run = (cmd, a, env = {}) =>
  new Promise((resolve) => spawn(cmd, a, { stdio: 'inherit', cwd: root, env: { ...process.env, ...env } }).on('close', resolve));

// 1) Indexierbare Testkopie bauen (falls nicht schon vorhanden)
const dist = `${root}dist/${tmp}/`;
if (!existsSync(dist) || !keep) {
  rmSync(`${root}variants/${tmp}`, { recursive: true, force: true });
  cpSync(`${root}variants/${slug}`, `${root}variants/${tmp}`, { recursive: true });
  const cfgFile = `${root}variants/${tmp}/site.config.json`;
  const cfg = JSON.parse(readFileSync(cfgFile, 'utf8'));
  cfg.meta = { ...cfg.meta, slug: tmp, noindex: false, domain: `http://127.0.0.1:${PORT}` };
  writeFileSync(cfgFile, JSON.stringify(cfg, null, 2));
  rmSync(dist, { recursive: true, force: true });
  const code = await run('npx', ['astro', 'build'], { VARIANT: tmp, OUT_DIR: `./dist/${tmp}` });
  rmSync(`${root}variants/${tmp}`, { recursive: true, force: true });
  if (code !== 0) process.exit(1);
}

// 2) Messen – asynchron, damit der Server im selben Prozess antworten kann
const { server, url } = await serve(dist, PORT);
mkdirSync(`${root}lighthouse`, { recursive: true });
const ergebnisse = [];
for (const p of pfadArg.split(',')) {
  const name = `${slug}-${p === '/' ? 'start' : p.replace(/\//g, '_').replace(/^_|_$/g, '')}`;
  await run('npx', [
    '--yes', 'lighthouse@13', url + p, '--quiet', '--output=json', '--output=html', `--output-path=lighthouse/${name}`,
    '--only-categories=performance,accessibility,best-practices,seo', `--chrome-path=${chrome}`, '--chrome-flags=--headless=new',
    ...(block ? [`--blocked-url-patterns=${block}`] : []),
  ]);
  const file = `${root}lighthouse/${name}.report.json`;
  if (!existsSync(file)) continue;
  const j = JSON.parse(readFileSync(file, 'utf8'));
  const c = j.categories;
  const a = j.audits;
  const pct = (x) => Math.round(x.score * 100);
  ergebnisse.push(
    `${p}  Performance ${pct(c.performance)} · Accessibility ${pct(c.accessibility)} · Best Practices ${pct(c['best-practices'])} · SEO ${pct(c.seo)}\n` +
      `  LCP ${a['largest-contentful-paint'].displayValue} · CLS ${a['cumulative-layout-shift'].displayValue} · TBT ${a['total-blocking-time'].displayValue} · FCP ${a['first-contentful-paint'].displayValue}  (lighthouse/${name}.report.html)`,
  );
}
server.close();
if (!keep) rmSync(dist, { recursive: true, force: true });
console.log(`\nLighthouse mobil – ${slug}${block ? ` (blockiert: ${block})` : ''}\n${ergebnisse.join('\n')}`);
