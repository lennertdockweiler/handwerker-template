/**
 * Weitere Gewerke mit Leistungen und FAQ. Ablauf und Werte kommen aus dem
 * allgemeinen Preset; Sprachbausteine aus _basis.ts. Bei Bedarf wie elektro.ts
 * ausbauen.
 */
import type { GewerkPreset } from './types';
import { allgemeinAblauf } from './allgemein';
import { basisWerte } from './_basis';

const objekt = { id: 'objekt', frage: 'Um welches Objekt geht es?', typ: 'auswahl' as const, optionen: ['Einfamilienhaus', 'Mehrfamilienhaus', 'Gewerbe', 'Neubau'], pflicht: true };
const flaeche = (label = 'Fläche ungefähr?') => ({ id: 'flaeche', frage: label, typ: 'zahl' as const, einheit: 'm²' });

export const zimmerei: GewerkPreset = {
  key: 'zimmerei',
  bezeichnung: 'Zimmerei',
  betriebsart: 'Zimmerei',
  berufsbezeichnung: 'Zimmerermeister',
  schemaTyp: 'GeneralContractor',
  notdienstRelevant: false,
  fachbegriffe: ['Dachstuhl', 'Holzrahmenbau', 'Brettsperrholz', 'Abbund', 'Sparren', 'Pfette', 'Carport', 'Aufstockung'],
  leistungen: [
    { slug: 'dachstuhl', titel: 'Dachstühle', kurztext: 'Neue Dachstühle und Sanierung bestehender Konstruktionen – präzise abgebunden.', text: 'Wir planen, binden ab und richten Dachstühle für Neubau und Sanierung. Schadhafte Sparren und Pfetten ersetzen wir, verstärken alte Konstruktionen für neue Lasten wie Photovoltaik und bereiten den Dachausbau vor.', icon: 'house', motiv: 'Frisch aufgerichteter Dachstuhl aus hellem Fichtenholz vor blauem Himmel', anfrageFragen: [objekt, { id: 'vorhaben', frage: 'Was ist geplant?', typ: 'auswahl', optionen: ['Neuer Dachstuhl', 'Sanierung', 'Verstärkung', 'Dachausbau'] }] },
    { slug: 'holzbau', titel: 'Holzrahmenbau', kurztext: 'Häuser und Anbauten in Holzbauweise – schnell, trocken, klimafreundlich.', text: 'Holzrahmenbau verbindet kurze Bauzeiten mit hervorragender Dämmung und gesundem Raumklima. Wir fertigen Wand- und Deckenelemente in der Halle vor und stellen das Gebäude in wenigen Tagen auf.', icon: 'trees', motiv: 'Holzrahmenbau-Elemente werden mit Kran aufgestellt', anfrageFragen: [objekt, flaeche('Wohnfläche geplant?')] },
    { slug: 'aufstockung', titel: 'Aufstockung & Anbau', kurztext: 'Mehr Wohnraum ohne neues Grundstück – leicht und schnell in Holzbauweise.', text: 'Eine Aufstockung in Holz bringt wenig Gewicht auf das Bestandsgebäude und ist in kurzer Zeit wetterdicht. Wir prüfen Statik und Genehmigungsfähigkeit und koordinieren die Gewerke.', icon: 'building', motiv: 'Moderne Holzaufstockung auf einem Bestandsgebäude', anfrageFragen: [objekt, flaeche('Zusätzliche Fläche gewünscht?')] },
    { slug: 'carport', titel: 'Carports & Terrassendächer', kurztext: 'Carports, Vordächer und Terrassenüberdachungen nach Maß.', text: 'Wir planen und bauen Carports, Vordächer und Terrassendächer aus Konstruktionsvollholz oder Brettschichtholz – mit sauberen Details, auf Wunsch begrünt oder mit Glasdach.', icon: 'car', motiv: 'Holzcarport mit Gründach neben einem modernen Haus', anfrageFragen: [{ id: 'art', frage: 'Was soll entstehen?', typ: 'auswahl', optionen: ['Carport', 'Terrassendach', 'Vordach', 'Gartenhaus'], pflicht: true }, flaeche()] },
    { slug: 'dachausbau', titel: 'Dachausbau', kurztext: 'Aus dem Speicher wird Wohnraum – gedämmt, hell und gemütlich.', text: 'Wir dämmen, beplanken und bauen Gauben für zusätzlichen Wohnraum unter dem Dach – in Abstimmung mit Dachdecker und Innenausbau.', icon: 'square-dashed', motiv: 'Ausgebautes Dachgeschoss mit sichtbaren Holzbalken', anfrageFragen: [objekt, flaeche()] },
    { slug: 'holzfassade', titel: 'Holzfassaden', kurztext: 'Langlebige Holzfassaden aus Lärche, Douglasie oder thermisch modifiziertem Holz.', text: 'Holzfassaden altern in Würde, wenn sie richtig konstruiert sind. Wir planen Hinterlüftung, Schutz und Details so, dass die Fassade Jahrzehnte hält.', icon: 'rows-3', motiv: 'Vergraute Lärchenholzfassade mit vertikaler Schalung', anfrageFragen: [objekt, flaeche('Fassadenfläche?')] },
  ],
  faq: [
    { frage: 'Ist Holzbau teurer als Massivbau?', antwort: 'Die Baukosten sind vergleichbar. Holzbau spart aber Bauzeit, und die gute Dämmung senkt die Heizkosten dauerhaft.' },
    { frage: 'Wie lange hält ein Holzhaus?', antwort: 'Bei fachgerechter Konstruktion genauso lange wie ein Massivhaus – viele Fachwerkhäuser sind mehrere hundert Jahre alt.' },
    { frage: 'Brauche ich für einen Carport eine Genehmigung?', antwort: 'Das regelt die Landesbauordnung. Kleinere Carports sind oft genehmigungsfrei, wir klären das vorab.' },
    { frage: 'Wie schnell ist eine Aufstockung fertig?', antwort: 'Durch Vorfertigung ist der Rohbau oft in wenigen Tagen wetterdicht. Der Innenausbau dauert anschließend einige Wochen.' },
    { frage: 'Welches Holz {{verwenden Sie|verwendet ihr}}?', antwort: 'Überwiegend Fichte, Tanne, Lärche und Douglasie aus regionaler, zertifizierter Forstwirtschaft.' },
    { frage: 'Ist Holz brandgefährlich?', antwort: 'Massive Holzbauteile verkohlen außen und behalten innen lange ihre Tragfähigkeit. Holzbauten erfüllen alle Brandschutzanforderungen.' },
  ],
  ablauf: allgemeinAblauf,
  werte: basisWerte,
  texte: { heroHeadline: 'Wir bauen mit Holz. Und mit Verstand.', heroStatement: 'Holz trägt.' },
};

