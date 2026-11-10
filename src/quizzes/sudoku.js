// Sudoku (beliebige Größe, z. B. 4x4 oder 9x9). Statt Auswahl tippt der Spieler die fehlenden
// Zahlen in Lesereihenfolge (links nach rechts, oben nach unten) als eine Zeichenkette ein.
function render(puzzle) {
  const size = puzzle.length;
  const box = Number.isInteger(Math.sqrt(size)) ? Math.sqrt(size) : size;
  const rows = puzzle.map((row) => {
    const cells = row.map((c) => (c === 0 ? '.' : c));
    const groups = [];
    for (let i = 0; i < cells.length; i += box) groups.push(cells.slice(i, i + box).join(' '));
    return groups.join(' | ');
  });
  const sep = '-'.repeat(rows[0].length);
  const lines = [];
  rows.forEach((line, r) => {
    if (r > 0 && r % box === 0) lines.push(sep);
    lines.push(line);
  });
  return lines.join('\n');
}

function blanksInOrder(puzzle, solution) {
  const digits = [];
  for (let r = 0; r < puzzle.length; r++) {
    for (let c = 0; c < puzzle[r].length; c++) {
      if (puzzle[r][c] === 0) digits.push(String(solution[r][c]));
    }
  }
  return digits.join('');
}

export async function runSudoku(ui, house) {
  const { quiz, npc } = house;
  const answer = blanksInOrder(quiz.puzzle, quiz.solution);
  const grid = render(quiz.puzzle);
  const prompt =
    `${quiz.question}\n\n${grid}\n\n` +
    `Trag die fehlenden Zahlen der Reihe nach ein (links nach rechts, oben nach unten), ohne Leerzeichen.\n` +
    `(Esc = später wiederkommen)`;
  for (;;) {
    const input = await ui.ask(npc.name, prompt);
    if (input === null) return false;
    if (input.replace(/\s+/g, '') === answer) return true;
    await ui.say(npc.name, house.wrong[Math.floor(Math.random() * house.wrong.length)]);
  }
}
