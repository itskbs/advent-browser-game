import { SOLUTION, LETTER_ORDER, DAYS } from './config.js';

// Alle Texte sind vorerst Platzhalter. Ein Haus ersetzt man, indem man seinen Eintrag in REAL überschreibt.
const NPC_NAMES = [
  'Bäcker Brösel', 'Rentier-Rudi', 'Oma Zimtstern', 'Förster Fichtel', 'Elfe Glitzer', 'Nikolaus Nepomuk',
  'Schneefrau Frieda', 'Postbote Pauli', 'Kerzenmacher Kasimir', 'Wichtel Wuschel', 'Lebkuchen-Lotte', 'Eisbär Bruno',
  'Tüftler Theo', 'Sternsinger Sven', 'Glöckner Gustav', 'Pfefferkuchen-Paula', 'Christbaum-Charlie',
  'Märchenerzählerin Mia', 'Schlittenfahrer Sepp', 'Strickliesel Liesl', 'Mondfee Luna', 'Wunschzettel-Walter', 'Engel Emma',
];

const TUNICS = ['#c0392b', '#2e7d32', '#1565c0', '#8e44ad', '#d35400', '#00838f', '#6d4c41', '#ad1457'];

const INTROS = [
  (d) => `Oh, ein Besucher! Willkommen bei mir. Heute ist der ${d}. Dezember, da ist im Dorf einiges los.`,
  (d) => `Hallo, hallo! Ich habe schon auf dich gewartet. Das ${d}. Türchen ist mein Türchen!`,
  (d) => `Psst, komm rein, es zieht! Dezember ${d} – und ich habe das Gefühl, du kannst gut knobeln.`,
  (d) => `Schön, dass du da bist! Fast hätte ich den ${d}. Dezember verschlafen. Wo war ich stehen geblieben?`,
];
const STORIES = [
  'Letzte Nacht hat jemand alle Kekse aus meiner Dose gestohlen. Ich habe einen Verdacht, aber keinen Beweis.',
  'Mein Schlitten steckt seit Tagen im Schnee fest. Zum Glück habe ich ja noch Zeit zum Rätseln.',
  'Der Wind hat mir den Wunschzettel aus der Hand gerissen. Er flog bis zum Kirchturm!',
  'Ich zähle schon die Tage bis zum großen Fest. Und dabei verzähle ich mich ständig.',
];

const WRONG = [
  'Hm, das stimmt leider nicht. Versuch es noch einmal!',
  'Knapp daneben ist auch vorbei. Probier es nochmal!',
  'Nein, nein. Denk noch einmal in Ruhe nach.',
];

const PLACEHOLDER_KINDS = ['Sudoku', 'Kreuzworträtsel', 'Schachpuzzle', 'Logikrätsel', 'Bilderrätsel'];

