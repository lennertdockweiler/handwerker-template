/**
 * Datenschutzerklärung als strukturierte VORLAGE. Abschnitte erscheinen nur,
 * wenn die jeweilige Funktion aktiv ist. Vor dem Livegang rechtlich prüfen
 * lassen oder mit einem Generator erstellen – siehe Hinweis auf der Seite.
 */
export interface DsAbschnitt {
  titel: string;
  absaetze: string[];
}

export interface DsKontext {
  name: string;
  adresse: string;
  email: string;
  telefon: string;
  formular: boolean;
  formularDienst: string | undefined;
  bewerbung: boolean;
  whatsapp: boolean;
  karte: boolean;
  buchung: string | undefined;
  analytics: string | undefined;
  serviceWorker: boolean;
}

export function datenschutz(k: DsKontext): DsAbschnitt[] {
  const out: DsAbschnitt[] = [
    {
      titel: 'Verantwortlicher',
      absaetze: [`Verantwortlich für die Datenverarbeitung auf dieser Website ist: ${k.name}, ${k.adresse}, E-Mail: ${k.email}, Telefon: ${k.telefon}.`],
    },
    {
      titel: 'Überblick',
      absaetze: [
        'Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung dieser Website, zur Beantwortung von Anfragen oder zur Durchführung von Verträgen erforderlich ist. Diese Website setzt keine Tracking- oder Marketing-Cookies ein, bindet keine Schriften von Drittanbietern ein und lädt externe Inhalte (z. B. Karten) erst nach Ihrer ausdrücklichen Zustimmung.',
      ],
    },
    {
      titel: 'Hosting und Server-Logfiles',
      absaetze: [
        'Beim Aufruf dieser Website verarbeitet unser Hosting-Anbieter automatisch Informationen in sogenannten Server-Logfiles (z. B. IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp). Dies ist technisch erforderlich, um die Website auszuliefern und ihre Sicherheit zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). Die Logfiles werden nach kurzer Zeit gelöscht. [Hosting-Anbieter, Sitz und Auftragsverarbeitungsvertrag vor dem Livegang ergänzen.]',
      ],
    },
    {
      titel: 'Schriftarten',
      absaetze: ['Alle Schriften werden lokal von unserem Server ausgeliefert. Es findet keine Verbindung zu Servern von Google oder anderen Schriftanbietern statt.'],
    },
    {
      titel: 'Kontaktaufnahme per E-Mail und Telefon',
      absaetze: [
        'Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage und für mögliche Anschlussfragen (Art. 6 Abs. 1 lit. b DSGVO bei vertragsbezogenen Anfragen, sonst lit. f). Die Daten werden gelöscht, sobald sie nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.',
      ],
    },
  ];
  if (k.formular) {
    out.push({
      titel: 'Anfrageformular',
      absaetze: [
        'Über unser Anfrageformular können Sie uns Angaben zu Ihrem Vorhaben, Ihre Postleitzahl, optional Fotos und Ihre Kontaktdaten übermitteln. Wir verwenden diese Daten ausschließlich zur Bearbeitung Ihrer Anfrage und zur Vorbereitung eines Angebots (Art. 6 Abs. 1 lit. b DSGVO). Pflichtfelder sind als solche gekennzeichnet.',
        'Damit Sie eine begonnene Anfrage nicht verlieren, speichert das Formular Ihren Zwischenstand lokal in Ihrem Browser (localStorage). Diese Daten verlassen Ihr Gerät nicht, bis Sie die Anfrage absenden, und werden danach gelöscht. Fotos werden nicht zwischengespeichert.',
        k.formularDienst
          ? `Zum Versand der Formulardaten nutzen wir den Dienst ${k.formularDienst}. [Anbieter, Sitz, Drittlandübermittlung und Auftragsverarbeitungsvertrag vor dem Livegang ergänzen.]`
          : 'Hinweis Entwurf: In dieser Demo-Version werden keine Formulardaten übertragen.',
      ],
    });
  }
  if (k.bewerbung) {
    out.push({
      titel: 'Bewerbungen',
      absaetze: [
        'Wenn Sie sich bei uns bewerben (Schnellbewerbung, E-Mail oder WhatsApp), verarbeiten wir Ihre Angaben zur Durchführung des Bewerbungsverfahrens (§ 26 BDSG, Art. 6 Abs. 1 lit. b DSGVO). Kommt kein Arbeitsverhältnis zustande, löschen wir Ihre Daten spätestens sechs Monate nach Abschluss des Verfahrens, sofern Sie nicht in eine längere Speicherung eingewilligt haben.',
      ],
    });
  }
  if (k.whatsapp) {
    out.push({
      titel: 'Kontakt über WhatsApp',
      absaetze: [
        'Sie können uns über WhatsApp kontaktieren. Anbieter ist die WhatsApp Ireland Ltd. Bei der Nutzung werden Daten (u. a. Telefonnummer, Metadaten) an WhatsApp/Meta übertragen, ggf. auch in die USA. Die Kontaktaufnahme ist freiwillig; Sie können uns jederzeit auch per Telefon oder E-Mail erreichen. [Rechtsgrundlage und Einsatz von WhatsApp Business vor dem Livegang prüfen.]',
      ],
    });
  }
  if (k.karte) {
    out.push({
      titel: 'Karte (Zwei-Klick-Lösung)',
      absaetze: [
        'Auf unserer Kontaktseite können Sie eine Karte von Google Maps laden. Die Karte wird erst nach Ihrem Klick auf „Karte laden“ eingebunden (Einwilligung, Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Dabei werden u. a. Ihre IP-Adresse und Nutzungsdaten an Google übertragen, ggf. in die USA. Ohne Ihren Klick findet keine Verbindung zu Google statt.',
      ],
    });
  }
  if (k.buchung) {
    out.push({
      titel: 'Externe Terminbuchung',
      absaetze: [`Für Terminbuchungen verlinken wir auf den externen Dienst ${k.buchung}. Erst wenn Sie dem Link folgen, gelten die Datenschutzbestimmungen dieses Anbieters. [Anbieter vor dem Livegang ergänzen.]`],
    });
  }
  if (k.analytics) {
    out.push({
      titel: 'Reichweitenmessung',
      absaetze: [`Wir nutzen ${k.analytics} zur cookielosen, anonymisierten Reichweitenmessung. [Konfiguration, Rechtsgrundlage und ggf. Einwilligung vor dem Livegang prüfen.]`],
    });
  }
  if (k.serviceWorker) {
    out.push({
      titel: 'Offline-Zwischenspeicher',
      absaetze: ['Damit die Website auch bei schlechter Verbindung schnell lädt, speichert Ihr Browser Seiten und Dateien dieser Website in einem lokalen Zwischenspeicher (Service Worker). Dabei werden keine personenbezogenen Daten an uns übertragen.'],
    });
  }
  out.push(
    {
      titel: 'Ihre Rechte',
      absaetze: [
        'Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Wenden Sie sich dazu an die oben genannten Kontaktdaten.',
        'Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, insbesondere in dem Bundesland Ihres Wohnorts oder unseres Firmensitzes.',
      ],
    },
    {
      titel: 'SSL-/TLS-Verschlüsselung',
      absaetze: ['Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an „https://“ in der Adresszeile Ihres Browsers.'],
    },
  );
  return out;
}
