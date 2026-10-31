/** Hero-Videos aus variants/<slug>/assets/ (werden von Vite mit Hash ausgeliefert) */
const videos = import.meta.glob<string>('@variant/assets/**/*.{mp4,webm}', { eager: true, query: '?url', import: 'default' });

const byPath = new Map<string, string>();
for (const [key, url] of Object.entries(videos)) byPath.set(key.slice(key.indexOf('/assets/') + 1), url);

export function resolveVideo(v: { datei: string; dateiMobil?: string | undefined }) {
  const src = byPath.get(v.datei.replace(/^\.?\//, ''));
  if (!src) throw new Error(`\n✖ Video „${v.datei}“ nicht gefunden in variants/${__VARIANT__}/assets/.\n`);
  const mobil = v.dateiMobil ? byPath.get(v.dateiMobil.replace(/^\.?\//, '')) : undefined;
  return { src, mobil: mobil ?? src };
}
