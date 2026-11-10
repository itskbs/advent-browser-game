// Einfaches Schachrätsel (Matt in einem Zug). Statt Auswahl tippt der Spieler den Zug ein.
const SYMBOLS = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

function render(board) {
  const lines = board.map((row, i) => {
    const rank = 8 - i;
    const cells = row.map((cell) => (cell ? SYMBOLS[cell] : '.'));
    return `${rank} ${cells.join(' ')}`;
  });
  lines.push('  a b c d e f g h');
  return lines.join('\n');
}

const normalize = (s) => s.toLowerCase().trim().replace(/[\s#+!?-]/g, '');

export async function runChess(ui, house) {
  const { quiz, npc } = house;
  const accept = quiz.accept.map(normalize);
  const board = render(quiz.board);
  const prompt =
    `${quiz.question}\n\n${board}\n\n` +
    `Gib den Zug ein, der Matt setzt (z. B. "Ta8").\n` +
    `(Esc = später wiederkommen)`;
  for (;;) {
    const input = await ui.ask(npc.name, prompt);
    if (input === null) return false;
    if (accept.includes(normalize(input))) return true;
    await ui.say(npc.name, house.wrong[Math.floor(Math.random() * house.wrong.length)]);
  }
}
