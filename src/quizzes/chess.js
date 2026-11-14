// Schachrätsel (Matt in einem Zug) mit anklickbarem Brett: weiße Figur wählen, dann Zielfeld.
const FILES = 'abcdefgh';
const squareName = (r, c) => `${FILES[c]}${8 - r}`;
const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const QUEEN_DIRS = [...ROOK_DIRS, ...BISHOP_DIRS];
const KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_OFFSETS = QUEEN_DIRS;

function findKing(board, color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === color + 'K') return [r, c];
  return null;
}

// Pseudo-legale Züge (ohne Schach-Erkennung für den eigenen König – reicht für diese statischen
// Matt-Rätsel, bei denen es nur eine einsame gegnerische Figur, den König, gibt). Bauern werden
// aktuell nicht unterstützt, da kein Rätsel welche benutzt.
function movesFor(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];
  const color = piece[0], kind = piece[1];
  const enemyKing = findKing(board, color === 'w' ? 'b' : 'w');
  const moves = [];

  function tryAdd(nr, nc) {
    if (!inBounds(nr, nc)) return false;
    const target = board[nr][nc];
    if (target && target[0] === color) return false; // eigene Figur blockiert
    if (target && target[1] === 'K') return false;    // Könige werden nie geschlagen
    moves.push([nr, nc]);
    return !target; // Feld frei -> Gleitfiguren dürfen weiterziehen
  }

  if (kind === 'N') {
    for (const [dr, dc] of KNIGHT_OFFSETS) tryAdd(r + dr, c + dc);
  } else if (kind === 'K') {
    for (const [dr, dc] of KING_OFFSETS) {
      const nr = r + dr, nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      if (enemyKing && Math.abs(nr - enemyKing[0]) <= 1 && Math.abs(nc - enemyKing[1]) <= 1) continue; // Könige nie nebeneinander
      tryAdd(nr, nc);
    }
  } else {
    const dirs = kind === 'R' ? ROOK_DIRS : kind === 'B' ? BISHOP_DIRS : QUEEN_DIRS;
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc)) {
        if (!tryAdd(nr, nc)) break;
        nr += dr; nc += dc;
      }
    }
  }
  return moves;
}

const normalize = (s) => s.toLowerCase().trim().replace(/[\s#+!?-]/g, '');

export async function runChess(ui, house) {
  const { quiz, npc } = house;
  const accept = quiz.accept.map(normalize);

  for (;;) {
    const board = quiz.board.map((row) => row.slice());
    const ctrl = await ui.chessBoard(
      npc.name,
      `${quiz.question}\n\nWähle eine weiße Figur, dann das Zielfeld.\n(Esc = später wiederkommen)`
    );

    const whiteSquares = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c]?.[0] === 'w') whiteSquares.push([r, c]);

    let from = null;
    let outcome = null; // 'solved' | 'later' | 'wrong'

    while (!outcome) {
      ctrl.render(board, from ? movesFor(board, from[0], from[1]) : whiteSquares, from);
      const picked = await ctrl.pick();
      if (!picked) { outcome = 'later'; break; }
      const [r, c] = picked;

      if (!from) {
        if (board[r][c]?.[0] === 'w') from = [r, c];
        continue;
      }
      if (r === from[0] && c === from[1]) { from = null; continue; } // Auswahl aufheben
      if (board[r][c]?.[0] === 'w') { from = [r, c]; continue; }     // andere Figur wählen

      const legal = movesFor(board, from[0], from[1]).some(([mr, mc]) => mr === r && mc === c);
      if (!legal) continue; // Klick ignorieren

      const move = `${squareName(from[0], from[1])}${squareName(r, c)}`;
      if (accept.includes(normalize(move))) {
        board[r][c] = board[from[0]][from[1]];
        board[from[0]][from[1]] = null;
        ctrl.render(board, [], null);
        outcome = 'solved';
      } else {
        outcome = 'wrong';
      }
    }

    ctrl.close();
    if (outcome === 'later') return false;
    if (outcome === 'solved') return true;
    await ui.say(npc.name, house.wrong[Math.floor(Math.random() * house.wrong.length)]);
  }
}
