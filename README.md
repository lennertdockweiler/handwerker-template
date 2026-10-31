# Handwerker-Template

Premium-Website-Template für Handwerksbetriebe aller Gewerke. Aus **einer** Codebasis entstehen
beliebig viele personalisierte Demo- und Live-Seiten – ausschließlich über eine
Konfigurationsdatei und einen Asset-Ordner je Betrieb.

- **Astro 7** (statisch) · TypeScript strict · **Tailwind CSS 4** · **GSAP 3** (ScrollTrigger, SplitText) · **Lenis** · **Preact** (nur Anfrage-Konfigurator) · **Zod 4**
- 3 Stil-Presets, 11 Gewerk-Presets, 12 Sektionstypen mit je 2–3 Layouts
- Schriften lokal, keine externen Requests ohne Einwilligung, kein Cookie-Banner nötig
- Demo-Varianten: `demo` (Elektro, Freiburg), `demo-2` (Schreinerei, Rosenheim), Bonus `demo-3` (SHK, Mannheim)

---

## 1. Schnellstart

Voraussetzung: Node.js ≥ 22.23 (empfohlen: aktuelle LTS, siehe `.nvmrc`), npm.

```bash
npm install
npx playwright install chromium     # nur für Screenshots

npm run dev                         # Variante „demo“ unter http://localhost:4321
VARIANT=demo-2 npm run dev          # andere Variante
npm run build                       # astro check + Build der aktiven Variante nach dist/
npm run preview                     # gebaute Variante ansehen
npm run build:all                   # alle Varianten nach dist/<slug>/
```

Weitere Befehle:

| Befehl | Zweck |
|---|---|
| `npm run variant:new -- <slug>` | Neue Variante aus `variants/_template` anlegen + Checkliste |
| `npm run variant:check -- <slug>` | Config prüfen (Pflichtfelder, Bilder, Kontraste, Platzhalter, Zeichenlimits) |
| `npm run build:all [-- <slug> …]` | `astro check`, dann jede Variante nach `dist/<slug>/` |
| `npm run shots -- <slug>` | Screenshots aller Seiten (390 / 1024 / 1440 px, Full-Page + Above-the-Fold) nach `screenshots/<slug>/` |
| `npm run qr -- <slug> <url>` | QR-Code (PNG + SVG) in Markenfarbe nach `qr/` |
| `npm run colors -- <logo.png>` | Dominante Logofarben als Vorschlag für `branding.farben` |
| `npm run schema` | `variants/_schema.json` (VS-Code-Autovervollständigung) aus dem Zod-Schema neu erzeugen |
| `npm run lighthouse -- <slug> [/pfad,/pfad2]` | Lighthouse mobil; baut dafür automatisch eine indexierbare Testkopie (noindex aus) und räumt danach auf. Berichte in `lighthouse/` |
| `npm run lint:anrede` | Prüft, ob alle Sie/du-Formen in Presets als Weiche `{{Sie|du}}` vorliegen |

Tipp für den Termin: `?static` an eine URL hängen zeigt den Endzustand aller Animationen
(z. B. für Ausdrucke oder Screenshots).

---

## 2. Neue Variante in 30 Minuten

**Vor dem Termin vom Betrieb besorgen (oder von dessen Website / Google-Profil übernehmen):**

- [ ] Firmenname, Rechtsform, Inhaber, Gründungsjahr, Mitarbeiter/Azubis
- [ ] Adresse, Telefon, E-Mail, WhatsApp, Öffnungszeiten, ggf. Notdienstnummer
- [ ] Logo (SVG oder PNG mit transparentem Hintergrund) – optional
- [ ] 6–15 Fotos: Hero, Leistungen, Projekte (vorher/nachher), Team, Werkstatt
- [ ] Leistungen (Preset passt meist, nur abwählen/ergänzen)
- [ ] Einsatzgebiet (Orte, PLZ, Radius)
- [ ] 3–8 Referenzprojekte (Ort, Jahr, 2–3 Sätze)
- [ ] Offene Stellen + Benefits
- [ ] Bewertungen (Google-Schnitt, Anzahl, 4–6 Zitate)
- [ ] Impressumsdaten: Handwerkskammer, Handwerksrollen-Nr., Berufsbezeichnung, Register, USt-IdNr.

