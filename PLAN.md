# PLAN – Premium-Website-Template für Handwerksbetriebe

Stand: 21.10.2026 · Phase 0 (Konzept). Dieses Dokument hält die Entscheidungen fest,
die vor der Umsetzung getroffen wurden. Abweichungen während der Umsetzung stehen
am Ende unter „Entscheidungslog“.

---

## 1. Leitidee

**„Handwerk wie Produktdesign inszenieren.“** Jede Variante bekommt eine visuelle
Idee, die aus dem Material des Gewerks kommt – nicht aus einem Baukasten:

| Preset | Visuelle Idee | Ornament / Signatur |
|---|---|---|
| Modern Präzise | Technische Zeichnung, Schaltplan, Messprotokoll | Maßketten mit Endstrichen, Koordinaten-Labels, feines 8-px-Raster, Signalfarbe wie Textmarker |
| Manufaktur Warm | Werkstatt, Holz, Papier, Zeit | Jahresringe (konzentrische Linien) als Ornament, Papier-Grain, weiche Radien, große Bildflächen |
| Kraftvoll Bold | Plakat, Baustellenschild neu gedacht, Lautstärke | Riesige Zahlen, Laufbänder, harte Farbflächen im Wechsel, gestauchte Display-Schrift |

Grundsatz für alle: genau **ein** orchestrierter Wow-Moment pro Seite (Hero-Reveal bzw.
gepinnte Ablauf-Sektion), alles andere ruhig und präzise.

---

## 2. Sitemap

```
/                         Startseite (Sektionen aus config.sektionen, Reihenfolge frei)
/leistungen/              Übersicht (große Liste mit Bildvorschau)
/leistungen/[slug]/       Detail: Nutzen, Ablauf, Bilder, Kostenschätzer?, FAQ, Referenzen, CTA
/leistungen/[slug]/[ort]/ Lokale Landingpage (nur wenn config.lokaleSeiten einen eigenen Text liefert)
/referenzen/              Galerie mit Kategorie-Filter (FLIP) + Lightbox (Swipe)
/referenzen/[slug]/       Projekt: Fakten, Vorher/Nachher, Bilder, Kundenstimme
/ueber-uns/               Timeline (gepinnt), Team, Werte, Zertifikate, Mitgliedschaften
/karriere/                Stellen, Benefits, Einblicke, Schnellbewerbung (Du-Ansprache)
/karriere/[slug]/         Stelle: Aufgaben, Profil, Benefits, Gehalt, Schnellbewerbung (vorbelegt)
/notdienst/               nur wenn notdienst.aktiv
/kontakt/                 Anfrage-Konfigurator (Preact-Island) + Kontaktblock
/impressum/  /datenschutz/  /404
/pitch/                   versteckt, noindex, nicht in Sitemap, per demo.pitchSeite
/og/*.png                 automatisch erzeugte OG-Bilder (Satori + resvg, Build-Zeit)
```

Jede Unterseite lässt sich über `seiten.*` abschalten (Links verschwinden überall automatisch).

---

## 3. Sektionen der Startseite & Layout-Varianten

