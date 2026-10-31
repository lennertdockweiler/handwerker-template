#!/usr/bin/env node
/** npm run build:all → astro check, dann jede Variante (außer _template) nach dist/<slug>/ */
import { readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const only = process.argv.slice(2);
const variants = readdirSync(new URL('../variants/', import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name)
  .filter((v) => !only.length || only.includes(v));

const run = (args, env = {}) => spawnSync('npx', args, { stdio: 'inherit', env: { ...process.env, ...env } });
const t0 = Date.now();

console.log('\n▶ TypeScript- und Astro-Prüfung (astro check)…');
if (run(['astro', 'check']).status !== 0) {
  console.error('\n✖ astro check meldet Fehler – Build abgebrochen.');
  process.exit(1);
}
const results = [];
for (const v of variants) {
  console.log(`\n▶ Baue Variante „${v}“ → dist/${v}/`);
  const check = spawnSync('node', ['--import', 'tsx', 'scripts/check-variant.mjs', v], { stdio: 'inherit' });
  if (check.status !== 0) {
    results.push([v, '✖ Config-Fehler']);
    continue;
  }
  rmSync(new URL(`../dist/${v}/`, import.meta.url), { recursive: true, force: true });
  const r = run(['astro', 'build'], { VARIANT: v, OUT_DIR: `./dist/${v}` });
  results.push([v, r.status === 0 ? '✔ gebaut' : '✖ Build-Fehler']);
}
console.log(`\nErgebnis (${Math.round((Date.now() - t0) / 1000)} s):`);
for (const [v, s] of results) console.log(`  ${s}  ${v}  → dist/${v}/`);
process.exit(results.some(([, s]) => s.startsWith('✖')) ? 1 : 0);
