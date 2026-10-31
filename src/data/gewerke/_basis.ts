import type { Sprachbausteine } from './types';

/**
 * Gewerkübergreifende Standardtexte. Jedes Gewerk-Preset überschreibt nur, was
 * branchenspezifisch klingen muss. Platzhalter siehe types.ts.
 */
export const basisTexte: Sprachbausteine = {
  heroHeadline: 'Saubere Arbeit. Klare Absprachen. Seit {gruendungsjahr}.',
  heroSubline:
    '{kurzname} ist {{Ihr|dein}} Meisterbetrieb in {ort} und {region}. Wir planen ehrlich, arbeiten sauber und sind da, wenn wir es versprechen.',
  heroStatement: 'Gut gemacht hält länger.',
  leistungenTitel: 'Was wir für {{Sie|dich}} tun',
  leistungenIntro: 'Vom ersten Gespräch bis zur Abnahme aus einer Hand – mit festen Ansprechpartnern und Terminen, die halten.',
  uspsTitel: 'Warum Kunden in {ort} uns weiterempfehlen',
  uspsIntro: 'Wir messen uns an dem, was nach der Arbeit bleibt: zufriedene Kunden, saubere Baustellen, Termine, die stehen.',
  ablaufTitel: 'So läuft {{Ihr|dein}} Projekt',
  ablaufIntro: 'Vier Schritte, keine Überraschungen. {{Sie wissen|Du weißt}} zu jeder Zeit, was passiert und was es kostet.',
  referenzenTitel: 'Projekte, auf die wir stolz sind',
  referenzenIntro: 'Echte Aufträge aus der Region – vom kleinen Umbau bis zur Komplettsanierung.',
  bewertungenTitel: 'Was unsere Kunden sagen',
  einsatzTitel: 'Kommen wir zu {{Ihnen|dir}}?',
  einsatzIntro: 'Wir arbeiten rund um {ort} im Umkreis von etwa {radius} km. {{Geben Sie Ihre|Gib deine}} Postleitzahl ein – die Antwort kommt sofort.',
  karriereTitel: 'Wir suchen dich.',
  karriereText:
    'Kein Großkonzern, keine Nummer: Bei uns arbeitest du in einem festen Team, mit gutem Werkzeug und einem Chef, der selbst vom Fach ist. Bewerben dauert 60 Sekunden – ohne Anschreiben.',
  partnerTitel: 'Wir arbeiten mit Herstellern, denen wir vertrauen',
  faqTitel: 'Häufige Fragen',
  ctaTitel: '{{Erzählen Sie|Erzähl}} uns von {{Ihrem|deinem}} Vorhaben.',
  ctaText: 'Eine strukturierte Anfrage dauert drei Minuten. Wir melden uns innerhalb eines Werktags mit einer ehrlichen Einschätzung.',
  ueberUnsTitel: 'Ein Familienbetrieb mit Anspruch',
  ueberUnsIntro: 'Seit {gruendungsjahr} arbeiten wir in {ort} – mit {mitarbeiter} Leuten, die ihr Handwerk lieben und Verantwortung übernehmen.',
  teamTitel: 'Die Menschen hinter der Arbeit',
  werteTitel: 'Woran {{Sie|du}} uns messen {{können|kannst}}',
  historieTitel: 'Unsere Geschichte',
  notdienstTitel: 'Notdienst – wir sind erreichbar.',
  notdienstText: 'Wenn es dringend ist, zählt jede Minute. Rufen {{Sie|du}} direkt an – wir sagen {{Ihnen|dir}} am Telefon, was jetzt zu tun ist.',
  kontaktTitel: '{{Ihre|Deine}} Anfrage in drei Minuten',
  kontaktIntro:
    'Je genauer wir {{Ihr|dein}} Vorhaben kennen, desto schneller und ehrlicher wird unsere Einschätzung. Fotos helfen besonders.',
  leistungenSeiteTitel: 'Leistungen',
  leistungenSeiteIntro: 'Alles, was wir anbieten – mit Ablauf, Antworten auf typische Fragen und Beispielen aus der Region.',
  referenzenSeiteTitel: 'Referenzen',
  referenzenSeiteIntro: 'Eine Auswahl abgeschlossener Projekte aus {ort} und Umgebung.',
  karriereSeiteTitel: 'Arbeiten bei {kurzname}',
  karriereSeiteIntro: 'Gutes Handwerk braucht gute Leute. Wir suchen Menschen, die mit anpacken – und bieten mehr als nur einen Job.',
  metaBeschreibung: '{name} – {gewerk} in {ort}. Meisterbetrieb seit {gruendungsjahr}. Jetzt Projekt anfragen.',
  lokalIntro: 'Wir sind regelmäßig in {ort} im Einsatz und kennen die Gegebenheiten vor Ort.',
};

export const basisWerte = [
  { titel: 'Termine, die halten', text: 'Wir sagen, wann wir kommen – und kommen dann auch. Verschiebt sich etwas, erfahren {{Sie|du}} es vorher, nicht hinterher.' },
  { titel: 'Festpreis statt Nachtrag', text: 'Unsere Angebote sind vollständig und verständlich. Was drinsteht, gilt. Änderungen besprechen wir, bevor sie entstehen.' },
  { titel: 'Sauber hinterlassen', text: 'Abdecken, absaugen, aufräumen: Wir verlassen jede Baustelle so, wie wir sie selbst vorfinden möchten.' },
  { titel: 'Ein Ansprechpartner', text: 'Vom Angebot bis zur Abnahme kümmert sich eine Person um {{Ihr|dein}} Projekt. Keine Weiterleitungen, kein Suchen.' },
];

export const basisBenefits = [
  { titel: 'Unbefristet & tariflich', text: 'Fester Vertrag, faire Bezahlung, pünktlich jeden Monat – plus Zuschläge, die nicht verhandelt werden müssen.', icon: 'badge-check' },
  { titel: 'Eigenes Fahrzeug', text: 'Voll ausgestatteter Servicewagen, den du auch für den Weg nach Hause nutzt.', icon: 'car-front' },
  { titel: 'Gutes Werkzeug', text: 'Akku-Werkzeug vom Markenhersteller, persönlich zugeteilt. Wer gut arbeiten soll, braucht gutes Material.', icon: 'drill' },
  { titel: 'Weiterbildung bezahlt', text: 'Vom Herstellerkurs bis zur Meisterschule: Wir übernehmen Kosten und stellen dich frei.', icon: 'graduation-cap' },
  { titel: 'Planbare Freizeit', text: 'Feste Arbeitszeiten, 30 Tage Urlaub und Überstunden, die ausgeglichen werden.', icon: 'calendar' },
  { titel: 'Team statt Hierarchie', text: 'Kurze Wege, offene Türen, gemeinsames Frühstück am Freitag. Du wirst gehört.', icon: 'users' },
];