export const fliesen: GewerkPreset = {
  key: 'fliesen',
  bezeichnung: 'Fliesenlegerbetrieb',
  betriebsart: 'Fliesenfachbetrieb',
  berufsbezeichnung: 'Fliesen-, Platten- und Mosaiklegermeister',
  schemaTyp: 'HomeAndConstructionBusiness',
  notdienstRelevant: false,
  fachbegriffe: ['Großformat', 'Verbundabdichtung', 'Fugenbild', 'Feinsteinzeug', 'Gefälleestrich', 'Naturstein', 'Mosaik'],
  leistungen: [
    { slug: 'bad', titel: 'Bäder fliesen', kurztext: 'Fugenarme Großformate, bodengleiche Duschen, perfekte Abdichtung.', text: 'Im Bad entscheidet die Abdichtung über die Lebensdauer. Wir arbeiten mit geprüften Verbundabdichtungen und verlegen Großformate fugenarm und exakt im Raster.', icon: 'bath', motiv: 'Bad mit großformatigen Feinsteinzeugfliesen und schmaler Rinne', anfrageFragen: [flaeche('Badfläche?'), { id: 'format', frage: 'Fliesenformat?', typ: 'auswahl', optionen: ['Großformat', 'Standard', 'Mosaik', 'Beratung'] }], kostenschaetzer: { einheit: 'm²', label: 'Fliesenfläche', preisVon: 95, preisBis: 165, grundpreis: 400, min: 5, max: 120, schritt: 1, standard: 30 } },
    { slug: 'boden', titel: 'Bodenfliesen', kurztext: 'Wohnräume, Küchen und Flure in Feinsteinzeug oder Naturstein.', text: 'Wir verlegen Bodenfliesen auch auf Fußbodenheizung, planen das Fugenbild und sorgen für exakte Übergänge zu anderen Belägen.', icon: 'grid-3x3', motiv: 'Wohnküche mit großformatigen Bodenfliesen in Steinoptik', anfrageFragen: [flaeche(), { id: 'heizung', frage: 'Fußbodenheizung vorhanden?', typ: 'ja-nein' }] },
    { slug: 'naturstein', titel: 'Naturstein', kurztext: 'Treppen, Fensterbänke und Böden aus Granit, Marmor und Schiefer.', text: 'Naturstein ist ein Unikat. Wir beraten zu Pflege und Eignung und verarbeiten Platten, Stufen und Fensterbänke passgenau.', icon: 'mountain', motiv: 'Treppe mit Natursteinstufen aus hellem Kalkstein', anfrageFragen: [{ id: 'objekt', frage: 'Was soll entstehen?', typ: 'auswahl', optionen: ['Boden', 'Treppe', 'Fensterbänke', 'Küchenrückwand'], pflicht: true }] },
    { slug: 'terrasse', titel: 'Terrassen & Balkone', kurztext: 'Frostsicher verlegt und dauerhaft dicht – auch auf Stelzlagern.', text: 'Draußen müssen Fliesen Frost, Regen und Sonne aushalten. Wir sanieren undichte Balkone und verlegen Terrassen frostsicher, gebunden oder auf Stelzlagern.', icon: 'sun', motiv: 'Dachterrasse mit Feinsteinzeugplatten auf Stelzlagern', anfrageFragen: [flaeche(), { id: 'problem', frage: 'Gibt es Undichtigkeiten?', typ: 'ja-nein' }] },
    { slug: 'kueche', titel: 'Küchenrückwände', kurztext: 'Fliesen, Großformat oder Mosaik – pflegeleicht und passend zur Küche.', text: 'Eine Küchenrückwand muss vor allem eins sein: leicht zu reinigen. Wir verlegen sie fugenarm in Großformat oder bewusst handwerklich in Zellige und Mosaik.', icon: 'cooking-pot', motiv: 'Küchenrückwand aus glasierten Zellige-Fliesen in Grün', anfrageFragen: [{ id: 'laenge', frage: 'Länge der Rückwand?', typ: 'zahl', einheit: 'm', pflicht: true }] },
    { slug: 'reparatur', titel: 'Reparatur & Fugen', kurztext: 'Gesprungene Fliesen tauschen, Fugen erneuern, Silikon sauber ziehen.', text: 'Nicht jedes Bad muss neu. Oft reichen neue Fugen, frisches Silikon und der Tausch einzelner Fliesen – schnell und sauber.', icon: 'wrench', motiv: 'Fliesenleger zieht eine saubere Silikonfuge in der Dusche', anfrageFragen: [{ id: 'umfang', frage: 'Was ist zu tun?', typ: 'mehrfach', optionen: ['Fliesen tauschen', 'Fugen erneuern', 'Silikon erneuern'], pflicht: true }] },
  ],
  faq: [
    { frage: 'Kann man auf alte Fliesen fliesen?', antwort: 'Oft ja, wenn der Untergrund tragfähig ist und die Aufbauhöhe passt. Das spart Zeit, Staub und Kosten.' },
    { frage: 'Wie lange dauert ein Bad?', antwort: 'Die reinen Fliesenarbeiten eines Standardbads dauern etwa eine Woche, inklusive Abdichtung und Trocknungszeiten.' },
    { frage: 'Sind Großformate schwieriger zu verlegen?', antwort: 'Ja, sie brauchen einen sehr ebenen Untergrund und Erfahrung. Dafür ist das Ergebnis ruhiger und pflegeleichter.' },
    { frage: 'Welche Fliesen sind rutschhemmend?', antwort: 'Achten {{Sie|du}} auf die Bewertungsgruppe R10 oder höher, im Duschbereich zusätzlich auf Klasse B.' },
    { frage: '{{Liefern Sie|Liefert ihr}} auch die Fliesen?', antwort: 'Ja, über unsere Partner zu fairen Konditionen. Gern verlegen wir auch selbst gekaufte Fliesen nach Absprache.' },
    { frage: 'Wie pflege ich Naturstein?', antwort: 'Mit pH-neutralen Reinigern und einer regelmäßigen Imprägnierung. Wir geben {{Ihnen|dir}} eine Pflegeanleitung mit.' },
  ],
  ablauf: allgemeinAblauf,
  werte: basisWerte,
  texte: { heroHeadline: 'Jede Fuge an ihrem Platz.', heroStatement: 'Auf den Millimeter.' },
};