**Ablauf:**

1. `npm run variant:new -- mueller-elektro` → legt `variants/mueller-elektro/` an.
2. `site.config.json` in VS Code öffnen. Dank `"$schema"` gibt es Autovervollständigung,
   Erklärungen per Hover und rote Markierungen bei Fehlern. Alle `TODO` ersetzen. *(10 min)*
3. Fotos nach `assets/` kopieren, in der Config referenzieren (`"datei": "assets/hero.jpg"`).
   Ohne Foto erscheint automatisch ein markenfarbiger Platzhalter mit Motivbeschriftung. *(5 min)*
4. `gewerk` setzen – Leistungen, Konfigurator-Fragen, FAQ, Ablauf und Texte kommen aus dem Preset.
   Nur Abweichungen eintragen. *(5 min)*
5. Stil wählen: `stilPreset`, Farben (`npm run colors -- variants/mueller-elektro/assets/logo.png`),
   Sektionsreihenfolge/-layouts in `sektionen`. *(5 min)*
6. `npm run variant:check -- mueller-elektro` → bis „Keine Fehler“. *(2 min)*
7. `VARIANT=mueller-elektro npm run dev`, kurz durchklicken, dann `npm run build:all -- mueller-elektro`
   und deployen (Abschnitt 6). QR-Code: `npm run qr -- mueller-elektro https://mueller.demo.deine-agentur.de`.

**Keine Klone:** Für jede Variante mindestens zwei der folgenden Stellschrauben anders setzen:
Stil-Preset, Farben, Hero-Layout, Leistungen-Layout, Sektionsreihenfolge, Flächentöne (`ton`),
`radius`, `animationsIntensitaet`, `schriftPaar`.

---

## 3. Referenz aller Config-Felder

Die vollständige, maschinenlesbare Referenz ist `variants/_schema.ts` (Zod, mit deutschen
Beschreibungen und Zeichenlimits). Vollständige Beispiele: `variants/demo/site.config.json`,
`variants/demo-2/site.config.json`, `variants/demo-3/site.config.json`.
Unbekannte Schlüssel (z. B. `"//": "Kommentar"`) werden ignoriert – praktisch für Notizen.

### `meta`
| Feld | Typ | Standard | Beispiel / Hinweis |
|---|---|---|---|
| `slug` | string | – | `"mueller-elektro"` (= Ordnername) |
| `anrede` | `"sie"` \| `"du"` | `"sie"` | Kundenansprache; Karriere ist immer „du“ |
| `domain` | URL | – | `"https://mueller-elektro.de"` (Canonical, Sitemap, OG) |
| `noindex` | bool | `true` | **Demo-Schutz.** Erst zum Livegang `false` |

### `betrieb`
| Feld | Beispiel |
|---|---|
| `name`, `kurzname`, `rechtsform`, `inhaber`, `slogan` | `"Brandt & Söhne Elektrotechnik GmbH"`, `"Brandt & Söhne"` … |
| `gruendungsjahr`, `mitarbeiter`, `azubis`, `projekte`, `reaktionszeit` | `1987`, `14`, `2`, `4800`, `"60 Min."` → speisen die Zähler |
| `adresse` | `{ "strasse", "plz", "ort", "region": "im Breisgau" }` |
| `geo` | `{ "lat": 48.01, "lng": 7.81 }` |
| `telefon`, `email`, `whatsapp`, `fax` | `"+49 761 000000"` (WhatsApp weglassen = Buttons weg) |
| `oeffnungszeiten` | `{ "regulaer": [{ "tage": ["mo","di"], "von": "07:00", "bis": "17:00" }], "sonder": [{ "datum": "2026-12-24", "geschlossen": true }], "hinweis" }` |
| `socialLinks` | `[{ "netzwerk": "instagram", "url": "…" }]` |
| `bewertungen` | `{ "quelle", "schnitt", "anzahl", "profilUrl", "beispiel": true, "pruefHinweis", "eintraege": [{ "name","ort","datum","sterne","text","leistung" }] }` |

