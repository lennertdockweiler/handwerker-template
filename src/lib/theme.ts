/**
 * Theme-Generator: erzeugt aus 1–3 Markenfarben vollständige Farbskalen (50–950)
 * im OKLCH-Farbraum und daraus semantische Tokens. Prüft automatisch WCAG-AA-
 * Kontraste und wählt Textfarben auf Farbflächen selbst.
 *
 * Bewusst ohne Astro-Abhängigkeiten, damit scripts/check-variant.mjs die Datei
 * direkt importieren kann.
 */
import { clampChroma, converter, formatHex, parse, wcagContrast, type Oklch } from 'culori';

export type StilPreset = 'modern-praezise' | 'manufaktur-warm' | 'kraftvoll-bold';
export type Scale = Record<(typeof STEPS)[number], string>;

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
// Zielhelligkeit je Stufe (OKLCH L) und relativer Chroma-Anteil.
const LIGHTNESS = [0.975, 0.945, 0.885, 0.815, 0.725, 0.635, 0.55, 0.465, 0.385, 0.305, 0.235];
const CHROMA = [0.18, 0.32, 0.55, 0.78, 0.94, 1, 1, 0.94, 0.82, 0.68, 0.55];

const toOklch = converter('oklch');
const WHITE = '#ffffff';
export const AA = 4.5;
export const AA_LARGE = 3;

function oklch(hex: string): Oklch {
  const c = toOklch(parse(hex));
  if (!c) throw new Error(`Ungültige Farbe: ${hex}`);
  return { mode: 'oklch', l: c.l, c: c.c ?? 0, h: c.h ?? 0 };
}

const hexOf = (c: Oklch) => formatHex(clampChroma(c, 'oklch'));

export const contrast = (a: string, b: string) => Math.round(wcagContrast(a, b) * 100) / 100;

/** Skala mit fester Helligkeitskurve; Chroma folgt der Markenfarbe. */
export function makeScale(hex: string, chromaCap = Infinity): Scale {
  const base = oklch(hex);
  const scale = {} as Scale;
  STEPS.forEach((step, i) => {
    scale[step] = hexOf({ mode: 'oklch', l: LIGHTNESS[i]!, c: Math.min(base.c * CHROMA[i]!, chromaCap), h: base.h });
  });
  return scale;
}

/** Neutrale Skala, leicht in Richtung des Neutraltons eingefärbt. */
export function makeNeutral(hex: string): Scale {
  const base = oklch(hex);
  const scale = {} as Scale;
  STEPS.forEach((step, i) => {
    // Helle Stufen nur hauchzart getönt, dunkle etwas kräftiger (wirkt hochwertiger als reines Grau).
    const cap = i === 0 ? 0.008 : i < 3 ? 0.013 : i < 7 ? 0.02 : 0.026;
    scale[step] = hexOf({ mode: 'oklch', l: LIGHTNESS[i]!, c: Math.min(base.c * 0.45, cap), h: base.h });
  });
  return scale;
}

/** Wählt hell oder dunkel als Textfarbe – je nachdem, was mehr Kontrast hat. */
export function onColor(bg: string, dark: string, light = WHITE): string {
  return contrast(bg, light) >= contrast(bg, dark) ? light : dark;
}

/** Liefert eine Variante der Farbe, die auf `bg` mindestens `min` Kontrast erreicht. */
export function ensureContrast(color: string, bg: string, min = AA): string {
  if (contrast(color, bg) >= min) return color;
  const c = oklch(color);
  const bgL = oklch(bg).l;
  const dir = bgL > 0.6 ? -1 : 1;
  for (let l = c.l; l >= 0 && l <= 1; l += dir * 0.01) {
    const candidate = hexOf({ ...c, l });
    if (contrast(candidate, bg) >= min) return candidate;
  }
  return dir < 0 ? '#000000' : WHITE;
}

/** Füllfarbe für Buttons: Markenfarbe, notfalls so weit nachgedunkelt/aufgehellt, dass Text AA erreicht. */
function buttonFill(color: string, dark: string): { fill: string; text: string } {
  const text = onColor(color, dark);
  if (contrast(color, text) >= AA) return { fill: color, text };
  const fill = ensureContrast(color, text, AA);
  return { fill, text };
}

const mix = (a: string, b: string, t: number) => {
  const A = oklch(a);
  const B = oklch(b);
  return hexOf({ mode: 'oklch', l: A.l + (B.l - A.l) * t, c: A.c + (B.c - A.c) * t, h: (A.h ?? 0) + ((B.h ?? 0) - (A.h ?? 0)) * t });
};

export interface ThemeInput {
  primaer: string;
  akzent?: string | undefined;
  neutralTon?: string | undefined;
  preset: StilPreset;
}

export interface ContrastCheck {
  name: string;
  vordergrund: string;
  hintergrund: string;
  ratio: number;
  min: number;
  ok: boolean;
}

export interface Theme {
  scales: { primary: Scale; accent: Scale; neutral: Scale };
  tokens: Record<string, string>;
  checks: ContrastCheck[];
  css: string;
  /** Meta-Theme-Color für mobile Browser-Leisten */
  themeColor: string;
}

