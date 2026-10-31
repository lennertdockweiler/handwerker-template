/**
 * ════════════════════════════════════════════════════════════════════
 *  SINGLE SOURCE OF TRUTH für jede Varianten-Konfiguration
 *  variants/<slug>/site.config.json wird beim Build gegen dieses Schema
 *  validiert. `npm run schema` erzeugt daraus variants/_schema.json für
 *  die Autovervollständigung in VS Code.
 *
 *  Diese Datei importiert bewusst nur `zod`, damit sie auch direkt von
 *  Node-Skripten (scripts/*.mjs) geladen werden kann.
 * ════════════════════════════════════════════════════════════════════
 */
import { z } from 'zod';

z.config(z.locales.de());

/* ── Bausteine ─────────────────────────────────────────────────────── */

const txt = (max: number, description: string) =>
  z.string().trim().min(1, 'darf nicht leer sein').max(max, `höchstens ${max} Zeichen (sonst sprengt der Text das Layout)`).meta({ description });

const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Farbe als sechsstelliger Hex-Wert, z. B. "#1E5BFF"')
  .meta({ description: 'Farbe als Hex-Wert, z. B. "#1E5BFF"' });

const uhrzeit = z.string().regex(/^([01]\d|2[0-4]):[0-5]\d$/, 'Uhrzeit im Format "HH:MM"');
const datum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum im Format "JJJJ-MM-TT"');
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'nur Kleinbuchstaben, Ziffern und Bindestriche (z. B. "smart-home")');
const telefon = z
  .string()
  .regex(/^\+?[0-9 ()/-]{6,}$/, 'Telefonnummer, idealerweise international: "+49 761 000000"')
  .meta({ description: 'Telefonnummer im Format +49 761 000000' });

const iconName = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Lucide-Iconname in kebab-case, z. B. "plug-zap" (siehe lucide.dev)')
  .meta({ description: 'Name eines Lucide-Icons (https://lucide.dev/icons), z. B. "plug-zap"' });

export const bildSchema = z
  .object({
    datei: z
      .string()
      .optional()
      .meta({ description: 'Pfad relativ zum Variantenordner, z. B. "assets/hero.jpg". Leer = markenfarbiger Platzhalter.' }),
    mobil: z.string().optional().meta({ description: 'Optional: eigener Bildausschnitt für Smartphones (Art Direction)' }),
    alt: txt(180, 'Alternativtext: Was ist auf dem Bild zu sehen? (Pflicht für Barrierefreiheit)'),
    motiv: z.string().max(80).optional().meta({ description: 'Motivbeschreibung für den Platzhalter, solange kein Foto vorliegt' }),
    fokus: z
      .string()
      .regex(/^\d{1,3}% \d{1,3}%$/)
      .optional()
      .meta({ description: 'Bildfokus als CSS object-position, z. B. "50% 30%"' }),
  })
  .meta({ description: 'Bild mit Alternativtext' });
export type BildInput = z.input<typeof bildSchema>;

const faqEintrag = z.object({ frage: txt(140, 'Frage'), antwort: txt(900, 'Antwort') });

const anfrageFrage = z.object({
  id: slug,
  frage: txt(110, 'Frage im Anfrage-Konfigurator'),
  typ: z.enum(['auswahl', 'mehrfach', 'ja-nein', 'zahl', 'text']),
  optionen: z.array(z.string().max(60)).optional(),
  einheit: z.string().max(12).optional(),
  hilfe: z.string().max(160).optional(),
  pflicht: z.boolean().default(false),
});

const kostenschaetzer = z
  .object({
    einheit: z.string().max(12).meta({ description: 'z. B. "m²", "lfm", "Stück"' }),
    label: txt(60, 'Beschriftung des Reglers, z. B. "Wandfläche"'),
    preisVon: z.number().positive().meta({ description: 'Preis pro Einheit von (Endpreis inkl. MwSt.)' }),
    preisBis: z.number().positive().meta({ description: 'Preis pro Einheit bis (Endpreis inkl. MwSt.)' }),
    grundpreis: z.number().nonnegative().default(0).meta({ description: 'Fester Sockelbetrag, z. B. Anfahrt/Einrichtung' }),
    min: z.number().positive().default(1),
    max: z.number().positive().default(200),
    schritt: z.number().positive().default(1),
    standard: z.number().positive().default(40),
  })
  .meta({ description: 'Optionaler Kostenschätzer: Menge × Preisspanne = unverbindlicher Preisrahmen' });