### `branding`
| Feld | Beispiel / Hinweis |
|---|---|
| `logo` | `{ "datei": "assets/logo.svg", "dateiHell": "assets/logo-hell.svg", "alt": "Müller Elektro" }` – optional, sonst Wortmarke |
| `farben` | `{ "primaer": "#262B30", "akzent": "#FFC41F", "neutralTon": "#5B6670" }` → OKLCH-Skalen 50–950, AA-Prüfung automatisch |
| `stilPreset` | `"modern-praezise"` \| `"manufaktur-warm"` \| `"kraftvoll-bold"` |
| `schriftPaar` | `{ "headline": "fraunces", "text": "hanken" }` (archivo, hanken, fraunces, manrope, bricolage) |
| `radius` | `"eckig"` \| `"dezent"` \| `"rund"` |
| `animationsIntensitaet` | `"dezent"` \| `"standard"` \| `"ausdrucksstark"` |
| `bildstil` | `{ "grain": true, "toenung": 0.1 }` – vereinheitlicht gemischte Fotoqualität |

### Branchenfelder
| Feld | Beispiel / Hinweis |
|---|---|
| `gewerk` | `elektro, shk, dachdecker, zimmerei, maler, tischler, fliesen, metallbau, galabau, bau, allgemein` |
| `gewerkBezeichnung` | `"Schreinerei"` (statt „Tischlerei“) |
| `meisterbetrieb`, `meisterName` | `true`, `"Thomas Brandt"` |
| `handwerkskammer`, `handwerksrolleNr`, `innung` | Pflicht bei Meisterbetrieb (Impressum) |
| `zertifikate` | `[{ "name", "jahr", "bild"? }]` |
| `mitgliedschaften` | `["Elektro-Innung Freiburg"]` |
| `notdienst` | `{ "aktiv": true, "telefon", "zeiten", "rundUmDieUhr", "hinweis", "leistungen"? }` |
| `einsatzgebiet` | `{ "zentrum": { "name","lat","lng" }, "radiusKm": 30, "orte": [{ "name","lat","lng","plz": [], "status": "ja"\|"anfrage" }], "plz": ["791"], "plzAufAnfrage": ["793"] }` – PLZ als ganze PLZ oder Präfix |
| `leistungen` | `[{ "slug": "wallbox", "bilder": [{ "datei","alt" }] }]` – nur Abweichungen zum Preset. Eigene Leistung: `slug, titel, kurztext, text, icon` + optional `nutzen, ablauf, faq, anfrageFragen, kostenschaetzer { einheit, label, preisVon, preisBis, grundpreis, min, max, schritt, standard }, kundengruppen` |
| `referenzen` | `[{ "slug","titel","ort","jahr","kategorie","leistungSlug","vorher"?,"nachher"?,"bilder","beschreibung","fakten"?,"kundenstimme"? }]` |
| `team` | `[{ "name","rolle","foto","zitat"? }]` |
| `stellen` | `[{ "slug","titel","art","intro","aufgaben","profil","benefits","startdatum","arbeitszeit"?,"gehaltsspanne"?,"veroeffentlicht","gueltigBis"? }]` → JobPosting-Schema |
| `benefits`, `werte`, `kennzahlen`, `ablauf`, `faq` | optional – sonst aus dem Preset |
| `partnerLogos` | `[{ "name": "Voltaris", "datei"? }]` – ohne Datei neutrale Wortmarke |
| `historie` | `[{ "jahr", "ereignis", "text"? }]` |
| `texte` | Überschreibt einzelne Sprachbausteine, z. B. `{ "heroHeadline": "…", "ctaTitel": "…" }` (Schlüssel: `src/data/gewerke/types.ts`) |
| `lokaleSeiten` | `[{ "leistungSlug","ort","titel"?,"text" (≥ 400 Zeichen eigener Text),"besonderheiten"? }]` → `/leistungen/<slug>/<ort>/` |

