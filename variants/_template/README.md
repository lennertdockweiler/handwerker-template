# Kopiervorlage für eine neue Variante

Nicht direkt bearbeiten – stattdessen:

```bash
npm run variant:new -- mustermann-elektro
```

Danach in `variants/mustermann-elektro/`:

1. `site.config.json` ausfüllen (alle `TODO`), VS Code zeigt Erklärungen per Hover.
2. Fotos nach `assets/` kopieren (Benennung und Formate: siehe README im Projektstamm, Abschnitt „Bilder-Leitfaden“).
3. Optional `assets/logo.svg` und `branding.logo` setzen – ohne Logo entsteht automatisch eine Wortmarke.
4. `npm run variant:check -- mustermann-elektro` bis keine Fehler mehr kommen.
5. `VARIANT=mustermann-elektro npm run dev`

Ordnerstruktur:

```
assets/
  hero.jpg            Hero (≥ 2400 × 1600, quer)
  leistungen/*.jpg    je Leistung 1–3 Bilder (≥ 1600 px breit)
  referenzen/*.jpg    Projektbilder, vorher/nachher gleicher Ausschnitt
  team/*.jpg          Porträts (≥ 1000 × 1250, hochkant)
  logo.svg            optional
CREDITS.md            Bildquellen (bei Stockfotos Pflicht)
```
