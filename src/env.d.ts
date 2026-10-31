/// <reference types="astro/client" />

/** Slug der aktiven Variante (gesetzt in astro.config.mjs über VARIANT) */
declare const __VARIANT__: string;

declare module '@/data/fonts.mjs' {
  export const FONT_FAMILIES: Record<string, { name: string; pkg: string; axis: string; weight: string; stretch?: string; fallback: string }>;
  export const PRESET_FONTS: Record<string, [string, string]>;
  export function fontVar(key: string): string;
  export function resolveFontPair(raw: unknown): [string, string];
}