### `sektionen` (Startseite, Reihenfolge = Array-Reihenfolge)
Gemeinsame Felder: `typ`, `layout`, `aktiv`, `id` (Anker), `ton` (`hell | flaeche | dunkel | marke`), `ueberschrift`, `intro`.

| typ | Layouts | Zusatzfelder |
|---|---|---|
| `hero` | `vollbild`, `split`, `typo` | `headline, subline, statement, bild, bilder[3], video{datei,dateiMobil,poster}, ctaPrimaer, ctaSekundaer` |
| `leistungen` | `bento`, `liste`, `tabs` | – |
| `usps` | `zahlen`, `split` | `bild` |
| `ablauf` | `gepinnt`, `liste` | – |
| `referenzen` | `slider-galerie`, `raster` | `highlight` (Slug mit vorher/nachher) |
| `bewertungen` | `laufband`, `karussell` | – |
| `einsatzgebiet` | `karte`, `kompakt` | – |
| `karriere` | `emotional`, `kompakt` | `bild` |
| `partner` | `laufband`, `raster` | – |
| `faq` | `akkordeon`, `zweispaltig` | – |
| `cta` | `kontakt`, `banner` | – |
| `text-bild` | `links`, `rechts` | `text, bild, cta` |

### Weitere Blöcke
| Block | Felder |
|---|---|
| `seiten` | `leistungen, referenzen, ueberUns, karriere, notdienst, kontakt` (bool) |
| `seo` | `titel, beschreibung, seiten: { "leistung-wallbox": { "titel", "beschreibung" } }` |
| `rechtliches` | `berufsbezeichnung, verleihungsstaat, vertretungsberechtigt[], registergericht, registernummer, ustId, wirtschaftsId, verantwortlichInhalt, berufshaftpflicht, agbUrl, verbraucherschlichtung` |
| `integrationen` | `formularEndpoint` (leer = Demo-Modus), `formularZugangsschluessel`, `buchungsLink{url,label}`, `karte{aktiv,embedUrl}` (Zwei-Klick), `analytics{aktiv,anbieter,src,domain}` |
| `demo` | `banner{aktiv,text}`, `agentur{name,telefon,email,website}`, `pitchSeite` |

---

## 4. Stil-Presets & Sektions-Layouts – Entscheidungshilfe

| Preset | Wann? |
|---|---|
| **Modern Präzise** (Archivo breit + Hanken Grotesk, Raster, Maßketten, Signalfarbe) | Technische Gewerke mit Anspruch: Elektro, SHK, Metallbau, Gewerbekunden. Wirkt kompetent und präzise. |
| **Manufaktur Warm** (Fraunces + Manrope, Papierkorn, Jahresringe, weiche Radien) | Gewerke mit Material und Geschichte: Schreinerei, Zimmerei, Maler, Fliesen, Familienbetriebe in 2.–3. Generation. |
| **Kraftvoll Bold** (Bricolage Grotesque, Farbflächen, Laufbänder, große Zahlen) | Junge, schnell wachsende Betriebe, die auffallen und Azubis gewinnen wollen. Gut mit `anrede: "du"`. |

| Layout | Passt, wenn … |
|---|---|
| Hero `vollbild` | ein starkes, dunkles Foto vorhanden ist – der stärkste Wow-Effekt. |
| Hero `split` | mehrere gute, eher helle Fotos (Werkstatt, Detail, Ergebnis) vorhanden sind. |
| Hero `typo` | kaum gute Fotos vorhanden sind – Typografie trägt den Auftritt. |
| Leistungen `bento` | 6–9 Leistungen mit Fotos – visuell abwechslungsreich. |
| Leistungen `liste` | edle Anmutung, wenige aber starke Fotos (Vorschau folgt dem Cursor). |
| Leistungen `tabs` | Privat- und Gewerbekunden klar getrennt angesprochen werden sollen. |
| USPs `zahlen` / `split` | Zahlen allein beeindrucken / ein Teamfoto soll dazu. |
| Ablauf `gepinnt` / `liste` | Storytelling-Moment gewünscht / ruhigere Seite. |
| Referenzen `slider-galerie` / `raster` | Vorher/Nachher + viele Projekte / weniger Projekte, ruhiger. |
| Bewertungen `laufband` / `karussell` | viele kurze Bewertungen / wenige, längere Zitate. |
| Einsatzgebiet `karte` / `kompakt` | Gebiet ist ein Verkaufsargument / platzsparend. |
| CTA `kontakt` / `banner` | Kontaktblock mit Live-Status / knapper Abschluss. |

