/**
 * Öffnungszeiten & Live-Status (Europe/Berlin). Läuft im Build und im Browser.
 */
export type Tag = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so';
export const TAGE: Tag[] = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];

export interface Zeiten {
  regulaer: { tage: Tag[]; von: string; bis: string }[];
  sonder: { datum: string; geschlossen: boolean; von?: string | undefined; bis?: string | undefined; hinweis?: string | undefined }[];
}

export interface BerlinZeit {
  datum: string; // YYYY-MM-DD
  tag: Tag;
  minuten: number;
}

const WEEKDAY: Record<string, Tag> = { Mon: 'mo', Tue: 'di', Wed: 'mi', Thu: 'do', Fri: 'fr', Sat: 'sa', Sun: 'so' };

export function berlinJetzt(d = new Date()): BerlinZeit {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return {
    datum: `${parts.year}-${parts.month}-${parts.day}`,
    tag: WEEKDAY[parts.weekday as string] ?? 'mo',
    minuten: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

const min = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

function zeitenAm(z: Zeiten, datum: string, tag: Tag): { von: string; bis: string }[] {
  const sonder = z.sonder.find((s) => s.datum === datum);
  if (sonder) return sonder.geschlossen || !sonder.von || !sonder.bis ? [] : [{ von: sonder.von, bis: sonder.bis }];
  return z.regulaer.filter((r) => r.tage.includes(tag)).map(({ von, bis }) => ({ von, bis }));
}

function addTage(datum: string, n: number): string {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface Status {
  offen: boolean;
  bis?: string;
  naechste?: { inTagen: number; tag: Tag; von: string };
}

export function status(z: Zeiten, now = berlinJetzt()): Status {
  const heute = zeitenAm(z, now.datum, now.tag);
  const jetzt = heute.find((s) => now.minuten >= min(s.von) && now.minuten < min(s.bis));
  if (jetzt) return { offen: true, bis: jetzt.bis };
  const spaeter = heute.find((s) => min(s.von) > now.minuten);
  if (spaeter) return { offen: false, naechste: { inTagen: 0, tag: now.tag, von: spaeter.von } };
  for (let i = 1; i <= 14; i++) {
    const tag = TAGE[(TAGE.indexOf(now.tag) + i) % 7]!;
    const slot = zeitenAm(z, addTage(now.datum, i), tag)[0];
    if (slot) return { offen: false, naechste: { inTagen: i, tag, von: slot.von } };
  }
  return { offen: false };
}

/** Kompakte Darstellung: aufeinanderfolgende Tage mit gleichen Zeiten zusammenfassen */
export function zeilen(z: Zeiten): { tage: Tag[]; zeiten: string | null }[] {
  return TAGE.map((t) => {
    const slots = z.regulaer.filter((r) => r.tage.includes(t));
    return { tag: t, zeiten: slots.length ? slots.map((s) => `${s.von}–${s.bis}`).join(', ') : null };
  }).reduce<{ tage: Tag[]; zeiten: string | null }[]>((acc, cur) => {
    const last = acc[acc.length - 1];
    if (last && last.zeiten === cur.zeiten) last.tage.push(cur.tag);
    else acc.push({ tage: [cur.tag], zeiten: cur.zeiten });
    return acc;
  }, []);
}