// Echte Rätsel für die Häuser. Tag 5 und 6 bleiben vorerst bewusst leer (Platzhalter).
const REAL = {
  1: {
    type: 'text',
    story: [
      'Hey, da bist du ja! Weißt du noch, wie wir uns kennengelernt haben?',
      'Burger in Berlin, und hinterher gab es noch Eis vom Späti um die Ecke.',
      'Weißt du noch genau, was du uns damals mitgebracht hast?',
    ],
    question: 'Weißt du noch, was du uns damals vom Späti mitgebracht hast, nachdem wir Burger gegessen hatten? Welches Eis hast du gekauft?',
    accept: ['nogger choc', 'noggerchoc', 'nogger-choc'],
  },
  2: {
    type: 'sudoku',
    question: 'Ein kleines Sudoku zum Aufwärmen: Jede Zahl von 1 bis 4 darf in jeder Zeile, Spalte und jedem 2x2-Block nur einmal vorkommen.',
    puzzle: [
      [1, 0, 3, 4],
      [0, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 0],
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  3: {
    type: 'chess',
    question: 'Ein kniffligeres Schachrätsel: Weiß ist am Zug. Finde das Matt in einem Zug – und überlege genau, welche Fluchtfelder gedeckt sind!',
    board: [
      [null, null, null, null, null, null, null, 'bK'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, 'wK', null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['wQ', null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ],
    accept: ['Qa8', 'a2a8'],
  },
  4: {
    type: 'text',
    question:
      'Ein kleines Logikrätsel: Flinke, Bimmel und Krümel haben je eine andere Mützenfarbe (rot, grün, blau) ' +
      'und backen je eine andere Plätzchensorte (Zimtsterne, Vanillekipferl, Spekulatius).\n\n' +
      '1. Wer die rote Mütze trägt, backt keine Zimtsterne.\n' +
      '2. Bimmel mag die Farbe Grün nicht.\n' +
      '3. Krümel backt Vanillekipferl.\n' +
      '4. Flinke trägt die rote Mütze.\n\n' +
      'Wer backt die Zimtsterne?',
    accept: ['bimmel'],
  },
  7: {
    type: 'text',
    question: 'Was ist eigentlich unser liebstes gemeinsames Hobby?',
    accept: ['umzug', 'umzüge', 'umzuege'],
    hintAfter: 5,
    hint: 'Hinweis: Es gibt nichts Schöneres als Kartons und Waschmaschinen.',
  },
  8: {
    type: 'sudoku',
    question: 'Ein etwas kniffligeres Sudoku: Jede Zahl von 1 bis 9 darf in jeder Zeile, Spalte und jedem 3x3-Block nur einmal vorkommen.',
    puzzle: [
      [5, 0, 4, 6, 7, 8, 0, 1, 2],
      [6, 7, 2, 0, 9, 5, 3, 4, 8],
      [0, 9, 8, 3, 4, 0, 5, 6, 7],
      [8, 5, 0, 7, 6, 1, 4, 2, 0],
      [4, 2, 6, 8, 0, 3, 7, 9, 1],
      [7, 0, 3, 9, 2, 4, 0, 5, 6],
      [9, 6, 1, 0, 3, 7, 2, 8, 4],
      [0, 8, 7, 4, 1, 9, 6, 0, 5],
      [3, 4, 5, 2, 8, 0, 1, 7, 0],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  9: {
    type: 'chess',
    question: 'Ein einfaches Schachrätsel: Weiß ist am Zug. Finde das Matt in einem Zug!',
    board: [
      [null, null, null, null, 'bK', null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, 'wK', null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, 'wQ'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ],
    accept: ['Qh8', 'h4h8'],
  },
  10: {
    type: 'code',
    question:
      'Eine kleine Programmieraufgabe: Ein Zähler startet bei 0. Gehe alle Zahlen von 1 bis 100 durch: Ist die Zahl durch 3 teilbar, ' +
      'addiere sie zum Zähler. Ist sie durch 5 teilbar (aber nicht durch 3), subtrahiere sie vom Zähler. Alle anderen Zahlen werden ' +
      'ignoriert. Wie lautet der Endwert des Zählers?',
    accept: ['948'],
  },
  11: {
    type: 'text',
    story: [
      'Weißt du noch, was wir beide damals aus lauter kleinen Teilen gebaut haben?',
      'Wir haben einfach immer weitergemacht, bis das Ding quer durch den ganzen Raum reichte.',
      'Ich frage mich echt, ob du dich noch erinnerst …',
    ],
    question:
      'Erinnerst du dich noch an das Ding, das wir mal literally endlos aneinandergeklebt haben, bis die Schlange quer durchs Zimmer reichte? ' +
      'Falls nicht: Ich hab dir dazu am 11.09.2023 ein Bild geschickt — schau da noch mal nach.',
    accept: ['strohhalm', 'strohhalme'],
  },
  12: {
    type: 'code',
    question:
      'Eine kleine Programmieraufgabe: Der Hinweis wurde mit ROT13 verschlüsselt (jeder Buchstabe um 13 Stellen im Alphabet verschoben, ' +
      'A→N, B→O, usw.). Entschlüssle: JRE QNF YVRFG VFG OYBQ',
    accept: ['wer das liest ist bloed', 'wer das liest ist blöd'],
  },
  13: {
    type: 'sudoku',
    question: 'Noch ein Sudoku, diesmal etwas schwerer: Jede Zahl von 1 bis 9 darf in jeder Zeile, Spalte und jedem 3x3-Block nur einmal vorkommen.',
    puzzle: [
      [7, 0, 6, 8, 9, 1, 0, 3, 4],
      [0, 0, 0, 0, 2, 0, 5, 0, 1],
      [3, 0, 1, 5, 6, 4, 7, 8, 9],
      [1, 0, 0, 9, 0, 3, 6, 0, 5],
      [6, 4, 0, 0, 7, 5, 0, 2, 0],
      [9, 3, 0, 2, 0, 6, 1, 0, 0],
      [0, 8, 0, 7, 0, 9, 4, 0, 0],
      [0, 1, 9, 0, 0, 2, 8, 0, 0],
      [0, 0, 7, 0, 0, 8, 3, 0, 2],
    ],
    solution: [
      [7, 5, 6, 8, 9, 1, 2, 3, 4],
      [8, 9, 4, 3, 2, 7, 5, 6, 1],
      [3, 2, 1, 5, 6, 4, 7, 8, 9],
      [1, 7, 2, 9, 8, 3, 6, 4, 5],
      [6, 4, 8, 1, 7, 5, 9, 2, 3],
      [9, 3, 5, 2, 4, 6, 1, 7, 8],
      [2, 8, 3, 7, 5, 9, 4, 1, 6],
      [4, 1, 9, 6, 3, 2, 8, 5, 7],
      [5, 6, 7, 4, 1, 8, 3, 9, 2],
    ],
  },
  14: {
    type: 'text',
    npcName: 'Kunde im Frisörstuhl',
    story: [
      'Du betrittst den Frisörsalon. Auf dem Stuhl sitzt ein Kunde und starrt unschlüssig in den Spiegel.',
      'Du sprichst ihn an und fragst, ob du helfen kannst. Er erzählt, dass er sich einfach nicht entscheiden kann, welche Frisur er haben möchte.',
      'Vielleicht hast du ja eine Idee …',
    ],
    question: 'Welche Frisur schlägst du ihm vor?',
    accept: ['man bun', 'manbun'],
  },
  15: {
    type: 'chess',
    question: 'Ein einfaches Schachrätsel: Weiß ist am Zug. Finde das Matt in einem Zug!',
    board: [
      ['bK', null, null, null, null, null, null, null],
      [null, null, 'wK', null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, 'wR'],
    ],
    accept: ['Ra1', 'h1a1'],
  },
  16: {
    type: 'code',
    question: 'Eine kleine Programmieraufgabe: Nimm alle Zahlen von 1 bis 500. Zähle, wie viele davon Primzahlen sind.',
    accept: ['95'],
  },
  17: {
    type: 'text',
    question: 'Ich habe eine rote Nase, fliege aber nie allein, sondern immer mit acht anderen. Wer bin ich?',
    accept: ['rudolf', 'rudolph'],
  },
  18: {
    type: 'text',
    story: [
      'Ach, wie gut, dass du da bist! Ich hätte jetzt so Lust auf eine Zigarette …',
      'Aber ich habe absolut keinen Tabak mehr. Kannst du mir einen Gefallen tun?',
      'Lauf doch schnell zum Kiosk um die Ecke und hol mir etwas.',
    ],
    question: "Du rennst schnell zum Kiosk um die Ecke — welchen Tabak holst du, den du früher immer als 'den besten' bezeichnet hast?",
    accept: ['pepe'],
  },
  19: {
    type: 'chess',
    question:
      'Noch ein kniffligeres Schachrätsel: Weiß ist am Zug. Finde das Matt in einem Zug – zähl alle Fluchtfelder des Königs durch!',
    board: [
      [null, null, null, null, null, null, 'bK', null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, 'wK', null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['wR', null, null, null, null, null, null, null],
    ],
    accept: ['Ra8', 'a1a8'],
  },
  20: {
    type: 'code',
    question: 'Eine kleine Programmieraufgabe: Berechne die Quersumme (Summe aller Ziffern) von 2 hoch 20.',
    accept: ['31'],
  },
  21: {
    type: 'text',
    question:
      'Erinnerst du dich an unseren Ballermann-Fehlkauf? Wir waren so betrunken, dass wir unser ganzes Geld für sinnlosen Kram ' +
      'ausgegeben haben. Was haben wir uns damals gekauft?',
    accept: ['bucket hat', 'bucket hats', 'eimerhut', 'sonnenbrille', 'sonnenbrillen'],
  },
  22: {
    type: 'sudoku',
    question: 'Das letzte Sudoku, und das ist wirklich schwer: Jede Zahl von 1 bis 9 darf in jeder Zeile, Spalte und jedem 3x3-Block nur einmal vorkommen.',
    puzzle: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 7, 6, 5, 0, 0, 0, 4],
      [6, 5, 4, 0, 0, 7, 1, 0, 0],
      [4, 1, 5, 3, 0, 0, 0, 0, 0],
      [9, 0, 0, 4, 1, 0, 0, 5, 6],
      [0, 0, 0, 0, 0, 9, 0, 1, 2],
      [0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 9, 0, 0, 0, 8, 0],
      [0, 0, 1, 0, 0, 2, 6, 3, 5],
    ],
    solution: [
      [1, 8, 9, 2, 3, 4, 5, 6, 7],
      [2, 3, 7, 6, 5, 1, 8, 9, 4],
      [6, 5, 4, 8, 9, 7, 1, 2, 3],
      [4, 1, 5, 3, 2, 6, 9, 7, 8],
      [9, 7, 2, 4, 1, 8, 3, 5, 6],
      [3, 6, 8, 5, 7, 9, 4, 1, 2],
      [5, 2, 6, 1, 8, 3, 7, 4, 9],
      [7, 4, 3, 9, 6, 5, 2, 8, 1],
      [8, 9, 1, 7, 4, 2, 6, 3, 5],
    ],
  },
  23: {
    type: 'text',
    story: [
      'Oh, hallo! Ich suche etwas ganz Bestimmtes... Und bin schon die ganze ZEIT am Überlegen. Vielleicht kannst du mir helfen?',
      "Eines eurer am meisten besuchten Orte für einen Kurzurlaub... Dort gibt's doch ein schönes Schloss bzw. Hotel in der Nähe? " +
        'Und soweit ich weiß, trifft sich dort auch jährlich eine Elite zu einem Event aus aller Welt. Ich glaube, man kann dort auch ' +
        'echt viel Geld verdienen. Vielleicht sind wir auch irgendwann mal dabei? Vermutlich nicht... Ich glaube, dafür ist die ZEIT schon vorbei :(',
      'Ich frage mich bei sowas immer, woher bzw. von wem das ganze Geld kommt? Hm, naja. Kannst du mir helfen? Wir haben kaum noch ZEIT bis Heiligabend.',
    ],
    question: 'Na, weißt du, was gesucht ist?',
    accept: ['chrono24', 'chrono 24'],
    openUrl: 'https://chrono24.com',
  },
};

function placeholderQuiz(day) {
  const kind = PLACEHOLDER_KINDS[((day - 6) % PLACEHOLDER_KINDS.length + PLACEHOLDER_KINDS.length) % PLACEHOLDER_KINDS.length];
  const options = ['Falsch', 'Vielleicht', 'Richtig'];
  // richtige Antwort wandert je nach Tag durch die Positionen
  const answer = day % 3;
  [options[answer], options[2]] = [options[2], options[answer]];
  return {
    type: 'choice',
    placeholder: kind,
    question: `[Platzhalter] Hier steckt später ein ${kind}. Wähle für den Moment einfach die Antwort „Richtig“.`,
    options,
    answer,
  };
}

export const HOUSES = Array.from({ length: DAYS }, (_, i) => {
  const day = i + 1;
  const name = NPC_NAMES[i];
  const tunic = TUNICS[i % TUNICS.length];
  const r = REAL[day];
  return {
    day,
    letter: SOLUTION[LETTER_ORDER[i]],
    npc: { name: r?.npcName ?? name, pal: { tunic, hat: tunic, skin: '#f0c090', beard: i % 3 === 0 } },
    story: r?.story ?? [INTROS[i % INTROS.length](day), STORIES[i % STORIES.length], 'Aber genug geplaudert. Ich habe eine Frage an dich!'],
    quiz: r ?? placeholderQuiz(day),
    wrong: WRONG,
    win: 'Richtig! Das hast du fein gemacht. Du verdienst eine Belohnung.',
    replay: 'Schön, dich wiederzusehen! Du hast mein Rätsel ja schon gelöst. Hier ist mein Buchstabe noch einmal:',
  };
});

export const GIFT = {
  npc: { name: 'Das große Türchen' },
  locked: 'Das große Türchen öffnet sich erst am 24. Dezember.',
  ask: 'Du hast alle Buchstaben gesammelt – aber ganz durcheinander! Ordne sie neu, um das Lösungswort zu bilden.',
  win: [
    'Klick! Das Schloss springt auf, die Türflügel schwingen auseinander und warmes Licht strömt heraus.',
    'FROHE WEIHNACHTEN! Hier wartet später dein Geschenk. (Platzhalter)',
  ],
  replay: 'Das große Türchen steht weit offen. Frohe Weihnachten!',
};

export const EGGS = [
  { id: 'grave', kind: 'grave', tx: 3, ty: 20, text: ['Hier ruht der letzte Keks.', 'Er wurde um 3:00 Uhr nachts gegessen. Du weißt schon, von wem.'] },
  { id: 'snowman', kind: 'snowman', tx: 40, ty: 14, text: ['Der Schneemann flüstert:', '„Ich bin nicht dick. Ich habe nur Winterspeck!“'] },
  { id: 'bush', kind: 'bush', tx: 2, ty: 30, text: ['Der Busch raschelt verdächtig …', 'Ein Wichtel springt heraus, ruft „Buh!“ und rennt davon.'] },
  { id: 'angler', kind: 'angler', tx: 26, ty: 1, text: ['Pssst! Ich angle seit 1987 vom Bohlenweg aus nach dem großen Geschenk.', 'Bisher: ein Stiefel, drei Socken und ein Lebkuchenherz.'] },
  { id: 'koyer', kind: 'koyer', tx: 17, ty: 4, text: ['Ein bronzener Deicharbeiter steht hier, Spaten in der Hand.', 'Eine Tafel verrät: „Dem Koyer, der mit kalten Händen warme Wohnungen baute.“'] },
  { id: 'manhole', kind: 'manhole', tx: 53, ty: 29, text: ['Jemand kniet über dem Gullydeckel und lauscht hinein.', '„Ich höre Glöckchen … und jemanden, der ,ho ho ho` nuschelt!“'] },
];