| typ | Layouts | Inhalt / Animation |
|---|---|---|
| `hero` | `vollbild` · `split` · `typo` | Vollbild: Bild/Video, Headline-Reveal per Maske, Parallax. Split: Text links, 3-Bild-Collage versetzt, sanft schwebend. Typo: riesiges Statement + Laufband mit Leistungen. Immer: 2 CTAs + Vertrauensleiste |
| `leistungen` | `bento` · `liste` · `tabs` | Bento-Grid mit Bild-Reveals · Liste mit cursorfolgender Vorschau (Desktop) / Akkordeon (mobil) · Tabs Privat/Gewerbe (ARIA-Tabs) |
| `usps` | `zahlen` · `split` | Count-up-Zähler (Jahre, Projekte, Mitarbeiter, Reaktionszeit) |
| `ablauf` | `gepinnt` · `liste` | Gepinnte Scroll-Sektion, Fortschrittslinie zeichnet sich, Schritte werden aktiv (mobil: vertikale Linie ohne Pin) |
| `referenzen` | `slider-galerie` · `raster` | Vorher/Nachher-Slider + horizontale Galerie (Desktop gepinnt, mobil scroll-snap) |
| `bewertungen` | `laufband` · `karussell` | Bewertungskarten, Gesamtnote groß, UWG-Hinweis |
| `einsatzgebiet` | `karte` · `kompakt` | Stilisierte SVG-Karte (aus Geo-Koordinaten projiziert), animierte Ortsmarker + PLZ-Checker |
| `karriere` | `emotional` · `kompakt` | Du-Ansprache, Benefits, Link zur Schnellbewerbung |
| `partner` | `laufband` · `raster` | Neutrale Platzhalter-Wortmarken |
| `faq` | `akkordeon` · `zweispaltig` | `<details>`-basiert (funktioniert ohne JS), FAQPage-Schema |
| `cta` | `kontakt` · `banner` | Abschluss-CTA + Öffnungszeiten + „Jetzt erreichbar“-Live-Status |
| `text-bild` | `links` · `rechts` | freier Inhaltsblock (Bonus für individuelle Betriebe) |

Jede Sektion: `{ typ, layout, aktiv, id?, ueberschrift?, intro?, … }`. Fehlende Texte kommen
aus dem Gewerk-Preset.

---

## 4. Config-Schema (Entwurf)

Single Source of Truth: `variants/_schema.ts` (Zod v4). Daraus `variants/_schema.json`
per `z.toJSONSchema()`; jede `site.config.json` verweist per `"$schema"` darauf.

```
meta            slug, sprache, anrede (sie|du), domain, noindex=true
betrieb         name, kurzname, rechtsform, inhaber, slogan, gruendungsjahr, mitarbeiter, azubis,
                adresse{strasse,plz,ort,land}, geo{lat,lng}, telefon, email, whatsapp,
                oeffnungszeiten{regulaer[{tage[],von,bis}], sonder[{datum,…}]}, socialLinks[],
                bewertungen{quelle,schnitt,anzahl,beispiel,pruefHinweis,eintraege[]}
branding        logo?{datei,alt}, farben{primaer,akzent,neutralTon}, stilPreset, schriftPaar?,
                radius?, animationsIntensitaet, bildstil{grain,overlay}
gewerk …        gewerk, gewerkBezeichnung, meisterbetrieb, meisterName, handwerkskammer{name,adresse},
                handwerksrolleNr, innung, zertifikate[], mitgliedschaften[], notdienst{…},
                einsatzgebiet{orte[],plz[],radiusKm,zentrum}, leistungen[], referenzen[], team[],
                stellen[], benefits[], partnerLogos[], historie[], werte[], kennzahlen[], ablauf[], faq[]
sektionen[]     geordnet, diskriminiert über `typ`
seiten          leistungen, referenzen, ueberUns, karriere, notdienst, kontakt (bool)
seo             titel/beschreibung je Seite (optional, sonst generiert)
rechtliches     berufsbezeichnung, verleihungsstaat, registergericht, registernummer, ustId,
                vertretungsberechtigt, verantwortlichInhalt, berufshaftpflicht?, agbUrl?
integrationen   formularEndpoint (leer = Demo-Modus), buchungsLink, karte{aktiv,embedUrl}, analytics(aus)
demo            banner{aktiv,text}, agentur{name,telefon,email,website}, pitchSeite
lokaleSeiten[]  {leistungSlug, ort, text, …} – nur mit eigenem Text
```

**Merge-Regel:** Leistungen/FAQ/Ablauf/Kennzahlen/Texte, die in der Config fehlen, kommen
aus `src/data/gewerke/<gewerk>.ts`. Eine Leistung in der Config mit gleichem `slug` wie im
Preset überschreibt nur die angegebenen Felder. Zeichenlimits stehen im Schema (`.max()`),
Fehlermeldungen auf Deutsch (`z.config(z.locales.de())` + eigene Meldungen).

**Anrede:** Texte enthalten Tokens wie `{{Sie|du}}`, `{{Ihr|dein}}` – der Renderer wählt anhand
`meta.anrede`. Karriere-Texte sind immer Du.

---

## 5. Die drei Stil-Presets

