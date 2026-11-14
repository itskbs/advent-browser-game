const normalize = (s) => s.toLowerCase().trim().replace(/[.!?\s]+$/g, '').replace(/\s+/g, ' ');

// Programmieraufgabe im Advent-of-Code-Stil: Spieler löst sie selbst (im Kopf oder mit einem
// kurzen Skript) und tippt nur das Endergebnis ein. Vergleich wie bei text.js.
export async function runCode(ui, house) {
  const { quiz, npc } = house;
  const accept = quiz.accept.map(normalize);
  for (;;) {
    const answer = await ui.ask(npc.name, `${quiz.question}\n(Antwort eintippen, Esc = später wiederkommen)`);
    if (answer === null) return false;
    if (accept.includes(normalize(answer))) return true;
    await ui.say(npc.name, house.wrong[Math.floor(Math.random() * house.wrong.length)]);
  }
}