export function buildTheme(input: ThemeInput): Theme {
  const primary = makeScale(input.primaer);
  const accentHex = input.akzent ?? input.primaer;
  const accent = makeScale(accentHex);
  const neutral = makeNeutral(input.neutralTon ?? input.primaer);

  const ink = neutral[950];
  const t: Record<string, string> = {};

  // ── Flächen je Preset ────────────────────────────────────────────
  if (input.preset === 'manufaktur-warm') {
    t.bg = neutral[50];
    t.surface = mix(neutral[50], neutral[100], 0.6);
    t['surface-2'] = neutral[100];
    t.ink = ensureContrast(primary[950], neutral[50], 12);
    t.dark = primary[900];
    t['dark-2'] = primary[800];
  } else if (input.preset === 'kraftvoll-bold') {
    t.bg = '#ffffff';
    t.surface = neutral[50];
    t['surface-2'] = neutral[100];
    t.ink = ink;
    t.dark = neutral[950];
    t['dark-2'] = neutral[900];
  } else {
    t.bg = neutral[50];
    t.surface = '#ffffff';
    t['surface-2'] = neutral[100];
    t.ink = ink;
    // „Anthrazit“: die Primärfarbe selbst, sofern sie dunkel genug für eine Kontrastfläche ist.
    t.dark = oklch(input.primaer).l < 0.42 ? input.primaer : primary[900];
    t['dark-2'] = mix(t.dark, '#ffffff', 0.07);
  }

  t['ink-soft'] = ensureContrast(neutral[700], t.bg, 5.5);
  t['ink-muted'] = ensureContrast(neutral[600], t.bg, AA);
  t.line = neutral[200];
  t['line-strong'] = neutral[300];
  t['on-dark'] = onColor(t.dark, ink) === WHITE ? '#ffffff' : ink;
  t['on-dark-soft'] = ensureContrast(mix(t['on-dark'], t.dark, 0.3), t.dark, AA);
  t['line-dark'] = mix(t.dark, t['on-dark'], 0.18);

  // ── Marke & Akzent ───────────────────────────────────────────────
  t.brand = input.primaer;
  t['on-brand'] = onColor(input.primaer, ink);
  t['brand-ink'] = ensureContrast(input.primaer, t.bg, AA);

  const cta = buttonFill(accentHex, ink);
  t.accent = cta.fill;
  t['on-accent'] = cta.text;
  t['accent-raw'] = accentHex;
  t['accent-hover'] = mix(cta.fill, cta.text === WHITE ? '#000000' : '#ffffff', 0.12);
  // Akzent als Text-/Linkfarbe auf hellem und dunklem Grund – automatisch AA-sicher
  t['accent-ink'] = ensureContrast(accentHex, t.bg, AA);
  t['accent-on-dark'] = ensureContrast(accentHex, t.dark, AA);
  t['accent-soft'] = accent[100];
  t['accent-tint'] = mix(accent[50], t.bg, 0.4);

  // Fokusring: muss auf hellem UND dunklem Grund ≥ 3:1 haben (WCAG 2.2, 1.4.11)
  t.focus = contrast(accentHex, t.bg) >= AA_LARGE && contrast(accentHex, t.dark) >= AA_LARGE ? accentHex : ensureContrast(accent[600], t.bg, AA_LARGE);
  t['focus-on-dark'] = ensureContrast(accentHex, t.dark, AA_LARGE);

  // Statusfarben (fest, aber gegen den Grund geprüft)
  t.success = ensureContrast('#1F7A4D', t.bg, AA);
  t.warning = ensureContrast('#9A6200', t.bg, AA);
  t.danger = ensureContrast('#B42318', t.bg, AA);

  // ── Prüfungen ────────────────────────────────────────────────────
  const pairs: Array<[string, string, string, number]> = [
    ['Fließtext auf Hintergrund', t.ink, t.bg, AA],
    ['Sekundärtext auf Hintergrund', t['ink-soft'], t.bg, AA],
    ['Hinweistext auf Hintergrund', t['ink-muted'], t.bg, AA],
    ['Text auf Akzent-Button', t['on-accent'], t.accent, AA],
    ['Text auf Markenfläche', t['on-brand'], t.brand, AA],
    ['Text auf dunkler Fläche', t['on-dark'], t.dark, AA],
    ['Akzent-Link auf Hintergrund', t['accent-ink'], t.bg, AA],
    ['Akzent auf dunkler Fläche', t['accent-on-dark'], t.dark, AA],
    ['Fokusring auf Hintergrund', t.focus, t.bg, AA_LARGE],
  ];
  const checks: ContrastCheck[] = pairs.map(([name, fg, bg, min]) => {
    const ratio = contrast(fg, bg);
    return { name, vordergrund: fg, hintergrund: bg, ratio, min, ok: ratio >= min };
  });
  // Rohwerte, die automatisch korrigiert wurden → Hinweis für variant:check
  const rawAccent = contrast(accentHex, onColor(accentHex, ink));
  if (rawAccent < AA) {
    checks.push({
      name: 'Akzentfarbe als Buttonfläche (automatisch angepasst)',
      vordergrund: onColor(accentHex, ink),
      hintergrund: accentHex,
      ratio: rawAccent,
      min: AA,
      ok: false,
    });
  }

  const lines: string[] = [];
  for (const [name, scale] of Object.entries({ p: primary, a: accent, n: neutral })) {
    for (const step of STEPS) lines.push(`--${name}-${step}:${scale[step]}`);
  }
  for (const [k, v] of Object.entries(t)) lines.push(`--c-${k}:${v}`);
  const css = `:root{${lines.join(';')}}`;

  return { scales: { primary, accent, neutral }, tokens: t, checks, css, themeColor: t.dark };
}
