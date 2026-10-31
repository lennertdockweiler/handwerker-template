/**
 * Varianten-Bilder: per import.meta.glob() aus variants/<aktive Variante>/assets/
 * geladen (Vite-Alias @variant), damit astro:assets sie optimiert (AVIF/WebP, srcset).
 */
import type { ImageMetadata } from 'astro';
import type { Bild } from './config';

const modules = import.meta.glob<{ default: ImageMetadata }>('@variant/assets/**/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
});

// Schlüssel normalisieren: "/variants/demo/assets/hero.jpg" → "assets/hero.jpg"
const byPath = new Map<string, ImageMetadata>();
for (const [key, mod] of Object.entries(modules)) {
  const i = key.indexOf('/assets/');
  byPath.set(key.slice(i + 1), mod.default);
}

export function getImage(path: string | undefined): ImageMetadata | undefined {
  if (!path) return undefined;
  const clean = path.replace(/^\.?\//, '');
  const img = byPath.get(clean);
  if (!img) {
    const vorhanden = [...byPath.keys()].slice(0, 12).join(', ');
    throw new Error(
      `\n✖ Bild „${clean}“ nicht gefunden in variants/${__VARIANT__}/.\n  Vorhanden u. a.: ${vorhanden}\n  Tipp: npm run variant:check -- ${__VARIANT__}\n`,
    );
  }
  return img;
}

export interface ResolvedBild {
  src?: ImageMetadata;
  mobil?: ImageMetadata;
  alt: string;
  motiv: string;
  fokus: string;
}

export function resolveBild(b: Bild | undefined, fallbackMotiv = ''): ResolvedBild {
  const src = getImage(b?.datei);
  const mobil = getImage(b?.mobil);
  return {
    ...(src ? { src } : {}),
    ...(mobil ? { mobil } : {}),
    alt: b?.alt ?? '',
    motiv: b?.motiv ?? fallbackMotiv,
    fokus: b?.fokus ?? '50% 50%',
  };
}

export const hasImage = (b: Bild | undefined) => !!b?.datei;