export const metallbau: GewerkPreset = {
  key: 'metallbau',
  bezeichnung: 'Metallbau',
  betriebsart: 'Metallbaubetrieb',
  berufsbezeichnung: 'Metallbauermeister',
  schemaTyp: 'HomeAndConstructionBusiness',
  notdienstRelevant: false,
  fachbegriffe: ['Edelstahl', 'Feuerverzinkung', 'Pulverbeschichtung', 'Flachstahl', 'Schweißfachbetrieb EN 1090', 'Absturzsicherung'],
  leistungen: [
    { slug: 'gelaender', titel: 'Geländer & Handläufe', kurztext: 'Treppen- und Balkongeländer aus Stahl, Edelstahl und Glas.', text: 'Geländer müssen sicher sein und dürfen schön sein. Wir fertigen nach Maß und nach den Vorgaben der Landesbauordnung – vom schlanken Flachstahl bis zur Ganzglasbrüstung.', icon: 'fence', motiv: 'Schlankes Flachstahlgeländer an einer Betontreppe', anfrageFragen: [{ id: 'ort', frage: 'Wo?', typ: 'auswahl', optionen: ['Innen', 'Außen', 'Balkon'], pflicht: true }, { id: 'laenge', frage: 'Länge ungefähr?', typ: 'zahl', einheit: 'm' }] },
    { slug: 'tore', titel: 'Tore & Zäune', kurztext: 'Schiebetore, Drehtore und Zaunanlagen – auf Wunsch mit Antrieb.', text: 'Wir planen und bauen Toranlagen und Zäune, feuerverzinkt und pulverbeschichtet, mit Antrieben und Zutrittskontrolle für Haus und Betrieb.', icon: 'fence', motiv: 'Anthrazitfarbenes Schiebetor vor einer Hofeinfahrt', anfrageFragen: [{ id: 'art', frage: 'Was wird benötigt?', typ: 'mehrfach', optionen: ['Schiebetor', 'Drehtor', 'Zaun', 'Antrieb'], pflicht: true }] },
    { slug: 'treppen', titel: 'Stahltreppen', kurztext: 'Innen- und Außentreppen aus Stahl, auch als Fluchttreppe.', text: 'Stahltreppen sind schlank, stabil und vielseitig. Wir fertigen Wangen-, Spindel- und Fluchttreppen nach Statik und als zertifizierter Schweißfachbetrieb.', icon: 'trending-up', motiv: 'Außentreppe aus verzinktem Stahl an einer Gewerbehalle', anfrageFragen: [{ id: 'art', frage: 'Innen oder außen?', typ: 'auswahl', optionen: ['Innen', 'Außen', 'Fluchttreppe'], pflicht: true }] },
    { slug: 'vordaecher', titel: 'Vordächer & Balkone', kurztext: 'Vordächer, Anbaubalkone und Überdachungen aus Stahl und Glas.', text: 'Ein Anbaubalkon bringt Lebensqualität in Bestandsgebäude. Wir planen Statik und Genehmigung und montieren in kurzer Zeit.', icon: 'umbrella', motiv: 'Glasvordach mit Edelstahlhalterungen über einer Haustür', anfrageFragen: [{ id: 'art', frage: 'Was ist geplant?', typ: 'auswahl', optionen: ['Vordach', 'Anbaubalkon', 'Terrassendach'], pflicht: true }] },
    { slug: 'stahlbau', titel: 'Stahlbau für Gewerbe', kurztext: 'Bühnen, Podeste, Unterkonstruktionen und Hallenerweiterungen.', text: 'Für Betriebe fertigen wir Arbeitsbühnen, Podeste und Stahlkonstruktionen – nach EN 1090, mit Dokumentation und Montage im laufenden Betrieb.', icon: 'factory', motiv: 'Stahlbühne in einer Produktionshalle', anfrageFragen: [{ id: 'beschreibung', frage: 'Was wird benötigt?', typ: 'text', pflicht: true }] },
    { slug: 'reparatur', titel: 'Reparatur & Schweißarbeiten', kurztext: 'Reparaturen an Toren, Geländern und Maschinenteilen.', text: 'Wir reparieren, verstärken und schweißen – in der Werkstatt oder mobil vor Ort.', icon: 'wrench', motiv: 'Schweißer bei der Arbeit, Funkenflug in der Werkstatt', anfrageFragen: [{ id: 'beschreibung', frage: 'Was ist zu reparieren?', typ: 'text', pflicht: true }] },
  ],
  faq: [
    { frage: 'Edelstahl oder verzinkter Stahl?', antwort: 'Edelstahl ist pflegeleicht und edel, verzinkter und beschichteter Stahl günstiger und in jeder Farbe möglich. Wir beraten je nach Einsatzort.' },
    { frage: 'Wie hoch muss ein Geländer sein?', antwort: 'Das regelt die Landesbauordnung – meist 90 bis 110 cm je nach Absturzhöhe. Wir planen normgerecht.' },
    { frage: '{{Sind Sie|Seid ihr}} zertifiziert?', antwort: 'Ja, als Schweißfachbetrieb nach EN 1090 dürfen wir tragende Stahlbauteile fertigen.' },
    { frage: 'Wie lange dauert die Fertigung?', antwort: 'Je nach Umfang und Beschichtung meist vier bis acht Wochen.' },
    { frage: '{{Montieren Sie|Montiert ihr}} auch?', antwort: 'Ja, alle Bauteile montieren wir selbst – mit eigenem Team und Gerät.' },
    { frage: 'Kann man Tore nachträglich automatisieren?', antwort: 'In vielen Fällen ja. Wir prüfen Torflügel, Beschläge und Stromanschluss vor Ort.' },
  ],
  ablauf: allgemeinAblauf,
  werte: basisWerte,
  texte: { heroHeadline: 'Stahl in Form gebracht.', heroStatement: 'Hält. Punkt.' },
};

