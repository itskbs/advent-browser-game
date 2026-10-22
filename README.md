# Advent im Wichteldorf

Browser-Adventskalender im Top-Down-Stil (Zelda: A Link to the Past). Keine Abhängigkeiten, kein Build.

## Starten

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen (ES-Module brauchen einen Server, `file://` geht nicht).

## Testen

| URL-Parameter | Wirkung |
|---|---|
| `?cheat` | alle Häuser und das Geschenk offen |
| `?date=2026-12-05` | simuliert ein Datum (Haus N öffnet ab 1.–N. Dezember) |
| `?solveall` | markiert alle 23 Rätsel als gelöst (zum Testen des Finales) |

Spielstand liegt in `localStorage` (`advent-wichteldorf-v1`).

## Inhalte ändern

- `src/content.js`: NPCs, Geschichten, Rätsel, Easter Eggs. Echte Rätsel kommen in das Objekt `REAL` (Schlüssel = Tag).
- `src/config.js`: Lösungswort (`SOLUTION`, genau 23 Buchstaben).
- Neuer Quiz-Typ (Sudoku, Schach, Kreuzworträtsel): Modul in `src/quizzes/` mit `async (ui, house) => boolean` schreiben und in `src/quizzes/index.js` eintragen.