---

## 5. Bilder-Leitfaden

- **Formate:** JPG (Fotos), PNG/SVG (Logo). Astro erzeugt automatisch AVIF + WebP in mehreren Breiten.
- **Benennung:** Kleinbuchstaben, Bindestriche, sprechend: `leistungen/wallbox-garage.jpg`, `referenzen/bad-vorher.jpg`.
- **Ablage:** immer in `variants/<slug>/assets/` (Unterordner frei wählbar).
- **Alt-Text:** Pflichtfeld – beschreiben, was zu sehen ist.
- **Bildausschnitt:** `"fokus": "50% 30%"` verschiebt den Ausschnitt; `"mobil": "assets/hero-hoch.jpg"` liefert einen eigenen Ausschnitt fürs Smartphone (Art Direction).

| Slot | Verhältnis | Mindestgröße |
|---|---|---|
| Hero vollbild | quer, ~3:2 (wird beschnitten) | 2400 × 1600 |
| Hero split (3 Bilder) | 4:5, 1:1, 3:4 | 1200 px lange Kante |
| Leistung | 4:3 bzw. 16:10 | 1600 × 1200 |
| Referenz | 4:3 / 16:9; vorher & nachher **gleicher Ausschnitt** | 1800 × 1200 |
| Team | 4:5 hochkant | 1000 × 1250 |
| Logo | SVG bevorzugt | – |

Mittelmäßige Handyfotos? `bildstil.toenung` (0,08–0,15) und `grain: true` vereinheitlichen die Anmutung.
Stockfotos immer in `variants/<slug>/CREDITS.md` dokumentieren (wird ins Impressum übernommen).

---

## 6. Deployment je Variante

### Demos an Kunden schicken (GitHub Pages, eingerichtet)

Der Template-Code liegt im **privaten** Repo `lennertdockweiler/handwerker-template`.
Die fertigen Demo-Seiten (nur HTML/Bilder) liegen im **öffentlichen** Repo
`lennertdockweiler/website-entwuerfe` und werden über GitHub Pages ausgeliefert:

```bash
npm run publish              # alle Varianten bauen und hochladen
npm run publish -- demo-2    # nur eine Variante aktualisieren
```

Danach sind die Demos nach 1–2 Minuten erreichbar unter
`https://lennertdockweiler.github.io/website-entwuerfe/<pfad>/`, z. B. `…/brandt-soehne/`.
Die Adresse je Variante steht in `veroeffentlichen.config.json` (`pfade`). Für eine
neue Kundenvariante dort einen sprechenden Pfad eintragen, z. B. `"mueller-elektro": "mueller-elektro"`.
QR-Codes zu den Links legt `npm run publish` automatisch in `qr/` ab.

Hinweise:
- Die Startseite `…/website-entwuerfe/` zeigt bewusst **keine Liste** – jeder Kunde sieht nur seinen eigenen Link.
- Alle Demos sind `noindex` und erscheinen nicht bei Google. Wer die Adresse kennt oder errät, kann sie aber öffnen – keine vertraulichen Daten in Demos.
- Den Code-Stand sichern: `git add -A && git commit -m "…" && git push`.

### Eigene (Sub-)Domain

Jede Variante ist nach `npm run build:all` ein eigenständiger statischer Ordner `dist/<slug>/` – deploybar
auf jede beliebige (Sub-)Domain.

