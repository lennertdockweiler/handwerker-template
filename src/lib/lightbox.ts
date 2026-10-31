/** Bereitet Bilder für die Lightbox vor (optimierte WebP-URLs mit srcset) */
import { getImage as astroImage } from 'astro:assets';
import { getImage } from './images';
import type { Bild } from './config';

export async function lightboxItems(bilder: Bild[]) {
  const out: { src: string; srcset: string; alt: string }[] = [];
  for (const b of bilder) {
    const meta = getImage(b.datei);
    if (!meta) continue;
    const ws = [900, 1600, 2200].filter((w) => w <= meta.width);
    if (!ws.length) ws.push(meta.width);
    const imgs = await Promise.all(ws.map((w) => astroImage({ src: meta, width: w, format: 'webp', quality: 75 })));
    out.push({ src: imgs[imgs.length - 1]!.src, srcset: imgs.map((im, n) => `${im.src} ${ws[n]}w`).join(', '), alt: b.alt });
  }
  return out;
}