### 5.1 Modern Präzise (Demo: Brandt & Söhne Elektrotechnik, Freiburg)
- **Schriften:** Archivo Variable (wght 100–900, wdth 62–125) – Headlines bei `wdth 125 / wght 750`,
  technische Labels bei `wdth 75 / wght 550` mit Tabellenziffern. Fließtext Hanken Grotesk Variable.
- **Farben (Demo):** Anthrazit `#262B30` (primaer), Signalgelb `#FFC41F` (akzent), Zeichenpapier `#F3F4F2`
  (aus neutralTon abgeleitet), Graphit `#4A5159`, Linie `#D5D8DA`.
- **Radien:** 0–2 px. **Linien:** 1 px, Raster als Hintergrundmuster in Hero und Ablauf.
- **Bildsprache:** klare Kanten, kühle Töne, Details (Klemmen, Leitungen, Displays), dunkles Overlay im Hero.
- **Animation:** präzise, kurz (0,6–0,8 s), `power3.out`, Maßketten „zeichnen“ sich, Zähler ticken.

### 5.2 Manufaktur Warm (Demo: Holzwerk Kaiser, Rosenheim)
- **Schriften:** Fraunces Variable (opsz, wght, SOFT, WONK) – Headlines `opsz 144 / wght 420 / SOFT 50`.
  Fließtext Manrope Variable.
- **Farben (Demo):** Nussbaum `#4A3427` (primaer), Moos `#5D6B3A` (akzent), Leinen `#F3EEE6` (Grund),
  Eiche `#B8956A` (neutralTon), Ton `#DDD0BC`. Bewusst **kein** Terracotta.
- **Radien:** 14–28 px, Bilder mit großzügigem Radius. **Textur:** SVG-Grain (feTurbulence) über Flächen.
- **Bildsprache:** warmes Licht, Holzmaserung, Hände, fertige Möbel im Raum, großzügig.
- **Animation:** ruhig, länger (0,9–1,2 s), `expo.out`, Bilder öffnen sich per clip-path wie ein Vorhang.

### 5.3 Kraftvoll Bold (Bonus-Demo: Wärmewerk Yilmaz, SHK, Mannheim)
- **Schriften:** Bricolage Grotesque Variable (opsz, wght) – Display `opsz 96 / wght 800`, eng gesetzt;
  Fließtext dieselbe Familie bei `opsz 14` (eine Familie = weniger Bytes).
- **Farben (Demo):** Heiß-Rot `#E63A2E` + Kalt-Blau `#1E5BFF` (wie Armaturen-Markierungen), Weiß, Tinte `#16181D`.
- **Radien:** 8–999 px (Pillen-Buttons). **Flächen:** harte Farbwechsel zwischen Sektionen.
- **Animation:** ausdrucksstark, Laufbänder, große Zähler, Skew beim Scrollen (dezent).

`radius`, `schriftPaar` und `animationsIntensitaet` können jedes Preset übersteuern.

---

## 6. Theme-Generator (`src/lib/theme.ts`)
1. Markenfarbe → OKLCH (culori). Skala 50–950 mit fester Helligkeitskurve, Chroma pro Stufe
   reduziert und in den sRGB-Gamut geklemmt.
2. Neutralskala aus `neutralTon` (oder primaer) mit stark reduziertem Chroma.
3. Semantische Tokens: `--c-bg`, `--c-surface`, `--c-ink`, `--c-ink-soft`, `--c-line`, `--c-brand`,
   `--c-on-brand`, `--c-accent`, `--c-on-accent`, `--c-accent-ink` (Akzent als Textfarbe, AA-sicher),
   `--c-dark`, `--c-on-dark`, `--c-focus` …
4. WCAG-Prüfung: Textfarbe auf Flächen automatisch hell/dunkel; ist die Markenfarbe selbst zu hell
   für Text auf Weiß, wird automatisch eine dunklere Stufe als `accent-ink` gewählt. Ergebnisse werden
   vom `variant:check` als Warnung ausgegeben.
5. Optional `npm run colors -- <logo>` extrahiert dominante Farben (sharp) als Vorschlag.

---