export const leistungSchema = z.object({
  slug,
  titel: txt(42, 'Titel der Leistung').optional(),
  kurztext: txt(150, 'Kurztext für Karten und Listen').optional(),
  text: txt(1400, 'Ausführlicher Text für die Detailseite').optional(),
  icon: iconName.optional(),
  bilder: z.array(bildSchema).optional(),
  nutzen: z.array(txt(120, 'Nutzenargument')).max(5).optional(),
  ablauf: z.array(z.object({ titel: txt(40, 'Schritt'), text: txt(220, 'Beschreibung') })).max(5).optional(),
  faq: z.array(faqEintrag).optional(),
  anfrageFragen: z.array(anfrageFrage).optional(),
  kostenschaetzer: kostenschaetzer.optional(),
  kundengruppen: z.array(z.enum(['privat', 'gewerbe'])).optional(),
  aktiv: z.boolean().default(true),
});

const referenzSchema = z.object({
  slug,
  titel: txt(70, 'Projekttitel'),
  ort: txt(40, 'Ort'),
  jahr: z.number().int().min(1900).max(2100),
  kategorie: txt(32, 'Filterkategorie in der Galerie'),
  leistungSlug: slug.meta({ description: 'Zugehörige Leistung (slug)' }),
  vorher: bildSchema.optional(),
  nachher: bildSchema.optional(),
  bilder: z.array(bildSchema).min(1),
  beschreibung: txt(1200, 'Projektbeschreibung'),
  fakten: z.array(z.object({ label: txt(30, 'Label'), wert: txt(60, 'Wert') })).max(6).optional(),
  kundenstimme: z.object({ text: txt(400, 'Zitat'), name: txt(60, 'Name') }).optional(),
});

const teamSchema = z.object({
  name: txt(50, 'Name'),
  rolle: txt(60, 'Rolle im Betrieb'),
  foto: bildSchema,
  zitat: z.string().max(200).optional(),
});

const stelleSchema = z.object({
  slug,
  titel: txt(70, 'Stellentitel, z. B. "Elektroniker (m/w/d) für Energie- und Gebäudetechnik"'),
  art: z.enum(['Ausbildung', 'Vollzeit', 'Teilzeit', 'Minijob']),
  intro: txt(400, 'Kurzer, emotionaler Einstieg in Du-Ansprache'),
  aufgaben: z.array(txt(160, 'Aufgabe')).min(2),
  profil: z.array(txt(160, 'Anforderung')).min(2),
  benefits: z.array(txt(120, 'Benefit')).min(1),
  startdatum: txt(30, 'z. B. "ab sofort" oder "01.09.2027"'),
  arbeitszeit: z.string().max(60).optional(),
  gehaltsspanne: z
    .object({ von: z.number().positive(), bis: z.number().positive(), einheit: z.enum(['HOUR', 'MONTH', 'YEAR']) })
    .optional(),
  veroeffentlicht: datum.meta({ description: 'datePosted für Google for Jobs' }),
  gueltigBis: datum.optional(),
});

const oeffnungszeitenSchema = z.object({
  regulaer: z
    .array(
      z.object({
        tage: z.array(z.enum(['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'])).min(1),
        von: uhrzeit,
        bis: uhrzeit,
      }),
    )
    .min(1),
  sonder: z
    .array(
      z.object({
        datum,
        geschlossen: z.boolean().default(true),
        von: uhrzeit.optional(),
        bis: uhrzeit.optional(),
        hinweis: z.string().max(80).optional(),
      }),
    )
    .default([]),
  hinweis: z.string().max(120).optional(),
});

/* ── Sektionen (diskriminiert über `typ`) ────────────────────────── */

const sektionBasis = {
  aktiv: z.boolean().default(true),
  id: slug.optional().meta({ description: 'Anker-ID (für Links wie /#leistungen)' }),
  ton: z
    .enum(['hell', 'flaeche', 'dunkel', 'marke'])
    .optional()
    .meta({ description: 'Flächenton der Sektion – für Rhythmus und Abwechslung' }),
  ueberschrift: txt(90, 'Überschrift (sonst Standard aus dem Gewerk-Preset)').optional(),
  intro: txt(320, 'Einleitender Satz').optional(),
};

const cta = z.object({ text: txt(28, 'Button-Text'), ziel: z.string().min(1).meta({ description: 'Link, z. B. "/kontakt/" oder "tel:"' }) });

