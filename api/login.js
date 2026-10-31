import { sql, ensureSchema } from './_db.js';
import { setSessionCookie, isAdminUsername } from './_auth.js';

const USERNAME_RE = /^[\p{L}\p{N} _-]{1,40}$/u;
const BIRTHDATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidBirthdate(birthdate) {
  if (!BIRTHDATE_RE.test(birthdate)) return false;
  const [y, m, d] = birthdate.split('-').map(Number);
  if (y < 1900 || y > 2100) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return false;
  return birthdate <= new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const birthdate = typeof body.birthdate === 'string' ? body.birthdate.trim() : '';

  if (!USERNAME_RE.test(username)) { res.status(400).json({ error: 'Ungültiger Benutzername.' }); return; }
  if (!isValidBirthdate(birthdate)) { res.status(400).json({ error: 'Ungültiges Geburtsdatum.' }); return; }

  const usernameLower = username.toLowerCase();

  try {
    await ensureSchema();
    const existing = await sql`SELECT id, birthdate FROM users WHERE username_lower = ${usernameLower}`;

    let uid;
    if (existing.length) {
      if (existing[0].birthdate !== birthdate) {
        res.status(401).json({ error: 'Benutzername oder Geburtsdatum stimmt nicht.' });
        return;
      }
      uid = existing[0].id;
    } else {
      const inserted = await sql`
        INSERT INTO users (username, username_lower, birthdate)
        VALUES (${username}, ${usernameLower}, ${birthdate})
        RETURNING id
      `;
      uid = inserted[0].id;
    }

    setSessionCookie(req, res, { uid, username });
    res.status(200).json({ username, isAdmin: isAdminUsername(username) });
  } catch (err) {
    if (err?.code === '23505') { res.status(409).json({ error: 'Dieser Benutzername wurde gerade vergeben. Bitte erneut versuchen.' }); return; }
    console.error(err);
    res.status(500).json({ error: 'Serverfehler, bitte später erneut versuchen.' });
  }
}