**Cloudflare Pages** (empfohlen, kostenlos):
```bash
npx wrangler pages deploy dist/demo --project-name brandt-demo
```
Danach unter *Custom domains* `brandt.demo.deine-agentur.de` hinzufügen.
**Passwortschutz:** *Zero Trust → Access → Application* für die Subdomain anlegen (E-Mail-Code oder Passwort).

**Netlify:**
```bash
npx netlify deploy --dir dist/demo --prod --site <site-id>
```
Passwortschutz: *Site settings → Access control → Password protection* (Pro-Plan) oder Basic-Auth über `_headers`.

**Später eigene Domain des Kunden:** `meta.domain` setzen, `noindex: false`, neu bauen, Domain beim
Hoster verbinden, DNS (CNAME) beim Kunden-Registrar eintragen.

Hinweis Netlify Forms: Für Netlify Forms statt eines externen Endpoints muss das Formular als
statisches HTML-Formular registriert werden; einfacher sind Formspree oder Web3Forms (`formularEndpoint`).

---

## 7. Checkliste „Von der Demo zur Live-Seite“

- [ ] `meta.noindex: false`, `meta.domain` gesetzt (→ Sitemap + robots.txt werden erzeugt)
- [ ] `demo.banner.aktiv: false`, `demo.pitchSeite: false`
- [ ] `integrationen.formularEndpoint` setzen (Formspree/Web3Forms) und Test-Anfrage + Test-Bewerbung senden
- [ ] Rechtstexte prüfen lassen oder per Generator erstellen (Impressum-Angaben, Datenschutzerklärung inkl. Hoster, Formulardienst, WhatsApp)
- [ ] Alle Demo-Fotos durch echte ersetzen bzw. Bildrechte klären, `CREDITS.md` aktualisieren
- [ ] Echte Bewertungen eintragen, `bewertungen.beispiel: false`, `pruefHinweis` nach § 5b UWG
- [ ] Demo-Daten (`@example.com`, `000000`, „fiktiv“) entfernen → `npm run variant:check -- <slug>` ohne Hinweise
- [ ] Google Search Console einrichten, Sitemap einreichen; Google-Unternehmensprofil mit Website verknüpfen
- [ ] Stellen: `veroeffentlicht`/`gueltigBis` aktuell halten (Google for Jobs)
- [ ] Lighthouse mobil prüfen (Budget siehe PLAN.md)

---

## 8. Bekannte Grenzen und offene Punkte

- **Rechtstexte** sind strukturierte Vorlagen, keine Rechtsberatung – vor jedem Livegang prüfen lassen.
- **Datei-Uploads im Konfigurator** werden im Demo-Modus nur clientseitig angezeigt. Ob ein Formulardienst Dateien annimmt, hängt vom Anbieter/Tarif ab (Formspree: kostenpflichtig).
- **Netlify Forms** wird nicht automatisch registriert (siehe Abschnitt 6).
- **Weitere Gewerke** (zimmerei, fliesen, metallbau, galabau, bau) enthalten Leistungen, Fragen und FAQ, aber knappere Texte als elektro/shk/dachdecker/maler/tischler/allgemein.
- **Hero-Video** ist implementiert, aber in keiner Demo genutzt (keine lizenzfreien Videos eingebunden).
- **Kartenansicht** ist eine stilisierte, aus Koordinaten projizierte SVG-Karte – keine echte Straßenkarte. Eine Google-Karte gibt es als Zwei-Klick-Lösung auf der Kontaktseite.
- **Demo-Fotos** stammen von Unsplash; Personenfotos zeigen nicht das fiktive Team.
- **Lighthouse schwankt stark** je nach Rechnerlast (gleicher Build: LCP 0,9–2,5 s). Nur bei ruhigem Rechner messen (keine parallelen Builds/Screenshots) und mehrere Läufe vergleichen. Seiten mit einem Foto als LCP-Element liegen bei ca. 2,2–2,7 s, Seiten mit Text als LCP bei ca. 1 s.
- Sehr feinteilige Fotos (z. B. Schaltschränke) ergeben große AVIF-Dateien – als erstes Bild einer Seite eher ein ruhiges Motiv wählen.
