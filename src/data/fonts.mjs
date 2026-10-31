// Schrift-Registry. Wird von astro.config.mjs (Node) und vom Layout (TS) gelesen.
// Alle Dateien kommen lokal aus @fontsource-variable – niemals vom Google-Fonts-CDN.

const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

const fs = (pkg, file) => `./node_modules/@fontsource-variable/${pkg}/files/${file}`;

/** @type {Record<string, { name: string; pkg: string; axis: string; weight: string; stretch?: string; fallback: string }>} */
export const FONT_FAMILIES = {
  archivo: { name: 'Archivo', pkg: 'archivo', axis: 'wdth', weight: '100 900', stretch: '62% 125%', fallback: 'sans-serif' },
  hanken: { name: 'Hanken Grotesk', pkg: 'hanken-grotesk', axis: 'wght', weight: '100 900', fallback: 'sans-serif' },
  fraunces: { name: 'Fraunces', pkg: 'fraunces', axis: 'opsz', weight: '100 900', fallback: 'serif' },
  manrope: { name: 'Manrope', pkg: 'manrope', axis: 'wght', weight: '200 800', fallback: 'sans-serif' },
  bricolage: { name: 'Bricolage Grotesque', pkg: 'bricolage-grotesque', axis: 'opsz', weight: '200 800', fallback: 'sans-serif' },
};

/** Standard-Schriftpaar je Stil-Preset: [Headline, Fließtext]. */
export const PRESET_FONTS = {
  'modern-praezise': ['archivo', 'hanken'],
  'manufaktur-warm': ['fraunces', 'manrope'],
  'kraftvoll-bold': ['bricolage', 'bricolage'],
};

export const fontVar = (key) => `--font-${key}`;

/** Ermittelt das Schriftpaar aus der (rohen) Variantenkonfiguration. */
export function resolveFontPair(rawConfig) {
  const b = rawConfig?.branding ?? {};
  const base = PRESET_FONTS[b.stilPreset] ?? PRESET_FONTS['modern-praezise'];
  return [b.schriftPaar?.headline ?? base[0], b.schriftPaar?.text ?? base[1]];
}

/**
 * Der lokale Provider kennt keine Subsets. Dieser Wrapper leitet das Subset aus dem
 * Dateinamen ab, damit <Font preload={[{ subset: 'latin' }]}> nur latin vorlädt.
 */
export function withSubsets(base) {
  return {
    name: 'local-subsets',
    config: base.config,
    init: (ctx) => base.init?.(ctx),
    async resolveFont(options) {
      const result = await base.resolveFont(options);
      if (!result) return result;
      return {
        fonts: result.fonts.map((face) => {
          const url = String(face.src?.[0]?.url ?? face.src?.[0] ?? '');
          return { ...face, meta: { ...face.meta, subset: url.includes('-latin-ext-') ? 'latin-ext' : 'latin' } };
        }),
      };
    },
  };
}

/** Baut die `fonts`-Einträge für astro.config (nur die tatsächlich genutzten Familien). */
export function astroFontEntries(keys, localProvider) {
  return [...new Set(keys)].map((key) => {
    const f = FONT_FAMILIES[key];
    const file = (subset) => fs(f.pkg, `${f.pkg}-${subset}-${f.axis}-normal.woff2`);
    const variant = (subset, range) => ({
      src: [file(subset)],
      weight: f.weight,
      style: 'normal',
      ...(f.stretch ? { stretch: f.stretch } : {}),
      unicodeRange: [range],
    });
    return {
      provider: localProvider,
      name: f.name,
      cssVariable: fontVar(key),
      fallbacks: [f.fallback],
      options: { variants: [variant('latin', LATIN), variant('latin-ext', LATIN_EXT)] },
    };
  });
}
