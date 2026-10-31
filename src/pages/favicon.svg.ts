import type { APIRoute } from 'astro';
import { site } from '@/lib/config';

/** Favicon je Variante: Initiale des Kurznamens auf Markenfarbe */
export const GET: APIRoute = () => {
  const t = site.theme.tokens;
  const ch = site.config.betrieb.kurzname.trim().charAt(0).toUpperCase();
  const preset = site.config.branding.stilPreset;
  const r = preset === 'modern-praezise' ? 0 : preset === 'manufaktur-warm' ? 14 : 18;
  const font = preset === 'manufaktur-warm' ? 'Georgia, serif' : 'Arial Black, Arial, sans-serif';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${r}" fill="${t.dark}"/><text x="32" y="45" text-anchor="middle" font-family="${font}" font-weight="800" font-size="38" fill="${t['on-dark']}">${ch}</text>${preset === 'modern-praezise' ? `<rect x="46" y="8" width="10" height="10" fill="${t['accent-raw']}"/>` : `<circle cx="51" cy="13" r="5" fill="${t['accent-raw']}"/>`}</svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
