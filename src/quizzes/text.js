const normalize = (s) => s.toLowerCase().trim().replace(/[.!?\s]+$/g, '').replace(/\s+/g, ' ');

// Freitext-Antwort (Rätsel, Zahl, Wort). Esc = später wiederkommen.
// Optional: quiz.hint + quiz.hintAfter zeigen nach N geräteweit gemerkten Fehlversuchen einen Hinweis,
// erst beim nächsten Besuch (der N-te Fehlversuch selbst beendet die Runde statt weiterzuloopen).
export async function runText(ui, house) {
  const { quiz, npc } = house;
  const accept = quiz.accept.map(normalize);
  const key = `attempts-${house.day}`;
  let attempts = quiz.hintAfter ? Number(localStorage.getItem(key) || 0) : 0;

  if (quiz.hint && attempts >= quiz.hintAfter) await ui.say(npc.name, quiz.hint);

  for (;;) {
    const answer = await ui.ask(npc.name, `${quiz.question}\n(Antwort eintippen, Esc = später wiederkommen)`);
    if (answer === null) return false;
    if (accept.includes(normalize(answer))) return true;

    if (quiz.hintAfter) {
      attempts++;
      localStorage.setItem(key, attempts);
      if (attempts === quiz.hintAfter) {
        await ui.say(npc.name, 'Puh, keine Sorge – komm doch ein andermal nochmal vorbei, dann helfe ich dir mit einem Hinweis.');
        return false;
      }
    }
    await ui.say(npc.name, house.wrong[Math.floor(Math.random() * house.wrong.length)]);
  }
}
