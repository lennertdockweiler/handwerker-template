/**
 * Basis-Pfad für Hosting in Unterordnern (z. B. GitHub Pages: /website-entwuerfe/brandt/).
 * Intern arbeitet das Template mit Pfaden wie "/kontakt/"; withBase() setzt bei der
 * Ausgabe den Präfix davor. Ohne BASE_PATH (eigene Domain) bleibt alles unverändert.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path; // tel:, mailto:, https://, #anker
  return `${BASE}${path}`;
}

export const basePath = BASE;