export const sektionSchema = z.discriminatedUnion('typ', [
  z.object({
    typ: z.literal('hero'),
    layout: z.enum(['vollbild', 'split', 'typo']).default('vollbild'),
    ...sektionBasis,
    headline: txt(80, 'Hero-Headline: kurz, konkret, selbstbewusst').optional(),
    subline: txt(220, 'Unterzeile').optional(),
    statement: txt(60, 'Nur Layout "typo": riesiges Statement').optional(),
    bild: bildSchema.optional(),
    bilder: z.array(bildSchema).max(3).optional().meta({ description: 'Layout "split": drei Bilder für die Collage' }),
    video: z
      .object({ datei: z.string(), dateiMobil: z.string().optional(), poster: bildSchema })
      .optional()
      .meta({ description: 'Layout "vollbild": stummes Hintergrundvideo (< 3 MB, Datei in public/ der Variante)' }),
    ctaPrimaer: cta.optional(),
    ctaSekundaer: cta.optional(),
  }),
  z.object({ typ: z.literal('leistungen'), layout: z.enum(['bento', 'liste', 'tabs']).default('bento'), ...sektionBasis }),
  z.object({ typ: z.literal('usps'), layout: z.enum(['zahlen', 'split']).default('zahlen'), ...sektionBasis, bild: bildSchema.optional() }),
  z.object({ typ: z.literal('ablauf'), layout: z.enum(['gepinnt', 'liste']).default('gepinnt'), ...sektionBasis }),
  z.object({
    typ: z.literal('referenzen'),
    layout: z.enum(['slider-galerie', 'raster']).default('slider-galerie'),
    ...sektionBasis,
    highlight: slug.optional().meta({ description: 'Slug der Referenz für den Vorher/Nachher-Slider' }),
  }),
  z.object({ typ: z.literal('bewertungen'), layout: z.enum(['laufband', 'karussell']).default('laufband'), ...sektionBasis }),
  z.object({ typ: z.literal('einsatzgebiet'), layout: z.enum(['karte', 'kompakt']).default('karte'), ...sektionBasis }),
  z.object({ typ: z.literal('karriere'), layout: z.enum(['emotional', 'kompakt']).default('emotional'), ...sektionBasis, bild: bildSchema.optional() }),
  z.object({ typ: z.literal('partner'), layout: z.enum(['laufband', 'raster']).default('laufband'), ...sektionBasis }),
  z.object({ typ: z.literal('faq'), layout: z.enum(['akkordeon', 'zweispaltig']).default('akkordeon'), ...sektionBasis }),
  z.object({ typ: z.literal('cta'), layout: z.enum(['kontakt', 'banner']).default('kontakt'), ...sektionBasis }),
  z.object({
    typ: z.literal('text-bild'),
    layout: z.enum(['links', 'rechts']).default('links'),
    ...sektionBasis,
    text: txt(1200, 'Fließtext'),
    bild: bildSchema,
    cta: cta.optional(),
  }),
]);
export type SektionInput = z.input<typeof sektionSchema>;

/* ── Gesamtschema ────────────────────────────────────────────────── */

export const GEWERKE = [
  'elektro',
  'shk',
  'dachdecker',
  'zimmerei',
  'maler',
  'tischler',
  'fliesen',
  'metallbau',
  'galabau',
  'bau',
  'allgemein',
] as const;

export const STIL_PRESETS = ['modern-praezise', 'manufaktur-warm', 'kraftvoll-bold'] as const;
export const SCHRIFTEN = ['archivo', 'hanken', 'fraunces', 'manrope', 'bricolage'] as const;

