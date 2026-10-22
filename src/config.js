export const TILE = 16;
export const VIEW_W = 256;
export const VIEW_H = 224;
export const DAYS = 23;

// Lösungswort: Buchstabe n gehört zu Haus n. Muss genau DAYS Zeichen lang sein.
export const SOLUTION = 'FROHEWEIHNACHTENMITEUCH';
if (SOLUTION.length !== DAYS) console.warn(`SOLUTION hat ${SOLUTION.length} statt ${DAYS} Buchstaben`);

// URL-Parameter für Tests:
//   ?cheat           alle Häuser offen (kein Datumsschutz)
//   ?date=2026-12-05 simuliert ein Datum
//   ?solveall        markiert alle Rätsel als gelöst
const params = new URLSearchParams(location.search);
export const CHEAT = params.has('cheat');
export const SOLVE_ALL = params.has('solveall');

function parseNow() {
  const d = params.get('date');
  if (d) {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day);
  }
  return new Date();
}
export const NOW = parseNow();

const inDecember = (day) => NOW.getMonth() === 11 && NOW.getDate() >= day;
export const isUnlocked = (day) => CHEAT || inDecember(day);
export const giftUnlocked = () => CHEAT || inDecember(24);
