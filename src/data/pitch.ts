/**
 * Inhalte der versteckten Pitch-Seite /pitch. Ansprache: immer „Sie“ – an den
 * Betriebsinhaber im Verkaufsgespräch, nicht an dessen Kunden.
 */
export const pitch = {
  titel: 'Was diese Website für {kurzname} leistet',
  intro: 'Eine Website ist kein Prospekt, sondern ein Mitarbeiter, der nie krank ist: Sie gewinnt Fachkräfte, sortiert Anfragen vor und überzeugt Kunden, bevor Sie zum Telefon greifen.',
  hinweis: 'Diese Seite ist nur für Sie sichtbar: nicht verlinkt, nicht in Suchmaschinen.',
  stellen: {
    titel: 'Was kostet Sie eine unbesetzte Stelle?',
    intro: 'Jede offene Stelle ist Umsatz, der liegen bleibt. Schieben Sie die Regler auf Ihre Situation.',
    anzahl: { label: 'Offene Stellen', min: 1, max: 10, schritt: 1, standard: 2, einheit: '' },
    umsatz: { label: 'Ø Monatsumsatz pro Fachkraft', min: 3000, max: 20000, schritt: 500, standard: 9000, einheit: '€' },
    monate: { label: 'Monate unbesetzt', min: 1, max: 24, schritt: 1, standard: 6, einheit: 'Monate' },
    ergebnis: 'Entgangener Umsatz',
    fazit: 'Schon eine einzige zusätzliche Bewerbung über Google for Jobs und die Schnellbewerbung kann diese Rechnung drehen.',
  },
  zeit: {
    titel: 'Zeitersparnis durch vorqualifizierte Anfragen',
    intro: 'Strukturierte Anfragen mit Fotos ersetzen Rückfragen am Telefon und unnötige Besichtigungen.',
    anfragen: { label: 'Anfragen pro Woche', min: 1, max: 60, schritt: 1, standard: 12, einheit: '' },
    minuten: { label: 'Eingesparte Minuten pro Anfrage', min: 5, max: 60, schritt: 5, standard: 15, einheit: 'Min.' },
    satz: { label: 'Ihr Stundensatz', min: 40, max: 140, schritt: 5, standard: 68, einheit: '€' },
    proJahr: 'Gewonnene Zeit pro Jahr',
    wert: 'Wert dieser Zeit pro Jahr',
    stunden: '{n} Stunden',
    wochen: 46,
  },
  nutzenTitel: 'Funktionen, die sich rechnen',
  nutzen: [
    { icon: 'briefcase', funktion: 'Stellenanzeigen mit Google-for-Jobs-Daten', nutzen: 'Ihre Stellen erscheinen direkt in der Google-Jobsuche – ohne Kosten für Jobportale.' },
    { icon: 'clipboard-check', funktion: 'Anfrage-Konfigurator mit Fotos', nutzen: 'Sie wissen vor dem Rückruf, worum es geht, wo es ist und wie dringend – inklusive Fotos.' },
    { icon: 'map-pin', funktion: 'Lokale Sichtbarkeit', nutzen: 'Optimiert für Suchen wie „{gewerk} {ort}“: Ort, Leistungen und Einsatzgebiet sind sauber ausgezeichnet.' },
    { icon: 'images', funktion: 'Referenzen mit Vorher/Nachher', nutzen: 'Ihre Arbeit überzeugt, bevor Sie ein Wort sagen. Echte Projekte schlagen jede Werbung.' },
    { icon: 'smartphone', funktion: 'Perfekt auf dem Smartphone', nutzen: 'Die meisten Kunden suchen mobil. Anrufen, WhatsApp und Anfrage sind immer einen Daumen entfernt.' },
    { icon: 'shield-check', funktion: 'DSGVO-konform ohne Cookie-Banner', nutzen: 'Keine Tracking-Cookies, keine Google-Fonts, keine Abmahnfallen – und kein nerviges Banner.' },
    { icon: 'accessibility', funktion: 'Barrierearm nach WCAG 2.2', nutzen: 'Das Barrierefreiheitsstärkungsgesetz gilt seit Juni 2025. Ihre Website ist vorbereitet.' },
    { icon: 'zap', funktion: 'Schnell wie eine App', nutzen: 'Optimierte Bilder und minimaler Code: Die Seite lädt auch im Funkloch auf der Baustelle.' },
  ],
  ctaTitel: 'Sollen wir das für {kurzname} live schalten?',
  ctaText: 'Inhalte, Fotos und Texte passen wir mit Ihnen an. Danach geht die Seite in wenigen Tagen online.',
};
