// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { astroFontEntries, resolveFontPair, withSubsets } from './src/data/fonts.mjs';

// Aktive Variante: VARIANT=<slug> npm run dev|build  (Standard: demo)
const VARIANT = process.env.VARIANT || 'demo';
const variantDir = new URL(`./variants/${VARIANT}/`, import.meta.url);
const configFile = new URL('site.config.json', variantDir);

if (VARIANT.startsWith('_') || !fs.existsSync(configFile)) {
  const available = fs
    .readdirSync(new URL('./variants/', import.meta.url), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name);
  throw new Error(
    `\n✖ Variante „${VARIANT}“ nicht gefunden (variants/${VARIANT}/site.config.json).\n  Verfügbar: ${available.join(', ')}\n`,
  );
}

const raw = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const noindex = raw?.meta?.noindex !== false;
const site = process.env.SITE_URL || raw?.meta?.domain || `https://${VARIANT}.example.com`;
// Basis-Pfad für Unterordner-Hosting (z. B. GitHub Pages), Standard: Domain-Root
const base = process.env.BASE_PATH || '/';

/**
 * Abgeschaltete Seiten (seiten.* = false) erzeugen Weiterleitungs-Stubs – diese nach dem Build entfernen.
 * @type {import('astro').AstroIntegration}
 */
const removeDisabledPages = {
  name: 'remove-disabled-pages',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const root = fileURLToPath(dir).replace(/\/$/, "");
      /** @param {string} d */
      const walk = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const p = `${d}/${e.name}`;
          if (e.isDirectory() && e.name !== '_astro') walk(p);
          else if (e.name === 'index.html' && fs.readFileSync(p, 'utf8').startsWith('<!doctype html><title>Redirecting to:')) {
            fs.rmSync(d, { recursive: true });
            logger.info(`abgeschaltete Seite entfernt: ${d.replace(root, '')}/`);
          }
        }
      };
      walk(root);
    },
  },
};

export default defineConfig({
  site,
  base,
  output: 'static',
  outDir: process.env.OUT_DIR || './dist',
  trailingSlash: 'always',
  // Gesamtes CSS inline: kein render-blockierender Request (wichtig für LCP auf 4G)
  build: { format: 'directory', inlineStylesheets: 'always' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  fonts: astroFontEntries(resolveFontPair(raw), withSubsets(fontProviders.local())),
  image: { responsiveStyles: false },
  integrations: [
    removeDisabledPages,
    preact({ include: ['**/islands/**/*.tsx'] }),
    // DEMO-SCHUTZ: Bei noindex entfällt die Sitemap komplett.
    ...(noindex
      ? []
      : [sitemap({ filter: (page) => !/\/(pitch|og|404)\b/.test(page) })]),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@variant': fileURLToPath(variantDir),
        '@': fileURLToPath(new URL('./src/', import.meta.url)),
      },
    },
    define: {
      __VARIANT__: JSON.stringify(VARIANT),
    },
  },
});
