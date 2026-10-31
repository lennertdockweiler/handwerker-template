/**
 * Typen der Branchen-Presets. Ein Preset liefert Standardwerte für alles, was eine
 * Variante NICHT selbst angibt (Leistungen, Fragen, FAQ, Ablauf, Sprachbausteine …).
 *
 * Texte dürfen Platzhalter enthalten:
 *   {{Sie|du}}  → Anrede-Weiche (meta.anrede); Groß-/Kleinschreibung wie geschrieben
 *   {ort} {region} {kurzname} {name} {jahre} {gruendungsjahr} {gewerk} {mitarbeiter} {radius}
 */
export type SchemaTyp =
  | 'Electrician'
  | 'Plumber'
  | 'HVACBusiness'
  | 'RoofingContractor'
  | 'HousePainter'
  | 'GeneralContractor'
  | 'HomeAndConstructionBusiness';

export interface PresetFrage {
  id: string;
  frage: string;
  typ: 'auswahl' | 'mehrfach' | 'ja-nein' | 'zahl' | 'text';
  optionen?: string[];
  einheit?: string;
  hilfe?: string;
  pflicht?: boolean;
}

export interface PresetLeistung {
  slug: string;
  titel: string;
  kurztext: string;
  text: string;
  icon: string;
  /** Bildmotiv-Vorschlag für Fotograf bzw. Platzhalter */
  motiv: string;
  nutzen?: string[];
  ablauf?: { titel: string; text: string }[];
  anfrageFragen: PresetFrage[];
  faq?: { frage: string; antwort: string }[];
  kundengruppen?: ('privat' | 'gewerbe')[];
  kostenschaetzer?: {
    einheit: string;
    label: string;
    preisVon: number;
    preisBis: number;
    grundpreis?: number;
    min?: number;
    max?: number;
    schritt?: number;
    standard?: number;
  };
}

/** Sprachbausteine: jeder Schlüssel kann per config.texte überschrieben werden. */
export interface Sprachbausteine {
  heroHeadline: string;
  heroSubline: string;
  heroStatement: string;
  leistungenTitel: string;
  leistungenIntro: string;
  uspsTitel: string;
  uspsIntro: string;
  ablaufTitel: string;
  ablaufIntro: string;
  referenzenTitel: string;
  referenzenIntro: string;
  bewertungenTitel: string;
  einsatzTitel: string;
  einsatzIntro: string;
  karriereTitel: string;
  karriereText: string;
  partnerTitel: string;
  faqTitel: string;
  ctaTitel: string;
  ctaText: string;
  ueberUnsTitel: string;
  ueberUnsIntro: string;
  teamTitel: string;
  werteTitel: string;
  historieTitel: string;
  notdienstTitel: string;
  notdienstText: string;
  kontaktTitel: string;
  kontaktIntro: string;
  leistungenSeiteTitel: string;
  leistungenSeiteIntro: string;
  referenzenSeiteTitel: string;
  referenzenSeiteIntro: string;
  karriereSeiteTitel: string;
  karriereSeiteIntro: string;
  metaBeschreibung: string;
  /** Kurzer Satz, warum sich Projekt X in dieser Region lohnt – Basis für lokale Seiten */
  lokalIntro: string;
}

export interface GewerkPreset {
  key: string;
  /** Anzeige-Bezeichnung, z. B. „Elektrotechnik“ */
  bezeichnung: string;
  /** Bezeichnung des Betriebs, z. B. „Elektrobetrieb“, „Schreinerei“ */
  betriebsart: string;
  /** Standard-Berufsbezeichnung des Meisters fürs Impressum */
  berufsbezeichnung: string;
  schemaTyp: SchemaTyp | SchemaTyp[];
  notdienstRelevant: boolean;
  /** Typische Fachbegriffe – Hilfe beim Texten, auch für lokale SEO-Texte */
  fachbegriffe: string[];
  leistungen: PresetLeistung[];
  faq: { frage: string; antwort: string }[];
  ablauf: { titel: string; text: string }[];
  werte: { titel: string; text: string }[];
  /** Notdienst-Leistungen (nur bei notdienstRelevant) */
  notdienstLeistungen?: string[];
  texte: Partial<Sprachbausteine>;
}
