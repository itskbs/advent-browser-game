import { runChoice } from './choice.js';
import { runText } from './text.js';
import { runSudoku } from './sudoku.js';
import { runChess } from './chess.js';
import { runCode } from './code.js';

// Neuer Quiz-Typ (kreuzwort ...): Modul schreiben und hier eintragen.
// Signatur: async (ui, house) => boolean  (true = gelöst)
const QUIZ_TYPES = { choice: runChoice, text: runText, sudoku: runSudoku, chess: runChess, code: runCode };

export async function runHouse(ui, house, state) {
  const { npc } = house;

  if (state.solved[house.day]) {
    await ui.say(npc.name, house.replay, { letter: house.letter });
    return;
  }

  for (const line of house.story) await ui.say(npc.name, line);

  const run = QUIZ_TYPES[house.quiz.type];
  const solved = run ? await run(ui, house) : false;
  if (!solved) {
    await ui.say(npc.name, 'Kein Stress! Komm einfach wieder, wenn du bereit bist.');
    return;
  }

  if (house.quiz.openUrl) window.open(house.quiz.openUrl, '_blank');

  await ui.say(npc.name, house.win);
  state.solve(house.day);
  await ui.say(npc.name, 'Dein Lösungsbuchstabe für das 24. Türchen lautet:', { letter: house.letter });
  await ui.say(npc.name, 'Merk ihn dir gut – er steht auch oben in deiner Buchstabenleiste.');
}