## 7. Animationskonzept je Sektion (data-anim API)

| Sektion | Bewegung | Reduced Motion |
|---|---|---|
| Header | transparent → kompakt + Blur, versteckt beim Runter-, zeigt beim Hochscrollen | nur Farbwechsel |
| Hero vollbild | Headline: Zeilen per Maske hoch (LCP-Bild **sichtbar**, nur Scale 1.08→1), Parallax | statisch |
| Hero split | 3 Bilder clip-path-Reveal gestaffelt, danach sanftes Schweben (CSS) | statisch |
| Hero typo | Wörter per Maske, Laufband | Laufband steht |
| Leistungen | Bento: Bild-Reveals mit Stagger · Liste: Vorschau folgt Cursor (pointer:fine) | Fade |
| USPs | Count-up beim Sichtbarwerden | Endwerte sofort |
| Ablauf | Pin + Scrub, Linie zeichnet sich (scaleX/scaleY), Schritte aktiv | alle aktiv, kein Pin |
| Referenzen | Vorher/Nachher „Hinweis-Wackeln“ einmalig, horizontale Galerie gepinnt (≥1024 px) | kein Wackeln, nativer Scroll |
| Bewertungen/Partner | Marquee (CSS-Transform, pausiert bei Hover/Fokus) | steht still |
| Einsatzgebiet | Marker poppen gestaffelt, Pulsring um Zentrum | statisch |
| Seitenwechsel | View Transitions, Shared Element Karte → Detail (`transition:name`) | Astro-Fallback ohne Animation |

`animationsIntensitaet` skaliert Distanzen/Dauer (dezent 0,6× · standard 1× · ausdrucksstark 1,4×)
und schaltet bei „dezent“ Parallax/Magnet-Buttons ab. Ausgangszustände nur unter `html.js`.
Lifecycle: `astro:page-load` → `init()`, `astro:before-swap` → `destroy()` (ScrollTrigger.kill,
Lenis.destroy, Observer.disconnect, AbortController für alle Listener).

---

## 8. Interaktive Features

1. **Anfrage-Konfigurator** (Preact-Island, `client:visible`): Leistung → Fragen aus Preset →
   Dringlichkeit → PLZ (Einsatzgebiet) → Fotos (Drag & Drop, Thumbnails, clientseitig) → Kontakt →
   Zusammenfassung → Senden (Demo-Modus oder echter Endpoint) → Erfolgsanimation. localStorage-Entwurf.
2. **Vorher/Nachher-Slider** (Vanilla, `role="slider"`, Maus/Touch/Pfeiltasten/Home/End).
3. **PLZ-Checker** (Vanilla): ja / auf Anfrage / leider nein.
4. **Notdienst-Leiste** + Live-Status (Intl, Europe/Berlin).
5. **Kostenschätzer** (Vanilla, je Leistung per Config), Preise inkl. MwSt.
6. **Schnellbewerbung** (Vanilla) + WhatsApp-Option.
7. **Referenz-Galerie** mit FLIP-Filter + Lightbox (Fokusfalle, Esc, Swipe, Pfeiltasten).
8. **Mobile Sticky-Aktionsleiste** (Anrufen · WhatsApp · Anfrage, safe-area).
9. **Pitch-Rechner** (/pitch): unbesetzte Stellen + Zeitersparnis.
10. **Öffnungszeiten-Live-Status** („Jetzt erreichbar“).

---

## 9. Technik-Entscheidungen
- Astro 7.4 (statisch), TS strict, Tailwind 4.3 via `@tailwindcss/vite`, GSAP 3.15 (+ScrollTrigger, SplitText), Lenis 1.3.
- Aktive Variante: `VARIANT` → Vite-Alias `@variant` → `variants/<slug>/`. Bilder per
  `import.meta.glob('@variant/assets/**/*')` → nur Bilder der aktiven Variante landen im Build.
- Schriften über die Astro-Font-API mit `fontProviders.local()` aus den `@fontsource-variable`-Paketen
  (woff2, latin + latin-ext, `swap`, automatische Fallbacks mit `size-adjust`, Preload). Es werden nur
  die 1–2 Familien des aktiven Presets registriert.
