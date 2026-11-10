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

// Echte Beispiel-Rätsel für die ersten Häuser, damit man die Quiz-Typen sieht.
const REAL = {
  1: {
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
  2: {
    type: 'chess',
    question: 'Ein einfaches Schachrätsel: Weiß ist am Zug. Finde das Matt in einem Zug!',
    board: [
      [null, null, null, null, null, null, 'bK', null],
      [null, null, null, null, null, 'bP', 'bP', 'bP'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['wR', null, null, null, 'wK', null, null, null],
    ],
    accept: ['Ta8', 'Ra8', 'a1a8'],
  },
  3: {
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
  4: { type: 'choice', question: 'In welchem Monat feiert man den Nikolaustag?', options: ['November', 'Dezember', 'Januar'], answer: 1 },
  5: { type: 'text', question: 'Wie viele Tage hat der Dezember? Gib die Zahl ein.', accept: ['31'] },
};

function placeholderQuiz(day) {
  const kind = PLACEHOLDER_KINDS[(day - 6) % PLACEHOLDER_KINDS.length];
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
  return {
    day,
    letter: SOLUTION[LETTER_ORDER[i]],
    npc: { name, pal: { tunic, hat: tunic, skin: '#f0c090', beard: i % 3 === 0 } },
    story: [INTROS[i % INTROS.length](day), STORIES[i % STORIES.length], 'Aber genug geplaudert. Ich habe eine Frage an dich!'],
    quiz: REAL[day] ?? placeholderQuiz(day),
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
