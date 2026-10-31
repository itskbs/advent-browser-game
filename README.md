# Advent im Wichteldorf

Browser-Adventskalender im Top-Down-Stil (Zelda: A Link to the Past). Frontend ohne Build-Step; Accounts und Fortschritt laufen über Vercel-Serverless-Functions (`api/`) und eine Postgres-Datenbank (Neon).

## Starten (lokal)

Da `api/*.js` serverseitig läuft, reicht ein einfacher statischer Server nicht mehr — Login/Fortschritt funktionieren nur über die Vercel CLI:

```bash
npm install
npx vercel link       # einmalig: Projekt mit Vercel verknüpfen
npx vercel env pull   # holt DATABASE_URL, SESSION_SECRET, ADMIN_USERNAMES in .env.local
npx vercel dev
```

Dann die ausgegebene URL (meist `http://localhost:3000`) öffnen.

## Accounts & Admin

- Login läuft nur über Benutzername + Geburtsdatum (kein Passwort). Ein neuer Benutzername legt beim ersten Login automatisch ein Konto an; Fortschritt wird pro Konto in der Datenbank gespeichert (nicht mehr in `localStorage`).
- `ADMIN_USERNAMES` (Env-Var, kommagetrennt, z. B. `kevin`) legt fest, welche Konten die Test-Parameter unten benutzen dürfen. Bei allen anderen Konten werden sie ignoriert.
- `SESSION_SECRET`: beliebiger zufälliger String, signiert das Login-Cookie. In Vercel als Env-Var setzen.

## Testen (nur Admin-Konten)

| URL-Parameter | Wirkung |
|---|---|
| `?cheat` | alle Häuser und das Geschenk offen |
| `?date=2026-12-05` | simuliert ein Datum (Haus N öffnet ab 1.–N. Dezember) |
| `?solveall` | markiert alle 23 Rätsel als gelöst (zum Testen des Finales) |

## Inhalte ändern

- `src/content.js`: NPCs, Geschichten, Rätsel, Easter Eggs. Echte Rätsel kommen in das Objekt `REAL` (Schlüssel = Tag).
- `src/config.js`: Lösungswort (`SOLUTION_WORDS`, zusammen genau 23 Buchstaben) und `LETTER_ORDER` (feste Durchmischung: Haus n gibt nicht Buchstabe n, sondern muss am 24. Türchen neu geordnet werden).
- Neuer Quiz-Typ (Sudoku, Schach, Kreuzworträtsel): Modul in `src/quizzes/` mit `async (ui, house) => boolean` schreiben und in `src/quizzes/index.js` eintragen.
- `api/`: Login (`login.js`), Logout (`logout.js`), Session-Check (`me.js`), Fortschritt (`progress.js`), gemeinsame Helfer (`_db.js`, `_auth.js`).
