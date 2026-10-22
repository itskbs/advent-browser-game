// Frage mit Antwortmöglichkeiten. Liefert true, wenn gelöst, false wenn der Spieler später wiederkommt.
export async function runChoice(ui, house) {
  const { quiz, npc } = house;
  const options = [...quiz.options, 'Ich komme später wieder'];
  const later = options.length - 1;
  for (;;) {
    const i = await ui.choose(npc.name, quiz.question, options);
    if (i === later) return false;
    if (i === quiz.answer) return true;
    await ui.say(npc.name, house.wrong[Math.floor(Math.random() * house.wrong.length)]);
  }
}
