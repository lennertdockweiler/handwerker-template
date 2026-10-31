/**
 * Alle Seiten der aktiven Variante – Grundlage für OG-Bilder, Service Worker
 * und Screenshots. og = Schlüssel des OG-Bilds (/og/<og>.png).
 */
import { site } from './config';
import { ui } from '@/data/ui';
import { slugify, fill } from './text';

export interface Route {
  path: string;
  og: string;
  titel: string;
  untertitel?: string;
}

export function lokaleSeiten() {
  return site.config.lokaleSeiten
    .map((l) => ({ ...l, ortSlug: slugify(l.ort), leistung: site.leistungen.find((x) => x.slug === l.leistungSlug) }))
    .filter((l) => l.leistung);
}

export function allRoutes(): Route[] {
  const c = site.config;
  const s = site.seiten;
  const r: Route[] = [{ path: '/', og: 'start', titel: fill(ui.seo.gewerkOrt, site.vars), untertitel: c.betrieb.slogan }];
  if (s.leistungen) {
    r.push({ path: '/leistungen/', og: 'leistungen', titel: ui.nav.leistungen });
    site.leistungen.forEach((l) => r.push({ path: `/leistungen/${l.slug}/`, og: `leistung-${l.slug}`, titel: l.titel, untertitel: l.kurztext }));
    lokaleSeiten().forEach((l) =>
      r.push({ path: `/leistungen/${l.leistungSlug}/${l.ortSlug}/`, og: `lokal-${l.leistungSlug}-${l.ortSlug}`, titel: l.titel ?? `${l.leistung!.titel} in ${l.ort}` }),
    );
  }
  if (s.referenzen) {
    r.push({ path: '/referenzen/', og: 'referenzen', titel: ui.nav.referenzen });
    c.referenzen.forEach((x) => r.push({ path: `/referenzen/${x.slug}/`, og: `referenz-${x.slug}`, titel: x.titel, untertitel: `${x.ort} · ${x.jahr}` }));
  }
  if (s.ueberUns) r.push({ path: '/ueber-uns/', og: 'ueber-uns', titel: ui.nav.ueberUns });
  if (s.karriere) {
    r.push({ path: '/karriere/', og: 'karriere', titel: ui.nav.karriere });
    c.stellen.forEach((x) => r.push({ path: `/karriere/${x.slug}/`, og: `stelle-${x.slug}`, titel: x.titel, untertitel: x.art }));
  }
  if (s.notdienst) r.push({ path: '/notdienst/', og: 'notdienst', titel: ui.nav.notdienst });
  if (s.kontakt) r.push({ path: '/kontakt/', og: 'kontakt', titel: ui.nav.kontakt });
  r.push({ path: '/impressum/', og: 'impressum', titel: ui.footer.impressum });
  r.push({ path: '/datenschutz/', og: 'datenschutz', titel: ui.footer.datenschutz });
  return r;
}

export const allPagePaths = () => allRoutes().map((r) => r.path);
