import { site, sb, t } from '@/lib/config';
import { ui } from '@/data/ui';
import { telHref, fill } from '@/lib/text';
import type { Sektion } from '@/lib/config';
import { withBase } from '@/lib/paths';

export type HeroSektion = Extract<Sektion, { typ: 'hero' }>;

/** Gemeinsame Hero-Inhalte (Texte aus Config, sonst Preset) */
export function heroData(s: HeroSektion) {
  const c = site.config;
  return {
    kicker: fill(c.meisterbetrieb ? ui.hero.kickerMeister : ui.hero.kicker, { betriebsart: c.gewerkBezeichnung ?? site.preset.betriebsart, ort: c.betrieb.adresse.ort }),
    headline: s.headline ? t(s.headline) : sb('heroHeadline'),
    subline: s.subline ? t(s.subline) : sb('heroSubline'),
    statement: s.statement ? t(s.statement) : sb('heroStatement'),
    primary: { text: s.ctaPrimaer?.text ?? ui.cta.anfragen, href: s.ctaPrimaer?.ziel ? withBase(s.ctaPrimaer.ziel) : site.links.anfrage() },
    secondary: s.ctaSekundaer
      ? { text: s.ctaSekundaer.text, href: withBase(s.ctaSekundaer.ziel) }
      : { text: ui.cta.anrufen, href: telHref(c.betrieb.telefon) },
    coords: fill(ui.hero.koordinaten, { lat: c.betrieb.geo.lat.toFixed(4).replace('.', ','), lng: c.betrieb.geo.lng.toFixed(4).replace('.', ',') }),
  };
}
