import { runChoice } from './choice.js';
import { runText } from './text.js';

// Neuer Quiz-Typ (sudoku, schach, kreuzwort ...): Modul schreiben und hier eintragen.
// Signatur: async (ui, house) => boolean  (true = gelöst)
const QUIZ_TYPES = { choice: runChoice, text: runText };

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

  await ui.say(npc.name, house.win);
  state.solve(house.day);
  await ui.say(npc.name, 'Dein Lösungsbuchstabe für das 24. Türchen lautet:', { letter: house.letter });
  await ui.say(npc.name, 'Merk ihn dir gut – er steht auch oben in deiner Buchstabenleiste.');
}
