/**
 * SEO: Titel, Beschreibung, Canonical und strukturierte Daten (JSON-LD).
 */
import { site, sb, type Leistung } from './config';
import { TAGE } from './hours';
import { basePath } from './paths';

const c = site.config;
// SITE_URL (z. B. beim Veröffentlichen auf GitHub Pages) überschreibt meta.domain; Basis-Pfad wird angehängt
const ORIGIN = `${(process.env.SITE_URL ?? c.meta.domain ?? `https://${site.variant}.example.com`).replace(/\/$/, '')}${basePath}`;

export const absUrl = (path: string) => `${ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  ogKey: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}

/** Seitentitel mit Ort für lokales SEO, max. ~60 Zeichen */
export function pageTitle(teil?: string, key?: string): string {
  const o = key ? c.seo.seiten[key]?.titel : undefined;
  if (o) return o;
  if (!teil) return c.seo.titel ?? `${c.betrieb.kurzname} – ${site.gewerkName} in ${c.betrieb.adresse.ort}`;
  const t = `${teil} | ${c.betrieb.kurzname}`;
  return t.length <= 62 ? t : teil;
}

export function pageDescription(fallback: string, key?: string): string {
  const d = (key ? c.seo.seiten[key]?.beschreibung : undefined) ?? fallback;
  return d.length > 158 ? `${d.slice(0, 155).replace(/\s+\S*$/, '')} …` : d;
}

export const homeDescription = () => c.seo.beschreibung ?? sb('metaBeschreibung');

const DAY: Record<string, string> = { mo: 'Monday', di: 'Tuesday', mi: 'Wednesday', do: 'Thursday', fr: 'Friday', sa: 'Saturday', so: 'Sunday' };

export function localBusiness() {
  const b = c.betrieb;
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': site.schemaTyp,
    '@id': `${ORIGIN}/#betrieb`,
    name: b.name,
    alternateName: b.kurzname,
    slogan: b.slogan,
    url: `${ORIGIN}/`,
    image: absUrl('/og/start.png'),
    logo: absUrl('/og/start.png'),
    telephone: b.telefon,
    email: b.email,
    foundingDate: String(b.gruendungsjahr),
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.adresse.strasse,
      postalCode: b.adresse.plz,
      addressLocality: b.adresse.ort,
      addressCountry: b.adresse.land,
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng },
    openingHoursSpecification: b.oeffnungszeiten.regulaer.map((r) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: r.tage.map((t) => DAY[t]),
      opens: r.von,
      closes: r.bis,
    })),
    areaServed: [
      ...c.einsatzgebiet.orte.map((o) => ({ '@type': 'City', name: o.name })),
      {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: c.einsatzgebiet.zentrum.lat, longitude: c.einsatzgebiet.zentrum.lng },
        geoRadius: c.einsatzgebiet.radiusKm * 1000,
      },
    ],
    knowsAbout: site.leistungen.map((l) => l.titel),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: site.gewerkName,
      itemListElement: site.leistungen.map((l) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: l.titel, url: site.seiten.leistungen ? absUrl(site.links.leistung(l.slug)) : undefined },
      })),
    },
  };
  if (b.socialLinks.length) ld.sameAs = b.socialLinks.map((s) => s.url);
  if (b.mitarbeiter) ld.numberOfEmployees = { '@type': 'QuantitativeValue', value: b.mitarbeiter };
  // aggregateRating NUR bei echten Bewertungen – nie bei Beispieldaten
  if (b.bewertungen && !b.bewertungen.beispiel && b.bewertungen.anzahl > 0) {
    ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: b.bewertungen.schnitt, reviewCount: b.bewertungen.anzahl, bestRating: 5 };
  }
  if (site.notdienst.aktiv && site.notdienst.rundUmDieUhr) {
    (ld.openingHoursSpecification as unknown[]).push({
      '@type': 'OpeningHoursSpecification',
      name: 'Notdienst',
      dayOfWeek: TAGE.map((t) => DAY[t]),
      opens: '00:00',
      closes: '23:59',
    });
  }
  return ld;
}

export function website() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${ORIGIN}/#website`, url: `${ORIGIN}/`, name: c.betrieb.name, inLanguage: 'de-DE' };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
}

export function faqPage(faqs: { frage: string; antwort: string }[]) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.frage, acceptedAnswer: { '@type': 'Answer', text: f.antwort } })),
  };
}

export function service(l: Leistung, ort?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: ort ? `${l.titel} in ${ort}` : l.titel,
    description: l.kurztext,
    serviceType: l.titel,
    provider: { '@id': `${ORIGIN}/#betrieb` },
    areaServed: ort ? { '@type': 'City', name: ort } : c.einsatzgebiet.orte.map((o) => ({ '@type': 'City', name: o.name })),
    url: absUrl(site.links.leistung(l.slug)),
  };
}

type Stelle = (typeof c.stellen)[number];
const EMPLOYMENT: Record<Stelle['art'], string[]> = {
  Ausbildung: ['FULL_TIME', 'INTERN'],
  Vollzeit: ['FULL_TIME'],
  Teilzeit: ['PART_TIME'],
  Minijob: ['PART_TIME', 'TEMPORARY'],
};

/** JobPosting für Google for Jobs – alle Pflichtfelder + empfohlene Felder */
export function jobPosting(s: Stelle) {
  const b = c.betrieb;
  const html = [
    `<p>${s.intro}</p>`,
    `<h3>Deine Aufgaben</h3><ul>${s.aufgaben.map((a) => `<li>${a}</li>`).join('')}</ul>`,
    `<h3>Was du mitbringst</h3><ul>${s.profil.map((a) => `<li>${a}</li>`).join('')}</ul>`,
    `<h3>Was wir bieten</h3><ul>${s.benefits.map((a) => `<li>${a}</li>`).join('')}</ul>`,
  ].join('');
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: s.titel,
    description: html,
    datePosted: s.veroeffentlicht,
    employmentType: EMPLOYMENT[s.art],
    hiringOrganization: { '@type': 'Organization', name: b.name, sameAs: `${ORIGIN}/`, logo: absUrl('/og/start.png') },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', streetAddress: b.adresse.strasse, addressLocality: b.adresse.ort, postalCode: b.adresse.plz, addressCountry: b.adresse.land },
    },
    directApply: true,
    url: absUrl(site.links.stelle(s.slug)),
  };
  if (s.gueltigBis) ld.validThrough = `${s.gueltigBis}T23:59:59+01:00`;
  if (s.gehaltsspanne) {
    ld.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: { '@type': 'QuantitativeValue', minValue: s.gehaltsspanne.von, maxValue: s.gehaltsspanne.bis, unitText: s.gehaltsspanne.einheit },
    };
  }
  return ld;
}