export const galabau: GewerkPreset = {
  key: 'galabau',
  bezeichnung: 'Garten- und Landschaftsbau',
  betriebsart: 'GaLaBau-Fachbetrieb',
  berufsbezeichnung: 'Gärtnermeister (Garten- und Landschaftsbau)',
  schemaTyp: 'HomeAndConstructionBusiness',
  notdienstRelevant: false,
  fachbegriffe: ['Pflasterbau', 'Naturstein', 'Rollrasen', 'Bewässerung', 'Trockenmauer', 'Teichbau', 'Pflanzplanung'],
  leistungen: [
    { slug: 'gartengestaltung', titel: 'Gartengestaltung', kurztext: 'Gärten planen und anlegen, die zu {{Ihrem|deinem}} Leben passen.', text: 'Wir planen Gärten mit klarer Struktur, passenden Pflanzen und durchdachter Pflege – von der Skizze bis zur Fertigstellung.', icon: 'flower-2', motiv: 'Moderner Garten mit Gräsern, Naturstein und Sitzplatz im Abendlicht', anfrageFragen: [flaeche('Gartenfläche?'), { id: 'wunsch', frage: 'Was ist {{Ihnen|dir}} wichtig?', typ: 'mehrfach', optionen: ['Pflegeleicht', 'Naturnah', 'Sitzplatz', 'Spielfläche', 'Sichtschutz'] }] },
    { slug: 'pflaster', titel: 'Pflaster & Wege', kurztext: 'Einfahrten, Wege und Terrassen aus Pflaster und Naturstein.', text: 'Ein Pflaster ist nur so gut wie sein Unterbau. Wir bauen frostsicher und versickerungsfähig – für Einfahrten, die nicht absacken.', icon: 'grid-3x3', motiv: 'Frisch verlegtes Natursteinpflaster in einer Einfahrt', anfrageFragen: [flaeche(), { id: 'nutzung', frage: 'Befahrbar?', typ: 'ja-nein' }], kostenschaetzer: { einheit: 'm²', label: 'Pflasterfläche', preisVon: 90, preisBis: 160, grundpreis: 600, min: 10, max: 400, schritt: 5, standard: 60 } },
    { slug: 'terrasse', titel: 'Terrassen', kurztext: 'Terrassen aus Holz, WPC, Keramik oder Naturstein.', text: 'Die Terrasse ist das Wohnzimmer im Sommer. Wir beraten zu Material und Unterbau und bauen langlebig und barrierearm.', icon: 'sun', motiv: 'Holzterrasse mit Lounge-Möbeln am Rand eines Gartens', anfrageFragen: [flaeche(), { id: 'material', frage: 'Material?', typ: 'auswahl', optionen: ['Holz', 'WPC', 'Keramik', 'Naturstein', 'Beratung'] }] },
    { slug: 'mauern', titel: 'Mauern & Treppen', kurztext: 'Trockenmauern, Hangsicherungen und Gartentreppen.', text: 'Wir gestalten Höhenunterschiede mit Trockenmauern, Gabionen und Treppen aus Naturstein – stabil und schön.', icon: 'brick-wall', motiv: 'Natursteintrockenmauer mit Bepflanzung am Hang', anfrageFragen: [{ id: 'laenge', frage: 'Länge ungefähr?', typ: 'zahl', einheit: 'm', pflicht: true }] },
    { slug: 'pflege', titel: 'Gartenpflege', kurztext: 'Rückschnitt, Rasenpflege und Saisonarbeiten – zuverlässig im Jahresvertrag.', text: 'Mit einem Pflegevertrag bleibt {{Ihr|dein}} Garten in Form. Wir kommen regelmäßig, schneiden, mähen und kümmern uns um die Saisonarbeiten.', icon: 'scissors', motiv: 'Gärtner schneidet eine Hecke in Form', anfrageFragen: [flaeche('Gartenfläche?'), { id: 'rhythmus', frage: 'Wie oft?', typ: 'auswahl', optionen: ['Einmalig', 'Monatlich', 'Saisonal', 'Jahresvertrag'] }] },
    { slug: 'bewaesserung', titel: 'Bewässerung & Rasen', kurztext: 'Rollrasen, Bewässerungsanlagen und Zisternen.', text: 'Wir verlegen Rollrasen, installieren automatische Bewässerung und binden Zisternen ein – für grünen Rasen ohne Gießkanne.', icon: 'sprout', motiv: 'Frisch verlegter Rollrasen mit Versenkregnern', anfrageFragen: [flaeche('Rasenfläche?')] },
  ],
  faq: [
    { frage: 'Wann ist die beste Zeit für einen neuen Garten?', antwort: 'Planung im Winter, Bau im Frühjahr oder Herbst. Viele Pflanzen wachsen im Herbst am besten an.' },
    { frage: 'Was kostet ein neuer Garten?', antwort: 'Das hängt stark von Fläche und Materialien ab. Nach einem Vor-Ort-Termin bekommen {{Sie|du}} eine Planung mit Kosten.' },
    { frage: 'Wie pflegeleicht kann ein Garten sein?', antwort: 'Sehr – mit passenden Stauden, Mulch und Bewässerung. Schottergärten empfehlen wir nicht, sie sind vielerorts auch verboten.' },
    { frage: '{{Übernehmen Sie|Übernehmt ihr}} die Entsorgung?', antwort: 'Ja, Grünschnitt und Aushub entsorgen wir fachgerecht.' },
    { frage: 'Kann man Gartenarbeiten von der Steuer absetzen?', antwort: 'Ja, die Arbeitskosten als Handwerkerleistung nach § 35a EStG.' },
    { frage: 'Brauche ich für eine Mauer eine Genehmigung?', antwort: 'Ab bestimmten Höhen ja. Wir klären das mit {{Ihnen|dir}} vorab.' },
  ],
  ablauf: allgemeinAblauf,
  werte: basisWerte,
  texte: { heroHeadline: 'Draußen ist das neue Drinnen.', heroStatement: 'Grün mit Plan.' },
};

