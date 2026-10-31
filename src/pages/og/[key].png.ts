/**
 * Open-Graph-Bilder (1200 × 630) je Seite – zur Build-Zeit mit Satori + resvg.
 * Satori kann kein woff2, daher die statischen @fontsource-WOFF-Dateien (nur Build, nicht ausgeliefert).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { site } from '@/lib/config';
import { allRoutes, type Route } from '@/lib/routes';
import { fill, telAnzeige } from '@/lib/text';
import { ui } from '@/data/ui';

const require = createRequire(import.meta.url);
const PKG: Record<string, [string, number, number]> = {
  archivo: ['archivo', 800, 500],
  hanken: ['hanken-grotesk', 700, 400],
  fraunces: ['fraunces', 600, 400],
  manrope: ['manrope', 700, 400],
  bricolage: ['bricolage-grotesque', 800, 400],
};
function font(key: string, weight: number) {
  const [pkg] = PKG[key] ?? PKG.archivo!;
  return readFileSync(require.resolve(`@fontsource/${pkg}/files/${pkg}-latin-${weight}-normal.woff`));
}

export const getStaticPaths: GetStaticPaths = () => allRoutes().map((r) => ({ params: { key: r.og }, props: { r } }));

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): El => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const r = (props as { r: Route }).r;
  const c = site.config;
  const t = site.theme.tokens;
  const preset = c.branding.stilPreset;
  const [hk, tk] = [site.fonts.headline, site.fonts.text];
  const [, hw] = PKG[hk] ?? PKG.archivo!;
  const [, , tw] = PKG[tk] ?? PKG.hanken!;
  const bold = preset === 'kraftvoll-bold';
  const bg = bold ? t.brand! : t.dark!;
  const ink = bold ? t['on-brand']! : t['on-dark']!;
  const titel = r.titel.length > 70 ? `${r.titel.slice(0, 68)}…` : r.titel;
  const sub = r.untertitel ?? fill(ui.seo.gewerkOrt, site.vars);
  const radius = preset === 'modern-praezise' ? 0 : 999;

  const tree = h(
    'div',
    { width: 1200 - 144, height: 630 - 144, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: bg, color: ink, fontFamily: 'Text' },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
        h('div', { width: 30, height: 30, background: t['accent-raw'], borderRadius: radius }),
        h('div', { fontFamily: 'Head', fontSize: 34, fontWeight: hw, letterSpacing: -0.5 }, c.betrieb.kurzname),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
        h('div', { fontFamily: 'Head', fontWeight: hw, fontSize: titel.length > 40 ? 64 : 82, lineHeight: 1.02, letterSpacing: -2, maxWidth: 1000 }, titel),
        h('div', { fontSize: 30, opacity: 0.82, maxWidth: 900, lineHeight: 1.35 }, sub.length > 120 ? `${sub.slice(0, 118)}…` : sub),
      ]),
      h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24, opacity: 0.9 }, [
        h('div', { display: 'flex' }, `${site.gewerkName} · ${c.betrieb.adresse.ort}`),
        h('div', { display: 'flex', padding: '10px 22px', background: t.accent, color: t['on-accent'], borderRadius: radius, fontWeight: tw }, telAnzeige(c.betrieb.telefon)),
      ]),
    ],
  );

  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Head', data: font(hk, hw), weight: hw as 800, style: 'normal' },
      { name: 'Text', data: font(tk, tw), weight: tw as 400, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
