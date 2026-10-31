export const TILE = 16;
export const VIEW_W = 256;
export const VIEW_H = 224;
export const DAYS = 23;

// Lösungswort, in Wörter aufgeteilt (für die Lücken-Anzeige am 24. Türchen).
// Zusammen müssen die Wörter genau DAYS Zeichen ergeben.
export const SOLUTION_WORDS = ['FROHE', 'WEIHNACHTEN', 'JOSHUA!'];
export const SOLUTION = SOLUTION_WORDS.join('');
if (SOLUTION.length !== DAYS) console.warn(`SOLUTION hat ${SOLUTION.length} statt ${DAYS} Buchstaben`);

// Haus n gibt nicht Buchstabe n des Lösungsworts, sondern SOLUTION[LETTER_ORDER[n]].
// Die gesammelten Buchstaben ergeben also erst am 24. Türchen das Lösungswort, nachdem man sie neu geordnet hat.
export const LETTER_ORDER = [6, 14, 9, 4, 21, 7, 15, 8, 5, 13, 17, 1, 2, 3, 19, 16, 22, 10, 12, 11, 18, 0, 20];
if (LETTER_ORDER.length !== DAYS) console.warn(`LETTER_ORDER hat ${LETTER_ORDER.length} statt ${DAYS} Einträge`);

// URL-Parameter für Tests (nur für den Admin-Account, siehe main.js/applyAdmin):
//   ?cheat           alle Häuser offen (kein Datumsschutz)
//   ?date=2026-12-05 simuliert ein Datum
//   ?solveall        markiert alle Rätsel als gelöst
export let CHEAT = false;
export let SOLVE_ALL = false;
export let NOW = new Date();

function parseNow(params) {
  const d = params.get('date');
  if (d) {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day);
  }
  return new Date();
}

// Wird einmal beim Start aufgerufen, sobald die Session (und damit isAdmin) bekannt ist.
// Nicht-Admins behalten die Defaults oben, egal was in der URL steht.
export function applyAdmin(isAdmin) {
  const params = new URLSearchParams(location.search);
  CHEAT = isAdmin && params.has('cheat');
  SOLVE_ALL = isAdmin && params.has('solveall');
  NOW = isAdmin ? parseNow(params) : new Date();
}

const inDecember = (day) => NOW.getMonth() === 11 && NOW.getDate() >= day;
export const isUnlocked = (day) => CHEAT || inDecember(day);
export const giftUnlocked = () => CHEAT || inDecember(24);