export const bau: GewerkPreset = {
  key: 'bau',
  bezeichnung: 'Bauunternehmen',
  betriebsart: 'Bauunternehmen',
  berufsbezeichnung: 'Maurer- und Betonbauermeister',
  schemaTyp: 'GeneralContractor',
  notdienstRelevant: false,
  fachbegriffe: ['Rohbau', 'Bodenplatte', 'Kellerabdichtung', 'Mauerwerk', 'Stahlbeton', 'Umbau', 'Abbruch'],
  leistungen: [
    { slug: 'rohbau', titel: 'Rohbau', kurztext: 'Einfamilienhäuser, Mehrfamilienhäuser und Gewerbebauten im Rohbau.', text: 'Wir erstellen Rohbauten termingerecht und maßhaltig – von der Bodenplatte bis zum Dachstuhlauflager, in enger Abstimmung mit Architekt und Statik.', icon: 'building', motiv: 'Rohbau eines Einfamilienhauses mit frischem Mauerwerk', anfrageFragen: [objekt, flaeche('Wohnfläche geplant?')] },
    { slug: 'umbau', titel: 'Umbau & Sanierung', kurztext: 'Wände versetzen, Öffnungen schaffen, Bestand ertüchtigen.', text: 'Wir setzen Wanddurchbrüche mit Statik um, ertüchtigen Bestandsmauerwerk und bauen Grundrisse um – sauber und sicher.', icon: 'hammer', motiv: 'Neuer Wanddurchbruch mit Stahlträger in einem Altbau', anfrageFragen: [objekt, { id: 'vorhaben', frage: 'Was ist geplant?', typ: 'text' }] },
    { slug: 'keller', titel: 'Kellerabdichtung', kurztext: 'Feuchte Keller trockenlegen – von außen oder innen.', text: 'Wir finden die Ursache feuchter Wände und dichten fachgerecht ab, außen mit Freilegung oder innen mit Injektions- und Sperrputzsystemen.', icon: 'droplets', motiv: 'Freigelegte Kelleraußenwand mit neuer Abdichtung', anfrageFragen: [objekt, { id: 'symptom', frage: 'Was beobachten {{Sie|du}}?', typ: 'mehrfach', optionen: ['Feuchte Flecken', 'Salzausblühungen', 'Wasser im Keller', 'Muffiger Geruch'] }] },
    { slug: 'anbau', titel: 'Anbau & Garage', kurztext: 'Anbauten, Garagen und Wintergartenfundamente.', text: 'Mehr Platz am Bestand: Wir bauen Anbauten und Garagen in Massivbauweise und kümmern uns um die Anschlüsse an das bestehende Haus.', icon: 'warehouse', motiv: 'Massiver Anbau an ein bestehendes Wohnhaus', anfrageFragen: [objekt, flaeche()] },
    { slug: 'betonbau', titel: 'Betonarbeiten', kurztext: 'Bodenplatten, Fundamente, Sichtbeton und Treppen.', text: 'Von der Bodenplatte bis zur Sichtbetontreppe: Wir schalen, bewehren und betonieren präzise.', icon: 'layers', motiv: 'Sichtbetontreppe mit glatter Oberfläche', anfrageFragen: [{ id: 'bauteil', frage: 'Welches Bauteil?', typ: 'auswahl', optionen: ['Bodenplatte', 'Fundament', 'Treppe', 'Wand', 'Sonstiges'], pflicht: true }] },
    { slug: 'abbruch', titel: 'Abbruch & Entkernung', kurztext: 'Rückbau und Entkernung mit fachgerechter Entsorgung.', text: 'Wir entkernen und brechen ab – kontrolliert, staubarm und mit sortenreiner Entsorgung.', icon: 'construction', motiv: 'Entkernter Altbau mit sortierten Bauabfällen', anfrageFragen: [objekt] },
  ],
  faq: [
    { frage: '{{Arbeiten Sie|Arbeitet ihr}} mit Architekten zusammen?', antwort: 'Ja, regelmäßig. Auf Wunsch empfehlen wir Planer und Statiker aus der Region.' },
    { frage: 'Wie lange dauert ein Rohbau?', antwort: 'Bei einem Einfamilienhaus meist acht bis zwölf Wochen, abhängig von Größe und Wetter.' },
    { frage: 'Kann ich eine Wand selbst entfernen?', antwort: 'Bitte nicht ohne Statiker. Viele Wände sind tragend, auch wenn sie es nicht scheinen.' },
    { frage: '{{Bauen Sie|Baut ihr}} nach VOB?', antwort: 'Ja, auf Wunsch nach VOB/B, sonst nach BGB-Werkvertragsrecht.' },
    { frage: 'Wer kümmert sich um die Entsorgung?', antwort: 'Wir – sortenrein und mit Nachweis.' },
    { frage: '{{Bieten Sie|Bietet ihr}} Festpreise an?', antwort: 'Ja, auf Basis einer vollständigen Planung und Leistungsbeschreibung.' },
  ],
  ablauf: allgemeinAblauf,
  werte: basisWerte,
  texte: { heroHeadline: 'Solide gebaut. Von Grund auf.', heroStatement: 'Fundament first.' },
};
