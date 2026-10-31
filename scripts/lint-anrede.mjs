// Findet Sie-/Ihr-Formen in Preset-Texten, die nicht als Anrede-Weiche {{Sie|du}} vorliegen.
import { readdirSync, readFileSync } from 'node:fs';
const dir = new URL('../src/data/gewerke/', import.meta.url);
const re = /(^|[^{|\w])(Sie|Ihr|Ihre|Ihren|Ihrem|Ihrer|Ihres|Ihnen)\b/g;
let n = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'types.ts')) {
  readFileSync(new URL(f, dir), 'utf8').split('\n').forEach((line, i) => {
    const clean = line.replace(/\{\{[^}]*\}\}/g, '');
    for (const m of clean.matchAll(re)) {
      n++;
      console.log(`${f}:${i + 1}  …${clean.slice(Math.max(0, m.index - 20), m.index + 30).trim()}…`);
    }
  });
}
console.log(n ? `\n✖ ${n} ungetaggte Anrede(n)` : '✔ Alle Anreden als Weiche getaggt');
process.exit(n ? 1 : 0);
