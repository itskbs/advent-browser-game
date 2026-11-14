// Sudoku (beliebige Größe, z. B. 4x4 oder 9x9) mit anklickbarem Raster: Zellen anklicken oder mit
// den Pfeiltasten/WASD navigieren, Zahl tippen, Enter zum Prüfen.
function blanksMatch(puzzle, solution, values) {
  for (let r = 0; r < puzzle.length; r++) {
    for (let c = 0; c < puzzle[r].length; c++) {
      if (puzzle[r][c] === 0 && values[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export async function runSudoku(ui, house) {
  const { quiz, npc } = house;
  let values = null; // Fortschritt über Fehlversuche hinweg merken

  for (;;) {
    const result = await ui.sudokuBoard(
      npc.name,
      `${quiz.question}\n\nTrag die fehlenden Zahlen ein (Zelle anklicken oder Pfeiltasten/WASD, dann Zahl tippen).\nEnter = prüfen, Esc = später wiederkommen.`,
      quiz.puzzle,
      values
    );
    if (result === null) return false;
    if (blanksMatch(quiz.puzzle, quiz.solution, result)) return true;
    values = result;
    await ui.say(npc.name, house.wrong[Math.floor(Math.random() * house.wrong.length)]);
  }
}