export const siteConfigSchema = z
  .object({
    $schema: z.string().optional(),

    meta: z.object({
      slug,
      sprache: z.literal('de').default('de'),
      anrede: z.enum(['sie', 'du']).default('sie').meta({ description: 'Ansprache der Kunden (Karriere ist immer „du“)' }),
      domain: z.url().optional().meta({ description: 'Live-URL inkl. https://, z. B. "https://brandt-elektro.de"' }),
      noindex: z.boolean().default(true).meta({ description: 'DEMO-SCHUTZ: true = nicht in Suchmaschinen. Erst zum Livegang auf false setzen!' }),
    }),

    betrieb: z.object({
      name: txt(80, 'Vollständiger Firmenname inkl. Rechtsform'),
      kurzname: txt(32, 'Kurzname für Logo/Wortmarke, z. B. "Brandt & Söhne"'),
      rechtsform: z.string().max(30).optional(),
      inhaber: txt(80, 'Inhaber / Geschäftsführer'),
      slogan: txt(90, 'Kurzer Claim'),
      gruendungsjahr: z.number().int().min(1800).max(2100),
      mitarbeiter: z.number().int().positive().optional(),
      azubis: z.number().int().nonnegative().optional(),
      projekte: z.number().int().positive().optional().meta({ description: 'Abgeschlossene Projekte (für Zähler)' }),
      reaktionszeit: z.string().max(20).optional().meta({ description: 'z. B. "24 h" – für die USP-Zähler' }),
      adresse: z.object({
        strasse: txt(60, 'Straße und Hausnummer'),
        plz: z.string().regex(/^\d{5}$/, 'fünfstellige PLZ'),
        ort: txt(40, 'Ort'),
        land: z.string().default('DE'),
        region: z.string().max(40).optional().meta({ description: 'Region inkl. Präposition, z. B. "im Breisgau" (Standard: "Umgebung")' }),
      }),
      geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
      telefon,
      email: z.email('gültige E-Mail-Adresse'),
      whatsapp: telefon.optional().meta({ description: 'WhatsApp-Nummer (leer = WhatsApp-Buttons ausgeblendet)' }),
      fax: z.string().optional(),
      oeffnungszeiten: oeffnungszeitenSchema,
      socialLinks: z
        .array(z.object({ netzwerk: z.enum(['instagram', 'facebook', 'linkedin', 'youtube', 'xing', 'tiktok']), url: z.url() }))
        .default([]),
      bewertungen: z
        .object({
          quelle: z.string().default('Google'),
          schnitt: z.number().min(1).max(5),
          anzahl: z.number().int().nonnegative(),
          profilUrl: z.url().optional(),
          beispiel: z.boolean().default(true).meta({ description: 'true = Beispielbewertungen (Demo). Live nur echte Bewertungen!' }),
          pruefHinweis: z
            .string()
            .max(400)
            .optional()
            .meta({ description: 'Pflichthinweis § 5b Abs. 3 UWG: ob und wie die Echtheit geprüft wird' }),
          eintraege: z
            .array(
              z.object({
                name: txt(40, 'Name (abgekürzt)'),
                ort: z.string().max(40).optional(),
                datum,
                sterne: z.number().int().min(1).max(5),
                text: txt(420, 'Bewertungstext'),
                leistung: z.string().max(40).optional(),
              }),
            )
            .default([]),
        })
        .optional(),
    }),

    branding: z.object({
      logo: z
        .object({
          datei: z.string().meta({ description: 'SVG oder PNG im Ordner assets/, z. B. "assets/logo.svg"' }),
          dateiHell: z.string().optional().meta({ description: 'Variante für dunkle Hintergründe' }),
          alt: txt(80, 'Alternativtext, meist der Firmenname'),
        })
        .optional()
        .meta({ description: 'Ohne Logo wird automatisch eine typografische Wortmarke erzeugt.' }),
      farben: z.object({
        primaer: hex.meta({ description: 'Hauptfarbe der Marke' }),
        akzent: hex.optional().meta({ description: 'Akzent-/Signalfarbe für Buttons und Highlights' }),
        neutralTon: hex.optional().meta({ description: 'Färbt Grau- und Hintergrundtöne (warm/kalt)' }),
      }),
      stilPreset: z.enum(STIL_PRESETS).default('modern-praezise'),
      schriftPaar: z
        .object({ headline: z.enum(SCHRIFTEN), text: z.enum(SCHRIFTEN) })
        .optional()
        .meta({ description: 'Überschreibt die Schriften des Presets' }),
      radius: z.enum(['eckig', 'dezent', 'rund']).optional().meta({ description: 'Überschreibt die Radien des Presets' }),
      animationsIntensitaet: z.enum(['dezent', 'standard', 'ausdrucksstark']).default('standard'),
      bildstil: z
        .object({
          grain: z.boolean().default(true).meta({ description: 'Feines Korn über Fotos – vereinheitlicht gemischte Bildqualität' }),
          toenung: z.number().min(0).max(0.6).default(0.12).meta({ description: 'Leichte Einfärbung der Fotos in Markenfarbe (0–0,6)' }),
        })
        .prefault({}),
    }),

    gewerk: z.enum(GEWERKE),
    gewerkBezeichnung: z.string().max(40).optional().meta({ description: 'z. B. "Schreinerei" statt "Tischlerei"' }),
    meisterbetrieb: z.boolean().default(true),
    meisterName: z.string().max(80).optional(),
    handwerkskammer: z.object({ name: txt(80, 'Name der Handwerkskammer'), adresse: txt(120, 'Anschrift') }).optional(),
    handwerksrolleNr: z.string().max(40).optional(),
    innung: z.string().max(100).optional(),
    zertifikate: z.array(z.object({ name: txt(80, 'Zertifikat'), bild: bildSchema.optional(), jahr: z.number().int().optional() })).default([]),
    mitgliedschaften: z.array(z.string().max(80)).default([]),

    notdienst: z
      .object({
        aktiv: z.boolean().default(false),
        telefon: telefon.optional(),
        zeiten: z.string().max(80).default('24 Stunden, 7 Tage die Woche'),
        rundUmDieUhr: z.boolean().default(true),
        hinweis: z.string().max(240).optional(),
        leistungen: z.array(z.string().max(60)).max(8).optional(),
      })
      .prefault({}),

    einsatzgebiet: z.object({
      zentrum: z.object({ name: txt(40, 'Ort'), lat: z.number(), lng: z.number() }),
      radiusKm: z.number().positive().max(300),
      orte: z
        .array(
          z.object({
            name: txt(40, 'Ortsname'),
            lat: z.number(),
            lng: z.number(),
            plz: z.array(z.string().regex(/^\d{5}$/)).default([]),
            status: z.enum(['ja', 'anfrage']).default('ja'),
          }),
        )
        .min(1),
      plz: z.array(z.string().regex(/^\d{2,5}$/)).default([]).meta({ description: 'Weitere PLZ (oder Präfixe wie "791") im Kerngebiet' }),
      plzAufAnfrage: z.array(z.string().regex(/^\d{2,5}$/)).default([]).meta({ description: 'PLZ/Präfixe, die „auf Anfrage“ bedient werden' }),
    }),

    leistungen: z.array(leistungSchema).optional().meta({ description: 'Leer = alle Leistungen des Gewerk-Presets. Gleicher slug = Preset-Werte überschreiben.' }),
    referenzen: z.array(referenzSchema).default([]),
    team: z.array(teamSchema).default([]),
    stellen: z.array(stelleSchema).default([]),
    benefits: z.array(z.object({ titel: txt(40, 'Benefit'), text: txt(160, 'Beschreibung'), icon: iconName })).optional(),
    partnerLogos: z.array(z.object({ name: txt(40, 'Name'), datei: z.string().optional() })).default([]),
    historie: z.array(z.object({ jahr: z.number().int(), ereignis: txt(70, 'Ereignis'), text: z.string().max(300).optional() })).default([]),
    werte: z.array(z.object({ titel: txt(40, 'Wert'), text: txt(240, 'Beschreibung') })).optional(),
    kennzahlen: z
      .array(z.object({ wert: z.number(), praefix: z.string().max(4).optional(), suffix: z.string().max(8).optional(), label: txt(40, 'Beschriftung') }))
      .max(4)
      .optional()
      .meta({ description: 'Leer = automatisch aus Gründungsjahr, Projekten, Mitarbeitern und Reaktionszeit' }),
    ablauf: z.array(z.object({ titel: txt(40, 'Schritt'), text: txt(240, 'Beschreibung') })).length(4).optional(),
    faq: z.array(faqEintrag).optional(),
    texte: z.record(z.string(), z.string()).default({}).meta({ description: 'Überschreibt einzelne Sprachbausteine des Presets (Schlüssel siehe src/data/gewerke)' }),

    lokaleSeiten: z
      .array(
        z.object({
          leistungSlug: slug,
          ort: txt(40, 'Ort'),
          titel: txt(80, 'H1 der lokalen Seite').optional(),
          text: z
            .string()
            .min(400, 'mindestens 400 Zeichen eigenständiger Text – sonst droht Duplicate Content')
            .max(2400),
          besonderheiten: z.array(z.string().max(140)).max(5).optional(),
        }),
      )
      .default([]),

    sektionen: z.array(sektionSchema).min(1).meta({ description: 'Reihenfolge = Reihenfolge auf der Startseite' }),

    seiten: z
      .object({
        leistungen: z.boolean().default(true),
        referenzen: z.boolean().default(true),
        ueberUns: z.boolean().default(true),
        karriere: z.boolean().default(true),
        notdienst: z.boolean().default(true).meta({ description: 'Wird nur gebaut, wenn zusätzlich notdienst.aktiv = true' }),
        kontakt: z.boolean().default(true),
      })
      .prefault({}),

    seo: z
      .object({
        titel: z.string().max(65).optional(),
        beschreibung: z.string().max(160).optional(),
        seiten: z.record(z.string(), z.object({ titel: z.string().max(65).optional(), beschreibung: z.string().max(160).optional() })).default({}),
      })
      .prefault({}),

    rechtliches: z.object({
      berufsbezeichnung: txt(80, 'z. B. "Elektrotechnikermeister"'),
      verleihungsstaat: z.string().default('Deutschland'),
      vertretungsberechtigt: z.array(z.string().max(80)).min(1),
      registergericht: z.string().max(60).optional(),
      registernummer: z.string().max(40).optional(),
      ustId: z.string().max(20).optional(),
      wirtschaftsId: z.string().max(20).optional(),
      verantwortlichInhalt: z.object({ name: z.string().max(80), adresse: z.string().max(120) }).optional(),
      berufshaftpflicht: z.object({ versicherer: z.string().max(80), adresse: z.string().max(120), geltungsraum: z.string().max(60) }).optional(),
      agbUrl: z.string().optional(),
      verbraucherschlichtung: z.boolean().default(false),
    }),

    integrationen: z
      .object({
        formularEndpoint: z.union([z.url(), z.literal('')]).default('').meta({ description: 'Leer = Demo-Modus. Sonst z. B. Formspree-/Web3Forms-URL' }),
        formularZugangsschluessel: z.string().optional().meta({ description: 'z. B. Web3Forms access_key (öffentlich, kein Geheimnis)' }),
        buchungsLink: z.object({ url: z.url(), label: z.string().max(30) }).optional(),
        karte: z
          .object({ aktiv: z.boolean().default(false), embedUrl: z.url().optional() })
          .prefault({})
          .meta({ description: 'Zwei-Klick-Karte (Google/OSM). Lädt erst nach Einwilligung.' }),
        analytics: z
          .object({ aktiv: z.boolean().default(false), anbieter: z.enum(['plausible', 'matomo']).optional(), src: z.url().optional(), domain: z.string().optional() })
          .prefault({}),
      })
      .prefault({}),

    demo: z
      .object({
        banner: z.object({ aktiv: z.boolean().default(true), text: z.string().max(120).optional() }).prefault({}),
        agentur: z.object({ name: z.string(), telefon: telefon.optional(), email: z.email().optional(), website: z.url().optional() }).optional(),
        pitchSeite: z.boolean().default(true),
      })
      .prefault({}),
  })
  .superRefine((c, ctx) => {
    if (c.notdienst.aktiv && !c.notdienst.telefon) {
      ctx.addIssue({ code: 'custom', path: ['notdienst', 'telefon'], message: 'Notdienst ist aktiv, aber es fehlt eine Notdienst-Telefonnummer' });
    }
    if (c.meisterbetrieb && (!c.handwerkskammer || !c.handwerksrolleNr)) {
      ctx.addIssue({
        code: 'custom',
        path: ['handwerkskammer'],
        message: 'Meisterbetrieb (zulassungspflichtiges Handwerk): Handwerkskammer und Handwerksrollen-Nr. sind Pflicht im Impressum',
      });
    }
    const slugs = new Set<string>();
    c.referenzen.forEach((r, i) => {
      if (slugs.has(r.slug)) ctx.addIssue({ code: 'custom', path: ['referenzen', i, 'slug'], message: `Doppelter Slug „${r.slug}“` });
      slugs.add(r.slug);
    });
    if (!c.sektionen.some((s) => s.typ === 'hero')) {
      ctx.addIssue({ code: 'custom', path: ['sektionen'], message: 'Die Startseite braucht eine Sektion vom typ "hero"' });
    }
  });

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfig = z.output<typeof siteConfigSchema>;
export type Sektion = SiteConfig['sektionen'][number];
export type LeistungConfig = z.output<typeof leistungSchema>;

/** Formatiert Zod-Fehler als verständliche deutsche Liste. */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => {
      const pfad = i.path.length ? i.path.join(' › ') : '(Wurzel)';
      return `  • ${pfad}: ${i.message}`;
    })
    .join('\n');
}
