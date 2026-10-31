import type { GewerkPreset } from './types';
import { elektro } from './elektro';
import { shk } from './shk';
import { dachdecker } from './dachdecker';
import { maler } from './maler';
import { tischler } from './tischler';
import { allgemein } from './allgemein';
import { zimmerei, fliesen, metallbau, galabau, bau } from './weitere';

export const GEWERK_PRESETS: Record<string, GewerkPreset> = {
  elektro,
  shk,
  dachdecker,
  zimmerei,
  maler,
  tischler,
  fliesen,
  metallbau,
  galabau,
  bau,
  allgemein,
};

export type { GewerkPreset } from './types';
export { basisTexte, basisBenefits, basisWerte } from './_basis';
