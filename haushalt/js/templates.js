// Default task suggestions per room type.
// [name, n, unit, effort, kid]  — n = 0 → "jederzeit" (anytime task)
// kid: true → kid-friendly with auto emoji, or { e: '🧸', steps: [['🧸','Text'], ...] }

const KZ_AUFRAEUMEN = { e: '🧸', steps: [
  ['🧸', 'Spielzeug in die Kisten legen'],
  ['📚', 'Bücher ins Regal stellen'],
  ['👕', 'Schmutzige Kleidung in den Wäschekorb'],
  ['🖍️', 'Stifte in die Stiftedose'],
  ['🐻', 'Kuscheltiere aufs Bett setzen'],
  ['👀', 'Boden checken: liegt noch etwas herum?'],
] };
const BETT_MACHEN = { e: '🛏️', steps: [
  ['🛏️', 'Decke ausschütteln'],
  ['☁️', 'Kissen aufschütteln'],
  ['✋', 'Decke glatt auf das Bett legen'],
  ['🐻', 'Kuscheltiere schön hinsetzen'],
] };
const STAUB = { e: '🪶', steps: [
  ['🧽', 'Staubtuch holen'],
  ['📚', 'Regal abwischen'],
  ['🪟', 'Fensterbank abwischen'],
  ['🗄️', 'Kommode / Schreibtisch abwischen'],
] };
const TISCH_DECKEN = { e: '🍽️', steps: [
  ['🍽️', 'Teller hinstellen'],
  ['🍴', 'Besteck neben die Teller'],
  ['🥛', 'Gläser oder Becher dazu'],
  ['🧻', 'Servietten verteilen'],
] };
const TISCH_ABRAEUMEN = { e: '🧺', steps: [
  ['🍽️', 'Teller zur Spülmaschine bringen'],
  ['🥛', 'Gläser wegbringen'],
  ['🧽', 'Tisch mit Lappen abwischen'],
] };
const SPUELMASCHINE = { e: '🫧', steps: [
  ['🍴', 'Besteck in die Schublade'],
  ['🥛', 'Becher und Gläser in den Schrank'],
  ['🍽️', 'Teller stapeln (Mama/Papa helfen bei oben)'],
] };
const SCHUHE = { e: '👟', steps: [
  ['👟', 'Schuhe paarweise zusammenstellen'],
  ['📦', 'Ins Schuhregal stellen'],
] };
const WAESCHE_LEGEN = { e: '🧦', steps: [
  ['🧦', 'Socken paarweise zusammenlegen'],
  ['👕', 'T-Shirts falten'],
  ['🗂️', 'Stapel für jede Person machen'],
  ['🚪', 'Eigenen Stapel in den Schrank räumen'],
] };
const PFLANZEN = { e: '🪴', steps: [
  ['🚿', 'Gießkanne mit Wasser füllen'],
  ['🪴', 'Jede Pflanze ein bisschen gießen'],
  ['👆', 'Erde fühlen: zu trocken? Noch einen Schluck!'],
] };
const MUELL = { e: '🗑️', steps: [
  ['🗑️', 'Müllbeutel zuknoten'],
  ['🚶', 'Zur Mülltonne bringen'],
  ['🆕', 'Neuen Beutel einlegen'],
] };
const SCHREIBTISCH = { e: '✏️', steps: [
  ['✏️', 'Stifte in die Dose'],
  ['📄', 'Blätter stapeln'],
  ['🎒', 'Schulsachen in den Ranzen'],
  ['🧽', 'Tisch abwischen'],
] };
const SPIELZEUG_SORTIEREN = { e: '🧩', steps: [
  ['🧱', 'Bausteine in die Bausteinkiste'],
  ['🚗', 'Autos in die Autokiste'],
  ['🧩', 'Puzzleteile in die richtige Schachtel'],
  ['💔', 'Kaputtes Spielzeug Mama/Papa zeigen'],
] };