- TypeScript 6 (nicht 7), weil `@astrojs/check` nur `^5 || ^6` unterstützt.
- Preact nur für den Konfigurator (komplexer Mehrschritt-Zustand).
- OG-Bilder: Satori + resvg zur Build-Zeit (statische Fontsource-WOFF-Dateien, da Satori kein woff2 kann).
- Service Worker (schlank): Precache der Hauptseiten, Cache-first für `/_astro/*`.

---

## 10. Entscheidungslog (während der Umsetzung)

| Entscheidung | Begründung |
|---|---|
| Astro 7.4 statt 5/6 | aktuelle stabile Version laut npm (Prompt: „per npm prüfen“). Font-API ist dort stabil und liefert Preload + `size-adjust`-Fallbacks automatisch. |
| TypeScript 6 statt 7 | `@astrojs/check` unterstützt nur `^5 \|\| ^6`. |
| Eigener Font-Provider-Wrapper (`withSubsets`) | Der lokale Provider kennt keine Subsets; ohne Wrapper würden latin **und** latin-ext vorgeladen (+86 KB). |
| Vite-Alias `@variant` + `import.meta.glob('@variant/assets/**')` | nur Bilder der aktiven Variante landen im Build; Optimierung durch astro:assets. |
| Anrede-Weichen `{{Sie\|du}}` in allen Preset-Texten + `npm run lint:anrede` | `meta.anrede: "du"` funktioniert ohne zweite Textfassung; der Lint verhindert Rückfälle. |
| Kommentare in JSON per `"//"`-Schlüssel | Zod entfernt unbekannte Schlüssel; die Kopiervorlage bleibt gültiges JSON mit Erklärungen. |
| Hero-Animation als reine CSS-Transform-Keyframes | LCP darf nicht bei `opacity: 0` starten (Prompt B4). JS-/Masken-Reveals verzögerten LCP messbar (Lighthouse 76 → 97). |
| GSAP-Module erst nach `load` im Leerlauf | Hero braucht kein GSAP mehr; hält 44 KB aus dem kritischen Pfad. 4-s-Fallback macht Inhalte immer sichtbar. |
| `inlineStylesheets: 'always'` | zwei render-blockierende CSS-Requests kosteten auf simuliertem 4G ~600 ms. |
| `data-anim-done` nach Animationen | `clearProps` hätte sonst die CSS-Ausgangsregel (`opacity: 0`) wieder aktiviert – Elemente verschwanden nach dem Einblenden. |
| Zustände über Farbe statt Transparenz (Ablauf, Timeline, Maßkette) | `opacity` auf Text unterschritt AA-Kontrast. |
| JS-only-Bedienelemente via `html.js`-CSS statt `hidden`-Attribut | verhindert Layout-Sprünge (CLS 0,13 → 0). |
| AVIF-Qualität 50 (LCP-Bilder 58) | Bildgewicht war der größte verbleibende LCP-Faktor; optisch kein sichtbarer Unterschied im Layout-Kontext. |
| Bonus-Variante `demo-3` | Nachweis für Preset „Kraftvoll Bold“, Du-Anrede, Typo-Hero und Tabs – nicht gefordert, aber Beleg für „keine Klone“. |
| Unsplash-Fotos per offiziellem Download-Endpunkt | Suchseiten blockieren Bots (Anubis/Cloudflare); Auswahl per WebFetch-Liste + Kontaktbögen, Download über `/photos/<id>/download`. |
| LCP-Bild-Preload vor den Font-Preloads im `<head>` | Bild und Schriften konkurrieren auf 4G um Bandbreite; Fonts nicht vorzuladen machte Text-LCP schlechter (getestet, verworfen). |
| `npm run lighthouse` baut eine eigene indexierbare Testkopie | Demos sind noindex – für SEO = 100 muss das für den Test aus sein, ohne die Demo-Config anzufassen. |
| Ruhigeres Foto als erste Referenz in demo | feinteiliges Schaltschrank-Foto war als LCP-Bild 117 KB groß (/referenzen/ 88 → 95). |
| Mobiles Demo-Badge oben rechts | unten links überdeckte es die Hero-Buttons. |
