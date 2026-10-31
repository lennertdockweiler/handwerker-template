/** PLZ-Prüfung gegen das Einsatzgebiet (Browser + Build, keine Abhängigkeiten) */
export interface PlzData {
  orte: { name: string; plz: string[]; status: 'ja' | 'anfrage' }[];
  plz: string[];
  anfrage: string[];
}
export type PlzErgebnis = { status: 'ja' | 'anfrage' | 'nein' | 'ungueltig'; ort?: string };

export function pruefePlz(input: string, d: PlzData): PlzErgebnis {
  const plz = input.replace(/\D/g, '');
  if (plz.length !== 5) return { status: 'ungueltig' };
  const ort = d.orte.find((o) => o.plz.includes(plz));
  if (ort) return { status: ort.status, ort: ort.name };
  if (d.plz.some((p) => plz.startsWith(p))) return { status: 'ja' };
  if (d.anfrage.some((p) => plz.startsWith(p))) return { status: 'anfrage' };
  return { status: 'nein' };
}