export const TEMPLATES = {
  kueche: [
    ['Geschirr spülen', 0, 'd', 1],
    ['Spülmaschine ausräumen', 0, 'd', 1, SPUELMASCHINE],
    ['Tisch decken', 0, 'd', 1, TISCH_DECKEN],
    ['Tisch abräumen', 0, 'd', 1, TISCH_ABRAEUMEN],
    ['Oberflächen abwischen', 2, 'd', 1],
    ['Spüle putzen', 1, 'w', 1],
    ['Herd putzen', 12, 'd', 2],
    ['Boden saugen', 4, 'd', 1],
    ['Boden wischen', 1, 'w', 2],
    ['Kühlschrank aufräumen', 14, 'd', 1],
    ['Kühlschrank putzen', 7, 'w', 2],
    ['Mülleimer putzen', 5, 'w', 2],
    ['Gefrierschrank aufräumen', 2, 'm', 1],
    ['Gefrierschrank putzen', 12, 'm', 3],
    ['Toaster reinigen', 2, 'm', 1],
    ['Wasserkocher entkalken', 2, 'm', 1],
    ['Kaffeemaschine entkalken', 4, 'm', 1],
    ['Abzugshaube putzen', 3, 'm', 2],
    ['Backofen putzen', 6, 'm', 3],
    ['Schränke aufräumen & auswischen', 6, 'm', 3],
    ['Schubladen aufräumen & auswischen', 6, 'm', 2],
  ],
  wohnzimmer: [
    ['Aufräumen', 3, 'd', 1, { e: '🧺', steps: [['🧸', 'Spielsachen zurück ins Kinderzimmer'], ['🛋️', 'Kissen aufs Sofa'], ['🧣', 'Decke falten'], ['📺', 'Fernbedienungen an ihren Platz']] }],
    ['Staubsaugen', 1, 'w', 2],
    ['Staub wischen', 1, 'w', 1, STAUB],
    ['Boden wischen', 2, 'w', 2],
    ['Pflanzen gießen', 1, 'w', 1, PFLANZEN],
    ['Bildschirme abstauben', 2, 'w', 1],
    ['Sofa absaugen', 1, 'm', 2],
    ['Lampen abstauben', 2, 'm', 1],
    ['Fenster putzen', 3, 'm', 3],
    ['Vorhänge waschen', 6, 'm', 2],
  ],
  esszimmer: [
    ['Tisch abwischen', 1, 'd', 1, { e: '🧽', steps: [['🧽', 'Lappen nass machen und auswringen'], ['↔️', 'Tisch abwischen'], ['🧻', 'Mit Tuch trocken wischen']] }],
    ['Staubsaugen', 1, 'w', 2],
    ['Boden wischen', 2, 'w', 2],
    ['Stühle abwischen', 1, 'm', 1, true],
    ['Fenster putzen', 3, 'm', 3],
  ],
  schlafzimmer: [
    ['Bett machen', 1, 'd', 1, BETT_MACHEN],
    ['Wäsche wegräumen', 0, 'd', 1, true],
    ['Staubsaugen', 1, 'w', 2],
    ['Bettwäsche wechseln', 2, 'w', 2],
    ['Staub wischen', 2, 'w', 1, STAUB],
    ['Boden wischen', 2, 'w', 2],
    ['Fenster putzen', 3, 'm', 3],
    ['Matratze absaugen & wenden', 6, 'm', 3],
    ['Kleiderschrank ausmisten', 6, 'm', 3],
  ],
  badezimmer: [
    ['Waschbecken putzen', 4, 'd', 1],
    ['Spiegel putzen', 1, 'w', 1, { e: '🪞', steps: [['🧴', 'Glasreiniger aufsprühen (mit Hilfe)'], ['🧻', 'Mit Tuch blank wischen'], ['😁', 'Grimasse im sauberen Spiegel machen']] }],
    ['Toilette putzen', 1, 'w', 2],
    ['Dusche putzen', 1, 'w', 2],
    ['Badewanne putzen', 2, 'w', 2],
    ['Handtücher wechseln', 1, 'w', 1, true],
    ['Mülleimer leeren', 1, 'w', 1, MUELL],
    ['Boden wischen', 1, 'w', 2],
    ['Abflüsse reinigen', 1, 'm', 2],
    ['Fliesen & Fugen reinigen', 2, 'm', 3],
    ['Duschvorhang waschen', 3, 'm', 1],
    ['Badschränke aufräumen', 3, 'm', 2],
  ],
  kinderzimmer: [
    ['Kinderzimmer aufräumen', 2, 'd', 1, KZ_AUFRAEUMEN],
    ['Bett machen', 1, 'd', 1, BETT_MACHEN],
    ['Schreibtisch aufräumen', 1, 'w', 1, SCHREIBTISCH],
    ['Staubsaugen', 1, 'w', 2],
    ['Staub wischen', 2, 'w', 1, STAUB],
    ['Spielzeug sortieren', 2, 'w', 2, SPIELZEUG_SORTIEREN],
    ['Bettwäsche wechseln', 2, 'w', 2],
    ['Boden wischen', 2, 'w', 2],
    ['Kuscheltiere waschen', 3, 'm', 1, { e: '🐻', steps: [['🐻', 'Kuscheltiere aussuchen, die baden dürfen'], ['🧺', 'In den Wäschesack stecken'], ['🫧', 'Zusammen in die Waschmaschine']] }],
    ['Kleidung aussortieren', 3, 'm', 2, { e: '👚', steps: [['👚', 'Alles anprobieren, was zu klein sein könnte'], ['📦', 'Zu Kleines in die Spendenkiste'], ['🚪', 'Den Rest ordentlich zurücklegen']] }],
  ],
  arbeitszimmer: [
    ['Schreibtisch aufräumen', 1, 'w', 1],
    ['Staubsaugen', 1, 'w', 2],
    ['Papierkorb leeren', 1, 'w', 1, MUELL],
    ['Staub wischen', 2, 'w', 1, STAUB],
    ['Papierkram sortieren', 2, 'w', 2],
    ['Boden wischen', 2, 'w', 2],
    ['Bildschirm & Tastatur reinigen', 1, 'm', 1],
  ],
  flur: [
    ['Schuhe aufräumen', 3, 'd', 1, SCHUHE],
    ['Staubsaugen', 1, 'w', 2],
    ['Boden wischen', 1, 'w', 2],
    ['Garderobe aufräumen', 2, 'w', 1, { e: '🧥', steps: [['🧥', 'Jacken an die Haken hängen'], ['🧢', 'Mützen und Schals in den Korb'], ['🎒', 'Taschen ordentlich hinstellen']] }],
    ['Fußmatte ausklopfen', 2, 'w', 1, true],
    ['Spiegel putzen', 2, 'w', 1, true],
  ],
  waesche: [
    ['Wäsche waschen', 0, 'd', 2],
    ['Wäsche aufhängen', 0, 'd', 1, { e: '👕', steps: [['🧺', 'Wäschekorb zum Ständer tragen'], ['🧦', 'Socken aufhängen'], ['👕', 'T-Shirts glatt schütteln und aufhängen']] }],
    ['Wäsche zusammenlegen', 0, 'd', 1, WAESCHE_LEGEN],
    ['Flusensieb reinigen', 1, 'w', 1],
    ['Bügeln', 1, 'w', 2],
    ['Boden wischen', 1, 'm', 2],
    ['Waschmaschine reinigen', 2, 'm', 2],
  ],
  wc: [
    ['Toilette putzen', 1, 'w', 2],
    ['Waschbecken putzen', 1, 'w', 1],
    ['Handtuch wechseln', 1, 'w', 1, true],
    ['Spiegel putzen', 2, 'w', 1, true],
    ['Boden wischen', 2, 'w', 2],
  ],
  keller: [
    ['Vorräte prüfen', 1, 'm', 1, true],
    ['Fegen', 1, 'm', 2],
    ['Aufräumen', 3, 'm', 3],
    ['Entrümpeln', 6, 'm', 3],
  ],
  dachboden: [
    ['Fegen', 3, 'm', 2],
    ['Aufräumen', 6, 'm', 3],
  ],
  allgemein: [
    ['Müll rausbringen', 3, 'd', 1, MUELL],
    ['Pflanzen gießen', 1, 'w', 1, PFLANZEN],
    ['Altpapier wegbringen', 2, 'w', 1, true],
    ['Türklinken & Lichtschalter abwischen', 2, 'w', 1, true],
    ['Altglas wegbringen', 1, 'm', 1],
    ['Spinnweben entfernen', 1, 'm', 1],
    ['Heizkörper reinigen', 3, 'm', 2],
    ['Fenster putzen', 3, 'm', 3],
    ['Rauchmelder testen', 6, 'm', 1],
  ],
  garage: [
    ['Fegen', 2, 'm', 2],
    ['Aufräumen', 3, 'm', 3],
  ],
  garten: [
    ['Blumen gießen', 2, 'd', 1, PFLANZEN, [5, 6, 7, 8, 9]],
    ['Rasen mähen', 1, 'w', 3, null, [4, 5, 6, 7, 8, 9, 10]],
    ['Laub rechen', 1, 'w', 2, { e: '🍂', steps: [['🧤', 'Handschuhe anziehen'], ['🍂', 'Laub zu Haufen rechen'], ['🪣', 'In die Biotonne füllen']] }, [10, 11]],
    ['Unkraut jäten', 2, 'w', 2, true, [4, 5, 6, 7, 8, 9]],
    ['Gartenmöbel reinigen', 2, 'm', 2, null, [4, 5, 6, 7, 8, 9]],
    ['Hecke schneiden', 3, 'm', 3],
    ['Schnee schieben', 2, 'd', 2, { e: '❄️', steps: [['🧤', 'Mütze, Schal und Handschuhe an'], ['❄️', 'Mit der Schaufel Schnee zur Seite schieben'], ['🧂', 'Mama/Papa streuen, wo es glatt ist']] }, [11, 12, 1, 2]],
    ['Gartenmöbel einwintern', 12, 'm', 2, null, [10, 11]],
  ],
  balkon: [
    ['Pflanzen gießen', 2, 'd', 1, PFLANZEN, [4, 5, 6, 7, 8, 9]],
    ['Fegen', 2, 'w', 1, true],
    ['Geländer abwischen', 1, 'm', 1],
    ['Balkonmöbel reinigen', 2, 'm', 2, null, [4, 5, 6, 7, 8, 9]],
  ],
  terrasse: [
    ['Fegen', 1, 'w', 1, true],
    ['Möbel reinigen', 2, 'm', 2, null, [4, 5, 6, 7, 8, 9]],
    ['Schnee schieben', 2, 'd', 2, true, [11, 12, 1, 2]],
    ['Fugen reinigen', 6, 'm', 3],
  ],
  auto: [
    ['Müll aus dem Auto holen', 2, 'w', 1, true],
    ['Innenraum saugen', 1, 'm', 2],
    ['Auto waschen', 1, 'm', 2],
    ['Scheiben innen putzen', 2, 'm', 1],
  ],
};

// Emoji guesses for kid-friendly display
const EMOJI_RULES = [
  [/aufräum|sortier/i, '🧺'], [/saug/i, '🌀'], [/wisch|putz|abwisch/i, '🧽'], [/staub/i, '🪶'],
  [/gieß|pflanz|blume/i, '🪴'], [/müll|papierkorb|tonne/i, '🗑️'], [/wäsche|handt/i, '🧺'], [/bett/i, '🛏️'],
  [/schuh/i, '👟'], [/fenster|spiegel|scheib/i, '🪟'], [/geschirr|spül/i, '🍽️'], [/tisch/i, '🍽️'],
  [/fegen|laub/i, '🧹'], [/kuschel|spielzeug/i, '🧸'], [/auto/i, '🚗'], [/rasen|unkraut|garten/i, '🌱'],
  [/kühlschrank|vorräte/i, '🧊'], [/fußmatte/i, '🚪'], [/papier/i, '📰'], [/glas/i, '🫙'],
];
export function guessEmoji(name) {
  for (const [re, e] of EMOJI_RULES) if (re.test(name)) return e;
  return '⭐';
}

export { LINES as MONSTER_LINES } from './lines.js';
